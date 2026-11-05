# Security audit guide

Use this workflow for a bounded Benefit security assessment: agree scope, evaluate a small pilot, collect evidence, then fix and retest confirmed findings. The [5 November 2026 archive](../archive/security_audit_2026-11-05.md) records what actually ran and its limitations. Commands below are a reusable starting procedure, not evidence that a future revision has passed.

## 1. Agree scope and security expectations

Open an investigation issue. Record the owner, source revision, targets, roles, allowed operations, time/request limits, exclusions and evidence location. Use **isolated local disposable data** for active testing. Production and shared testing environments need separate explicit authorization and scope. Do not use real user data, credentials, external callbacks, broad password guessing or load tests in this local procedure.

Read `AGENTS.md`, [authentication](authentication.md), [database](database.md), controllers/services and current tests. Inspect current settings/results for existing CodeQL, Dependabot and secret scanning with push protection; enabled checks are starting evidence, not completed audits. The configuration snapshot below records the verified settings; recheck rather than assuming they persist.

### Current automated security configuration

Verified **5 November 2026** against repository settings/API and tracked workflow
configuration. GitHub-managed settings are not all represented by YAML files;
update this snapshot when those settings change.

| Check | Current configuration and execution | Results and limitations |
| --- | --- | --- |
| Dependabot | Alerts and security-update PRs enabled. No `.github/dependabot.yml` or `.yaml` is present, so there is no repository-defined version-update schedule/ecosystem configuration. | **Security → Dependabot alerts**, plus generated PRs. Security updates can operate without a version-update YAML file; do not infer routine upgrades or complete dependency coverage. Reconcile with Trivy before opening duplicate work. |
| CodeQL | GitHub **default setup**, default query suite, remote threat model, standard runner; Actions, Java/Kotlin and JavaScript/TypeScript configured. Weekly schedule, plus GitHub-managed push/PR triggers. No custom CodeQL workflow is checked in. | **Actions → CodeQL** for execution/errors and **Security → Code scanning** for findings. Recent main/PR analyses were visible. Default-suite coverage does not establish complete source or business-authorization verification. |
| Secret scanning **with push protection** | Both enabled. Non-provider patterns and validity checks disabled in the returned settings. | **Security → Secret scanning** and repository **Settings → Code security / Secret protection**. Push protection checks supported secret types on pushes; it is not universal credential detection. Custom patterns and bypass/delegated-bypass policy were not independently inventoried. Rotate/revoke a real leak; removing text alone is insufficient. |
| Trivy | [Tracked workflow](../../.github/workflows/trivy.yml), pinned **0.76.1**; builds final backend/frontend production images and scans vulnerabilities at all severities, including unfixed. Relevant PRs/main pushes, Friday **19:35 UTC**, manual dispatch. Vulnerabilities are report-only; execution/report errors fail. | **Actions → Trivy image scan** summaries and 30-day JSON/text/SARIF/provenance artifacts; high/critical results in Code scanning under separate backend/frontend categories. Fork/Dependabot PRs skip SARIF upload but retain reports. Full procedure and exclusions: [trivy.md](trivy.md). |

The earlier audit-stage snapshot had secret-scanning push protection disabled;
the later configuration check confirmed it enabled. This documentation change
does not enable or alter repository security settings.

For a future read-only verification, use the GitHub settings UI or authenticated
GitHub CLI with suitable repository access:

```bash
gh api repos/fisma-benefit-app/benefit-app --jq '.security_and_analysis'
gh api repos/fisma-benefit-app/benefit-app/code-scanning/default-setup
gh api repos/fisma-benefit-app/benefit-app/vulnerability-alerts --silent
```

The last endpoint returns HTTP **204** when alerts are enabled; inspect the HTTP
status if needed. Access errors are not proof a feature is disabled. Do not dump
secret-alert payloads into logs to verify configuration. Review current language
analyses, dependency manifests and alert disposition separately from settings.
See GitHub's documentation for [Dependabot configuration](https://docs.github.com/en/code-security/concepts/supply-chain-security/about-the-dependabot-yml-file),
[CodeQL default setup](https://docs.github.com/en/code-security/concepts/code-scanning/setup-types)
and [secret-scanning pattern coverage](https://docs.github.com/en/code-security/reference/secret-security/supported-secret-scanning-patterns).

Start with **OWASP ASVS 5.0.0**, pinned to [v5.0.0](https://github.com/OWASP/ASVS/tree/v5.0.0/5.0/en). Read each selected requirement's exact text and record evidence individually. The November subset was:

| Security question | ASVS 5.0.0 identifiers to consider |
| --- | --- |
| Cross-user project/component/comment access; membership and parent relationships | 8.1.1, 8.1.2, 8.2.1, 8.2.2, 8.2.3, 8.3.1 |
| Archived/latest versions, protected body fields and stale saves | 8.2.3, 15.3.1, 15.3.3 |
| Current-password checks, password policy and throttling | 6.1.1, 6.2.1, 6.2.3, 6.3.1, 6.3.4 |
| Logout, renewal, password changes, restart and session limits | 7.1.1, 7.3.2, 7.4.1, 7.4.2, 7.4.3 |
| JWT validation and key/environment boundaries | 9.1.1, 9.1.2, 9.1.3, 9.2.1, 9.2.3 |
| Stored text, CSV formulas, browser storage, CORS and CSRF | 1.2.1, 1.2.10, 3.2.2, 3.4.2, 3.4.3, 3.5.1, 3.5.2, 3.5.4 |
| Secrets, runtime/debug exposure and deployment configuration | 13.2.2, 13.3.1, 13.4.1, 13.4.2, 13.4.5 |
| Dependency/component inventory and maintenance | 15.1.1, 15.1.2, 15.2.1 |

Choose a smaller subset if necessary and state what remains untested. Use **confirmed failure**, **partial evidence**, **not tested**, or **not applicable with justification**; record an actual pass only after checking the whole requirement in the agreed scope. Never infer an ASVS level from this mixed subset.

## 2. Select tools by demonstrated value

| Category | Project choice / use | Limits and alternatives |
| --- | --- | --- |
| Dynamic requests and limited scanning | ZAP plus small scripted API replays | Retained after the pilot; scripted role/state assertions found authorization failures generic scanning missed. Successful replay is not automated detection. |
| Final-image packages | Trivy, permanently adopted | See [Trivy guide](trivy.md) and existing workflow; no duplicate workflow needed. No full npm/build-stage/PostgreSQL coverage or penetration testing. |
| Source and attack-path review | Codex Security plugin, on demand when available | November scan produced three useful new findings; independently validate. Not a blind benchmark, permanent CI adoption or guarantee of full coverage. Ordinary manual source review remains useful. |
| Existing automation | CodeQL, Dependabot, GitHub secret scanning | Inspect coverage, alert disposition and exact revisions. These were already enabled; do not propose enabling them as new audit work. |
| Manual proxy | Burp Community, optional | Found #985, then retired by this maintainer because operation was laborious. No paid license is required for this workflow. ZAP/scripts are the practical default. |
| Secrets history | Gitleaks CLI, undecided | Trial only if it adds history/custom-pattern value beyond GitHub. No November Gitleaks run; installation is not a prerequisite. |
| Regressions | Existing backend tests; existing Playwright only where browser behavior matters | Follow repository test policy. Avoid a new browser suite for API-only assertions. |

Compare **within categories** using coverage, confirmed findings, missed seeded flaws, false positives, operator time/usability, repeatability, maintenance, total cost and data handling. Use separate disposable fixtures with a known flaw and a fixed control; never weaken the real application. The November fixture showed ZAP detecting reflected XSS but missing generic authorization failure. Do not turn that one experiment into a broad ranking of products.

Record versions, add-ons/rules, image digests and configuration. ZAP/Trivy process assessment data locally, but image pulls and vulnerability databases require downloads. AI tools can send source/context to model services: inspect permissions, provider/retention settings and budget before use. Do not send `.env`, private keys, tokens or raw captures to a model. No extra overlapping scanner or license purchase without evidence. Daybreak was only a future consideration, not a selected tool.

### Future candidates if coverage needs expand

These are investigation leads, **not adopted tools or additional requirements for
the November audit**. ZAP is already retained, and Burp Community remains an
optional manual alternative; their proxy functions overlap. Start with a defined
gap, then pilot one tool in that category against the existing workflow.

| Candidate | Practical Benefit use | Evaluation boundary |
| --- | --- | --- |
| [testssl.sh](https://testssl.sh/) or [SSLyze](https://github.com/nabla-c0d3/sslyze) | TLS/certificate checks after deployment changes and during periodic configuration review | Choose one. Public frontend/backend endpoints require separately authorized hosted scope and hosting-provider constraints; fixes may belong to the platform. This fills a different gap from local HTTP testing. |
| [Nmap](https://nmap.org/book/man.html) | Check unexpected exposed ports/services on a self-hosted server, including database exposure | Use only for explicitly scoped hosts/ports the project is authorized to assess. Shared managed hosting limits relevance and permission; do not infer a whole provider IP is in scope. |
| [SonarQube](https://www.sonarsource.com/products/sonarqube/) or [Snyk Code](https://docs.snyk.io/scan-with-snyk/snyk-code) | Additional Java/TypeScript source analysis if a pilot demonstrates useful rules or findings | Compare incremental value with **existing CodeQL and Codex/manual source review**, not just Trivy. Check language/rule coverage, edition, pricing, source upload/retention and maintenance before selecting one or adding CI. Snyk Code is the source-analysis product; other Snyk products have different coverage. |
| [Nuclei](https://docs.projectdiscovery.io/opensource/nuclei/overview) or [Nikto](https://github.com/sullo/nikto) | Later targeted checks for exposed web services, known configurations and vulnerability signatures | Review selected templates/plugins and request behavior, allowlist targets, limit rate, and disable external callback services. Expect overlap/noise and validate findings. Hosted execution needs its own authorization; signatures do not establish business authorization correctness. |

Recheck official documentation, licensing and data handling when evaluating;
none of these additional candidates was run or benchmarked in the November
assessment. The existing [remaining-coverage issue #990](https://github.com/fisma-benefit-app/benefit-app/issues/990)
is sufficient to record a future selection decision; this list creates no new
remediation finding or installation commitment.

## 3. Prepare a disposable local lab

Do not run the repository's normal Compose against your existing database for an audit. It has fixed names, reads the real `.env` and the `dev` profile reseeds. A project-name override alone does not isolate it. Use an exported tracked-source snapshot and a standalone Compose file, with unique resources, generated keys, a disposable database and loopback-only host ports.

The following Linux/Bash example needs Git, Docker Compose, Python 3 and OpenSSL. Run from the repo root. It constructs an audit configuration; inspect it privately and validate before starting. It uses production Dockerfiles with an explicitly **dev-profile backend** for seeding; this is not production-mode assurance. Pin/review base images separately when reproducible package comparisons matter.

```bash
umask 077
audit_dir=$(mktemp -d /tmp/benefit-security-audit.XXXXXX)
export audit_dir
mkdir "$audit_dir/source"
git rev-parse HEAD > "$audit_dir/revision.txt"
git archive HEAD | tar -x -C "$audit_dir/source"
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 \
  -out "$audit_dir/key.pem" 2>"$audit_dir/keygen.log"

docker build --pull -t benefit-audit-backend:local "$audit_dir/source/backend"
docker build --pull -t benefit-audit-frontend:local "$audit_dir/source/frontend"
docker pull ghcr.io/zaproxy/zaproxy@sha256:9624669db72f54d86c4b46a7064518bd9bf79d8c61a4c31befa9923489f328af

python3 - <<'PY'
import json, os, secrets
from pathlib import Path
p = Path(os.environ['audit_dir'])
api_key = secrets.token_hex(24)
(p / 'zap-key').write_text(api_key)
# The non-root ZAP user must read this bind-mounted audit-only key.
# The parent directory remains mode 700 on the host.
(p / 'zap-key').chmod(0o644)
db = {'POSTGRES_DB': 'benefit_audit', 'POSTGRES_USER': 'audit',
      'POSTGRES_PASSWORD': secrets.token_hex(24)}
config = {
  'name': 'benefit-audit-' + p.name.rsplit('.', 1)[-1].lower(),
  'services': {
    'db': {
      'image': 'postgres:16-alpine', 'environment': db,
      'tmpfs': ['/var/lib/postgresql/data'],
      'healthcheck': {'test': ['CMD-SHELL', 'pg_isready -U audit -d benefit_audit'],
                      'interval': '3s', 'timeout': '3s', 'retries': 30}},
    'backend': {
      'image': 'benefit-audit-backend:local',
      'environment': {
        'SPRING_PROFILES_ACTIVE': 'dev',
        'SPRING_DATASOURCE_URL': 'jdbc:postgresql://db:5432/benefit_audit',
        'SPRING_DATASOURCE_USERNAME': db['POSTGRES_USER'],
        'SPRING_DATASOURCE_PASSWORD': db['POSTGRES_PASSWORD'],
        'JWT_PRIVATE_KEY': (p / 'key.pem').read_text(),
        'CORS_ALLOWED_ORIGINS': 'http://localhost:18080',
        'API_DEBUG': 'never', 'API_DEBUG_LEVEL': 'info'},
      'depends_on': {'db': {'condition': 'service_healthy'}},
      'ports': ['127.0.0.1:18081:8080']},
    'frontend': {
      'image': 'benefit-audit-frontend:local',
      'environment': {'BACKEND_UPSTREAM': 'backend:8080'},
      'depends_on': ['backend'], 'ports': ['127.0.0.1:18080:80']},
    'zap': {
      'image': 'ghcr.io/zaproxy/zaproxy@sha256:9624669db72f54d86c4b46a7064518bd9bf79d8c61a4c31befa9923489f328af',
      'environment': {'ZAP_PORT': '8090'},
      'command': ['zap.sh', '-daemon', '-silent', '-host', '0.0.0.0', '-port', '8090',
                  '-config', 'api.key=' + api_key],
      'volumes': [str(p / 'zap-key') + ':/audit/zap-key:ro']}
  },
  'networks': {'default': {'internal': True}}
}
(p / 'compose.json').write_text(json.dumps(config))
PY

docker compose -f "$audit_dir/compose.json" config --quiet
docker compose -f "$audit_dir/compose.json" up -d
```

The lab configuration contains generated secrets: **do not print `docker compose config`, commit the directory, or upload raw logs**. No database port or ZAP API is published. Image building/pulling occurs before the isolated runtime starts. Check free ports first. Use the correct Docker context consistently; do not switch the user's global context or tear down their normal stack.

Wait for backend health through the local API or from the lab network; a container being started is not readiness. Browser: `http://localhost:18080/`; direct backend: `http://localhost:18081/`. If the engine cannot publish loopback ports from an internal network (observed during this audit), keep headless requests inside ZAP as below. For browser access, explicitly review an audit-only access bridge/firewall; do not solve it by exposing the DB/ZAP API or disabling isolation silently.

The seed supplies `user` / `user`, publicly known **local fixture credentials**. Add distinct synthetic A/B/C accounts inside this DB only, using locally generated BCrypt hashes and the account schema in [database.md](database.md). There is no registration endpoint. Prepare separate A/B projects, a shared project, components/comments and archived/latest versions. Record IDs privately. Restarting the backend under `dev` reseeds; PostgreSQL tmpfs is disposable on container recreation too.

For restart-persistence/default-profile tests, use a fresh lab DB initialized manually from the reviewed schema, omit `SPRING_PROFILES_ACTIVE=dev`, retain the generated audit key and DB across **backend-only** recreation. Do not modify shared `spring.sql.init.mode: never` or initialize a hosted DB. Record this as a separate environment; a dev restart cannot test revocation persistence.

## 4. Use ZAP for authenticated replay before scanning

Docker supplies ZAP without a desktop install. November used **2.17.0**, pinned above; update deliberately and record the new digest/version/add-ons. See the official [Docker guide](https://www.zaproxy.org/docs/docker/about/) and [API reference](https://www.zaproxy.org/docs/api/). `-silent` reduces unsolicited startup traffic; the internal network is the boundary, not that flag alone. Keep the API key enabled. Setting `ZAP_PORT` matches its healthcheck to the daemon port.

This small harness uses Python already in the ZAP image. It sends only fixed local requests through `core/action/sendRequest`, retains JWTs in memory, and prints statuses rather than response bodies. It demonstrates the #985 control structure; it does not run an active scanner or establish full authentication coverage. Run against the disposable seeded lab only after readiness:

```bash
docker compose -f "$audit_dir/compose.json" exec -T zap python3 - <<'PY'
import base64, json, time, urllib.parse, urllib.request
from pathlib import Path
key = Path('/audit/zap-key').read_text().strip()

def send(method, path, authorization=None):
    assert path in ('/token', '/projects', '/auth/logout')
    lines = [f'{method} http://backend:8080{path} HTTP/1.1', 'Host: backend:8080']
    if authorization:
        lines.append('Authorization: ' + authorization)
    if method == 'POST':
        lines.append('Content-Length: 0')
    request = '\r\n'.join(lines) + '\r\n\r\n'
    data = urllib.parse.urlencode({'apikey': key, 'request': request,
                                   'followRedirects': 'false'}).encode()
    req = urllib.request.Request('http://127.0.0.1:8090/JSON/core/action/sendRequest/', data=data)
    with urllib.request.urlopen(req, timeout=15) as response:
        messages = json.load(response)['sendRequest']
    message = messages[-1] if isinstance(messages, list) else messages
    status = int(message['responseHeader'].splitlines()[0].split()[1])
    time.sleep(0.25)
    return status, message['responseBody']

basic = base64.b64encode(b'user:user').decode()
status, body = send('POST', '/token', 'Basic ' + basic)
assert status == 200, 'Local login failed; stop and check readiness/configuration'
token = json.loads(body)['token']
assert token, 'No token; stop'
status, body = send('GET', '/projects', 'Bearer ' + token)
assert status == 200 and isinstance(json.loads(body), list), 'Protected control failed'
status, _ = send('GET', '/projects')
assert status == 401, 'Missing-token control failed'
status, _ = send('POST', '/auth/logout', 'Bearer ' + token)
assert status in (200, 204), 'Logout setup failed'
failed = False
for scheme in ('Bearer', 'bearer', 'BEARER', 'bEaReR'):
    status, _ = send('GET', '/projects', scheme + ' ' + token)
    print('Revoked protected read:', scheme, status, 'expected 401')
    failed |= status != 401
raise SystemExit(1 if failed else 0)
PY
```

On the vulnerable November revision, lowercase accepted schemes can return `200`; report a failed security expectation rather than weakening the assertion. A `200` preflight is not proof of bypass. Extend this with fresh tokens per case for logout in every accepted casing and revoked `POST /token` renewal. A renewal response alone does not establish that its replacement token reaches protected data: test that separately and safely. Never echo JWTs or put them in process command arguments, shell history or public reports.

For multi-user cases, keep separate in-memory tokens and expected IDs. Send the original valid request, mutate **one** account/object/body field, then verify a fresh read and, where necessary, persisted rows. Assert both authorized controls and denied requests. `400`, `401`, `403`, `404`, `405` and `409` mean different things; a status without content/state evidence is insufficient.

### Small active scan after authenticated coverage works

Create a ZAP context allowing only the lab backend address and explicitly selected paths. Import/discover current API methods from controllers/OpenAPI; do not scan an unbounded crawler tree. Configure authentication/header injection for the synthetic account and verify protected reads **and writes**, expected fixture IDs and continued access throughout. A collection of `401` responses is failed setup, not a clean scan. Restrict redirects/targets to scope.

Start with one expendable endpoint, selected rule(s), one thread/host, a delay and a short time limit. November's limited example was rule **40018**, one comment POST, 250 ms delay and 90 seconds. Do not reuse its results for other routes or assume the replay harness above configures an active scan. Save the exact context/policy/automation configuration privately, inspect request history and persisted state, and stop on out-of-scope traffic or unexpected resource use. Remove fixture comments afterward by destroying the lab.

[ZAP's passive Baseline Scan](https://www.zaproxy.org/docs/docker/baseline-scan/) is a specifically named mode. It does not replace these authorization or active tests. Keep scanner alerts, custom replay findings and manual observations separate in reports.

## 5. Review source, packages, secrets and browser behavior

### Codex Security / source review

If the Codex Security plugin is installed, invoke its **standard repository security scan** workflow against a tracked-source snapshot with an explicit brief: assessment only, exact revision, local/disposable active scope, known issues, selected ASVS requirements, no automatic fixes or hosted targets. Record plugin/host/model versions, scan ID, actual read coverage/exclusions, validation and report location. Let the plugin perform its configured workflow rather than substituting an invented CLI command. This guide does not require a CLI installation, paid product or permanent CI integration.

Inspect available source export before granting access: exclude `.env`, ignored credentials and unrelated private artifacts. Review threat boundaries, follow candidates through controllers/services/mappers/repositories and independently reproduce plausible findings. Link duplicates; known supplied findings are corroborations, not new blind discoveries. Do not rerun or mutate a sealed report to add runtime evidence; keep supplemental evidence tied to its own revision. If target provenance changes, reverify before later remediation.

Manual review can follow the same process without the plugin. Concentrate on URL/body relationship mismatches, name-based authorization families, all password/session paths, output contexts and deployment configuration. AI-generated hypotheses need counterexamples and runtime evidence; no-path-found searches are bounded negative evidence.

### Trivy and existing GitHub checks

Follow [trivy.md](trivy.md) for installation, pinned version, builds, commands, reports, schedule and limitations. Download the JSON/text/SARIF/provenance before retention expires. Record exact image IDs, source revision, vulnerability database time and installed packages. Compare scanner and vendor severity, prerequisites, runtime reachability and compatible fixes. Deduplicate package occurrences versus CVEs. Inspect affected deployed artifacts separately. Report-only green jobs can contain critical findings; absence of a source feature is not proof that deployed extensions/configuration cannot enable it.

Review CodeQL analyses by language/revision and triage alerts. Reconcile Dependabot before creating overlapping package issues. Preserve separately owned CSRF work; a Spring dependency advisory is not automatically the same as a CSRF configuration issue. Scan build dependencies and PostgreSQL separately only after defining that scope; final frontend nginx scanning does not include the full npm tree.

Use GitHub's Security UI to inspect secret-scanning coverage/settings and alert disposition without copying secret values. If Gitleaks is selected for a pilot, install a reviewed release per [its official instructions](https://github.com/gitleaks/gitleaks), check `gitleaks version` / `gitleaks git --help`, then scan a complete local history with redaction:

```bash
gitleaks git --redact --report-format json \
  --report-path "$audit_dir/gitleaks-redacted.json" .
```

Check clone completeness/refs first; this command alone does not prove every ref/history is covered. Reports still need restricted handling and manual review. Compare with GitHub coverage using never-valid local fixtures, and record misses/noise before deciding adoption. Never push seeded secrets; if a real leak is found, revoke/rotate before public disclosure.

### Browser, exports and regression coverage

Use synthetic text and local proof markers, including another user's render path; inspect actual DOM/execution rather than interpreting reflected response text as XSS. Review localStorage exposure: a base-path prefix names keys, it does not isolate same-origin scripts. Avoid real JWT exfiltration or external collectors.

For CSV, exercise the real shared export function and an end-to-end download where needed. Use harmless `=1+1` and literal/numeric controls, noting spreadsheet version, separator, encoding, import options and formula-enabled/disabled results. Preserve CSV and cell readback, not just a screenshot. The [LibreOffice CSV filter documentation](https://help.libreoffice.org/latest/en-US/text/shared/guide/csv_params.html) describes import parameters. Do not infer Excel or arbitrary code execution from a Calc arithmetic formula. Request supported-client coverage from the team.

Prefer focused real-auth backend regression tests for API authorization and token lifecycle. Run the repository's existing checks, following `AGENTS.md` and the pre-PR skill. Extend existing Playwright only when browser session/storage/render behavior warrants it; follow the frontend test criteria rather than adding tests that mirror wrappers or text.

## 6. Record, fix, retest and close

Keep the investigation issue as a concise decision log. Each finding needs: affected revision/configuration, endpoint/roles, ASVS version/ID, prerequisites, expected/actual response and state, severity/confidence, confirmed/suspected/non-applicable/duplicate disposition, owner, narrow remediation issue/PR and retest result. Check duplicates first. Optional features and policy questions are not discovered vulnerabilities.

Useful Benefit cases from November:

- Two/three accounts: project/component/comment IDs, membership grants/removal, parent IDs and independent same-name projects; preserve true-version sharing controls.
- Login/renewal/logout: accepted scheme casings, old/new token replay, malformed tokens, expiry/caps, restart and account changes. Password-change policy is logout of every session including current (#979), not optional logout of other sessions (#980).
- Archived versions and request bodies: forged version/IDs/relationships, missing/stale locks and verified non-mutation.
- Stored text and exports: project/component/comment contexts, browser rendering and spreadsheet interpretation.

Finish the assessment before unrelated fixes if that is the agreed workflow. Fix confirmed problems through narrow PRs with meaningful regressions, run relevant normal checks, replay the original bypass plus positive/denial controls, and rescan affected images/packages. Record local retest, merge and deployed verification separately; a merged PR does not prove deployed remediation. Accepted risks need an explicit owner, reason and review date; otherwise retain an open issue.

Archive a sanitized summary in `documents/archive/` and link the future guide. Keep full reports/captures outside Git with access restrictions, stated retention and a team-controlled handoff location. Preserve sanitized evidence before CI expiry. Remove credentials, JWTs, Basic headers, private project data and environment dumps from published material; redaction tools alone are not proof of safe publication.

Before teardown, save the approved summary, provenance, rules/policies and status/state evidence. Then delete **only this lab**:

```bash
docker compose -f "$audit_dir/compose.json" down -v --remove-orphans
```

Verify the project's containers/networks/volumes are gone, then delete its generated keys, configuration, raw captures and temporary source. Do not use global Docker prune or touch another development stack. Keep the private evidence you explicitly retained; image/build caches may be left for reuse.

Close the investigation when its bounded assessment and report are complete and remaining findings/coverage have explicit follow-ups. State that boundary in the closing comment. Do not silently convert untested areas into passes or close remediation issues with a documentation PR. November's remaining coverage is [#990](https://github.com/fisma-benefit-app/benefit-app/issues/990).

## Rerun cadence

- **Each relevant change:** existing CI/CodeQL/Dependabot/Trivy; targeted security regressions and replay when auth, membership, versions, exports or configuration change.
- **Dependency/base-image update or relevant advisory:** rebuild/rescan exact artifacts, reassess prerequisites and retest affected behavior.
- **Weekly:** existing Trivy schedule (Friday 19:35 UTC); assign alert triage, not merely successful job execution.
- **Before a release with security-sensitive changes:** repeat the relevant role/session/browser matrix and explicitly verify deployment identity/configuration under agreed scope.
- **Suggested quarterly team review:** revisit threat model, secret/history and deployment coverage, unresolved findings, tool value and ownership. Agree this cadence with the team; it is not an installed scheduled audit.

A clean scanner report is useful evidence within its coverage. It is never proof that the application is secure.
