#!/usr/bin/env python3
"""Add biodegradation chart to materials-3; fix shipping table (CS + checkout note)."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FAQ_ROOT = ROOT / "content" / "faq"

# Screenshot wording: EVA + "same material without", caption with ASTM/ISO.
CHART: dict[str, dict[str, str]] = {
    "en": {
        "with": "ëkcos EVA with Eco-One™",
        "without": "Same material without Eco-One™",
        "caption": "Same material, same laboratory test, 3.5 years (ASTM D5511, ISO 15985)",
        "pct": "93%",
        "zero": "0%",
    },
    "cs": {
        "with": "ëkcos EVA s Eco-One™",
        "without": "Stejný materiál bez Eco-One™",
        "caption": "Stejný materiál, stejný laboratorní test, 3,5 roku (ASTM D5511, ISO 15985)",
        "pct": "93 %",
        "zero": "0 %",
    },
    "sk": {
        "with": "ëkcos EVA s Eco-One™",
        "without": "Rovnaký materiál bez Eco-One™",
        "caption": "Rovnaký materiál, rovnaký laboratórny test, 3,5 roka (ASTM D5511, ISO 15985)",
        "pct": "93 %",
        "zero": "0 %",
    },
    "de": {
        "with": "ëkcos EVA mit Eco-One™",
        "without": "Dasselbe Material ohne Eco-One™",
        "caption": "Dasselbe Material, derselbe Labortest, 3,5 Jahre (ASTM D5511, ISO 15985)",
        "pct": "93 %",
        "zero": "0 %",
    },
    "pl": {
        "with": "ëkcos EVA z Eco-One™",
        "without": "Ten sam materiał bez Eco-One™",
        "caption": "Ten sam materiał, ten sam test laboratoryjny, 3,5 roku (ASTM D5511, ISO 15985)",
        "pct": "93%",
        "zero": "0%",
    },
    "fr": {
        "with": "EVA ëkcos avec Eco-One™",
        "without": "Même matériau sans Eco-One™",
        "caption": "Même matériau, même test en laboratoire, 3,5 ans (ASTM D5511, ISO 15985)",
        "pct": "93 %",
        "zero": "0 %",
    },
    "es": {
        "with": "EVA ëkcos con Eco-One™",
        "without": "El mismo material sin Eco-One™",
        "caption": "Mismo material, mismo ensayo de laboratorio, 3,5 años (ASTM D5511, ISO 15985)",
        "pct": "93 %",
        "zero": "0 %",
    },
    "it": {
        "with": "EVA ëkcos con Eco-One™",
        "without": "Stesso materiale senza Eco-One™",
        "caption": "Stesso materiale, stesso test di laboratorio, 3,5 anni (ASTM D5511, ISO 15985)",
        "pct": "93%",
        "zero": "0%",
    },
    "nl": {
        "with": "ëkcos EVA met Eco-One™",
        "without": "Hetzelfde materiaal zonder Eco-One™",
        "caption": "Hetzelfde materiaal, dezelfde laboratoriumtest, 3,5 jaar (ASTM D5511, ISO 15985)",
        "pct": "93%",
        "zero": "0%",
    },
    "pt": {
        "with": "EVA ëkcos com Eco-One™",
        "without": "O mesmo material sem Eco-One™",
        "caption": "Mesmo material, mesmo ensaio laboratorial, 3,5 anos (ASTM D5511, ISO 15985)",
        "pct": "93%",
        "zero": "0%",
    },
    "sv": {
        "with": "ëkcos EVA med Eco-One™",
        "without": "Samma material utan Eco-One™",
        "caption": "Samma material, samma laboratorietest, 3,5 år (ASTM D5511, ISO 15985)",
        "pct": "93 %",
        "zero": "0 %",
    },
    "da": {
        "with": "ëkcos EVA med Eco-One™",
        "without": "Samme materiale uden Eco-One™",
        "caption": "Samme materiale, samme laboratorietest, 3,5 år (ASTM D5511, ISO 15985)",
        "pct": "93 %",
        "zero": "0 %",
    },
    "fi": {
        "with": "ëkcos EVA Eco-One™-lisäaineella",
        "without": "Sama materiaali ilman Eco-One™",
        "caption": "Sama materiaali, sama laboratoriotesti, 3,5 vuotta (ASTM D5511, ISO 15985)",
        "pct": "93 %",
        "zero": "0 %",
    },
    "el": {
        "with": "EVA ëkcos με Eco-One™",
        "without": "Ίδιο υλικό χωρίς Eco-One™",
        "caption": "Ίδιο υλικό, ίδια εργαστηριακή δοκιμή, 3,5 χρόνια (ASTM D5511, ISO 15985)",
        "pct": "93%",
        "zero": "0%",
    },
    "hu": {
        "with": "ëkcos EVA Eco-One™ adalékkal",
        "without": "Ugyanaz az anyag Eco-One™ nélkül",
        "caption": "Ugyanaz az anyag, ugyanaz a laborvizsgálat, 3,5 év (ASTM D5511, ISO 15985)",
        "pct": "93%",
        "zero": "0%",
    },
    "ro": {
        "with": "EVA ëkcos cu Eco-One™",
        "without": "Același material fără Eco-One™",
        "caption": "Același material, același test de laborator, 3,5 ani (ASTM D5511, ISO 15985)",
        "pct": "93%",
        "zero": "0%",
    },
    "bg": {
        "with": "ëkcos EVA с Eco-One™",
        "without": "Същият материал без Eco-One™",
        "caption": "Същият материал, същият лабораторен тест, 3,5 години (ASTM D5511, ISO 15985)",
        "pct": "93 %",
        "zero": "0 %",
    },
    "hr": {
        "with": "ëkcos EVA s aditivom Eco-One™",
        "without": "Isti materijal bez Eco-One™",
        "caption": "Isti materijal, isto laboratorijsko ispitivanje, 3,5 godine (ASTM D5511, ISO 15985)",
        "pct": "93 %",
        "zero": "0 %",
    },
    "sl": {
        "with": "ëkcos EVA z aditivom Eco-One™",
        "without": "Isti material brez Eco-One™",
        "caption": "Isti material, isti laboratorijski preskus, 3,5 leta (ASTM D5511, ISO 15985)",
        "pct": "93 %",
        "zero": "0 %",
    },
    "et": {
        "with": "ëkcos EVA Eco-One™ lisandiga",
        "without": "Sama materjal ilma Eco-One™ta",
        "caption": "Sama materjal, sama laborikatse, 3,5 aastat (ASTM D5511, ISO 15985)",
        "pct": "93 %",
        "zero": "0 %",
    },
    "lv": {
        "with": "ëkcos EVA ar Eco-One™",
        "without": "Tas pats materiāls bez Eco-One™",
        "caption": "Tas pats materiāls, tas pats laboratorijas tests, 3,5 gadi (ASTM D5511, ISO 15985)",
        "pct": "93 %",
        "zero": "0 %",
    },
    "lt": {
        "with": "ëkcos EVA su Eco-One™",
        "without": "Ta pati medžiaga be Eco-One™",
        "caption": "Ta pati medžiaga, tas pats laboratorijos bandymas, 3,5 metų (ASTM D5511, ISO 15985)",
        "pct": "93 %",
        "zero": "0 %",
    },
}

CS_SHIPPING = {
    "intro": "Doprava je zdarma u objednávek nad 120 EUR, kromě Kypru a Malty. U objednávek pod 120 EUR stojí doprava:",
    "headers": ["Doprava", "Země"],
    "rows": [
        ["3,90 EUR", "Česká republika"],
        ["4,90 EUR", "Maďarsko, Německo, Polsko, Rakousko, Slovensko"],
        ["5,90 EUR", "Belgie, Itálie, Lucembursko, Nizozemsko, Rumunsko, Slovinsko"],
        ["7,90 EUR", "Francie"],
        ["8,90 EUR", "Dánsko, Chorvatsko, Řecko, Španělsko, Švédsko"],
        ["9,90 EUR", "Bulharsko, Estonsko, Finsko, Irsko, Litva, Lotyšsko"],
        ["10,90 EUR", "Portugalsko"],
        ["16,90 EUR", "Kypr, Malta (bez dopravy zdarma)"],
    ],
    "note": "V pokladně uvidíte přesnou částku ve vaší měně.",
}

# Patterns that leak into the last shipping-table cell (checkout note).
CHECKOUT_NOTE_RE = re.compile(
    r"\s*(?:"
    r"At checkout you see the exact amount in your currency\.?"
    r"|V pokladně uvidíte přesnou částku ve vaší měně\.?"
    r"|Pri pokladni uvidíte presnú sumu vo vašej mene\.?"
    r"|An der Kasse sehen Sie den genauen Betrag in Ihrer Währung\.?"
    r"|Przy kasie widzisz dokładną kwotę w swojej walucie\.?"
    r"|Lors du paiement, vous voyez le montant exact dans votre devise\.?"
    r"|En el pago verá[s]? el importe exacto en su moneda\.?"
    r"|Al momento del pagamento vedrai l'importo esatto nella tua valuta\.?"
    r"|Bij het afrekenen zie je het exacte bedrag in jouw valuta\.?"
    r"|No checkout vê o valor exato na sua moeda\.?"
    r"|I kassan ser du det exakta beloppet i din valuta\.?"
    r"|Ved kassen ser du det præcise beløb i din valuta\.?"
    r"|Kassalla näet tarkan summan omassa valuutassasi\.?"
    r"|Στο ταμείο βλέπετε το ακριβές ποσό στο νόμισμά σας\.?"
    r"|A pénztárnál a pontos összeget a saját pénznemében látja\.?"
    r"|La finalizare vedeți suma exactă în moneda dvs\.?"
    r"|На касата виждате точната сума във вашата валута\.?"
    r"|Na blagajni vidite točan iznos u svojoj valuti\.?"
    r"|Na blagajni vidite točen znesek v svoji valuti\.?"
    r"|Kassas näete täpset summat oma valuutas\.?"
    r"|Kasē redzat precīzo summu savā valūtā\.?"
    r"|Atsiskaitymo metu matote tikslią sumą savo valiuta\.?"
    r")\s*$",
    re.IGNORECASE,
)

CHECKOUT_NOTES: dict[str, str] = {
    "en": "At checkout you see the exact amount in your currency.",
    "cs": "V pokladně uvidíte přesnou částku ve vaší měně.",
    "sk": "Pri pokladni uvidíte presnú sumu vo vašej mene.",
    "de": "An der Kasse sehen Sie den genauen Betrag in Ihrer Währung.",
    "pl": "Przy kasie widzisz dokładną kwotę w swojej walucie.",
    "fr": "Lors du paiement, vous voyez le montant exact dans votre devise.",
    "es": "En el pago verá el importe exacto en su moneda.",
    "it": "Al momento del pagamento vedrai l'importo esatto nella tua valuta.",
    "nl": "Bij het afrekenen zie je het exacte bedrag in jouw valuta.",
    "pt": "No checkout vê o valor exato na sua moeda.",
    "sv": "I kassan ser du det exakta beloppet i din valuta.",
    "da": "Ved kassen ser du det præcise beløb i din valuta.",
    "fi": "Kassalla näet tarkan summan omassa valuutassasi.",
    "el": "Στο ταμείο βλέπετε το ακριβές ποσό στο νόμισμά σας.",
    "hu": "A pénztárnál a pontos összeget a saját pénznemében látja.",
    "ro": "La finalizare vedeți suma exactă în moneda dvs.",
    "bg": "На касата виждате точната сума във вашата валута.",
    "hr": "Na blagajni vidite točan iznos u svojoj valuti.",
    "sl": "Na blagajni vidite točen znesek v svoji valuti.",
    "et": "Kassas näete täpset summat oma valuutas.",
    "lv": "Kasē redzat precīzo summu savā valūtā.",
    "lt": "Atsiskaitymo metu matote tikslią sumą savo valiuta.",
}


def chart_block(locale: str) -> dict:
    c = CHART.get(locale) or CHART["en"]
    return {
        "type": "chart",
        "variant": "biodegradation",
        "rows": [
            {"label": c["with"], "value": 93, "display": c["pct"]},
            {"label": c["without"], "value": 0, "display": c["zero"]},
        ],
        "caption": c["caption"],
    }


def find_item(data: dict, item_id: str) -> dict | None:
    for cat in data.get("categories", []):
        for item in cat.get("items", []):
            if item.get("id") == item_id:
                return item
    return None


def patch_materials_chart(data: dict, locale: str) -> bool:
    item = find_item(data, "materials-3")
    if not item:
        return False
    answer = item.get("answer") or []
    if any(b.get("type") == "chart" for b in answer):
        # refresh chart copy
        item["answer"] = [
            b if b.get("type") != "chart" else chart_block(locale) for b in answer
        ]
        return True
    item["answer"] = [*answer, chart_block(locale)]
    return True


def patch_shipping(data: dict, locale: str) -> bool:
    item = find_item(data, "orders-9")
    if not item:
        return False

    if locale == "cs":
        item["answer"] = [
            {"type": "paragraph", "text": CS_SHIPPING["intro"]},
            {
                "type": "table",
                "headers": CS_SHIPPING["headers"],
                "rows": CS_SHIPPING["rows"],
            },
            {"type": "paragraph", "text": CS_SHIPPING["note"]},
        ]
        return True

    answer = item.get("answer") or []
    table = next((b for b in answer if b.get("type") == "table"), None)
    if not table or not table.get("rows"):
        return False

    last = table["rows"][-1]
    if len(last) < 2:
        return False

    cell = last[1]
    m = CHECKOUT_NOTE_RE.search(cell)
    note = CHECKOUT_NOTES.get(locale) or CHECKOUT_NOTES["en"]
    if m:
        last[1] = cell[: m.start()].rstrip()
    elif any(b.get("type") == "paragraph" and "checkout" in b.get("text", "").lower() for b in answer):
        return True  # already separated somehow
    else:
        # still ensure trailing note paragraph exists
        pass

    # Drop existing trailing note paragraphs that duplicate checkout text
    cleaned = []
    for b in answer:
        if b.get("type") == "paragraph":
            text = (b.get("text") or "").strip()
            if CHECKOUT_NOTE_RE.fullmatch(text) or text == note:
                continue
        cleaned.append(b)

    # Ensure note is last
    if not any(
        b.get("type") == "paragraph" and (b.get("text") or "").strip() == note
        for b in cleaned
    ):
        cleaned.append({"type": "paragraph", "text": note})

    item["answer"] = cleaned
    return True


def main() -> None:
    changed = 0
    for audience_dir in sorted(FAQ_ROOT.iterdir()):
        if not audience_dir.is_dir():
            continue
        for path in sorted(audience_dir.glob("*.json")):
            locale = path.stem
            data = json.loads(path.read_text(encoding="utf-8"))
            did = False
            if patch_materials_chart(data, locale):
                did = True
            if audience_dir.name == "eshop" and patch_shipping(data, locale):
                did = True
            if did:
                path.write_text(
                    json.dumps(data, ensure_ascii=False, indent=2) + "\n",
                    encoding="utf-8",
                )
                changed += 1
                print(f"patched {audience_dir.name}/{locale}.json")
    print(f"done: {changed} files")


if __name__ == "__main__":
    main()
