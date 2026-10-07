#!/usr/bin/env python3
"""Merge FRAGMENT locales into advisor_locale_texts.py if missing."""
from __future__ import annotations

import re
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TARGET = ROOT / "advisor_locale_texts.py"
FRAG_FILE = ROOT / "advisor_new_locales_fragment.py"
CODES = ["el", "hu", "ro", "bg", "hr", "sl", "et", "lv", "lt"]


def load_fragment() -> str:
    ns: dict = {}
    exec(FRAG_FILE.read_text(encoding="utf-8"), ns)
    wrapped = "LOCALES = {" + ns["FRAGMENT"] + "}"
    frag_ns: dict = {}
    exec(wrapped, frag_ns)
    return frag_ns["LOCALES"]


def format_locale(code: str, pack: dict) -> str:
    import json

    meta = json.dumps(pack["meta"], ensure_ascii=False, indent=12)
    # re-indent meta to match file style
    meta_lines = meta.splitlines()
    meta_block = "\n".join("            " + line.strip() for line in meta_lines)

    text_lines = []
    for key, val in pack["texts"].items():
        esc = val.replace("\\", "\\\\").replace('"', '\\"')
        text_lines.append(f'            "{key}": "{esc}",')
    texts_block = "\n".join(text_lines)

    return (
        f'    "{code}": {{\n'
        f"        \"meta\": {{\n"
        + "\n".join(
            f'            "{k}": {json.dumps(v, ensure_ascii=False)},'
            for k, v in pack["meta"].items()
        )
        + "\n        },\n"
        f'        "texts": {{\n{texts_block}\n        }},\n    }}'
    )


def merge_once() -> list[str]:
    text = TARGET.read_text(encoding="utf-8")
    frag = load_fragment()
    added: list[str] = []
    chunks: list[str] = []
    for code in CODES:
        if f'"{code}":' in text:
            continue
        if code not in frag:
            raise KeyError(f"missing fragment for {code}")
        chunks.append(format_locale(code, frag[code]))
        added.append(code)
    if not chunks:
        return added
    insert = ",\n".join(chunks)
    marker = "\n        },\n    },\n}\n"
    if marker not in text:
        raise RuntimeError("unexpected file ending; re-read before merge")
    text = text.replace(marker, f"\n        }},\n    }},\n{insert},\n}}\n", 1)
    TARGET.write_text(text, encoding="utf-8")
    return added


def main() -> None:
    for attempt in range(8):
        added = merge_once()
        if added:
            print(f"Added locales (attempt {attempt + 1}): {', '.join(added)}")
            time.sleep(0.3)
            continue
        print("All target locales already present.")
        break
    else:
        raise SystemExit("merge retries exhausted")


if __name__ == "__main__":
    main()
