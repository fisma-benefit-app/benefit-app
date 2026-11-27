# Dependency vulnerability scanning with Trivy

Trivy complements Dependabot and CodeQL by scanning a freshly built backend JAR
and the frontend npm lockfile. These are CI artifacts, not necessarily the exact
artifacts deployed to Scalingo or GitHub Pages. The original image-scan
pilot is recorded in [security audit #959](https://github.com/fisma-benefit-app/benefit-app/issues/959)
and [PR #977](https://github.com/fisma-benefit-app/benefit-app/pull/977).

## Schedule and results

[Trivy dependency scan](../../.github/workflows/trivy.yml) runs on relevant PRs
and pushes to `main`, every Friday at 19:35 UTC, and manually from Actions. The
backend job builds a JAR with Java 21 and scans its packaged dependencies in
rootfs mode; Trivy filesystem mode does not inspect JAR files. The frontend job scans `package-lock.json`, including development dependencies used
in the build. A lockfile match does not establish that code is included in the
published bundle or that an advisory is exploitable.

- Job summaries list vulnerability counts at all severities.
- `trivy-backend` and `trivy-frontend` artifacts contain JSON, text, SARIF and
  provenance for 30 days. Provenance records revision, scan time, scanner version
  and SHA-256 of the JAR or lockfile.
- High/critical findings are uploaded to Code scanning in separate categories.
  SARIF locations point to `backend/build.gradle` or `frontend/package-lock.json`
  for stable repository links; the backend location does not identify a specific
  declaration. The JSON report retains the JAR paths and package versions.
  Fingerprints distinguish packages and advisories. Fork and Dependabot PRs
  retain reports but skip the upload.
- The scan is report-only: all severities and unfixed findings remain visible,
  and findings do not fail the job. Build, scan, conversion and upload errors do.
  A green run does not mean there are no vulnerabilities.

## Run locally

Install the workflow's pinned Trivy version, currently 0.76.1, and Java 21.
From the repository root:

```bash
(cd backend && ./gradlew clean bootJar)
trivy rootfs --scanners vuln --list-all-pkgs --format json --output /tmp/benefit-backend-trivy.json backend/build/libs
trivy fs --scanners vuln --include-dev-deps --list-all-pkgs --format json --output /tmp/benefit-frontend-trivy.json frontend/package-lock.json
trivy convert --format table /tmp/benefit-backend-trivy.json
trivy convert --format table /tmp/benefit-frontend-trivy.json
sha256sum backend/build/libs/*.jar frontend/package-lock.json
```

Record the source revision, scanner version and time as well. Vulnerability
information changes over time, and independently built artifacts can resolve
different versions. Compare package/advisory records rather than only totals.

## Triage and limitations

Compare each advisory and package with existing Dependabot alerts, PRs and issues
before creating work. Dependabot security alerts and updates are enabled, but no
repository `dependabot.yml` defines a version-update schedule. The tools can
report the same advisory; use one remediation issue or PR rather than duplicates.

Check the vendor advisory, affected version, configuration and reachable code.
Separate npm build-only dependencies from dependencies included in shipped code;
lockfile membership alone does not prove either exposure or absence of exposure.
Record uncertainty and avoid broad suppressions. For Java, compare the JAR's
resolved dependencies with the actual hosted artifact before claiming a deployed
fix. A clean scan does not establish that an application is secure.

This workflow scans vulnerabilities only. It does not scan Docker image or hosted
operating-system packages, PostgreSQL, secrets, configuration or application
behavior. Scalingo runtime security must be assessed separately.
