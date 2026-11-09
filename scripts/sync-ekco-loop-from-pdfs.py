#!/usr/bin/env python3
"""Sync dictionaries/*/products.ekcoLoop from ekcos_product_texts_*.pdf packs.

Usage:
  python3 scripts/sync-ekco-loop-from-pdfs.py \\
    --dir ~/Downloads/copy

Expects LibreOffice/Word PDFs with an ëkco loop section (pdftotext -layout).
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DICT_DIR = ROOT / "dictionaries"

LOCALE_FILES = {
    "bg": "ekcos_product_texts_Bulgarian.pdf",
    "hr": "ekcos_product_texts_Croatian.pdf",
    "cs": "ekcos_product_texts_Czech.pdf",
    "da": "ekcos_product_texts_Danish.pdf",
    "nl": "ekcos_product_texts_Dutch.pdf",
    "en": "ekcos_product_texts_English.pdf",
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
    "sl": "ekcos_product_texts_Slovenian.pdf",
    "es": "ekcos_product_texts_Spanish.pdf",
    "sv": "ekcos_product_texts_Swedish.pdf",
}

BULLET_RE = re.compile(r"^[\s\u00a0]*(?:[\u2022\u2023\u25E6\u2043\u2219\uf0b7•·\-\*]|\d+[.)])\s+")
BENEFITS_MARKERS = [
    "key benefits", "hlavní výhody", "hlavné výhody", "ventajas principales", "ventajas clave",
    "principaux avantages", "wichtigste vorteile", "die wichtigsten vorteile", "vantaggi principali",
    "vigtigste fordele", "belangrijkste voordelen", "viktigaste fördelar", "viktigaste fördelarna",
    "tärkeimmät edut", "peamised eelised", "galvenās priekšrocības", "galvenie ieguvumi",
    "pagrindiniai privalumai", "pagrindinės naudos", "najważniejsze zalety", "główne korzyści",
    "principais vantagens", "principais benefícios", "avantaje principale", "principalele beneficii",
    "glavne prednosti", "osnovne prednosti", "ključne prednosti", "основни предимства",
    "βασικά πλεονεκτήματα", "βασικά οφέλη", "fő előnyök", "főbb előnyök", "kľúčové výhody",
]
CODES_MARKERS = [
    "product codes", "product codes and names", "kódy a", "kódy a názvy", "códigos",
    "codes produits", "produktcodes", "codici", "produktkoder", "productcodes",
    "tuotekoodit", "tootekoodid", "produktu kodi", "produktų kodai", "kody produktów",
    "códigos e nomes", "coduri", "oznake", "шифри", "κωδικοί", "termékkódok",
]

USE_CASES = {
    "en": ["Under desks and drawers", "Closets, cabinets and bins"],
    "cs": ["Pod stoly a do zásuvek", "Skříně, botníky a koše"],
    "sk": ["Pod stoly a do zásuviek", "Skrine, botníky a koše"],
    "de": ["Unter Schreibtischen und in Schubladen", "Schränke, Schuhschränke und Abfalleimer"],
    "pl": ["Pod biurkami i w szufladach", "Szafy, szafki na buty i kosze"],
    "fr": ["Sous les bureaux et dans les tiroirs", "Placards, meubles à chaussures et poubelles"],
    "es": ["Bajo escritorios y en cajones", "Armarios, zapateros y cubos"],
    "it": ["Sotto le scrivanie e nei cassetti", "Armadi, scarpiera e cestini"],
    "nl": ["Onder bureaus en in laden", "Kasten, schoenkasten en prullenbakken"],
    "pt": ["Debaixo de secretárias e em gavetas", "Armários, sapateiras e caixotes"],
    "sv": ["Under skrivbord och i lådor", "Skåp, skohyllor och papperskorgar"],
    "da": ["Under skriveborde og i skuffer", "Skabe, skohylder og skraldespande"],
    "fi": ["Pöytien alle ja laatikoihin", "Kaapit, kenkäkaapit ja roskikset"],
    "el": ["Κάτω από γραφεία και σε συρτάρια", "Ντουλάπες, παπουτσοθήκες και κάδοι"],
    "hu": ["Asztalok alá és fiókokba", "Szekrények, cipőtartók és szemetesek"],
    "ro": ["Sub birouri și în sertare", "Dulapuri, pantofare și coșuri"],
    "bg": ["Под бюра и в чекмеджета", "Шкафове, обувки и кошчета"],
    "hr": ["Ispod stolova i u ladice", "Ormari, cipelarnici i koševi"],
    "sl": ["Pod mizami in v predalih", "Omare, čevljarne in koši"],
    "et": ["Laudade alla ja sahtlitesse", "Kapid, jalanõukapid ja prügikastid"],
    "lv": ["Zem galdiem un atvilktnēs", "Skapji, apavu skapji un atkritumu tvertnes"],
    "lt": ["Po stalais ir stalčiuose", "Spintos, batų spintos ir šiukšliadėžės"],
}

BASE_LABEL = {
    "en": "base", "cs": "základna", "sk": "základňa", "de": "Basis", "pl": "podstawa",
    "fr": "base", "es": "base", "it": "base", "nl": "basis", "pt": "base", "sv": "bas",
    "da": "base", "fi": "jalusta", "el": "βάση", "hu": "alap", "ro": "bază", "bg": "основа",
    "hr": "baza", "sl": "osnova", "et": "alus", "lv": "pamats", "lt": "pagrindas",
}

IMAGE_ALT_EN = (
    "Blue ëkco loop compact air freshener disc on its adhesive mounting base, "
    "seen from above on a black background"
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


def parse_loop(text: str) -> dict[str, object]:
    lines = [l.replace("\x0c", "") for l in text.splitlines()]
    start = next(
        (i for i, l in enumerate(lines) if re.match(r"^ëkco loop\s+-", l.strip(), re.I)),
        None,
    )
    if start is None:
        raise ValueError("ëkco loop section not found")

    end = len(lines)
    for j in range(start + 1, len(lines)):
        raw = lines[j].strip()
        if re.match(
            r"^(About Us|O nás|Sobre nosotros|À propos|Über uns|Chi siamo|Over ons|Om os|Om oss|"
            r"Tietoa meistä|Meist|Par mums|Apie mus|O nas|Sobre nós|Despre noi|Za nas|O nama|"
            r"За нас|Σχετικά με εμάς|Rólunk)\b",
            raw,
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
    paras: list[str] = []
    buf: list[str] = []
    for line in chunk[1:body_end]:
        s = line.strip()
        if not s:
            if buf:
                paras.append(" ".join(buf))
                buf = []
            continue
        buf.append(s)
    if buf:
        paras.append(" ".join(buf))

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
                    benefits.append(cur)
                cur = BULLET_RE.sub("", s if BULLET_RE.match(s) else line).strip()
                cur = re.sub(r"^[\uf0b7•·\-\*]+\s*", "", cur).strip()
            elif cur is not None:
                cur = f"{cur} {s}".strip()
        if cur:
            benefits.append(cur)

    def scrub(s: str) -> str:
        s = re.sub(r"Eco-\s+One", "Eco-One", s)
        s = re.split(
            r"\s+(?:Product Codes|Kódy a|Varenumre|Produktcodes|Codes produits|Codes et|"
            r"Códigos|Codici|Kody |Coduri|Šifre|Oznake|Шифри|Κωδικοί|Termékkódok|"
            r"Tuotekoodit|Tootekoodid|Produktu kodi|Produktų kodai|Produktkoder|"
            r"Artikelnummers|Artikelnummern|Продуктови|Gaminių)\b",
            s,
            maxsplit=1,
            flags=re.I,
        )[0].strip()
        return s

    benefits = [scrub(b) for b in benefits]
    paras = [scrub(p) for p in paras]
    return {
        "name": "ëkco loop",
        "category": category,
        "short": paras[0] if paras else category,
        "long": "\n\n".join(paras),
        "benefits": benefits,
    }


def pdf_to_text(pdf: Path) -> str:
    return subprocess.check_output(["pdftotext", "-layout", str(pdf), "-"], text=True)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", type=Path, required=True, help="Folder with ekcos_product_texts_*.pdf")
    args = ap.parse_args()

    for loc, filename in LOCALE_FILES.items():
        pdf = args.dir / filename
        if not pdf.exists():
            print(f"SKIP {loc}: missing {filename}")
            continue
        parsed = parse_loop(pdf_to_text(pdf))
        path = DICT_DIR / f"{loc}.json"
        doc = json.loads(path.read_text())
        existing = doc.setdefault("products", {}).get("ekcoLoop", {})
        uses = USE_CASES.get(loc, USE_CASES["en"])
        doc["products"]["ekcoLoop"] = {
            "name": "ëkco loop",
            "imageAlt": existing.get("imageAlt") or IMAGE_ALT_EN,
            "category": parsed["category"],
            "short": parsed["short"],
            "long": parsed["long"],
            "benefits": {str(i): b for i, b in enumerate(parsed["benefits"])},  # type: ignore[arg-type]
            "useCases": {"0": uses[0], "1": uses[1]},
            "bases": {
                "standard": (existing.get("bases") or {}).get("standard")
                or BASE_LABEL.get(loc, "base")
            },
        }
        path.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n")
        print(f"OK {loc}: {len(parsed['benefits'])} benefits")  # type: ignore[arg-type]


if __name__ == "__main__":
    main()
