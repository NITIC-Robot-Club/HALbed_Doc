#!/usr/bin/env python3
"""Run the yomiyasu static evaluator on every Markdown file under Docs/."""

from __future__ import annotations

import argparse
from collections import Counter
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any


def find_linter() -> Path:
    """Find the installed yomiyasu linter, allowing an environment override."""
    override = os.environ.get("YOMIYASU_LINT_SCRIPT")
    if override:
        return Path(override).expanduser().resolve()
    return Path.home() / ".codex" / "skills" / "yomiyasu" / "scripts" / "yomiyasu_lint.py"


def evaluate_file(linter: Path, markdown_file: Path) -> dict[str, Any]:
    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"
    result = subprocess.run(
        [sys.executable, str(linter), str(markdown_file), "--json"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        env=env,
        check=False,
    )
    if result.returncode != 0:
        detail = result.stderr.strip() or result.stdout.strip() or f"終了コード {result.returncode}"
        raise RuntimeError(detail)
    return json.loads(result.stdout)


def main() -> int:
    project_root = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(
        description="Docs/以下のすべての.mdファイルをyomiyasu静的評価器で評価します。"
    )
    parser.add_argument(
        "--docs-dir",
        type=Path,
        default=project_root / "Docs",
        help="評価対象ディレクトリ（既定: リポジトリのDocs/）",
    )
    parser.add_argument(
        "--lint-script",
        type=Path,
        default=find_linter(),
        help="yomiyasu_lint.pyのパス（既定: ~/.codex/skills/yomiyasu/scripts/）",
    )
    parser.add_argument("--json", action="store_true", help="集計結果をJSONで出力")
    parser.add_argument(
        "--json-file",
        type=Path,
        help="集計結果を指定したファイルへJSON形式で保存",
    )
    parser.add_argument(
        "--summary-only",
        action="store_true",
        help="各ファイルの指摘を省略して集計だけを表示",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="warn/errorの指摘があれば終了コード1で終了",
    )
    args = parser.parse_args()

    docs_dir = args.docs_dir.resolve()
    linter = args.lint_script.expanduser().resolve()
    if not docs_dir.is_dir():
        parser.error(f"Docsディレクトリが見つかりません: {docs_dir}")
    if not linter.is_file():
        parser.error(
            f"yomiyasu_lint.pyが見つかりません: {linter}\n"
            "--lint-script または YOMIYASU_LINT_SCRIPT でパスを指定してください。"
        )

    markdown_files = sorted(
        (path for path in docs_dir.rglob("*") if path.is_file() and path.suffix.lower() == ".md"),
        key=lambda path: path.as_posix().casefold(),
    )
    if not markdown_files:
        parser.error(f".mdファイルが見つかりません: {docs_dir}")

    results: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []
    for markdown_file in markdown_files:
        relative_path = markdown_file.relative_to(docs_dir).as_posix()
        try:
            evaluation = evaluate_file(linter, markdown_file)
            results.append({"file": relative_path, **evaluation})
        except (OSError, RuntimeError, json.JSONDecodeError) as error:
            errors.append({"file": relative_path, "error": str(error)})

    findings = [finding for item in results for finding in item["findings"]]
    summary = {
        "docs_dir": str(docs_dir),
        "files_scanned": len(results),
        "files_failed": len(errors),
        "findings": len(findings),
        "warnings": sum(finding["severity"] in ("warn", "error") for finding in findings),
        "info": sum(finding["severity"] == "info" for finding in findings),
    }

    report = {"summary": summary, "results": results, "errors": errors}
    if args.json_file:
        args.json_file.expanduser().resolve().write_text(
            json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
        )

    if args.json or args.json_file:
        if args.json:
            print(json.dumps(report, ensure_ascii=False, indent=2))
    elif args.summary_only:
        print(
            f"評価: {summary['files_scanned']}ファイル / "
            f"指摘: {summary['findings']}件 "
            f"(警告 {summary['warnings']}件、情報 {summary['info']}件) / "
            f"失敗: {summary['files_failed']}件"
        )
        rule_counts = Counter(finding["rule"] for finding in findings)
        for rule, count in rule_counts.most_common():
            print(f"{rule}: {count}件")
        print("指摘件数の多いファイル:")
        for item in sorted(results, key=lambda result: (-len(result["findings"]), result["file"]))[:10]:
            if not item["findings"]:
                break
            print(f"{item['file']}: {len(item['findings'])}件 (score {item['score']}/100)")
        for error in errors:
            print(f"{error['file']}: 評価失敗: {error['error']}", file=sys.stderr)
    else:
        for item in results:
            print(f"{item['file']}: {item['score']}/100 ({len(item['findings'])}件)")
            for finding in item["findings"]:
                print(
                    f"  L{finding['line']} [{finding['severity'].upper()}] "
                    f"{finding['message']}"
                )
                print(f"    {finding['snippet']}")
        for error in errors:
            print(f"{error['file']}: 評価失敗: {error['error']}", file=sys.stderr)
        print(
            f"\n評価: {summary['files_scanned']}ファイル / "
            f"指摘: {summary['findings']}件 "
            f"(警告 {summary['warnings']}件、情報 {summary['info']}件) / "
            f"失敗: {summary['files_failed']}件"
        )

    if errors:
        return 2
    if args.strict and summary["warnings"]:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
