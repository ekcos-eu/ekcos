#!/usr/bin/env python3
"""
Sync collection descriptions from EU text packs (xcrën HD / xcrën puck / ëkcoscreen).

Updates EN collection descriptionHtml and registers translations for all
pack locales enabled on the shop (Portuguese → pt-PT; Slovenian omitted).

Usage:
  python3 scripts/sync-shopify-xcren-collections.py
  python3 scripts/sync-shopify-xcren-collections.py --handle ekcoscreen
  python3 scripts/sync-shopify-xcren-collections.py --dry-run
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
PRODUCT_SYNC = ROOT / "scripts" / "sync-shopify-xcren-texts.py"

# Shopify collection handle → pack product key
COLLECTIONS = {
    "xcren-hd": "xcrenHd",
    "xcren-puck": "xcrenPuck",
    "ekcoscreen": "ekcoscreen",
    "powerscreen": "powerscreen",
    "uro-lite": "urolite",
    "ekco-clip": "ekcoclip",
    "fresh-drop": "freshdrop",
    "ez-trap": "eztrap",
    "ekco-mat": "ekcomat",
}


def load_product_sync():
    spec = importlib.util.spec_from_file_location("xcren_sync", PRODUCT_SYNC)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load {PRODUCT_SYNC}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def escape_html(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def collection_html(title_line: str, paragraphs: list[str]) -> str:
    """Category blurb: heading + body paragraphs (no benefits list)."""
    # title_line like "xcrën HD 60+ - high-design ..."
    parts = [f"<h3>{escape_html(title_line)}</h3>"]
    for i, para in enumerate(paragraphs):
        if i == len(paragraphs) - 1 and len(paragraphs) > 1:
            parts.append(f"<p><strong>{escape_html(para)}</strong></p>")
        else:
            parts.append(f"<p>{escape_html(para)}</p>")
    return "\n".join(parts)


def title_line_from_pack(pack: dict[str, Any]) -> str:
    prefix = pack["prefix"]
    category = pack.get("category") or ""
    if category:
        # Prefer "60+" form when present in first paragraph / short
        short = pack.get("short") or ""
        name = prefix
        if "60+" in short or "60+" in (pack.get("paragraphs") or [""])[0]:
            if "60+" not in name:
                name = f"{prefix} 60+"
        return f"{name} - {category}"
    return prefix


def list_collections(mod, domain: str, token: str) -> dict[str, dict[str, Any]]:
    query = """
    query {
      collections(first: 50) {
        nodes { id title handle descriptionHtml }
      }
    }
    """
    data = mod.gql(domain, token, query)
    out: dict[str, dict[str, Any]] = {}
    for node in data["collections"]["nodes"]:
        if node["handle"] in COLLECTIONS:
            out[node["handle"]] = node
    return out


def update_collection_en(
    mod, domain: str, token: str, collection_id: str, description_html: str
) -> None:
    mutation = """
    mutation($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection { id title }
        userErrors { field message }
      }
    }
    """
    data = mod.gql(
        domain,
        token,
        mutation,
        {"input": {"id": collection_id, "descriptionHtml": description_html}},
    )
    errors = data["collectionUpdate"]["userErrors"]
    if errors:
        raise RuntimeError(f"collectionUpdate errors: {errors}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--handle",
        action="append",
        default=[],
        help="Limit to collection handle(s), e.g. xcren-hd",
    )
    args = parser.parse_args()

    mod = load_product_sync()
    for locale, filename in mod.LOCALE_FILES.items():
        path = mod.DOC_DIR / filename
        if not path.exists():
            raise SystemExit(f"Missing text pack: {path}")

    print("Parsing text packs...")
    packs = {
        locale: mod.parse_locale_doc(mod.DOC_DIR / filename)
        for locale, filename in mod.LOCALE_FILES.items()
    }

    client_id, client_secret, domain = mod.load_credentials()
    token = mod.get_token(client_id, client_secret, domain)
    collections = list_collections(mod, domain, token)
    handles = args.handle or list(COLLECTIONS.keys())
    missing = [h for h in handles if h not in collections]
    if missing:
        raise SystemExit(f"Collections not found: {missing}")

    all_failed: set[str] = set()
    for handle in handles:
        family = COLLECTIONS[handle]
        col = collections[handle]
        print(f"\n=== {col['title']} ({handle}) ===")

        locales_html: dict[str, str] = {}
        for locale, pack_map in packs.items():
            pack = pack_map[family]
            title_line = title_line_from_pack(pack)
            # Rebuild title from first line of section if available via category
            # Prefer exact pack title: prefix + category from parse
            raw_title = f"{pack['prefix']}"
            if "60+" in (pack["short"] or "") and "60+" not in raw_title:
                # HD / ëkcoscreen lines use 60+ in pack headings
                if family in ("xcrenHd", "ekcoscreen"):
                    raw_title = f"{pack['prefix']} 60+"
            if pack.get("category"):
                raw_title = f"{raw_title} - {pack['category']}"
            html = collection_html(raw_title, pack["paragraphs"])
            locales_html[locale] = html
            if locale in ("en", "bg", "cs"):
                print(f"  {locale} heading: {raw_title}")

        if args.dry_run:
            print("DRY-RUN: skip write")
            print(f"EN html preview:\n{locales_html['en'][:400]}...")
            continue

        update_collection_en(mod, domain, token, col["id"], locales_html["en"])
        print("updated EN primary")

        digests = mod.fetch_digests(domain, token, col["id"])
        translations: list[dict[str, str]] = []
        for locale in mod.TRANSLATION_LOCALES:
            translations.append(
                {
                    "locale": mod.shopify_locale(locale),
                    "key": "body_html",
                    "value": locales_html[locale],
                    "translatableContentDigest": digests["body_html"],
                }
            )

        failures = mod.register_translations(domain, token, col["id"], translations)
        failed_locales = {f.split(":", 1)[0] for f in failures}
        ok = len(mod.TRANSLATION_LOCALES) - len(failed_locales)
        print(f"registered translations: {ok}/{len(mod.TRANSLATION_LOCALES)}")
        if failures:
            for f in sorted(set(failures)):
                print(f"  - {f}")
            all_failed |= failed_locales

    if all_failed:
        print(
            "\nMissing shop locales: " + ", ".join(sorted(all_failed))
        )
        return 2

    print("\nDone.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
