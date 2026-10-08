#!/usr/bin/env python3
"""Generate scripts/tmp/competition-content/{locale}.json from PDF-aligned copy."""
from __future__ import annotations

import json
from pathlib import Path

OUT = Path(__file__).resolve().parent / "competition-content"
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


def ask_block(key: str, label: str, question: str) -> Block:
    return {
        "_key": key,
        "_type": "block",
        "style": "normal",
        "markDefs": [],
        "children": [
            span(key, f"{label}: ", ["strong"]),
            span(f"{key}b", question),
        ],
    }


def build_body(t: dict[str, str]) -> list[Block]:
    body: list[Block] = [
        block("intro", "normal", t["intro"]),
        block("h2-glance", "h2", t["h2-glance"]),
        bullet_plain("stat-bio", t["stat-bio"]),
        bullet_plain("stat-days", t["stat-days"]),
        bullet_plain("stat-grams", t["stat-grams"]),
        bullet_plain("stat-bristles", t["stat-bristles"]),
        block("h2-proof", "h2", t["h2-proof"]),
        block("proof-test-title", "h3", t["proof-test-title"]),
        block("proof-test-body", "normal", t["proof-test-body"]),
        block("proof-patents-title", "h3", t["proof-patents-title"]),
        block("proof-patents-body", "normal", t["proof-patents-body"]),
        block("proof-ppwr-title", "h3", t["proof-ppwr-title"]),
        block("proof-ppwr-body", "normal", t["proof-ppwr-body"]),
        block("proof-sds-title", "h3", t["proof-sds-title"]),
        block("proof-sds-body", "normal", t["proof-sds-body"]),
        block("h2-compare", "h2", t["h2-compare"]),
    ]

    for i in range(1, 14):
        body.append(block(f"f{i}-name", "h3", t[f"f{i}-name"]))
        body.append(block(f"f{i}-ekcos", "normal", t[f"f{i}-ekcos"]))
        body.append(ask_block(f"f{i}-ask", t["ask-label"], t[f"f{i}-ask"]))

    body.append(block("h2-advantages", "h2", t["h2-advantages"]))

    groups = [
        ("material", 3),
        ("performance", 4),
        ("fragrance", 2),
        ("design", 2),
        ("cubicle", 3),
        ("marketing", 4),
    ]
    for name, count in groups:
        body.append(block(f"adv-{name}-h3", "h3", t[f"adv-{name}-h3"]))
        for j in range(1, count + 1):
            body.append(bullet_plain(f"adv-{name}-{j}", t[f"adv-{name}-{j}"]))

    body.extend(
        [
            block("h2-cta", "h2", t["h2-cta"]),
            block("cta-1", "normal", t["cta-1"]),
            block("cta-2", "normal", t["cta-2"]),
            block("cta-3", "normal", t["cta-3"]),
        ]
    )
    return body


LOCALES: dict[str, dict] = {}
exec((Path(__file__).parent / "competition_locale_texts.py").read_text(encoding="utf-8"))


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
