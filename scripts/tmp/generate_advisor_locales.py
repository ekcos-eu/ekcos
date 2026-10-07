#!/usr/bin/env python3
"""Generate scripts/tmp/advisor-content/{locale}.json from curated PDF-aligned copy."""
from __future__ import annotations

import json
from pathlib import Path

OUT = Path(__file__).resolve().parent / "advisor-content"
OUT.mkdir(parents=True, exist_ok=True)

Block = dict


def span(key: str, text: str, marks: list[str] | None = None) -> dict:
    return {"_key": f"{key}a", "_type": "span", "marks": marks or [], "text": text}


def block(key: str, style: str, text: str) -> Block:
    return {
        "_key": key,
        "_type": "block",
        "style": style,
        "markDefs": [],
        "children": [span(key, text)],
    }


def bullet(key: str, strong: str, rest: str) -> Block:
    return {
        "_key": key,
        "_type": "block",
        "style": "normal",
        "listItem": "bullet",
        "level": 1,
        "markDefs": [],
        "children": [
            span(key, strong, ["strong"]),
            span(f"{key}b", rest),
        ],
    }


def bullet_plain(key: str, text: str) -> Block:
    return {
        "_key": key,
        "_type": "block",
        "style": "normal",
        "listItem": "bullet",
        "level": 1,
        "markDefs": [],
        "children": [span(key, text)],
    }


def build_body(t: dict[str, str]) -> list[Block]:
    return [
        block("intro", "normal", t["intro"]),
        block("h2-traffic", "h2", t["h2-traffic"]),
        block("p-traffic-1", "normal", t["p-traffic-1"]),
        block("p-traffic-high", "normal", t["p-traffic-high"]),
        block("p-traffic-standard", "normal", t["p-traffic-standard"]),
        block("p-traffic-budget", "normal", t["p-traffic-budget"]),
        block("h2-splash", "h2", t["h2-splash"]),
        block("p-splash-1", "normal", t["p-splash-1"]),
        block("p-splash-stats", "normal", t["p-splash-stats"]),
        block("p-splash-uv", "normal", t["p-splash-uv"]),
        bullet_plain("b-splash-power", t["b-splash-power"]),
        bullet_plain("b-splash-uro", t["b-splash-uro"]),
        bullet_plain("b-splash-basic", t["b-splash-basic"]),
        block("p-splash-tip", "normal", t["p-splash-tip"]),
        block("h2-fragrance", "h2", t["h2-fragrance"]),
        block("h3-frag-long", "h3", t["h3-frag-long"]),
        block("p-frag-long", "normal", t["p-frag-long"]),
        block("p-frag-cost", "normal", t["p-frag-cost"]),
        block("h3-frag-strong", "h3", t["h3-frag-strong"]),
        block("p-frag-strong", "normal", t["p-frag-strong"]),
        block("h3-frag-color", "h3", t["h3-frag-color"]),
        block("p-frag-color", "normal", t["p-frag-color"]),
        block("h2-evidence", "h2", t["h2-evidence"]),
        block("p-evidence-1", "normal", t["p-evidence-1"]),
        block("p-evidence-bio", "normal", t["p-evidence-bio"]),
        block("p-evidence-recycled", "normal", t["p-evidence-recycled"]),
        block("p-evidence-used", "normal", t["p-evidence-used"]),
        block("p-evidence-ask", "normal", t["p-evidence-ask"]),
        block("p-evidence-boxes", "normal", t["p-evidence-boxes"]),
        block("h2-urinal", "h2", t["h2-urinal"]),
        bullet("b-urinal-small", t["b-urinal-small-strong"], t["b-urinal-small-rest"]),
        bullet("b-urinal-most", t["b-urinal-most-strong"], t["b-urinal-most-rest"]),
        bullet("b-urinal-waterless", t["b-urinal-waterless-strong"], t["b-urinal-waterless-rest"]),
        bullet("b-urinal-drain", t["b-urinal-drain-strong"], t["b-urinal-drain-rest"]),
        bullet("b-urinal-design", t["b-urinal-design-strong"], t["b-urinal-design-rest"]),
        bullet("b-urinal-puck", t["b-urinal-puck-strong"], t["b-urinal-puck-rest"]),
        block("h2-summary", "h2", t["h2-summary"]),
        block("p-summary-intro", "normal", t["p-summary-intro"]),
        bullet("b-summary-1", t["b-summary-1-strong"], t["b-summary-1-rest"]),
        bullet("b-summary-2", t["b-summary-2-strong"], t["b-summary-2-rest"]),
        bullet("b-summary-3", t["b-summary-3-strong"], t["b-summary-3-rest"]),
        bullet("b-summary-4", t["b-summary-4-strong"], t["b-summary-4-rest"]),
        bullet("b-summary-5", t["b-summary-5-strong"], t["b-summary-5-rest"]),
        bullet("b-summary-6", t["b-summary-6-strong"], t["b-summary-6-rest"]),
        bullet("b-summary-7", t["b-summary-7-strong"], t["b-summary-7-rest"]),
        bullet("b-summary-8", t["b-summary-8-strong"], t["b-summary-8-rest"]),
        bullet("b-summary-9", t["b-summary-9-strong"], t["b-summary-9-rest"]),
        bullet("b-summary-10", t["b-summary-10-strong"], t["b-summary-10-rest"]),
        block("h2-complete", "h2", t["h2-complete"]),
        block("p-complete-intro", "normal", t["p-complete-intro"]),
        block("p-complete-clip", "normal", t["p-complete-clip"]),
        block("p-complete-mat", "normal", t["p-complete-mat"]),
        block("p-complete-fresh", "normal", t["p-complete-fresh"]),
        block("p-complete-trap", "normal", t["p-complete-trap"]),
        block("h2-help", "h2", t["h2-help"]),
        block("p-help-1", "normal", t["p-help-1"]),
        block("p-help-2", "normal", t["p-help-2"]),
    ]


LOCALES: dict[str, dict] = {}

# NOTE: Text packs appended below via exec from locale packs file
exec((Path(__file__).parent / "advisor_locale_texts.py").read_text(encoding="utf-8"))


def write_locale(code: str, meta: dict, texts: dict[str, str]) -> None:
    doc = {
        "title": meta["title"],
        "excerpt": meta["excerpt"],
        "imageAlt": meta["imageAlt"],
        "body": build_body(texts),
    }
    path = OUT / f"{code}.json"
    path.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {path}")


def main() -> None:
    for code, pack in LOCALES.items():
        write_locale(code, pack["meta"], pack["texts"])


if __name__ == "__main__":
    main()
