# Container vulnerability scanning with Trivy

Trivy complements Dependabot, CodeQL and GitHub secret scanning by inspecting
the final backend and frontend production Docker images. The pilot and adoption
decision are recorded in [security audit #959](https://github.com/fisma-benefit-app/benefit-app/issues/959)
and [PR #977](https://github.com/fisma-benefit-app/benefit-app/pull/977).

## When it runs and where to find results

[Trivy image scan](../../.github/workflows/trivy.yml) runs on PRs targeting
`main` and pushes to `main` when `backend/**`, `frontend/**`, or its own
workflow changes. It also runs every Friday at 19:35 UTC and can be started from
**Actions → Trivy image scan → Run workflow** once merged into the default branch.
The weekly run checks for newly disclosed vulnerabilities even without a code change.

Each component builds separately using its production Dockerfile and
`docker build --pull`. No application or database is started, no image is published,
and no deployment credentials are needed. Actions and Trivy are pinned; update
those pins deliberately and review the resulting reports.

- The Actions job summary lists counts for all severities.
- Artifacts `trivy-backend` and `trivy-frontend` contain `trivy.json`,
  `trivy.txt`, `trivy.sarif`, and `provenance.txt`, retained for 30 days.
  Provenance includes the checked-out revision, PR head when applicable,
  image ID, time and scanner version.
- High/critical findings are uploaded to **Security → Code scanning**, with separate
  `trivy-backend` and `trivy-frontend` categories. Fork and Dependabot PRs retain
  artifacts and summaries but skip that upload because their tokens can be restricted.

The workflow is initially **report-only for vulnerabilities**: it retains all
severities and unfixed advisories, without making the existing backlog fail CI.
Build, scanner, report and upload errors still fail the job. A green run means
the workflow completed; inspect the reports for findings. No ignores or severity
gate were added. Revisit gating after the initial backlog has been triaged.

## Run locally

Install [Trivy](https://trivy.dev/docs/latest/getting-started/installation/) and use
the workflow's pinned version (currently **0.76.1**) when comparing results.
With Docker running, execute from the repository root:

```bash
docker build --pull -t benefit-backend:audit ./backend
docker build --pull -t benefit-frontend:audit ./frontend

trivy image --scanners vuln --format json --output /tmp/benefit-backend-trivy.json benefit-backend:audit
trivy image --scanners vuln --format json --output /tmp/benefit-frontend-trivy.json benefit-frontend:audit

trivy convert --format table /tmp/benefit-backend-trivy.json
trivy convert --format table /tmp/benefit-frontend-trivy.json
```

Record `git rev-parse HEAD`, `trivy --version`, scan time, and each image's
`docker image inspect --format '{{.Id}}' IMAGE`. Trivy downloads vulnerability
databases. Different database snapshots and floating base-image tags can change
results even at the same source revision. Use the recorded image ID to identify
what was assessed; the workflow does not retain the built image itself.

## Assess findings and plan fixes

Start with high/critical findings, then assess the rest. Severity is a triage
input, not proof of exploitability. Counts are package/advisory occurrences:
one CVE affecting several packages is counted several times.

1. Confirm the installed package/version and image from the JSON report.
   Deduplicate by advisory and package, and compare with existing Dependabot alerts
   and issues before opening new work.
2. Read the upstream advisory and vendor severity. Establish whether the affected
   feature/configuration is used and reachable. Record evidence and uncertainty;
   a package match alone does not prove an attack works.
3. Group fixes by their owner: compatible Spring Boot/BOM and Java dependency
   updates; backend base image; frontend nginx/Alpine image and packages.
   Do not select unrelated framework major versions merely to clear a report.
4. Link remediation issues/PRs to #959. Record advisory IDs, package versions,
   expected fixes, applicability, priority and remaining risk. Any dismissal or
   exception needs a reason and a review point; do not hide the backlog with a broad ignore.
5. Rebuild, run normal checks and repeat the scan after each fix. Compare matching
   advisory/package records rather than just total counts. Verify the deployed
   image/version separately before claiming production remediation.

## Why Trivy and what it does not cover

The pilot demonstrated final-image OS package coverage and detection of Java
libraries inside the packaged backend JAR. This complements source analysis and
provides a view of resolved artifacts. It was selected for that additional
coverage, a short successful CI run, inspectable reports, and no paid scanner
license. Ongoing costs include CI/storage usage and triage/update time.
The pilot did not establish that Trivy detects more Java issues than Dependabot.

This workflow scans vulnerabilities only. It does not perform penetration tests,
authorization tests, secret scanning, or configuration audits. Frontend runtime
scanning sees nginx/OS content and does not provide full npm/build dependency
coverage. Build stages and the standalone PostgreSQL image are not scanned.
Fresh builds of repository Dockerfiles are not necessarily the images deployed
on Heroku, Scalingo or a self-hosted server.

Use the audit's selected OWASP ASVS 5.0.0 component requirements as assessment
criteria; a clean scan alone does not verify ASVS 15.2.1 or an ASVS level.
Manual/dynamic testing and application security regressions remain separate work.
