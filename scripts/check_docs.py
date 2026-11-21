"""Compile-check every complete Ocean example in the page sources.

Usage: OCEAN=/path/to/ocean OCEAN_SRC=/path/to/ocean-src python3 scripts/check_docs.py content/docs [slug-filter]

A code block is checked when its label is empty/Ocean and it contains a
`package` declaration. `// file: relative/path.oc` lines split a block into
several files (an `ocean.mod` file may be included the same way). A block whose
first line is `// check: run` is also executed, and `// expect:` lines that
follow give the exact expected stdout lines.
"""
import os
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from build_docs import parse  # noqa: E402

OCEAN = os.environ.get("OCEAN", "ocean")
ENV = dict(os.environ, NO_COLOR="1")


def split_files(code):
    files = {}
    current = "main.oc"
    for line in code.split("\n"):
        m = re.match(r"^// file: (\S+)$", line)
        if m:
            current = m.group(1)
            continue
        files.setdefault(current, []).append(line)
    return {k: "\n".join(v).strip() + "\n" for k, v in files.items() if "\n".join(v).strip()}


def main(src_dir, only=None):
    failures = 0
    checked = 0
    for path in sorted(pathlib.Path(src_dir).glob("*.txt")):
        for page in parse(path.read_text(), path.name):
            if only and only not in page["slug"]:
                continue
            for s in page["sections"]:
                code = "\n".join(s["code"])
                if s["lang"] not in (None, "Ocean") or not re.search(r"^package \w+;", code, re.M):
                    continue
                if "// check: skip" in code:
                    continue
                checked += 1
                where = f"{page['slug']}#{s['id']}"
                tmp = pathlib.Path(tempfile.mkdtemp(prefix="oc-doc-"))
                try:
                    root = tmp / "example"
                    for name, content in split_files(code).items():
                        target = root / name
                        target.parent.mkdir(parents=True, exist_ok=True)
                        target.write_text(content)
                    cmd = [OCEAN, "check", "."]
                    run = "// check: run" in code
                    if run:
                        cmd = [OCEAN, "run", "."]
                    proc = subprocess.run(cmd, cwd=root, env=ENV, capture_output=True, text=True, timeout=300)
                    expected = re.findall(r"^// expect: ?(.*)$", code, re.M)
                    ok = proc.returncode == 0 if not run or "// expect-status:" not in code else True
                    warn = "warning" in proc.stderr.lower()
                    if run and expected:
                        got = proc.stdout.rstrip("\n").split("\n")
                        if got != expected:
                            ok = False
                            print(f"OUTPUT MISMATCH {where}\n  expected {expected}\n  got      {got}")
                    if not ok or warn:
                        failures += 0 if ok else 1
                        print(("FAIL " if not ok else "WARN ") + where)
                        print(proc.stdout[-2000:])
                        print(proc.stderr[-3000:])
                finally:
                    shutil.rmtree(tmp, ignore_errors=True)
    print(f"checked {checked} examples, {failures} failures")
    return failures


if __name__ == "__main__":
    sys.exit(1 if main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None) else 0)
