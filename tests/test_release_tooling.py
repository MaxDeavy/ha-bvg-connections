"""Tests for the commit check and release helper scripts."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import re
import sys
from types import ModuleType

ROOT = Path(__file__).resolve().parent.parent


def _load(name: str) -> ModuleType:
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / f"{name}.py")
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


check_commits = _load("check_commits")
release = _load("release")


def test_conventional_subjects() -> None:
    ok = [
        "feat: add departure filter",
        "feat(card)!: drop legacy option",
        "fix(security): escape remarks",
        "docs: setup guide",
        "chore(release): 0.1.2",
        "chore(deps): Bump lit from 3.3.3 to 3.4.0",
        "Merge pull request #12 from MaxDeavy/feature",
        'Revert "feat: add departure filter"',
    ]
    bad = [
        "Add departure filter",
        "feat add filter",
        "feature: add filter",
        "fix:missing space",
        "feat(Card): upper case scope",
    ]
    assert check_commits.invalid_subjects(ok) == []
    assert check_commits.invalid_subjects(bad) == bad


def test_changelog_sections_and_notes() -> None:
    text = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
    assert release.MARKER in text
    section = release.section("0.1.1")
    assert section.startswith("## [0.1.1]")
    assert "[MEHR/MORE]" in section
    assert "## [0.1.0]" not in section
    notes = release.notes("0.1.1")
    assert notes.startswith("### Neu / Added")
    assert "## [" not in notes


def test_versions_are_consistent() -> None:
    manifest = json.loads(
        (ROOT / "custom_components/bvg_connections/manifest.json").read_text()
    )
    version = manifest["version"]
    package = json.loads((ROOT / "frontend/package.json").read_text())
    assert package["version"] == version
    for path, pattern in (
        ("custom_components/bvg_connections/const.py", r'VERSION: Final = "([^"]+)"'),
        ("pyproject.toml", r'(?m)^version = "([^"]+)"'),
        ("frontend/src/card.ts", r'const VERSION = "([^"]+)";'),
    ):
        match = re.search(pattern, (ROOT / path).read_text())
        assert match and match.group(1) == version, path
    assert f"## [{version}]" in (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
