import { ErrorUtils } from "@ironfish/sdk";
import { observable } from "@trpc/server/observable";
import { z } from "zod";

import { SnapshotUpdate } from "../../../shared/types";
import { manager } from "../manager";
import { t } from "../trpc";

export const snapshotRouter = t.router({
  snapshotProgress: t.procedure
    .input(z.object({ id: z.number() }))
    .subscription(async () => {
      const ironfish = await manager.getIronfish();

      return observable<SnapshotUpdate>((emit) => {
        const onProgress = (update: SnapshotUpdate) => {
          emit.next(update);
        };

        ironfish.snapshotManager.onProgress.on(onProgress);

        ironfish.snapshotManager
          .result()
          .then(() => {
            emit.next({ step: "complete" });
          })
          .catch((err) => {
            const error = ErrorUtils.renderError(err);
            emit.error(error);
          });

        return () => {
          ironfish.snapshotManager.onProgress.off(onProgress);
        };
      });
    }),
  downloadSnapshot: t.procedure.mutation(async () => {
    const ironfish = await manager.getIronfish();
    if (ironfish.isStarted()) {
      await ironfish.stop();
      await ironfish.init();
    }
    ironfish.downloadSnapshot();
  }),
});
