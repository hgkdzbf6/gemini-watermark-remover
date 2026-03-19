# Release Checklist

## Scope

This repository currently ships three release surfaces:

- website build in `dist/`
- userscript bundle in `dist/userscript/gemini-watermark-remover.user.js`
- unpacked extension build in `dist/extension/`

## Preflight

Run these locally from the repo root:

```bash
pnpm install
pnpm test
pnpm build
```

Expected result:

- all tests pass
- `dist/userscript/gemini-watermark-remover.user.js` is regenerated
- `dist/extension/manifest.json` uses the current `package.json` version

## Release Metadata

- bump `package.json` version
- keep `build.js` userscript `@version` sourced from `pkg.version`
- add a dated entry to `CHANGELOG.md`

## Manual Verification

- install or update the generated userscript in Tampermonkey/Violentmonkey
- verify Gemini page preview replacement works
- verify native Gemini copy/download still returns processed output
- verify preview processing failure leaves the original page image visible
- load `dist/extension/` as an unpacked extension and smoke-test one Gemini session

## Publish

- commit release changes
- create a git tag matching the package version, for example `v1.0.1`
- publish or upload the built userscript from `dist/userscript/gemini-watermark-remover.user.js`
- deploy website assets from `dist/` if the online entry changed

## Post-Release

- confirm the installed userscript reports the expected version
- confirm the hosted install link serves the latest userscript bundle
- keep any ad hoc verification notes in the release PR or tag notes, not in source docs
