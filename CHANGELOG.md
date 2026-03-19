# Changelog

## 1.0.1 - 2026-03-19

### Userscript

- Added in-page Gemini preview replacement so page images can be processed before manual download.
- Routed preview fetching through `GM_xmlhttpRequest` when available, avoiding fallback CORS failures in userscript sandboxes.
- Added a restrained `Processing...` overlay during preview processing and made failures fail-open so the original image remains visible.
- Hardened overlay lifecycle cleanup to avoid stale fade callbacks removing a new processing state.

### Extension

- Kept page-image replacement behavior aligned with the userscript preview pipeline and processing-state UX.

### Quality

- Added regression tests for userscript version sync and processing overlay lifecycle edge cases.
- Verified release build with full automated test coverage and production bundle generation.
