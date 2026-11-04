#!/usr/bin/env python3
"""Prepare a release locally: changelog, version bump, commit and tag.

    python scripts/release.py preview          # show the unreleased section
    python scripts/release.py prepare 0.1.2    # update files, commit, tag
    python scripts/release.py notes 0.1.2      # print the notes of a release

`prepare` generates the CHANGELOG.md section from the Conventional Commits
since the last tag with git-cliff (`pip install git-cliff`), bumps every
version string, rebuilds the card bundle, then creates the commit
`chore(release): X.Y.Z` and the annotated tag `vX.Y.Z` with your own git
identity. Nothing is pushed; the script prints the remaining commands.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
CHANGELOG = ROOT / "CHANGELOG.md"
MARKER = "<!-- next-release -->"
VERSION_RE = re.compile(r"^\d+\.\d+\.\d+$")
SECTION_RE = r"^## \[{version}\].*?(?=^## \[|^---$|\Z)"


def run(*args: str, cwd: Path = ROOT) -> str:
    """Run a command and return its stdout."""
    return subprocess.run(
        args, cwd=cwd, check=True, capture_output=True, text=True
    ).stdout


def cliff(*args: str) -> str:
    """Run git-cliff with the repository config."""
    if not shutil.which("git-cliff"):
        sys.exit("git-cliff not found: pip install git-cliff")
    return run("git-cliff", "--config", str(ROOT / "cliff.toml"), *args).strip()


def section(version: str) -> str:
    """Return the CHANGELOG.md section of a version."""
    text = CHANGELOG.read_text(encoding="utf-8")
    match = re.search(SECTION_RE.format(version=re.escape(version)), text, re.M | re.S)
    if not match:
        sys.exit(f"CHANGELOG.md has no section for {version}")
    return match.group(0).strip()


def notes(version: str) -> str:
    """Release notes: the changelog section without its heading."""
    return section(version).split("\n", 1)[1].strip() + "\n"


def insert_section(body: str) -> None:
    """Insert a generated section below the marker."""
    text = CHANGELOG.read_text(encoding="utf-8")
    if MARKER not in text:
        sys.exit(f"CHANGELOG.md is missing the marker {MARKER}")
    body = re.sub(r"\n{3,}", "\n\n", body.strip())
    CHANGELOG.write_text(
        text.replace(MARKER, f"{MARKER}\n\n{body}", 1), encoding="utf-8"
    )


def sub(path: str, pattern: str, replacement: str) -> None:
    """Replace exactly one version string in a file."""
    file = ROOT / path
    text, count = re.subn(pattern, replacement, file.read_text(encoding="utf-8"))
    if count != 1:
        sys.exit(f"{path}: expected one version string, found {count}")
    file.write_text(text, encoding="utf-8")


def bump(version: str) -> None:
    """Write the version into every place that carries it."""
    sub(
        "custom_components/bvg_connections/manifest.json",
        r'"version": "[^"]+"',
        f'"version": "{version}"',
    )
    sub(
        "custom_components/bvg_connections/const.py",
        r'VERSION: Final = "[^"]+"',
        f'VERSION: Final = "{version}"',
    )
    sub("pyproject.toml", r'(?m)^version = "[^"]+"', f'version = "{version}"')
    sub(
        "frontend/src/card.ts",
        r'const VERSION = "[^"]+";',
        f'const VERSION = "{version}";',
    )
    for name in ("package.json", "package-lock.json"):
        file = ROOT / "frontend" / name
        data = json.loads(file.read_text(encoding="utf-8"))
        data["version"] = version
        if name == "package-lock.json":
            data["packages"][""]["version"] = version
        file.write_text(
            json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )


def prepare(version: str) -> None:
    """Update changelog and versions, then commit and tag."""
    tag = f"v{version}"
    if run("git", "status", "--porcelain").strip():
        sys.exit("Working tree is not clean.")
    if run("git", "tag", "--list", tag).strip():
        sys.exit(f"Tag {tag} already exists.")
    body = cliff("--unreleased", "--tag", tag, "--strip", "all")
    if not re.search(r"^### ", body, re.M):
        sys.exit("No feat/fix/docs/perf/refactor commits since the last tag.")
    insert_section(body)
    bump(version)
    run("npm", "run", "build", cwd=ROOT / "frontend")
    run("git", "add", "-A")
    run("git", "commit", "-m", f"chore(release): {version}")
    run("git", "tag", "-a", tag, "-m", f"Release {version}\n\n{notes(version)}")
    print(section(version))
    print(
        "\nReview the commit, then publish it under your own account:\n"
        f"  git push origin main {tag}\n"
        f"  python scripts/release.py notes {version} > /tmp/notes.md\n"
        f"  gh release create {tag} --title {tag} --notes-file /tmp/notes.md\n"
        "or create the release on GitHub from the tag and paste the notes."
    )


def main() -> None:
    """Entry point."""
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    sub_parsers = parser.add_subparsers(dest="command", required=True)
    sub_parsers.add_parser("preview")
    for name in ("prepare", "notes"):
        sub_parsers.add_parser(name).add_argument("version")
    args = parser.parse_args()

    version = getattr(args, "version", "").removeprefix("v")
    if args.command != "preview" and not VERSION_RE.match(version):
        sys.exit("Version must look like 1.2.3")
    if args.command == "preview":
        body = cliff("--unreleased", "--strip", "all")
        print(
            re.sub(r"\n{3,}", "\n\n", body)
            if "### " in body
            else "No unreleased changes."
        )
    elif args.command == "notes":
        sys.stdout.write(notes(version))
    else:
        prepare(version)


if __name__ == "__main__":
    main()
