#!/usr/bin/env python3
"""
Sync product copy to Shopify from EU text packs
(xcrën HD / xcrën puck / ëkcoscreen / powër screen / üro lite / ëkco clip / frësh drop).

Updates (primary EN): title, descriptionHtml, custom.short_description
Registers translations for every locale present in the EU text packs
(shop must have those locales added in Settings → Languages).

Usage:
  python3 scripts/sync-shopify-xcren-texts.py --family ekcomat --all
  python3 scripts/sync-shopify-xcren-texts.py --family eztrap --all
  python3 scripts/sync-shopify-xcren-texts.py --family freshdrop --all
  python3 scripts/sync-shopify-xcren-texts.py --family ekcoclip --all
  python3 scripts/sync-shopify-xcren-texts.py --family urolite --all
  python3 scripts/sync-shopify-xcren-texts.py --family powerscreen --all
  python3 scripts/sync-shopify-xcren-texts.py --family ekcoscreen --all
  python3 scripts/sync-shopify-xcren-texts.py --family xcren --sku XHD-3B
  python3 scripts/sync-shopify-xcren-texts.py --all --dry-run
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
MCP_CFG = ROOT / ".cursor" / "mcp.json"
DOC_DIR = Path.home() / "Downloads" / "ekcos_product_texts_EU_3"

LOCALE_FILES = {
    "en": "ekcos_product_texts_English.docx",
    "bg": "ekcos_product_texts_Bulgarian.docx",
    "hr": "ekcos_product_texts_Croatian.docx",
    "cs": "ekcos_product_texts_Czech.docx",
    "da": "ekcos_product_texts_Danish.docx",
    "nl": "ekcos_product_texts_Dutch.docx",
    "et": "ekcos_product_texts_Estonian.docx",
    "fi": "ekcos_product_texts_Finnish.docx",
    "fr": "ekcos_product_texts_French.docx",
    "de": "ekcos_product_texts_German.docx",
    "el": "ekcos_product_texts_Greek.docx",
    "hu": "ekcos_product_texts_Hungarian.docx",
    "it": "ekcos_product_texts_Italian.docx",
    "lv": "ekcos_product_texts_Latvian.docx",
    "lt": "ekcos_product_texts_Lithuanian.docx",
    "pl": "ekcos_product_texts_Polish.docx",
    "pt": "ekcos_product_texts_Portuguese.docx",
    "ro": "ekcos_product_texts_Romanian.docx",
    "sk": "ekcos_product_texts_Slovak.docx",
    # "sl": Slovenian omitted — shop locale limit
    "es": "ekcos_product_texts_Spanish.docx",
    "sv": "ekcos_product_texts_Swedish.docx",
}

TRANSLATION_LOCALES = [loc for loc in LOCALE_FILES if loc != "en"]

# Pack locale code → Shopify shop locale (when they differ).
SHOPIFY_LOCALE = {
    "pt": "pt-PT",
}

def shopify_locale(pack_locale: str) -> str:
    return SHOPIFY_LOCALE.get(pack_locale, pack_locale)

PACK_SUFFIX = {
    "en": ", pack of 2",
    "bg": ", опаковка от 2",
    "hr": ", pakiranje od 2",
    "cs": ", balení po 2",
    "da": ", pakke med 2",
    "nl": ", verpakking van 2",
    "et": ", 2-pakk",
    "fi": ", 2 kpl pakkaus",
    "fr": ", lot de 2",
    "de": ", 2er-Pack",
    "el": ", συσκευασία των 2",
    "hu": ", 2 db-os csomag",
    "it": ", confezione da 2",
    "lv": ", iepakojums pa 2",
    "lt": ", pakuotė po 2",
    "pl": ", opakowanie 2 szt.",
    "pt": ", embalagem de 2",
    "ro": ", pachet de 2",
    "sk": ", balenie po 2",
    "sl": ", pakiranje po 2",
    "es": ", paquete de 2",
    "sv": ", förpackning om 2",
}

BENEFITS_LABEL = {
    "en": "Key benefits:",
    "bg": "Основни предимства:",
    "hr": "Glavne prednosti:",
    "cs": "Hlavní výhody:",
    "da": "Vigtigste fordele:",
    "nl": "Belangrijkste voordelen:",
    "et": "Peamised eelised:",
    "fi": "Tärkeimmät edut:",
    "fr": "Principaux avantages:",
    "de": "Die wichtigsten Vorteile:",
    "el": "Βασικά πλεονεκτήματα:",
    "hu": "Fő előnyök:",
    "it": "Vantaggi principali:",
    "lv": "Galvenās priekšrocības:",
    "lt": "Pagrindiniai privalumai:",
    "pl": "Najważniejsze zalety:",
    "pt": "Principais vantagens:",
    "ro": "Avantaje principale:",
    "sk": "Hlavné výhody:",
    "sl": "Glavne prednosti:",
    "es": "Ventajas principales:",
    "sv": "Viktigaste fördelar:",
}

BENEFITS_MARKERS = [
    "key benefits",
    "основни предимства",
    "glavne prednosti",
    "hlavní výhody",
    "hlavné výhody",
    "vigtigste fordele",
    "belangrijkste voordelen",
    "peamised eelised",
    "tärkeimmät edut",
    "principaux avantages",
    "die wichtigsten vorteile",
    "wichtigste vorteile",
    "βασικά πλεονεκτήματα",
    "fő előnyök",
    "vantaggi principali",
    "galvenās priekšrocības",
    "pagrindiniai privalumai",
    "najważniejsze zalety",
    "principais vantagens",
    "avantaje principale",
    "ventajas principales",
    "viktigaste fördelar",
]

CODES_MARKERS = [
    "product codes",
    "kódy a",
    "kódy a názvy",
    "codes et noms",
    "artikelnummern",
    "codici e nomi",
    "códigos y nombres",
    "códigos e nomes",
    "productcodes",
    "produktcodes",
    "produktkoder",
    "varenumre",
    "tuotekoodit",
    "tootekoodid",
    "produktu kodi",
    "gaminių kodai",
    "produktų kodai",
    "kody i",
    "coduri",
    "kodovi i",
    "šifre i",
    "sifre i",
    "šifre in",
    "кодове и",
    "κωδικοί",
    "termékkódok",
    "kode in imena",
]

PRODUCT_PREFIXES = [
    ("xcrenHd", "xcrën HD"),
    ("ekcoscreen", "ëkcoscreen"),
    ("powerscreen", "powër screen"),
    ("urolite", "üro lite"),
    ("ekcoclip", "ëkco clip"),
    ("freshdrop", "frësh drop"),
    ("eztrap", "ëz trap"),
    ("ekcomat", "ëkco mat"),
    ("xcrenPuck", "xcrën puck"),
]

FAMILIES = {
    "xcren": ("xcrenHd", "xcrenPuck"),
    "ekcoscreen": ("ekcoscreen",),
    "powerscreen": ("powerscreen",),
    "urolite": ("urolite",),
    "ekcoclip": ("ekcoclip",),
    "freshdrop": ("freshdrop",),
    "eztrap": ("eztrap",),
    "ekcomat": ("ekcomat",),
}

SKU_PREFIX_BY_FAMILY: dict[str, tuple[str, ...]] = {
    "xcrenHd": ("XHD-",),
    "xcrenPuck": ("XPU-",),
    "ekcoscreen": ("EKS-",),
    "powerscreen": ("PWR-",),
    "urolite": ("ULT-",),
    "ekcoclip": ("TBC-",),
    "freshdrop": ("FDI-", "FDB-", "FDL-"),
    "eztrap": ("EZT-",),
    "ekcomat": ("UFM-",),
}

# Hard stop markers when slicing a product section (other catalog entries).
SECTION_STOP_PREFIXES = (
    "ëkcoscreen",
    "powër screen",
    "basic scrëen",
    "üro lite",
    "ëkco clip",
    "frësh drop",
    "ëz trap",
    "xcrën puck",
    "ëkco mat",
    "ëkco loop",
)

API_VERSION = "2025-01"


def load_credentials() -> tuple[str, str, str]:
    cfg = json.loads(MCP_CFG.read_text())
    args = cfg["mcpServers"]["shopify"]["args"]

    def after(flag: str) -> str:
        return args[args.index(flag) + 1]

    return after("--clientId"), after("--clientSecret"), after("--domain")


def get_token(client_id: str, client_secret: str, domain: str) -> str:
    body = urllib.parse.urlencode(
        {
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
        }
    ).encode()
    req = urllib.request.Request(
        f"https://{domain}/admin/oauth/access_token",
        data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read().decode())
    token = data.get("access_token")
    if not token:
        raise RuntimeError(f"Token exchange failed: {data}")
    return token


def gql(domain: str, token: str, query: str, variables: dict[str, Any] | None = None) -> dict[str, Any]:
    payload: dict[str, Any] = {"query": query}
    if variables is not None:
        payload["variables"] = variables
    req = urllib.request.Request(
        f"https://{domain}/admin/api/{API_VERSION}/graphql.json",
        data=json.dumps(payload).encode(),
        headers={
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": token,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code}: {e.read().decode()[:1000]}") from e
    if data.get("errors"):
        raise RuntimeError(json.dumps(data["errors"], indent=2)[:2000])
    return data["data"]


def extract_txt(docx: Path) -> str:
    r = subprocess.run(
        ["textutil", "-convert", "txt", "-stdout", str(docx)],
        capture_output=True,
        text=True,
        check=False,
    )
    if r.returncode != 0:
        raise RuntimeError(f"textutil failed for {docx}: {r.stderr}")
    return (
        (r.stdout or "")
        .replace("\u00a0", " ")
        .replace("\ufeff", "")
        .replace("\r", "")
    )


def find_section_index(chunk: list[str], markers: list[str]) -> int | None:
    for i, line in enumerate(chunk):
        low = line.strip().lower()
        if any(m in low for m in markers):
            return i
    return None


def parse_product_section(lines: list[str], start: int, end: int, prefix: str) -> dict[str, Any]:
    chunk = lines[start:end]
    for j in range(1, len(chunk)):
        low = chunk[j].replace("\f", "").strip().lower()
        if any(low.startswith(p) for p in SECTION_STOP_PREFIXES):
            # Don't stop a section on its own title / variant lines
            if prefix.lower() == "xcrën puck" and low.startswith("xcrën puck"):
                continue
            if prefix.lower().startswith("ëkcoscreen") and low.startswith("ëkcoscreen"):
                continue
            if prefix.lower().startswith("powër screen") and low.startswith("powër screen"):
                continue
            if prefix.lower().startswith("üro lite") and low.startswith("üro lite"):
                continue
            if prefix.lower().startswith("ëkco clip") and low.startswith("ëkco clip"):
                continue
            if prefix.lower().startswith("frësh drop") and low.startswith("frësh drop"):
                continue
            if prefix.lower().startswith("ëz trap") and low.startswith("ëz trap"):
                continue
            if prefix.lower().startswith("ëkco mat") and low.startswith("ëkco mat"):
                continue
            chunk = chunk[:j]
            break

    title_line = chunk[0].replace("\f", "").strip()
    category = title_line.split(" - ", 1)[1].strip() if " - " in title_line else ""

    ben_idx = find_section_index(chunk, BENEFITS_MARKERS)
    codes_idx = find_section_index(chunk, CODES_MARKERS)
    if codes_idx is None:
        for i, line in enumerate(chunk):
            if line.strip() == "SKU":
                codes_idx = i - 1 if i > 0 else i
                break

    body_end = ben_idx if ben_idx is not None else (codes_idx if codes_idx is not None else len(chunk))
    paragraphs = [l.strip() for l in chunk[1:body_end] if l.strip() and l.strip() != "\f"]

    benefits: list[str] = []
    if ben_idx is not None:
        stop = codes_idx if codes_idx is not None else len(chunk)
        for raw in chunk[ben_idx + 1 : stop]:
            s = raw.strip()
            if not s:
                continue
            if s.startswith("•") or raw.startswith("\t") or s.startswith("-"):
                cleaned = re.sub(r"^[•\-\t\s]+", "", s).strip()
                if cleaned:
                    benefits.append(cleaned)

    variants: dict[str, str] = {}
    if codes_idx is not None:
        code_lines = [l.strip() for l in chunk[codes_idx + 1 :] if l.strip()]
        i = 0
        while i < len(code_lines):
            line = code_lines[i]
            if re.match(r"^[A-Z]{2,4}-[0-9A-Z]+$", line):
                sku = line
                label = code_lines[i + 1] if i + 1 < len(code_lines) else ""
                if label and not re.match(r"^[A-Z]{2,4}-[0-9A-Z]+$", label):
                    # Stop collecting once we hit another product family SKU prefix
                    if prefix.lower().startswith("xcrën hd") and not sku.startswith("XHD-"):
                        break
                    if prefix.lower().startswith("xcrën puck") and not sku.startswith("XPU-"):
                        break
                    if prefix.lower().startswith("ëkcoscreen") and not sku.startswith("EKS-"):
                        break
                    if prefix.lower().startswith("powër screen") and not sku.startswith("PWR-"):
                        break
                    if prefix.lower().startswith("üro lite") and not sku.startswith("ULT-"):
                        break
                    if prefix.lower().startswith("ëkco clip") and not sku.startswith("TBC-"):
                        break
                    if prefix.lower().startswith("frësh drop") and not sku.startswith(
                        ("FDI-", "FDB-", "FDL-")
                    ):
                        break
                    if prefix.lower().startswith("ëz trap") and not sku.startswith("EZT-"):
                        break
                    if prefix.lower().startswith("ëkco mat") and not sku.startswith("UFM-"):
                        break
                    variants[sku] = label
                    i += 2
                    continue
            i += 1

    return {
        "prefix": prefix,
        "category": category,
        "paragraphs": paragraphs,
        "short": paragraphs[0] if paragraphs else category,
        "benefits": benefits,
        "variants": variants,
    }


def parse_locale_doc(docx: Path) -> dict[str, dict[str, Any]]:
    text = extract_txt(docx)
    lines = text.split("\n")
    starts: list[tuple[int, str, str]] = []
    for i, raw in enumerate(lines):
        line = raw.replace("\f", "").strip()
        if not line or " - " not in line:
            continue
        for key, prefix in PRODUCT_PREFIXES:
            if line.lower().startswith(prefix.lower()):
                after = line.split(" - ", 1)[1]
                # skip variant-looking lines
                if "/" in after and len(after) < 45:
                    continue
                starts.append((i, key, prefix))
                break

    # first occurrence per product key
    seen: set[str] = set()
    filtered: list[tuple[int, str, str]] = []
    for item in starts:
        if item[1] in seen:
            continue
        seen.add(item[1])
        filtered.append(item)

    products: dict[str, dict[str, Any]] = {}
    for idx, (start, key, prefix) in enumerate(filtered):
        end = filtered[idx + 1][0] if idx + 1 < len(filtered) else len(lines)
        products[key] = parse_product_section(lines, start, end, prefix)
    return products


ECO_ONE_ARTICLE_PATH = "/blogs/articles/eco-one"


def escape_html(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def linkify_eco_one(html: str) -> str:
    """Wrap bare Eco-One™ mentions with a link to the Shopify article."""
    return re.sub(
        r"(^|[^>])Eco-One™(?!</a>)",
        rf'\1<a href="{ECO_ONE_ARTICLE_PATH}">Eco-One™</a>',
        html,
    )


def rich_text_short(text: str) -> str:
    return json.dumps(
        {
            "type": "root",
            "children": [
                {
                    "type": "paragraph",
                    "children": [{"type": "text", "value": text}],
                }
            ],
        },
        ensure_ascii=False,
        separators=(",", ":"),
    )


def extract_images(html: str) -> list[str]:
    return re.findall(r"<img\b[^>]*>", html or "", flags=re.I)


def build_description_html(
    paragraphs: list[str],
    benefits: list[str],
    locale: str,
    images: list[str],
) -> str:
    parts: list[str] = []
    for i, para in enumerate(paragraphs):
        if i == 0 and images:
            parts.append(f"<p>{escape_html(para)}</p>")
            parts.append(f"<p>{images[0]}</p>")
        elif i == len(paragraphs) - 1 and len(paragraphs) > 1:
            if len(images) > 1:
                parts.append(f"<p>{images[1]}</p>")
            parts.append(f"<p><strong>{escape_html(para)}</strong></p>")
        else:
            parts.append(f"<p>{escape_html(para)}</p>")

    label = BENEFITS_LABEL[locale]
    parts.append(f"<p><strong>{escape_html(label)}</strong></p>")
    if benefits:
        items = "".join(f"<li>{escape_html(b)}</li>" for b in benefits)
        parts.append(f"<ul>{items}</ul>")
    return linkify_eco_one("\n".join(parts))


def build_title(variant_label: str, sku: str, locale: str) -> str:
    if sku.startswith(("XHD-", "EKS-", "PWR-", "ULT-", "TBC-")):
        return f"{variant_label}{PACK_SUFFIX[locale]}"
    return variant_label


def list_family_products(
    domain: str, token: str, product_keys: tuple[str, ...]
) -> list[dict[str, Any]]:
    sku_query_parts: list[str] = []
    allowed_prefixes: list[str] = []
    for key in product_keys:
        prefixes = SKU_PREFIX_BY_FAMILY[key]
        allowed_prefixes.extend(prefixes)
        for prefix in prefixes:
            sku_query_parts.append(f"sku:{prefix.rstrip('-')}")
    search = " OR ".join(sku_query_parts)
    query = """
    query($cursor: String, $q: String!) {
      products(first: 50, after: $cursor, query: $q) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          title
          descriptionHtml
          variants(first: 5) { nodes { sku } }
          metafield(namespace: "custom", key: "short_description") { id value }
        }
      }
    }
    """
    out: list[dict[str, Any]] = []
    cursor = None
    while True:
        data = gql(domain, token, query, {"cursor": cursor, "q": search})
        conn = data["products"]
        for node in conn["nodes"]:
            sku = next((v["sku"] for v in node["variants"]["nodes"] if v.get("sku")), None)
            if not sku:
                continue
            if any(sku.startswith(p) for p in allowed_prefixes):
                if "loop" in node["title"].lower():
                    continue
                out.append({**node, "sku": sku})
        if not conn["pageInfo"]["hasNextPage"]:
            break
        cursor = conn["pageInfo"]["endCursor"]
    return out


def product_family(sku: str) -> str:
    if sku.startswith("XHD-"):
        return "xcrenHd"
    if sku.startswith("XPU-"):
        return "xcrenPuck"
    if sku.startswith("EKS-"):
        return "ekcoscreen"
    if sku.startswith("PWR-"):
        return "powerscreen"
    if sku.startswith("ULT-"):
        return "urolite"
    if sku.startswith("TBC-"):
        return "ekcoclip"
    if sku.startswith(("FDI-", "FDB-", "FDL-")):
        return "freshdrop"
    if sku.startswith("EZT-"):
        return "eztrap"
    if sku.startswith("UFM-"):
        return "ekcomat"
    raise ValueError(f"Unknown SKU family: {sku}")


def update_primary_en(
    domain: str,
    token: str,
    product_id: str,
    title: str,
    description_html: str,
    short_json: str,
) -> None:
    mutation = """
    mutation($input: ProductInput!) {
      productUpdate(input: $input) {
        product { id title }
        userErrors { field message }
      }
    }
    """
    variables = {
        "input": {
            "id": product_id,
            "title": title,
            "descriptionHtml": description_html,
            "metafields": [
                {
                    "namespace": "custom",
                    "key": "short_description",
                    "type": "rich_text_field",
                    "value": short_json,
                }
            ],
        }
    }
    data = gql(domain, token, mutation, variables)
    errors = data["productUpdate"]["userErrors"]
    if errors:
        raise RuntimeError(f"productUpdate errors: {errors}")


def register_translations(
    domain: str,
    token: str,
    resource_id: str,
    translations: list[dict[str, str]],
) -> list[str]:
    """Register translations; returns list of failed locale messages."""
    mutation = """
    mutation($resourceId: ID!, $translations: [TranslationInput!]!) {
      translationsRegister(resourceId: $resourceId, translations: $translations) {
        userErrors { field message code }
        translations { key locale }
      }
    }
    """
    # Register per-locale batches so one missing locale doesn't block others.
    failed: list[str] = []
    by_locale: dict[str, list[dict[str, str]]] = {}
    for t in translations:
        by_locale.setdefault(t["locale"], []).append(t)

    for locale, batch in by_locale.items():
        data = gql(
            domain,
            token,
            mutation,
            {"resourceId": resource_id, "translations": batch},
        )
        errors = data["translationsRegister"]["userErrors"]
        if errors:
            msgs = "; ".join(e.get("message", str(e)) for e in errors)
            failed.append(f"{locale}: {msgs}")
    return failed


def fetch_digests(domain: str, token: str, resource_id: str) -> dict[str, str]:
    query = """
    query($id: ID!) {
      translatableResource(resourceId: $id) {
        translatableContent { key digest }
      }
    }
    """
    data = gql(domain, token, query, {"id": resource_id})
    content = data["translatableResource"]["translatableContent"]
    return {c["key"]: c["digest"] for c in content}


def sync_product(
    domain: str,
    token: str,
    product: dict[str, Any],
    packs: dict[str, dict[str, dict[str, Any]]],
    dry_run: bool,
) -> set[str]:
    """Returns set of locales that failed to register."""
    sku = product["sku"]
    family = product_family(sku)
    en = packs["en"][family]
    if sku not in en["variants"]:
        raise RuntimeError(f"SKU {sku} missing in EN pack variants")

    images = extract_images(product.get("descriptionHtml") or "")

    # Build per-locale payloads
    locales_payload: dict[str, dict[str, str]] = {}
    for locale, pack in packs.items():
        family_pack = pack[family]
        if sku not in family_pack["variants"]:
            raise RuntimeError(f"SKU {sku} missing in {locale} pack")
        variant_label = family_pack["variants"][sku]
        title = build_title(variant_label, sku, locale)
        desc = build_description_html(
            family_pack["paragraphs"],
            family_pack["benefits"],
            locale,
            images,
        )
        short = rich_text_short(family_pack["short"])
        locales_payload[locale] = {
            "title": title,
            "body_html": desc,
            "short": short,
        }

    print(f"\n=== {sku} ({product['id']}) ===")
    print(f"EN title: {locales_payload['en']['title']}")
    print(f"CS title: {locales_payload['cs']['title']}")
    print(f"PL title: {locales_payload['pl']['title']}")
    print(f"EN short: {packs['en'][family]['short'][:110]}...")
    print(f"images preserved: {len(images)}")
    print(f"translation locales: {len(TRANSLATION_LOCALES)}")

    if dry_run:
        print("DRY-RUN: skip write")
        return set()

    update_primary_en(
        domain,
        token,
        product["id"],
        locales_payload["en"]["title"],
        locales_payload["en"]["body_html"],
        locales_payload["en"]["short"],
    )
    print("updated EN primary")

    # Refresh metafield id + digests after EN write
    q = """
    query($id: ID!) {
      product(id: $id) {
        id
        metafield(namespace: "custom", key: "short_description") { id }
      }
    }
    """
    mf_id = gql(domain, token, q, {"id": product["id"]})["product"]["metafield"]["id"]
    product_digests = fetch_digests(domain, token, product["id"])
    mf_digests = fetch_digests(domain, token, mf_id)

    product_translations: list[dict[str, str]] = []
    mf_translations: list[dict[str, str]] = []
    for locale in TRANSLATION_LOCALES:
        payload = locales_payload[locale]
        shop_locale = shopify_locale(locale)
        product_translations.extend(
            [
                {
                    "locale": shop_locale,
                    "key": "title",
                    "value": payload["title"],
                    "translatableContentDigest": product_digests["title"],
                },
                {
                    "locale": shop_locale,
                    "key": "body_html",
                    "value": payload["body_html"],
                    "translatableContentDigest": product_digests["body_html"],
                },
            ]
        )
        mf_translations.append(
            {
                "locale": shop_locale,
                "key": "value",
                "value": payload["short"],
                "translatableContentDigest": mf_digests["value"],
            }
        )

    register_failures = register_translations(
        domain, token, product["id"], product_translations
    )
    register_failures += register_translations(domain, token, mf_id, mf_translations)
    failed_locales = {f.split(":", 1)[0] for f in register_failures}
    ok_count = len(TRANSLATION_LOCALES) - len(failed_locales)
    print(f"registered translations: {ok_count}/{len(TRANSLATION_LOCALES)} locales")
    if register_failures:
        uniq = sorted(set(register_failures))
        print("  failures:")
        for f in uniq:
            print(f"    - {f}")
    return failed_locales


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sku", action="append", default=[], help="SKU to sync (repeatable)")
    parser.add_argument("--all", action="store_true", help="Sync all products in --family")
    parser.add_argument(
        "--family",
        choices=sorted(FAMILIES.keys()),
        default="xcren",
        help="Product family to sync (default: xcren)",
    )
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not args.all and not args.sku:
        parser.error("Provide --sku or --all")

    product_keys = FAMILIES[args.family]

    for locale, filename in LOCALE_FILES.items():
        path = DOC_DIR / filename
        if not path.exists():
            raise SystemExit(f"Missing text pack: {path}")

    print(f"Parsing text packs (family={args.family})...")
    packs = {locale: parse_locale_doc(DOC_DIR / filename) for locale, filename in LOCALE_FILES.items()}
    for locale, products in packs.items():
        missing = [k for k in product_keys if k not in products]
        if missing:
            raise SystemExit(f"{locale}: missing products {missing}")
        summary = ", ".join(
            f"{k} variants={len(products[k]['variants'])} benefits={len(products[k]['benefits'])}"
            for k in product_keys
        )
        print(f"  {locale}: {summary}")

    client_id, client_secret, domain = load_credentials()
    token = get_token(client_id, client_secret, domain)
    products = list_family_products(domain, token, product_keys)
    print(f"Shopify {args.family} products: {len(products)}")

    wanted = set(args.sku)
    selected = products if args.all else [p for p in products if p["sku"] in wanted]
    if not selected:
        raise SystemExit(f"No matching products for {wanted or 'ALL'}")

    all_failed: set[str] = set()
    for product in selected:
        all_failed |= sync_product(domain, token, product, packs, dry_run=args.dry_run)

    if all_failed:
        print(
            "\nMissing shop locales (add in Settings → Languages, then re-run): "
            + ", ".join(sorted(all_failed))
        )
        return 2

    print("\nDone.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
