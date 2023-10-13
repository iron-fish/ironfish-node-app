import fsAsync from "fs/promises";

import {
  Event,
  IronfishSdk,
  Meter,
  NodeUtils,
} from "@ironfish/sdk";

import {
  DownloadedSnapshot,
  SnapshotDownloader,
  getDefaultManifestUrl,
} from "./utils";
import { SnapshotUpdate } from "../../../shared/types";
import { SplitPromise, splitPromise } from "../utils";

export class SnapshotManager {
  onProgress: Event<[SnapshotUpdate]> = new Event();
  snapshotPromise: SplitPromise<void> = splitPromise();
  started = false;

  async run(sdk: IronfishSdk): Promise<void> {
    if(this.started) {
      return
    }

    this.started = true;

    try {
      await this._run(sdk)
      this.snapshotPromise.resolve()
    } catch (e) {
      this.snapshotPromise.reject(e)
    }
  }

  result(): Promise<void> {
    return this.snapshotPromise.promise;
  }

  async _run(sdk: IronfishSdk): Promise<void> {
    const node = await sdk.node();
    await NodeUtils.waitForOpen(node);
    const nodeChainDBVersion = await node.chain.blockchainDb.getVersion();
    await node.closeDB();

    console.log("Starting snapshot download");
    const networkId = sdk.internal.get("networkId");
    const manifestUrl = getDefaultManifestUrl(networkId);
    if (!manifestUrl) {
      throw new Error(
        `Manifest url for the snapshots are not available for network ID ${networkId}`,
      );
    }

    await fsAsync.mkdir(sdk.config.tempDir, { recursive: true });
    const dest = sdk.config.tempDir;

    const Downloader = new SnapshotDownloader(
      manifestUrl,
      dest,
      nodeChainDBVersion,
    );

    const manifest = await Downloader.manifest();

    const downloadSpeed = new Meter();
    downloadSpeed.start();

    await Downloader.download((prev, curr) => {
      console.log(`Download progress: ${curr}/${manifest.file_size}`);
      downloadSpeed.add(curr - prev);

      this.onProgress.emit({
        step: "download",
        totalBytes: manifest.file_size,
        currBytes: curr,
        speed: downloadSpeed.rate1m,
      });
    }).finally(() => {
      downloadSpeed.stop();
    });

    const path = await Downloader.verifyChecksum({ cleanup: true });
    if (!path) {
      throw new Error("Snapshot checksum does not match");
    }

    const downloadedSnapshot = new DownloadedSnapshot(sdk, path);

    const unzipSpeed = new Meter();
    unzipSpeed.start();

    await downloadedSnapshot
      .unzip(
        (
          totalEntries: number,
          prevExtracted: number,
          currExtracted: number,
        ) => {
          console.log(`Unzip progress: ${currExtracted}/${totalEntries}`);
          unzipSpeed.add(currExtracted - prevExtracted);

          this.onProgress.emit({
            step: "unzip",
            totalEntries,
            currEntries: currExtracted,
            speed: unzipSpeed.rate1m,
          });
        },
      )
      .finally(() => {
        unzipSpeed.stop();
      });

    await downloadedSnapshot.replaceDatabase();
    await fsAsync.rm(downloadedSnapshot.file);
  }
}
