#!/usr/bin/env bash
# Cleat wraps build_command as `cleat_cpu_limit <argv>`. Keep this file as the
# command body so bash keywords are not parsed as extra arguments.
set -euo pipefail

pick_env_file() {
  if [ -n "${CLEAT_PANEL_ENV_FILE:-}" ] && [ -f "${CLEAT_PANEL_ENV_FILE}" ]; then
    printf '%s\n' "${CLEAT_PANEL_ENV_FILE}"
    return 0
  fi
  if [ -n "${CLEAT_APP:-}" ] && [ -f "/etc/${CLEAT_APP}/env" ]; then
    printf '%s\n' "/etc/${CLEAT_APP}/env"
    return 0
  fi
  if [ -f /etc/ebook/env ]; then
    printf '%s\n' /etc/ebook/env
    return 0
  fi
  return 1
}

# systemd EnvironmentFile is KEY="quoted value". Source via python so quotes
# and escapes stay data (bash `. file` would keep the wrapping quotes).
load_env_file() {
  local src="$1"
  local tmp
  tmp=$(mktemp)
  if [ -r "$src" ]; then
    cp "$src" "$tmp"
  else
    sudo cp "$src" "$tmp"
    sudo chown "$(id -u):$(id -g)" "$tmp"
  fi
  chmod 600 "$tmp"
  eval "$(python3 - "$tmp" <<'PY'
import shlex
import sys

path = sys.argv[1]
lines = []
with open(path, encoding="utf-8") as handle:
    for raw in handle:
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, val = line.split("=", 1)
        if not key.isidentifier():
            continue
        if len(val) >= 2 and val[0] == '"' and val[-1] == '"':
            val = bytes(val[1:-1], "utf-8").decode("unicode_escape")
        lines.append(f"export {key}={shlex.quote(val)}")
print("\n".join(lines))
PY
)"
  rm -f "$tmp"
}

if ENV_FILE=$(pick_env_file); then
  load_env_file "$ENV_FILE"
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL missing after loading Cleat env; cannot build" >&2
  exit 1
fi

if [ -z "${NEXT_PUBLIC_APP_URL:-}" ]; then
  echo "NEXT_PUBLIC_APP_URL missing after loading Cleat env; cannot build" >&2
  exit 1
fi

npm run db:migrate
npm run db:seed
npm run build
