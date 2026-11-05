# Security audit — 5 November 2026

This records the local baseline assessment in [#959](https://github.com/fisma-benefit-app/benefit-app/issues/959), performed by the project maintainer with AI assistance. [#981](https://github.com/fisma-benefit-app/benefit-app/issues/981) tracks this archive and the [repeatable audit guide](../guides/security_audit.md). It is a historical assessment of specified artifacts, not a statement that current or deployed Benefit is secure.

The assessment combined source review, controlled local requests, a small automated ZAP pilot, container scanning, a user-operated Burp exercise, and spreadsheet verification. Findings were separated into remediation issues. After the initial password-route fix, the maintainer chose to finish assessment before making further fixes.

## Scope and artifacts

Active testing used only isolated local environments, synthetic accounts/projects and disposable databases. No production or shared hosted environment was actively tested. Real root/frontend `.env` files were excluded from exported source and audit configuration. Keys and passwords were generated for the lab; proxy captures and tokens were not published.

| Stage | Assessed artifact / configuration |
| --- | --- |
| Initial source and ZAP pilot | `f1bb6649caa5e5a5c382bfbccd9b4d1ac3261cf8`; local backend and dev frontend |
| Initial password-route remediation | `6ec7b92e`; retained legacy route with current-password validation; superseded by removal below |
| Final password-route fix, user Burp exercise, Codex source scan and final API replays | `4c98b57098aaf1b46c9f14dac407913a64c77200`; then-unmerged endpoint-removal branch |
| Final replay runtime | Fresh offline `bootJar` build of `4c98b570`, default profile, generated signing key, schema initialized manually in disposable PostgreSQL tmpfs; cached Java runtime base. This was not a new production-image vulnerability scan. |
| Trivy adoption run | [42008753933](https://github.com/fisma-benefit-app/benefit-app/actions/runs/42008753933); PR head `7c518001d8f40c101b4091da9c4e63f4f563ecfb`, checked-out merge revision `319d035ddcf7e7ea5c248c21ad43a11b7521293e` |
| Documentation/merge checkpoint | Main `4a39c8491f1bbe3cd8807dae61784d6b8c6d2600`; [PR #978](https://github.com/fisma-benefit-app/benefit-app/pull/978) merged at 15:19 UTC on 5 November. No deployment verification or new post-merge exploit retest. |

Recorded image identities:

| Purpose | Image ID or pinned digest |
| --- | --- |
| ZAP 2.17.0 | `sha256:9624669db72f54d86c4b46a7064518bd9bf79d8c61a4c31befa9923489f328af` |
| Trivy adoption backend image | `sha256:9a88bbead99bba70530c4d3189f813ff056193bec5150a2090b9a59f94162d9c` |
| Trivy adoption frontend image | `sha256:bc0723299e40a92ef0ad99d367722b143f3e55a616cbb92937960c9a6bc3393b` |
| Final replay backend image | `sha256:1800c5231bd8458808a34826716e022efb53620c8fa35f7559f820af0b8bad6c` |
| Final replay PostgreSQL image | `sha256:0cefaabd882e42bcb2a2f3dc56d3ce4770560ba62fd7f197f1a2e008fd5731ab` |

The first Trivy pilot was [run 42004880181](https://github.com/fisma-benefit-app/benefit-app/actions/runs/42004880181), with different images/revision; its provenance remains in [the pilot comment](https://github.com/fisma-benefit-app/benefit-app/issues/959#issuecomment-6654860375). Do not combine those identities with the adoption or final replay images.

## What we did and learned

### Existing protections and GitHub checks

Source inspection found BCrypt passwords, RSA-signed JWTs, project-membership checks, validated DTOs, latest-version checks and optimistic locking. Existing backend integration tests cover authentication, renewal/revocation, throttling, membership, archived versions and concurrent saves. Reading those tests was not counted as executing them.

CodeQL was already enabled. Its default setup analyses covered Java/Kotlin, JavaScript/TypeScript and Actions at the initial inspected revision without analysis errors; full alert triage was not completed. Dependabot was already in use. Alert counts changed during the day, so an earlier zero-alert response was not treated as a clean dependency assessment. Dependabot and CSRF work continued separately.

GitHub secret scanning was enabled; push protection, non-provider patterns and validity checks were disabled in the returned settings. The final accessible alert queries returned **0 open and 0 resolved**. Neither enabled settings nor those counts prove full history/custom-pattern coverage or absence of secrets. No Gitleaks history scan was performed.

An early statement that Playwright was absent was corrected: it exists at `4c98b570`, including login and serial own-project lifecycle tests; inspected deployment CI runs login with Chromium. No complete browser security suite or hosted E2E execution was inferred.

### Headless ZAP pilot

The maintainer selected headless ZAP first. Successful authenticated project/component/comment reads and writes established that requests reached protected functionality. Sampled replays covered cross-user IDs, membership add/remove, revoked access after removal, missing/stale locks, archived writes, tampered tokens, renewal and logout. Responses and retained state were checked together.

In a **separate disposable vulnerable fixture**, reflected-XSS rule **40012** detected the seeded flaw and did not alert on the escaped control. Generic scanning missed the seeded authorization flaw; explicit two-user replay distinguished vulnerable `200` from fixed `403`. This was evidence to retain manual authorization expectations, not a comprehensive scanner benchmark.

A narrowly configured Benefit active scan used SQL-injection rule **40018** against one authenticated comment POST: one thread per host, 250 ms delay, 90-second limit, no crawler or external callbacks. It completed **23 requests (22 × 201, 1 × 404)**, with persisted comments and a later protected read confirming access. No SQL injection was found in that one test. Passive credentials alerts reflected deliberately proxied local HTTP Basic authentication, not a confirmed hosted TLS flaw. This was an initial baseline assessment, **not ZAP's named passive Baseline Scan**.

Docker networking/API Host-header setup required troubleshooting. Initial outbound startup attempts were blocked; `-silent` mode was then used and startup logs checked. The final replay used an internal network and ZAP API calls from inside its container because host-published ports were not reachable on that engine. No broad network exposure was added.

### Burp Community: maintainer-operated local exercise

The maintainer installed Burp Community and edited/replayed requests against the local dev backend at `localhost:8081`. The important discovery was **#985**: after logout, the same JWT was rejected with `Authorization: Bearer …` but accepted with lowercase `bearer`. The custom revocation filter checked the scheme case-sensitively while downstream authentication accepted it case-insensitively.

The paired protected `GET /projects` returned `401 Token has been revoked` versus `200` with nonempty JSON. Empty-body `POST /token` likewise returned `401` versus `200` and a replacement JWT. Initial OPTIONS `200` was a preflight and excluded; POST `/projects` `400` alone was not proof of a successful write. The replacement JWT was not independently tested on a protected endpoint. This was a revoked-token bypass, not token forgery or anonymous access. See [the renewal evidence](https://github.com/fisma-benefit-app/benefit-app/issues/959#issuecomment-6657997286).

Other manual samples held: own account `200` versus another user's `403`; an HTML image/onerror marker appeared literally; archived project edits, including a forged body version, returned `409 NOT_LATEST_VERSION`; stale-save replay returned `409 STALE_LOCK_VERSION`. These do not establish complete authorization/XSS/version coverage.

During documentation validation, the guide's headless example was run in a new
disposable dev-profile lab using the cached `4c98b570` backend image. Login and
protected-read controls succeeded, a missing token returned `401`, and canonical
logout returned `204`. The same revoked JWT then gave `401` with `Bearer` and
`200` with `bearer`, `BEARER` and `bEaReR`. This independently corroborated the
known read bypass; it was not a fixed-revision retest or a new renewal test.
The lab and generated credentials were removed. Fresh image builds and frontend
browser access were not rerun for this documentation check.

Burp added real value but request/token handling and UI effort were too high for the maintainer. They retired it for the rest of this audit. Daybreak was recorded as a possible future evaluation, with no adoption, purchase or effectiveness claim.

### Codex Security source pilot and subsequent validation

Plugin **0.1.32**, host Codex **0.166.0-alpha.5.1**, model **gpt-6.1-sol / medium**; scan ID `6b22ced8-51b8-42e1-bbdd-f78edfd38551`. The exported tracked-source snapshot excluded real `.env` files. The source pilot itself did not run application code or tests.

Coverage recorded **246/338 files fully security-read**. Remaining paths included dependency locks, Gradle wrapper implementation, legacy/reference/archive documents and binary media. Searches and architecture mapping were not counted as full reads. Three new findings were reported, and three known issues corroborated (#985, #979, #975). Because known findings were supplied as context, this was not a blind detection benchmark.

The plugin first rejected group-writable storage; the maintainer authorized removing group write. A temporary source snapshot disappeared during interruption and was restored from the same Git archive. The sealed report was retained for the original snapshot and automatic remediation disabled because the target was replaced. Subsequent runtime evidence was kept separately; the sealed source report was not rewritten. Provider retention/telemetry and incremental cost were not independently established.

Final local validation used custom serial replay through ZAP's API, **not automated discovery by ZAP**:

| Finding | Secure controls | Observed failure / persisted evidence |
| --- | --- | --- |
| [#986](https://github.com/fisma-benefit-app/benefit-app/issues/986#issuecomment-6661233093), foreign component parent | Missing-token read `401`; direct attacker read/create in victim project `404`; valid same-project child worked; ordinary archived write `409` | Creating in attacker's editable project with victim `parentFCId` returned `200`; cross-link persisted and appeared in victim graph without changing its lock version. Archived-parent variant also reproduced. Integrity impact confirmed; victim-owned content reading not established. |
| [#987](https://github.com/fisma-benefit-app/benefit-app/issues/987#issuecomment-6661234942), same-name independent projects | Outsider denied before sharing; distinct-name private control stayed `404`; intended shared control readable | After matching names, decoy sharing and a victim sharing action, outsider received `200` for the independent private project and its synthetic marker; unintended membership row persisted. Matching names and victim action are prerequisites. |
| [#988](https://github.com/fisma-benefit-app/benefit-app/issues/988#issuecomment-6661236744), CSV formulas | Literal and numeric controls; formula-disabled import retained text | Original `convertToCSV` output containing harmless `=1+1` was interpreted as formula/value `2` in LibreOfficeDev **26.8.0.0.alpha0** with formula-enabled semicolon/UTF-8 import. Function-to-file test, not browser export E2E; no Excel/stable LibreOffice, exfiltration or code-execution claim. |

### Trivy adoption and priority triage

The maintainer chose Trivy permanently. [PR #977](https://github.com/fisma-benefit-app/benefit-app/pull/977) added final-image scanning and [its operating guide](../guides/trivy.md). Trivy **0.76.1** scanned both built production images, without starting an application/database or publishing images. The adoption run successfully uploaded high/critical SARIF results. Vulnerabilities remain **report-only**; scanner/build/report errors fail the workflow. A green run does not mean zero findings.

| Adoption scan target | Critical | High | Medium | Low | Unknown |
| --- | ---: | ---: | ---: | ---: | ---: |
| Backend Ubuntu OS | 0 | 2 | 52 | 4 | 0 |
| Backend packaged Java | 10 | 26 | 30 | 10 | 0 |
| Frontend Alpine OS | 1 | 5 | 2 | 44 | 1 |

Counts are package/advisory occurrences. **Correction to early issue wording: 38 backend high/critical = 36 Java + 2 OS, not 38 Java.** Frontend high/critical = six occurrences / five unique CVEs. Original reports were preserved privately before their recorded 5 December artifact expiry; the final pass re-read them, rather than rescanning different images.

All eleven scanner-critical matches received prerequisite/source triage:

- [#982 Java triage](https://github.com/fisma-benefit-app/benefit-app/issues/982#issuecomment-6661374485): Spring header advisory [CVE-2026-22732](https://spring.io/security/cve-2026-22732/) was the first validation/update candidate; relevant configuration appeared present, but the failure trigger was not reproduced. XsltView/SSE prerequisites were absent in inspected source. Tomcat DIGEST/FORM/declarative-constraint features were absent; HTTP/2 was not enabled in controlled configuration. These are scoped observations, not blanket deployed non-applicability. Vendor severities differed from scanner labels. Remaining 26 high Java advisories were not exhaustively validated.
- [#983 frontend triage](https://github.com/fisma-benefit-app/benefit-app/issues/983#issuecomment-6661376787): Brotli vulnerable-version match confirmed; decoder reachability unresolved. Curl/libexpat consumers also need checks. No malformed compressed stream was tested.
- [#984 backend OS triage](https://github.com/fisma-benefit-app/benefit-app/issues/984#issuecomment-6661378792): apt/libapt high matches shared one CVE; prerequisites concern package-download/operator/build exposure. No Java API route invoking that operation was established.

No blanket suppressions, accepted risks or platform upgrades resulted from this triage. Compatible Boot/BOM/runtime updates and actual deployment verification remain follow-up work.

## Findings and remediation state at archive time

| Issue | Assessment / priority | Remediation and retest state |
| --- | --- | --- |
| [#974](https://github.com/fisma-benefit-app/benefit-app/issues/974) | Confirmed legacy password-change bypass; provisional high | Final fix removes `PUT /appusers/{id}`, retaining `/appusers/password`. #978 merged. At `4c98b570`: 100 backend tests, Spotless/build and ten ZAP replay cases passed; removed route `405`, missing/wrong current password `400/403`, rejected requests did not mutate password, valid replacement login worked. Earlier 101-test retain-both-routes result was superseded. No hosted retest. |
| [#975](https://github.com/fisma-benefit-app/benefit-app/issues/975) | One-character password accepted locally; original provisional medium, source pilot low; team priority unresolved | Open; policy/service/frontend consistency and boundary retests pending |
| [#979](https://github.com/fisma-benefit-app/benefit-app/issues/979) | Existing tokens survived password changes; source corroborated | Open. Selected policy: invalidate every session, including current; no opt-out. Durable/concurrent implementation and retests pending. |
| [#985](https://github.com/fisma-benefit-app/benefit-app/issues/985) | User-confirmed revoked-token read/renewal bypass; high remediation priority | Open; case-insensitive enforcement/logout/renewal matrix pending |
| [#986](https://github.com/fisma-benefit-app/benefit-app/issues/986) | Runtime-confirmed relationship-integrity failure; provisional medium | Open; fix and regression/replay retests pending |
| [#987](https://github.com/fisma-benefit-app/benefit-app/issues/987) | Runtime-confirmed conditional sharing failure; provisional medium | Open; stable family identity and true-version controls need remediation/retest |
| [#988](https://github.com/fisma-benefit-app/benefit-app/issues/988) | Conditional CSV formula interpretation; provisional low | Open; shared encoding fix and supported-client checks pending |
| #982–#984 | Package matches with varying/unresolved applicability | Open; no dependency/image fixes or before/after rescans in final pass |

[#980](https://github.com/fisma-benefit-app/benefit-app/issues/980) is an optional standalone “log out other sessions” feature assessment, not a vulnerability or approved implementation. Account-wide invalidation after password change remains mandatory selected policy. Dependabot/CSRF work is separately owned.

## ASVS scope and remaining verification

The plan selected **OWASP ASVS 5.0.0**, a subset spanning levels. The following is a coverage register, not a compliance checklist. Every ID in a row has the stated bounded status; partial means no complete requirement pass.

| IDs | End-of-assessment evidence / limitation |
| --- | --- |
| 8.1.1, 8.2.1, 8.2.3, 8.3.1, 15.3.3 | Partial authorization/version/locking samples only |
| 8.2.2 | Confirmed open failures #986/#987; other paths unverified |
| 8.1.2, 15.3.1 | Not fully verified; policy questions remain |
| 6.2.1 | Confirmed password-length failure #975 |
| 6.2.3 | #974 targeted route gap remediated/retested locally; entire requirement not verified |
| 6.3.1, 6.3.4 | Partial authentication/current-password evidence; practical throttle bounds unverified |
| 6.1.1 | Not verified |
| 7.4.1 | Confirmed open revocation failure #985; canonical-token persistence control held across backend recreation |
| 7.4.3 | Open password-change invalidation gap #979; chosen current-session policy is stronger product intent, not a claim about ASVS wording |
| 7.1.1, 7.3.2, 7.4.2 | Not fully verified |
| 9.1.1 | Partial tampered-token evidence only |
| 9.1.2, 9.1.3, 9.2.1, 9.2.3 | Not verified |
| 1.2.1, 3.2.2 | Partial stored-input/browser samples only |
| 1.2.10 | Added after CSV discovery; conditional failure #988 |
| 3.4.2, 3.4.3, 3.5.1, 3.5.2, 3.5.4 | Not fully verified; CSRF separately investigated |
| 13.2.2, 13.3.1, 13.4.1, 13.4.2, 13.4.5 | Source/settings observations only; full secrets/deployment verification not completed |
| 15.1.1, 15.1.2, 15.2.1 | Partial component inventory/scanning/triage; not a full requirement pass |

Exact pinned requirement text: [ASVS v5.0.0](https://github.com/OWASP/ASVS/tree/v5.0.0/5.0/en). The [original plan](https://github.com/fisma-benefit-app/benefit-app/issues/959#issuecomment-6654260768) records the initial selection.

Remaining coverage is tracked in [#990](https://github.com/fisma-benefit-app/benefit-app/issues/990): deployed TLS/configuration/schema/firewall/JDBC verification; complete role/endpoint/body coverage; archived-comment policy; throttle resource bounds; broader JWT/CSRF/browser/storage tests; secrets history; PostgreSQL image/build-stage/npm coverage; and supported spreadsheet clients. These are unverified areas and team suggestions, not additional confirmed vulnerabilities or accepted risks. Owners, scope and review dates must be agreed there.

## Decisions, evidence and completion boundary

Retain ZAP plus scripted authenticated replay; permanently adopt Trivy; use the Codex Security source workflow on demand with validation. Burp was retired for usability, Gitleaks remains undecided, Daybreak unevaluated. No scanner license purchase or permanent Codex Security CI stack was selected. Existing backend regressions are preferred for API security; browser-only evidence should justify any Playwright expansion.

Public evidence is the sanitized issue/comment register linked above. The local private supplemental bundle retained status/boolean readbacks, spreadsheet options/results, alert counts, replay source, Trivy priority dispositions and original CI reports. The sealed Codex bundle separately retains report/findings/coverage/SARIF. Private machine paths and raw reports are deliberately not committed; repository documentation and issues provide the durable shared summary. Transfer approved evidence to team-controlled restricted storage if future maintainers need the originals.

Audit lab containers, networks, temporary database, generated credentials and raw proxy captures were removed. Stale local branches/worktrees were cleaned after #978 merged. Docker image/build caches were retained. No production remediation or post-merge deployment validation is claimed.

At the maintainer's request, #959 can close as the **completed, documented baseline investigation**, with #981 closing on the documentation PR. This narrows the earlier umbrella completion proposal: fixes, full verification and risk decisions remain in linked open issues, including #990. Closing these two records does not close findings, accept risk, or establish that Benefit is secure.
