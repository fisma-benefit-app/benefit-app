# Spec: Text-based PDF reports (issue #772)

> Temporary working spec. Delete after the final PR is merged; git history keeps the PR description.

## Objective

Both PDF reports are screenshots (`html2canvas` → JPEG pages → `jsPDF`), so their text can't be searched or copied. Replace the pipeline with **pdfmake** so reports contain real text.

Side effects we want: much smaller files (tens of KB instead of up to 70MB+), and removal of the Firefox hang/timeout/retry and canvas-size workarounds in `printUtils.ts`.

## Decisions

| Question        | Decision                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| Library         | pdfmake 0.3.x (declarative tables, colSpan, repeating headers, automatic pagination, `dontBreakRows`/`unbreakable`) |
| Where it runs   | In the browser, as now. No backend changes.                                                                         |
| Scope           | Both reports: calculation report and overview report                                                                |
| Visual fidelity | Free to redesign. Same content and structure; flat fills and simple shapes instead of CSS gradients.                |
| Font            | pdfmake's bundled Roboto. Covers Finnish (ä, ö, å) and the en dash; verified by text extraction. No Arial.          |
| Loading         | pdfmake and its fonts (~1.9 MB raw) are dynamically imported on first export only                                   |

## Out of scope

- Backend/server-side PDF generation
- Changing report content, calculations or translations
- Tagged PDF / PDF/UA accessibility (not evaluated)

## Structure

- `frontend/src/lib/pdf/pdfmakeRuntime.ts`: lazy loader plus `downloadPdfmakeDocument(definition, filename)`. Reuses `downloadBlob` and `ensurePdfFilename` from `printUtils.ts` (the Firefox-safe attached-anchor download).
- `frontend/src/lib/pdf/pdfReportLayout.ts`: shared page defaults, styles, table and cell helpers for both reports.
- `calculationReportUtils.ts` and `overviewReportUtils.ts` keep their exported entry points (`generateCalculationReportPDF`, `generateOverviewPDF`) so callers do not change; only the internals switch from HTML strings to pdfmake document definitions.

## Steps

1. **Foundation (done).** Add `pdfmake` + `@types/pdfmake`; lazy loader and download helper; smoke-tested in headless Chrome (Finnish text extracts correctly, 14 KB output).
2. **Shared helpers (done).** `pdf/pdfReportLayout.ts`: A4 page setup with "n / N" footer, heading styles, bordered table with repeating header and unsplittable rows, cell helpers (colSpan, indent, changed-value highlight), `keepTogether`. Smoke-tested with a 300-component table (8 pages, 117 KB).
3. **Calculation report (done).** Rebuilt on pdfmake in landscape A4 (the 10-column table does not fit portrait without cramped headers). Same content, version-diff highlighting, subcomponent rows, total rows, and the three summary tables; header row repeats and rows never split. Verified with 300 components + 100 subcomponents in headless Chrome (fi and en, v1 and v2): 28 pages, ~190 KB, ~3.6 s in a dev build including the first load of pdfmake, no blank pages, no NaN.
4. **Overview report.** Rebuild cover page, architecture diagram (simplified, canvas shapes), aggregate tables, notes, and function list.
5. **Cleanup.** Delete `html2canvas` and `jspdf` dependencies, the capture/chunk/keep-together code and the hidden shadow-DOM container from `printUtils.ts`, and the now-unused report CSS. Keep `dateLocalizer`, `getAllComponents`, `escapeHtmlForSummary` only if still used (check with `knip`).

## Success criteria

- Text in both PDFs can be selected, copied and found with Ctrl+F in Chrome and Firefox, including Finnish characters.
- Same content as the current reports: values, diff highlighting, totals, subcomponents, both languages (fi/en).
- A 300-component project exports in a few seconds with a PDF well under 1 MB.
- No change for users who never export: pdfmake is not in the main bundle.
- CI passes: Prettier, ESLint (no warnings), `tsc -b`.

## Boundaries

- Always: keep the exported function signatures and callers (`ProjectPage.tsx`, `FunctionalPointSummary.tsx`) unchanged; run Prettier/ESLint/`tsc -b` before opening the PR.
- Ask first: dropping any report section or column; changing translations.
- Never: add a backend endpoint for this; leave `html2canvas`/`jspdf` installed after step 5.

## Risks / notes

- `knip` will flag `downloadPdfmakeDocument` as unused until step 3 uses it. This is expected, and knip is not part of the required CI checks.
- The overview report's architecture diagram is the hardest part to port; the simplified design keeps this bounded.
- Large tables: pdfmake lays out in the main thread. Measure on a 300+ component project in step 3; move to a web worker only if it visibly freezes the tab.
- Needs manual testing in Firefox as well as Chrome (the old code had Firefox-specific bugs).
