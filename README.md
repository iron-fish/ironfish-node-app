# Iron Fish Node App

# Installation

👉 Install the released Iron Fish Node App by getting started [here](https://ironfish.network/use/node-app).

## Troubleshooting

### Windows

**Q: The app crashes on launch with `A JavaScript error occurred in the main process. Error: The specified module could not be found`**

**A:** Install the Visual C++ Redistributable: https://aka.ms/vs/17/release/vc_redist.x64.exe

## Development

1. Clone repo
2. `cd ironfish-node-app`
3. Install dependencies: `npm`
4. Start dev server: `npm run dev`

### Logs

`electron-log` writes logs to the following directories by default:

* **on Linux:** `~/.config/{app name}/logs/main.log`
* **on macOS:** `~/Library/Logs/{app name}/main.log`
* **on Windows:** `%USERPROFILE%\AppData\Roaming\{app name}\logs\main.log`

## Creating a production build

1. `npm run build`

## Deploying a release

1. New builds will be created on every commit to `main` and published to a draft GitHub release, [found here](https://github.com/iron-fish/ironfish-node-app/releases).
1. When you're ready to deploy a release, first ensure there are no ongoing `Publish Release` [GitHub Actions](https://github.com/iron-fish/ironfish-node-app/actions), then test the build on the draft.
1. After testing, publish the draft release, which should tag the latest commit on main with the draft release's version number.
1. Increment the version in `package.json` and push that commit to `main`. A new draft release should be created with the new version number.
