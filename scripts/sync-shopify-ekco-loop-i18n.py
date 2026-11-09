#!/usr/bin/env python3
"""
Sync ëkco loop product copy + translations to Shopify from PDF/text packs.

Usage:
  python3 scripts/sync-shopify-ekco-loop-i18n.py
  python3 scripts/sync-shopify-ekco-loop-i18n.py --txt-dir /tmp/ekcos_loop_txt
  python3 scripts/sync-shopify-ekco-loop-i18n.py --pdf-dir ~/Downloads/copy
  python3 scripts/sync-shopify-ekco-loop-i18n.py --dry-run
"""

from __future__ import annotations

import argparse
import importlib.util
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_TXT_DIR = Path("/tmp/ekcos_loop_txt")
DEFAULT_PDF_DIR = Path.home() / "Downloads" / "copy"

LOCALE_PDFS = {
    "en": "ekcos_product_texts_English.pdf",
    "bg": "ekcos_product_texts_Bulgarian.pdf",
    "hr": "ekcos_product_texts_Croatian.pdf",
    "cs": "ekcos_product_texts_Czech.pdf",
    "da": "ekcos_product_texts_Danish.pdf",
    "nl": "ekcos_product_texts_Dutch.pdf",
    "et": "ekcos_product_texts_Estonian.pdf",
    "fi": "ekcos_product_texts_Finnish.pdf",
    "fr": "ekcos_product_texts_French.pdf",
    "de": "ekcos_product_texts_German.pdf",
    "el": "ekcos_product_texts_Greek.pdf",
    "hu": "ekcos_product_texts_Hungarian.pdf",
    "it": "ekcos_product_texts_Italian.pdf",
    "lv": "ekcos_product_texts_Latvian.pdf",
    "lt": "ekcos_product_texts_Lithuanian.pdf",
    "pl": "ekcos_product_texts_Polish.pdf",
    "pt": "ekcos_product_texts_Portuguese.pdf",
    "ro": "ekcos_product_texts_Romanian.pdf",
    "sk": "ekcos_product_texts_Slovak.pdf",
    # Slovenian omitted — Shopify locale limit
    "es": "ekcos_product_texts_Spanish.pdf",
    "sv": "ekcos_product_texts_Swedish.pdf",
}

TRANSLATION_LOCALES = [loc for loc in LOCALE_PDFS if loc != "en"]

BENEFITS_MARKERS = [
    "key benefits",
    "hlavní výhody",
    "hlavné výhody",
    "ventajas principales",
    "ventajas clave",
    "principaux avantages",
    "wichtigste vorteile",
    "die wichtigsten vorteile",
    "vantaggi principali",
    "vigtigste fordele",
    "belangrijkste voordelen",
    "viktigaste fördelar",
    "viktigaste fördelarna",
    "tärkeimmät edut",
    "peamised eelised",
    "galvenās priekšrocības",
    "galvenie ieguvumi",
    "pagrindiniai privalumai",
    "pagrindinės naudos",
    "najważniejsze zalety",
    "główne korzyści",
    "principais vantagens",
    "principais benefícios",
    "avantaje principale",
    "principalele beneficii",
    "glavne prednosti",
    "osnovne prednosti",
    "ključne prednosti",
    "основни предимства",
    "βασικά πλεονεκτήματα",
    "βασικά οφέλη",
    "fő előnyök",
    "főbb előnyök",
    "kľúčové výhody",
]

CODES_MARKERS = [
    "product codes",
    "product codes and names",
    "kódy a",
    "kódy a názvy",
    "códigos",
    "codes produits",
    "codes et noms",
    "produktcodes",
    "artikelnummern",
    "codici",
    "produktkoder",
    "productcodes",
    "varenumre",
    "tuotekoodit",
    "tootekoodid",
    "produktu kodi",
    "produktų kodai",
    "kody produktów",
    "kody i",
    "códigos e nomes",
    "códigos y nombres",
    "coduri",
    "kodovi i",
    "oznake",
    "šifre i",
    "шифри",
    "кодове и",
    "κωδικοί",
    "termékkódok",
]

BULLET_RE = re.compile(
    r"^[\s\u00a0]*(?:[\u2022\u2023\u25E6\u2043\u2219\uf0b7•·\-\*]|\d+[.)])\s+"
)
SKU_LINE_RE = re.compile(
    r"^\s*(ELI-[0-9A-Z]+|ELB-[0-9A-Z]+)\s+(.+?)\s*$",
    re.I,
)
ABOUT_RE = re.compile(
    r"^(About Us|O nás|Sobre nosotros|À propos|Über uns|Chi siamo|Over ons|"
    r"Om os|Om oss|Tietoa meistä|Meist|Par mums|Apie mus|O nas|Sobre nós|"
    r"Despre noi|Za nas|O nama|За нас|Σχετικά με εμάς|Rólunk)\b"
)


def load_sync_mod() -> Any:
    path = ROOT / "scripts" / "sync-shopify-xcren-texts.py"
    spec = importlib.util.spec_from_file_location("xcren_sync", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def pdf_to_text(pdf: Path) -> str:
    r = subprocess.run(
        ["pdftotext", "-layout", str(pdf), "-"],
        capture_output=True,
        text=True,
        check=False,
    )
    if r.returncode != 0:
        raise RuntimeError(f"pdftotext failed for {pdf}: {r.stderr}")
    return normalize_text(r.stdout or "")


def normalize_text(raw: str) -> str:
    return (
        raw.replace("\u00a0", " ")
        .replace("\ufeff", "")
        .replace("\r", "")
    )


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s.strip().lower())


def find_idx(lines: list[str], markers: list[str]) -> int | None:
    for i, line in enumerate(lines):
        n = norm(line)
        for m in markers:
            if n == m or n.startswith(m):
                return i
    return None


def scrub_eco(s: str) -> str:
    return re.sub(r"Eco-\s+One", "Eco-One", s)


def parse_loop(text: str) -> dict[str, Any]:
    lines = [l.replace("\x0c", "") for l in text.splitlines()]
    start = next(
        (
            i
            for i, l in enumerate(lines)
            if re.match(r"^ëkco loop\s+-", l.strip(), re.I)
        ),
        None,
    )
    if start is None:
        raise ValueError("ëkco loop section not found")

    end = len(lines)
    for j in range(start + 1, len(lines)):
        raw = lines[j].strip()
        if ABOUT_RE.match(raw):
            end = j
            break
        # Next product after Loop (rarely present after About Us)
        if re.match(
            r"^(xcrën|ëkcoscreen|powër|basic scrëen|üro lite|ëkco clip|frësh drop|"
            r"ëz trap|ëkco mat)\b",
            raw,
            re.I,
        ):
            end = j
            break

    chunk = lines[start:end]
    title = chunk[0].strip()
    category = title.split(" - ", 1)[1].strip() if " - " in title else ""

    ben = find_idx(chunk, BENEFITS_MARKERS)
    codes = find_idx(chunk, CODES_MARKERS)
    if codes is None:
        for i, line in enumerate(chunk):
            if re.match(r"^SKU\b", line.strip(), re.I):
                codes = i
                break

    body_end = ben if ben is not None else codes if codes is not None else len(chunk)
    paragraphs: list[str] = []
    buf: list[str] = []
    for line in chunk[1:body_end]:
        s = line.strip()
        if not s:
            if buf:
                paragraphs.append(scrub_eco(" ".join(buf)))
                buf = []
            continue
        buf.append(s)
    if buf:
        paragraphs.append(scrub_eco(" ".join(buf)))

    benefits: list[str] = []
    if ben is not None:
        stop = codes if codes is not None else len(chunk)
        cur: str | None = None
        for line in chunk[ben + 1 : stop]:
            s = line.strip()
            if not s:
                continue
            if BULLET_RE.match(line) or BULLET_RE.match(s):
                if cur:
                    benefits.append(scrub_eco(cur))
                cleaned = BULLET_RE.sub("", s if BULLET_RE.match(s) else line).strip()
                cleaned = re.sub(r"^[\uf0b7•·\-\*]+\s*", "", cleaned).strip()
                cur = cleaned
            elif cur is not None and not SKU_LINE_RE.match(s):
                cur = f"{cur} {s}".strip()
        if cur:
            benefits.append(scrub_eco(cur))

    if benefits:
        benefits[-1] = re.split(
            r"\s+(?:Product Codes|Kódy a|Varenumre|Produktcodes|Artikelnummern|"
            r"Codes produits|Codes et|Códigos|Codici|Kody |Coduri|Šifre|Oznake|"
            r"Шифри|Κωδικοί|Termékkódok|Tuotekoodit|Tootekoodid|Produktu kodi|"
            r"Produktų kodai|Produktkoder|Artikelnummers|Продуктови|Gaminių|"
            r"Kodovi)\b",
            benefits[-1],
            maxsplit=1,
            flags=re.I,
        )[0].strip()

    variants: dict[str, str] = {}
    scan_from = codes if codes is not None else 0
    for line in chunk[scan_from:]:
        m = SKU_LINE_RE.match(line)
        if not m:
            continue
        sku = m.group(1).upper()
        label = scrub_eco(m.group(2).strip())
        if sku.startswith(("ELI-", "ELB-")):
            variants[sku] = label

    if not paragraphs:
        raise ValueError("ëkco loop body missing")
    if len(variants) < 12:
        raise ValueError(
            f"expected 12 Loop SKUs, got {len(variants)}: {sorted(variants)}"
        )

    return {
        "category": category,
        "paragraphs": paragraphs,
        "short": paragraphs[0],
        "benefits": benefits,
        "variants": variants,
    }


def load_locale_text(locale: str, txt_dir: Path | None, pdf_dir: Path | None) -> str:
    if txt_dir is not None:
        path = txt_dir / f"{locale}.txt"
        if path.exists():
            return normalize_text(path.read_text(encoding="utf-8"))
    if pdf_dir is not None:
        pdf = pdf_dir / LOCALE_PDFS[locale]
        if pdf.exists():
            return pdf_to_text(pdf)
    raise FileNotFoundError(
        f"No text for locale {locale} "
        f"(txt_dir={txt_dir}, pdf_dir={pdf_dir})"
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--txt-dir", type=Path, default=None)
    ap.add_argument("--pdf-dir", type=Path, default=None)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--sku", action="append", default=[], help="Limit to SKU(s)")
    args = ap.parse_args()

    txt_dir = args.txt_dir
    pdf_dir = args.pdf_dir
    if txt_dir is None and pdf_dir is None:
        if DEFAULT_TXT_DIR.exists():
            txt_dir = DEFAULT_TXT_DIR
        elif DEFAULT_PDF_DIR.exists():
            pdf_dir = DEFAULT_PDF_DIR
        else:
            raise SystemExit(
                f"Need --txt-dir or --pdf-dir "
                f"(defaults missing: {DEFAULT_TXT_DIR}, {DEFAULT_PDF_DIR})"
            )

    sync = load_sync_mod()

    packs: dict[str, dict[str, Any]] = {}
    print(f"Parsing Loop packs (txt={txt_dir}, pdf={pdf_dir}) ...")
    for locale in LOCALE_PDFS:
        parsed = parse_loop(load_locale_text(locale, txt_dir, pdf_dir))
        packs[locale] = {"ekcoloop": parsed}
        print(
            f"  {locale}: variants={len(parsed['variants'])} "
            f"benefits={len(parsed['benefits'])} "
            f"title[ELI-3B]={parsed['variants'].get('ELI-3B', '?')}"
        )

    client_id, client_secret, domain = sync.load_credentials()
    token = sync.get_token(client_id, client_secret, domain)
    products = sync.list_family_products(domain, token, ("ekcoloop",))
    print(f"Shopify ekcoloop products: {len(products)}")

    wanted = set(args.sku)
    selected = products if not wanted else [p for p in products if p["sku"] in wanted]
    if wanted and len(selected) != len(wanted):
        found = {p["sku"] for p in selected}
        raise SystemExit(f"Missing SKUs on Shopify: {sorted(wanted - found)}")
    if not selected:
        raise SystemExit("No Loop products found on Shopify")

    failed_all: set[str] = set()
    for product in selected:
        failed_all |= sync.sync_product(
            domain, token, product, packs, dry_run=args.dry_run
        )

    # Collection description from EN pack
    en = packs["en"]["ekcoloop"]
    col_html = (
        f"<h3>ëkco loop - {sync.escape_html(en['category'])}</h3>\n"
        + "\n".join(f"<p>{sync.escape_html(p)}</p>" for p in en["paragraphs"][:2])
    )
    print("\n=== collection ekco-loop ===")
    if args.dry_run:
        print("DRY-RUN: skip collection")
    else:
        q = """
        query {
          collections(first: 10, query: "handle:ekco-loop") {
            nodes { id handle }
          }
        }
        """
        cols = sync.gql(domain, token, q)["collections"]["nodes"]
        col = next((c for c in cols if c["handle"] == "ekco-loop"), None)
        if not col:
            print("collection ekco-loop not found — skip")
        else:
            mut = """
            mutation($input: CollectionInput!) {
              collectionUpdate(input: $input) {
                collection { id }
                userErrors { field message }
              }
            }
            """
            data = sync.gql(
                domain,
                token,
                mut,
                {"input": {"id": col["id"], "descriptionHtml": col_html}},
            )
            errs = data["collectionUpdate"]["userErrors"]
            print("collection EN", errs or "ok")

            digests = sync.fetch_digests(domain, token, col["id"])
            translations = []
            for locale in TRANSLATION_LOCALES:
                pack = packs[locale]["ekcoloop"]
                html = (
                    f"<h3>ëkco loop - {sync.escape_html(pack['category'])}</h3>\n"
                    + "\n".join(
                        f"<p>{sync.escape_html(p)}</p>" for p in pack["paragraphs"][:2]
                    )
                )
                shop_locale = sync.shopify_locale(locale)
                if "body_html" in digests:
                    translations.append(
                        {
                            "locale": shop_locale,
                            "key": "body_html",
                            "value": html,
                            "translatableContentDigest": digests["body_html"],
                        }
                    )
                if "title" in digests:
                    translations.append(
                        {
                            "locale": shop_locale,
                            "key": "title",
                            "value": "ëkco loop",
                            "translatableContentDigest": digests["title"],
                        }
                    )
            fails = sync.register_translations(
                domain, token, col["id"], translations
            )
            print(
                "collection translations",
                "ok" if not fails else fails,
            )

    if failed_all:
        print(f"\nDone with locale failures: {sorted(failed_all)}")
        return 1
    print("\nDone.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
