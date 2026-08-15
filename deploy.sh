#!/usr/bin/env bash
# Upload naildemogallarry to Hostinger via FTP, one file per curl call with
# stall detection so a hung transfer fails fast instead of blocking the deploy.
set -u

HOST="${FTP_HOST:?set FTP_HOST}"
CRED="${FTP_USER:?set FTP_USER}:${FTP_PASS:?set FTP_PASS}"
LOCAL=/d/naildemogallarry

cd "$LOCAL" || exit 1

# Remote sizes, so a re-run only sends what is missing or different.
remote_sizes=$(mktemp)
{
  curl -s --connect-timeout 15 -u "$CRED" "ftp://$HOST/" | awk '{print $5, $NF}'
  curl -s --connect-timeout 15 -u "$CRED" "ftp://$HOST/assets/" | awk '{print $5, "assets/" $NF}'
} > "$remote_sizes"

files=$(find . -type f \
  ! -name Dockerfile ! -name nginx.conf ! -name .dockerignore ! -name .gcloudignore \
  | sed 's|^\./||' | sort)

total=$(echo "$files" | wc -l)
n=0; sent=0; skipped=0; failed=0

for f in $files; do
  n=$((n + 1))
  lsize=$(stat -c %s "$f")
  rsize=$(awk -v p="$f" '$2 == p {print $1}' "$remote_sizes" | head -1)
  if [ "${rsize:-x}" = "$lsize" ]; then
    skipped=$((skipped + 1))
    echo "[$n/$total] SKIP  $f (already $lsize bytes)"
    continue
  fi

  ok=0
  for try in 1 2 3; do
    if curl -sS --connect-timeout 20 --max-time 300 \
         --speed-limit 2048 --speed-time 30 \
         --ftp-create-dirs --ftp-pasv \
         -u "$CRED" -T "$f" "ftp://$HOST/$f" 2>/tmp/curl.err; then
      ok=1; break
    fi
    echo "[$n/$total] retry $try  $f: $(tr -d '\n' < /tmp/curl.err)"
  done

  if [ "$ok" = 1 ]; then
    sent=$((sent + 1))
    echo "[$n/$total] OK    $f ($lsize bytes)"
  else
    failed=$((failed + 1))
    echo "[$n/$total] FAIL  $f"
  fi
done

echo "SUMMARY: sent=$sent skipped=$skipped failed=$failed total=$total"
rm -f "$remote_sizes"
