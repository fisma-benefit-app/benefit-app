#!/bin/bash
#
# Updates an existing self-hosted deployment (docker-compose.prod.yaml, e.g. the
# UpCloud server) and keeps the database's data. Run it on the server:
#
#   ./update_server.sh                    pull, build, back up, migrate, restart
#   ./update_server.sh --dry-run          show what that would do, change nothing
#   ./update_server.sh --baseline <file>  the same, first run on a database only
#   ./update_server.sh --no-pull          deploy the checked-out commit as it is
#
# Migrations are the files in backend/src/main/resources/migrations/. The ones a
# database already has are recorded in its schema_migrations table, and each run
# applies the others in file name order. A database set up before this script
# has no such table, so the first run needs --baseline with the newest migration
# that database already has: every file up to and including it is recorded as
# applied without running it.
#
# The script only reads .env. If a new version needs a setting that .env lacks,
# it stops before building and names it.
#
# Backups go to $BACKUP_DIR (default /var/backups/fisma-benefit-app).
# Setting up a new server is manual: see documents/guides/upcloud_deployment.md.

set -Eeuo pipefail
export LC_ALL=C # byte order for sorting and comparing migration file names

COMPOSE_FILE_NAME="docker-compose.prod.yaml"
MIGRATIONS_DIR="backend/src/main/resources/migrations"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/fisma-benefit-app}"
KEEP_BACKUPS=10
COMPOSE=(docker compose -f "$COMPOSE_FILE_NAME")

trap 'echo -e "\nError: update_server.sh stopped at line $LINENO (see the output above)." >&2' ERR

die() {
    echo -e "\nError: $*" >&2
    exit 1
}

step() {
    echo -e "\n==> $*"
}

# psql inside the database container, reading SQL from stdin. Arguments go to psql.
# The single-quoted variables are expanded by the container's shell, not this one.
# shellcheck disable=SC2016
db_psql() {
    "${COMPOSE[@]}" exec -T db sh -c 'psql -X -q -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" "$@"' _ "$@"
}

# Stops unless docker compose can use .env with the given compose file content.
# Its error messages can quote .env, so long quoted values are blanked out.
check_env() {
    local errors
    if ! errors=$(docker compose --project-directory . -f - config --quiet 2>&1 <<< "$1"); then
        die "$2 can't be used with this .env:\n$(sed -E 's/"[^"]{12,}"/"<redacted>"/g' <<< "$errors")"
    fi
}

# The committed migration files at a commit (default HEAD), oldest first. The
# names go into SQL, so only plain ones are allowed.
migration_files() {
    local files
    files=$(git ls-tree --name-only "${1:-HEAD}" -- "$MIGRATIONS_DIR/" | sed -n 's#^.*/\([^/]*\.sql\)$#\1#p')
    [ -n "$files" ] || die "No migrations found in $MIGRATIONS_DIR."
    if grep -qvE '^[A-Za-z0-9_.-]+\.sql$' <<< "$files"; then
        die "Unexpected migration file name in $MIGRATIONS_DIR (allowed: letters, digits, _ . -)."
    fi
    sort <<< "$files"
}

main() {
    local baseline="" pull=true dry_run=false
    while [ $# -gt 0 ]; do
        case "$1" in
            --baseline)
                [ $# -ge 2 ] || die "--baseline needs a migration file name."
                baseline="$2"
                shift 2
                ;;
            --no-pull)
                pull=false
                shift
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            -h | --help)
                sed -n '3,/^$/{s/^# \{0,1\}//;p}' "$0"
                exit 0
                ;;
            *) die "Unknown option: $1 (see ./update_server.sh --help)" ;;
        esac
    done

    cd "$(dirname "$(readlink -f "$0")")"
    local project deployed_file previous
    project=$(sed -n 's/^name: *//p' "$COMPOSE_FILE_NAME")
    # The commit that is running: the last one this script deployed successfully.
    # After a failed run the checkout can be ahead of it. Before the first run, the
    # checkout is what's running, so that's recorded before anything is pulled.
    deployed_file="$(git rev-parse --git-dir)/update_server_deployed"
    $dry_run || [ -s "$deployed_file" ] || git rev-parse --short HEAD > "$deployed_file"
    previous=$(cat "$deployed_file" 2> /dev/null || git rev-parse --short HEAD)

    ! $dry_run || step "Dry run: this shows what an update would do and changes nothing"
    step "Checking $(git branch --show-current) at $(git rev-parse --short HEAD) (running: $previous)"
    [ -z "$(git status --porcelain --untracked-files=no)" ] ||
        die "The repository has local changes (see git status). Commit, stash or discard them first."
    [ -f .env ] || die "No .env in $(pwd). See documents/guides/upcloud_deployment.md."
    check_env "$(cat "$COMPOSE_FILE_NAME")" "The checked-out $COMPOSE_FILE_NAME"
    if $dry_run; then
        "${COMPOSE[@]}" exec -T db pg_isready -q > /dev/null 2>&1 ||
            die "The database container isn't running, so there's nothing to compare with.\nStart it with: docker compose -f $COMPOSE_FILE_NAME up -d db"
    else
        "${COMPOSE[@]}" up -d --wait db
    fi

    # Which migrations the database has: from its table, or from --baseline on the first run.
    local has_table applied="" files f
    has_table=$(echo "SELECT to_regclass('public.schema_migrations') IS NOT NULL;" | db_psql -tA)
    files=$(migration_files)
    if [ -n "$baseline" ]; then
        [ "$has_table" = f ] || die "The schema_migrations table already exists. --baseline is only for the first run."
        grep -qxF -- "$baseline" <<< "$files" || die "No migration named $baseline in $MIGRATIONS_DIR."
        for f in $files; do
            [[ "$f" > "$baseline" ]] && break
            applied+="$f"$'\n'
        done
        if $dry_run; then
            step "Would record the migrations up to $baseline as already applied"
        else
            step "Baseline: recording the migrations up to $baseline as already applied"
            {
                echo "CREATE TABLE schema_migrations (filename VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMP(0) NOT NULL DEFAULT now(), baseline BOOLEAN NOT NULL DEFAULT FALSE);"
                for f in $applied; do
                    echo "INSERT INTO schema_migrations (filename, baseline) VALUES ('$f', TRUE);"
                done
            } | db_psql --single-transaction
        fi
        for f in $applied; do echo "  $f"; done
    elif [ "$has_table" = f ]; then
        die "This database has no schema_migrations table yet, so the script can't tell which migrations it already has.\nOn the first run, name the newest migration the database already has:\n  ./update_server.sh --baseline <file>\nThe migrations in $MIGRATIONS_DIR:\n  ${files//$'\n'/$'\n'  }"
    else
        applied=$(echo "SELECT filename FROM schema_migrations;" | db_psql -tA)
    fi

    local upstream=""
    if $pull && $dry_run; then
        git fetch -q
        local count
        upstream=$(git rev-parse --abbrev-ref '@{upstream}' 2> /dev/null) ||
            die "$(git branch --show-current) has no upstream branch to pull from."
        git merge-base --is-ancestor HEAD "$upstream" ||
            die "$upstream and the checkout have diverged, so git pull --ff-only would fail."
        count=$(git rev-list --count "HEAD..$upstream")
        if [ "$count" -eq 0 ]; then
            step "Nothing new to pull"
        else
            step "Would pull $count commit(s)"
            git log --oneline "HEAD..$upstream" | sed 's/^/  /'
            git diff --quiet HEAD "$upstream" -- update_server.sh ||
                echo "  update_server.sh itself changes, and its new version would take over."
            check_env "$(git show "$upstream:$COMPOSE_FILE_NAME")" "The new $COMPOSE_FILE_NAME"
        fi
    elif $pull; then
        step "Pulling"
        local before
        before=$(git rev-parse HEAD)
        git pull --ff-only
        if ! git diff --quiet "$before" HEAD -- update_server.sh; then
            echo "update_server.sh itself changed, so the new version takes over."
            exec ./update_server.sh --no-pull
        fi
        check_env "$(cat "$COMPOSE_FILE_NAME")" "The new $COMPOSE_FILE_NAME"
    fi
    local target
    target=$(git rev-parse --short "${upstream:-HEAD}")

    local pending=()
    files=$(migration_files "$target")
    for f in $files; do
        grep -qxF -- "$f" <<< "$applied" || pending+=("$f")
    done

    if $dry_run; then
        if [ ${#pending[@]} -eq 0 ]; then
            step "No new migrations"
        else
            step "Would apply ${#pending[@]} migration(s)"
            printf '  %s\n' "${pending[@]}"
        fi
        step "Would then build $target, back up the database to $BACKUP_DIR, start $target and wait until it's healthy"
        return 0
    fi

    step "Building $target (the running app stays up)"
    "${COMPOSE[@]}" build ||
        die "The build failed. Nothing was changed: the database and the running app are as they were."

    # --clean --if-exists makes the dump drop and recreate every table, so it can be
    # restored over the existing database (see the UpCloud guide).
    step "Backing up the database"
    local backup
    backup="$BACKUP_DIR/$project-$(date +%Y%m%d-%H%M%S).sql.gz"
    # shellcheck disable=SC2016
    if ! (umask 077 && mkdir -p "$BACKUP_DIR" &&
        "${COMPOSE[@]}" exec -T db sh -c 'pg_dump --clean --if-exists -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip > "$backup"); then
        rm -f "$backup"
        die "The backup failed, so nothing was migrated or restarted."
    fi
    echo "$backup ($(du -h "$backup" | cut -f1))"

    if [ ${#pending[@]} -eq 0 ]; then
        step "No new migrations"
    else
        step "Applying ${#pending[@]} migration(s)"
        for f in "${pending[@]}"; do
            echo "  $f"
            # One transaction per file, recorded only if it succeeds. Warnings are hidden
            # because files that open their own transaction warn about the outer one.
            {
                echo "SET client_min_messages TO error;"
                cat "$MIGRATIONS_DIR/$f"
                printf '\n;\nINSERT INTO schema_migrations (filename) VALUES (%s);\n' "'$f'"
            } | db_psql --single-transaction ||
                die "Migration $f failed and was rolled back. The ones after it weren't run.\nThe app still runs the previous version ($previous). Backup from before this run:\n  $backup"
        done
    fi

    step "Starting $target"
    "${COMPOSE[@]}" up -d
    local port health_url healthy=false
    port=$("${COMPOSE[@]}" port frontend 80)
    health_url="http://localhost:${port##*:}/api/actuator/health"
    echo "Waiting for $health_url"
    for _ in $(seq 60); do
        if curl -sf -m 3 "$health_url" > /dev/null; then
            healthy=true
            break
        fi
        sleep 2
    done
    if ! $healthy; then
        "${COMPOSE[@]}" ps
        "${COMPOSE[@]}" logs --tail 40 backend
        die "$target didn't become healthy within 2 minutes (backend log above).\nPrevious version: $previous. Backup from before this run:\n  $backup"
    fi
    echo "$target" > "$deployed_file"

    step "Cleaning up"
    docker image prune -f --filter "label=com.docker.compose.project=$project" > /dev/null
    docker builder prune -f --filter until=168h > /dev/null
    # The names start with the date and time, so name order is age order.
    printf '%s\n' "$BACKUP_DIR/$project"-*.sql.gz | sort -r | tail -n +$((KEEP_BACKUPS + 1)) | xargs -r rm --

    step "Done: $target is running (previous: $previous)"
    echo "Migrations applied: ${#pending[@]}. Backup: $backup"
    df -h / | tail -1
}

main "$@"
exit
