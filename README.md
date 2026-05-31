# SeamClone

SeamClone is an Expo + React Native app with native camera modules.

## Important Runtime Note

This project uses native modules (for example, vision camera/worklets) that are not supported in Expo Go.

For iPhone device testing, use a custom development build (dev client), not Expo Go.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start Metro for dev client (default script):

```bash
npm start
```

3. If network discovery is unstable, use tunnel mode:

```bash
npm run start:dev-client:tunnel
```

4. Open the installed SeamClone development client app on iPhone and connect via the QR/link shown by Metro.

## Scripts

- `npm start`: Start Metro in dev-client mode (default for this repo)
- `npm run start:dev-client`: Explicit dev-client mode
- `npm run start:dev-client:tunnel`: Dev-client mode with tunnel + clear cache
- `npm run dev:iphone`: One-command iPhone launch flow (dev-client + tunnel)
- `npm run dev:all`: One-command full stack (backend API + iPhone Metro)
- `npm run start:go`: Expo Go mode for limited non-camera flows only
- `npm run start:go:limited`: Same as Expo Go mode with a cleared cache
- `npm run start:go:tunnel`: Expo Go mode over tunnel for limited non-camera flows only
- `npm run web`: Run web target
- `npm run android`: Open Android target

## iPhone Build Requirement

If you do not yet have the SeamClone development client installed on iPhone, build it first:

```bash
npx eas build -p ios --profile development
```

The `development` profile is configured in `eas.json`.

## QR Troubleshooting

- If the phone shows `No usable data found`, you are likely scanning a dev-client QR with the wrong app flow.
- If runtime shows `NitroModules are not supported in Expo Go`, you opened with Expo Go instead of a custom dev client.
- If you intentionally open in Expo Go, the scan route now shows a development-build-required screen instead of crashing, because the camera stack is native-only.
- Use `npm run start:dev-client:tunnel` and open from the installed SeamClone dev app.

## Daily Workflow

Use one command depending on your target:

```bash
npm run dev:iphone
```

Run iPhone app workflow with dev-client compatible QR.

```bash
npm run dev:all
```

Run backend + iPhone workflow together in one terminal command.
