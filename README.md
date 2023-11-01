# Iron Fish Node App

# Installation

👉 Install the released Iron Fish Node App by getting started [here](https://ironfish.network/use/node-app).

## Troubleshooting

### Windows

**Q: The app crashes on launch with `A JavaScript error occurred in the main process. Error: The specified module could not be found`**

**A:** Install the Visual C++ Redistributable: https://aka.ms/vs/17/release/vc_redist.x64.exe

## Development

1. Clone repo
2. `cd iron-fish-node-app`
3. Install dependencies: `yarn`
4. Start dev server: `yarn dev`

## Creating a production build

1. `yarn build`

## Deploying a release

1. New builds will be created on every commit to `main` and published to a draft GitHub release, [found here](https://github.com/iron-fish/ironfish-node-app/releases).
1. When you're ready to deploy a release, first ensure there are no ongoing `Publish Release` [GitHub Actions](https://github.com/iron-fish/ironfish-node-app/actions), then test the build on the draft.
1. After testing, publish the draft release, which should tag the latest commit on main with the draft release's version number.
1. Increment the version in `package.json` and push that commit to `main`. A new draft release should be created with the new version number.
