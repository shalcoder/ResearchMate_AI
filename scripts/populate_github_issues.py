import json
import os
import subprocess
import time
import urllib.error
import urllib.request


def get_token():
  token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
  if token:
    return token
  try:
    p = subprocess.run(
        ["git", "credential", "fill"],
        input="protocol=https\nhost=github.com\n",
        text=True,
        capture_output=True,
        check=True,
    )
    for line in p.stdout.splitlines():
      if line.startswith("password="):
        return line.split("=", 1)[1].strip()
  except Exception as e:
    print("Could not retrieve credentials from git credential helper:", e)
  return ""


TOKEN = get_token()
REPO = "shalcoder/ResearchMate_AI"
BASE_URL = f"https://api.github.com/repos/{REPO}"

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "ResearchMate-Issue-Sync",
    "Content-Type": "application/json",
}


def api_request(path, method="GET", data=None):
  url = f"{BASE_URL}{path}"
  payload = json.dumps(data).encode("utf-8") if data else None
  req = urllib.request.Request(url, data=payload, headers=HEADERS, method=method)
  try:
    with urllib.request.urlopen(req) as resp:
      if resp.status in (200, 201, 204):
        body = resp.read().decode("utf-8")
        return json.loads(body) if body else {}
  except urllib.error.HTTPError as e:
    err_body = e.read().decode("utf-8")
    print(f"HTTP Error {e.code} for {method} {url}: {err_body}")
    return None
  except Exception as e:
    print(f"General error for {method} {url}: {e}")
    return None


if __name__ == "__main__":
  print(f"Sync utility loaded for {REPO} (Token present: {bool(TOKEN)})")
