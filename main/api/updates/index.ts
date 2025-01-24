import axios from "axios";
import { app } from "electron";
import log from "electron-log/main";
import { clean, gt } from "semver";

import { PartialGithubRelease } from "../../../shared/types";
import { t } from "../trpc";

const githubReleaseUrl =
  "https://api.github.com/repos/iron-fish/ironfish-node-app/releases";

// GitHub API allows 60 calls per hour unauthenticated.
// https://docs.github.com/en/rest/overview/rate-limits-for-the-rest-api?apiVersion=2022-11-28#primary-rate-limit-for-unauthenticated-users
const cacheTime = 15 * 60 * 1000;
let lastAttempt = -Infinity;
let cachedResult:
  | { ok: true; data: ReadonlyArray<PartialGithubRelease> }
  | { ok: false; data: string } = { ok: false, data: "" };

async function getLatestReleases() {
  const now = performance.now();

  if (now - cacheTime > lastAttempt) {
    lastAttempt = now;
    log.log("Fetching releases from GitHub");
    await axios
      .get(githubReleaseUrl, {
        headers: {
          accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      })
      .then((response) => {
        cachedResult = { ok: true, data: response.data };
      })
      .catch((error) => {
        let errorData;
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorData = JSON.stringify(error.response.data);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          errorData = JSON.stringify(error.request);
        } else {
          errorData = JSON.stringify(error.message);
        }

        log.error("An error occurred while fetching update notes:", errorData);
        cachedResult = { ok: false, data: errorData };
      });
  }

  return cachedResult;
}

export const updateRouter = t.router({
  getCurrentVersion: t.procedure.query(async () => {
    return app.getVersion();
  }),
  isUpdateAvailable: t.procedure.query(async () => {
    const latestRelease = await getLatestReleases();

    if (!latestRelease.ok) return false;

    const latestVersion = clean(latestRelease.data[0].tag_name);

    if (!latestVersion) return false;

    return gt(latestVersion, app.getVersion());
  }),
  getUpdateNotes: t.procedure.query(async () => {
    const latestRelease = await getLatestReleases();

    if (latestRelease.ok) {
      return latestRelease.data;
    }

    throw new Error(latestRelease.data);
  }),
});
