import { execFileSync } from "child_process";
import { platform } from "os";

/**
 * node-datachannel prebuilds throw a bad_cast exception on certain Linux distributions.
 * This seems to be fixed when patching out the static libstdc++.
 */
async function main() {
  if (platform() !== "linux") {
    return;
  }

  console.log("Patching node-datachannel...");

  execFileSync(
    "patch",
    ["-p0", "--merge", "-i", "scripts/node-datachannel.patch"],
    {
      stdio: "inherit",
    },
  );

  execFileSync("npm", ["install"], {
    cwd: "node_modules/node-datachannel",
    stdio: "inherit",
  });

  execFileSync("npm", ["run", "clean"], {
    cwd: "node_modules/node-datachannel",
    stdio: "inherit",
  });

  execFileSync("npm", ["run", "build"], {
    cwd: "node_modules/node-datachannel",
    stdio: "inherit",
  });

  execFileSync("rm", ["-rf", "node_modules"], {
    cwd: "node_modules/node-datachannel",
    stdio: "inherit",
  });

  execFileSync("rm", ["-rf", "prebuilds"], {
    cwd: "node_modules/node-datachannel",
    stdio: "inherit",
  });
}

main();
