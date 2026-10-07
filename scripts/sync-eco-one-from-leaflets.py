#!/usr/bin/env python3
"""Sync dictionaries/*/ecoOne from public/technical/eco-one leaflets (flow text)."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FLOW_DIR = ROOT / "scripts/tmp/eco-one-flow"
DICT_DIR = ROOT / "dictionaries"

FOOTER_RE = re.compile(r"ëkcos innovations", re.I)
PAGE_NUM_RE = re.compile(r"^\d/\d$")
HEADER_RE = re.compile(
    r"^(PRODUCT|INFORM|PRODUKT|TUOTE|ΠΛΗΡΟΦΟΡ|TERMÉK|ИНФОРМАЦ|TOOTE|GAMINIO|INFORMA)",
    re.I,
)

METRICS: dict[str, dict[str, dict[str, str]]] = {
    "en": {
        "additive": {"value": "~1%", "label": "Eco-One™ in the material"},
        "measured": {"value": "93%", "label": "measured within 3.5 years"},
        "projected": {"value": "up to 99%", "label": "projected within 5 years"},
        "cardboard": {"value": "100%", "label": "recycled cardboard boxes"},
    },
    "cs": {
        "additive": {"value": "~1 %", "label": "Eco-One™ v materiálu"},
        "measured": {"value": "93 %", "label": "naměřeno za 3,5 roku"},
        "projected": {"value": "až 99 %", "label": "předpokládáno do 5 let"},
        "cardboard": {"value": "100 %", "label": "krabice z recyklované lepenky"},
    },
    "sk": {
        "additive": {"value": "~1 %", "label": "Eco-One™ v materiáli"},
        "measured": {"value": "93 %", "label": "namerané za 3,5 roka"},
        "projected": {"value": "až 99 %", "label": "predpokladané do 5 rokov"},
        "cardboard": {"value": "100 %", "label": "krabice z recyklovanej lepenky"},
    },
    "de": {
        "additive": {"value": "~1 %", "label": "Eco-One™ im Material"},
        "measured": {"value": "93 %", "label": "binnen 3,5 Jahren gemessen"},
        "projected": {"value": "bis zu 99 %", "label": "binnen 5 Jahren prognostiziert"},
        "cardboard": {"value": "100 %", "label": "Schachteln aus Recyclingkarton"},
    },
    "pl": {
        "additive": {"value": "~1%", "label": "Eco-One™ w materiale"},
        "measured": {"value": "93%", "label": "zmierzone w ciągu 3,5 roku"},
        "projected": {"value": "do 99%", "label": "prognozowane w ciągu 5 lat"},
        "cardboard": {"value": "100%", "label": "pudełka z tektury z recyklingu"},
    },
    "fr": {
        "additive": {"value": "~1 %", "label": "Eco-One™ dans le matériau"},
        "measured": {"value": "93 %", "label": "mesurés en 3 ans et demi"},
        "projected": {"value": "jusqu'à 99 %", "label": "prévus en 5 ans"},
        "cardboard": {"value": "100 %", "label": "boîtes en carton recyclé"},
    },
    "es": {
        "additive": {"value": "~1 %", "label": "Eco-One™ en el material"},
        "measured": {"value": "93 %", "label": "medido en 3,5 años"},
        "projected": {"value": "hasta un 99 %", "label": "previsto en 5 años"},
        "cardboard": {"value": "100 %", "label": "cajas de cartón reciclado"},
    },
    "it": {
        "additive": {"value": "~1%", "label": "Eco-One™ nel materiale"},
        "measured": {"value": "93%", "label": "misurato in 3,5 anni"},
        "projected": {"value": "fino al 99%", "label": "previsto entro 5 anni"},
        "cardboard": {"value": "100%", "label": "scatole in cartone riciclato"},
    },
    "nl": {
        "additive": {"value": "~1%", "label": "Eco-One™ in het materiaal"},
        "measured": {"value": "93%", "label": "gemeten binnen 3,5 jaar"},
        "projected": {"value": "tot 99%", "label": "verwacht binnen 5 jaar"},
        "cardboard": {"value": "100%", "label": "dozen van gerecycled karton"},
    },
    "pt": {
        "additive": {"value": "~1%", "label": "Eco-One™ no material"},
        "measured": {"value": "93%", "label": "medido em 3,5 anos"},
        "projected": {"value": "até 99%", "label": "previsto em 5 anos"},
        "cardboard": {"value": "100%", "label": "caixas de cartão reciclado"},
    },
    "sv": {
        "additive": {"value": "~1 %", "label": "Eco-One™ i materialet"},
        "measured": {"value": "93 %", "label": "uppmätt inom 3,5 år"},
        "projected": {"value": "upp till 99 %", "label": "beräknat inom 5 år"},
        "cardboard": {"value": "100 %", "label": "lådor av återvunnen kartong"},
    },
    "da": {
        "additive": {"value": "~1 %", "label": "Eco-One™ i materialet"},
        "measured": {"value": "93 %", "label": "målt inden for 3,5 år"},
        "projected": {"value": "op til 99 %", "label": "forventet inden for 5 år"},
        "cardboard": {"value": "100 %", "label": "æsker af genanvendt pap"},
    },
    "fi": {
        "additive": {"value": "~1 %", "label": "Eco-One™-osuus materiaalissa"},
        "measured": {"value": "93 %", "label": "mitattu 3,5 vuodessa"},
        "projected": {"value": "jopa 99 %", "label": "ennustettu 5 vuodessa"},
        "cardboard": {"value": "100 %", "label": "laatikot kierrätyskartongista"},
    },
    "el": {
        "additive": {"value": "~1%", "label": "Eco-One™ στο υλικό"},
        "measured": {"value": "93%", "label": "μετρήθηκε σε 3,5 χρόνια"},
        "projected": {"value": "έως 99%", "label": "προβλέπεται σε 5 χρόνια"},
        "cardboard": {"value": "100%", "label": "κουτιά από ανακυκλωμένο χαρτόνι"},
    },
    "hu": {
        "additive": {"value": "~1%", "label": "Eco-One™ az anyagban"},
        "measured": {"value": "93%", "label": "mért érték 3,5 év alatt"},
        "projected": {"value": "akár 99%", "label": "előrejelzett érték 5 év alatt"},
        "cardboard": {"value": "100%", "label": "újrahasznosított kartondobozok"},
    },
    "ro": {
        "additive": {"value": "~1%", "label": "Eco-One™ în material"},
        "measured": {"value": "93%", "label": "măsurat în 3,5 ani"},
        "projected": {"value": "până la 99%", "label": "estimat în 5 ani"},
        "cardboard": {"value": "100%", "label": "cutii din carton reciclat"},
    },
    "bg": {
        "additive": {"value": "~1 %", "label": "Eco-One™ в материала"},
        "measured": {"value": "93 %", "label": "измерено за 3,5 години"},
        "projected": {"value": "до 99 %", "label": "прогнозно за 5 години"},
        "cardboard": {"value": "100 %", "label": "кутии от рециклиран картон"},
    },
    "hr": {
        "additive": {"value": "~1 %", "label": "aditiva Eco-One™ u materijalu"},
        "measured": {"value": "93 %", "label": "izmjereno u roku od 3,5 godine"},
        "projected": {"value": "do 99 %", "label": "predviđeno u roku od 5 godina"},
        "cardboard": {"value": "100 %", "label": "kutije od recikliranog kartona"},
    },
    "sl": {
        "additive": {"value": "~1 %", "label": "aditiva Eco-One™ v materialu"},
        "measured": {"value": "93 %", "label": "izmerjeno v roku 3,5 leta"},
        "projected": {"value": "do 99 %", "label": "predvideno v roku 5 let"},
        "cardboard": {"value": "100 %", "label": "škatle iz recikliranega kartona"},
    },
    "et": {
        "additive": {"value": "~1 %", "label": "lisandit Eco-One™ materjalis"},
        "measured": {"value": "93 %", "label": "mõõdetud 3,5 aasta jooksul"},
        "projected": {"value": "kuni 99 %", "label": "prognoositav 5 aasta jooksul"},
        "cardboard": {"value": "100 %", "label": "ringlussevõetud kartongist karbid"},
    },
    "lv": {
        "additive": {"value": "~1 %", "label": "Eco-One™ materiālā"},
        "measured": {"value": "93 %", "label": "izmērīts 3,5 gadu laikā"},
        "projected": {"value": "līdz 99 %", "label": "prognozēts 5 gadu laikā"},
        "cardboard": {"value": "100 %", "label": "kastes no pārstrādāta kartona"},
    },
    "lt": {
        "additive": {"value": "~1 %", "label": "Eco-One™ medžiagoje"},
        "measured": {"value": "93 %", "label": "išmatuota per 3,5 metų"},
        "projected": {"value": "iki 99 %", "label": "prognozuojama per 5 metus"},
        "cardboard": {"value": "100 %", "label": "dėžės iš perdirbto kartono"},
    },
}

BODY2_START = re.compile(
    r"(?=("
    r"In a biologically active landfill|"
    r"Na biologicky aktivní skládce|"
    r"Na biologicky aktívnej skládke|"
    r"Auf einer biologisch aktiven Deponie|"
    r"Na biologicznie aktywnym składowisku|"
    r"Dans une décharge biologiquement active|"
    r"En un vertedero biológicamente activo|"
    r"In una discarica biologicamente attiva|"
    r"Op een biologisch actieve stortplaats|"
    r"Num aterro biologicamente ativo|"
    r"Em um aterro biologicamente ativo|"
    r"På en biologiskt aktiv deponi|"
    r"På et biologisk aktivt deponi|"
    r"Biologisesti aktiivisella kaatopaikalla|"
    r"Σε έναν βιολογικά ενεργό ΧΥΤΑ|"
    r"Σε βιολογικά ενεργό ΧΥΤΑ|"
    r"Biológiailag aktív hulladéklerakóban|"
    r"Egy biológiailag aktív hulladéklerakóban|"
    r"Într-un depozit de deșeuri activ biologic|"
    r"Într-un depozit de deșeuri biologic activ|"
    r"В биологично активно депо|"
    r"Na biološki aktivnom odlagalištu|"
    r"Na biološko aktivnem odlagališču|"
    r"Bioloogiliselt aktiivses prügilas|"
    r"Bioloogiliselt aktiivsel prügimäel|"
    r"Bioloģiski aktīvā atkritumu poligonā|"
    r"Bioloģiski aktīvā poligonā|"
    r"Biologiškai aktyviame sąvartyne"
    r"))"
)

SOLUTION_BODY_START = re.compile(
    r"\s(?=("
    r"During manufacturing|"
    r"Bei der Herstellung|"
    r"Při výrobě|"
    r"Pri výrobe|"
    r"Podczas produkcji|"
    r"Lors de la fabrication|"
    r"Durante la fabricación|"
    r"Durante la produzione|"
    r"Tijdens de productie|"
    r"Durante a produção|"
    r"Durante o fabrico|"
    r"Vid tillverkningen|"
    r"Under produktionen|"
    r"Lisäämme materiaaliin|"
    r"Κατά την παραγωγή|"
    r"A gyártás során|"
    r"În timpul producției|"
    r"În timpul fabricației|"
    r"При производството|"
    r"Tijekom proizvodnje|"
    r"Med proizvodnjo|"
    r"Tootmise käigus|"
    r"Ražošanas laikā|"
    r"Gamybos metu|"
    r"En la fabricación"
    r"))"
)

PROBLEM_BODY_START = re.compile(
    r"\s(?=("
    r"EVA\b|"
    r"L'EVA\b|"
    r"L’EVA\b|"
    r"Az EVA\b|"
    r"Το EVA\b|"
    r"El EVA\b|"
    r"O EVA\b|"
    r"Het EVA\b"
    r"))"
)

MORE_INFO_RE = re.compile(
    r"\s*(More information|Mere information|Více informací|Viac informácií|Weitere Informationen|"
    r"Plus d['’]informations|Más información|Maggiori informazioni|Meer informatie|"
    r"Mais informações|Mer information|Flere oplysninger|Lisätietoja|"
    r"Περισσότερες πληροφορίες|További információ|Mai multe informații|"
    r"Повече информация|Više informacija|Več informacij|Lisateave|"
    r"Vairāk informācijas|Daugiau informacijos|Więcej informacji|"
    r"Mais\s*$)\s*(:\s*ekcos\.eu\.?)?\s*$",
    re.I,
)


def ascii_hyphens(s: str) -> str:
    return (
        s.replace("\u2013", "-")
        .replace("\u2014", "-")
        .replace("\u2212", "-")
        .replace("\u00a0", " ")
    )


def norm_space(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def clean_lines(text: str) -> list[str]:
    out: list[str] = []
    for raw in text.splitlines():
        line = raw.rstrip()
        if not line.strip():
            out.append("")
            continue
        stripped = line.strip()
        if FOOTER_RE.search(stripped) or PAGE_NUM_RE.match(stripped):
            continue
        if HEADER_RE.match(stripped) and len(stripped) < 60:
            continue
        out.append(stripped)
    return out


def paragraphs(lines: list[str]) -> list[str]:
    blocks: list[str] = []
    buf: list[str] = []
    for line in lines:
        if not line:
            if buf:
                blocks.append(norm_space(" ".join(buf)))
                buf = []
            continue
        buf.append(line)
    if buf:
        blocks.append(norm_space(" ".join(buf)))
    return [ascii_hyphens(b) for b in blocks if b]


def split_title_tagline(block: str) -> tuple[str, str]:
    # Leaflet H1 is the first short sentence; remaining sentences are the tagline.
    m = re.match(r"^(.+?[.!?])\s+(.+)$", block)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    return block, ""


def split_first_sentence(block: str) -> tuple[str, str]:
    m = re.match(r"^(.+?[.!?])\s+(.+)$", block)
    if m:
        return m.group(1).strip().rstrip("."), m.group(2).strip()
    return block.rstrip("."), ""


def split_problem(block: str) -> tuple[str, str]:
    m = PROBLEM_BODY_START.search(block)
    if m:
        return block[: m.start()].strip(), block[m.start() :].strip()
    return split_first_sentence(block)


def split_solution(block: str) -> tuple[str, str, str]:
    m = SOLUTION_BODY_START.search(block)
    if not m:
        title, rest = split_first_sentence(block)
        return title, rest, ""
    title = block[: m.start()].strip()
    rest = block[m.start() :].strip()
    m2 = BODY2_START.search(rest)
    if m2:
        return title, rest[: m2.start()].strip(), rest[m2.start() :].strip()
    # Keep undivided body in body1 when landfill sentence is not detected.
    return title, rest, ""


def split_testing(block: str) -> tuple[str, str]:
    m = re.search(
        r"^(.+?(?:vs\.|oproti|gegenüber|contre|kontra|proti|против|mot|tegen|"
        r"contra|contro|έναντι|ellenében|față de|naspram|vastu|pret|prieš|срещу|"
        r"frente a|versus)\s*0\s*%?)",
        block,
        re.I,
    )
    if m and len(m.group(1)) < 100:
        title = m.group(1).strip()
        return title, block[len(title) :].strip()
    return split_first_sentence(block)


def split_closing(block: str) -> tuple[str, str]:
    block = MORE_INFO_RE.sub("", block).strip()
    # Title: ëkcos ... Eco-One™[suffix] [optional lowercase connector], then body.
    m = re.match(
        r"^(ëkcos\b.*?Eco-One™\S*(?:\s+[a-zà-öø-ÿā-žа-џα-ωșță]+)?)(?:\s+|:\s*)(.+)$",
        block,
    )
    if m and len(m.group(1)) < 55:
        return m.group(1).strip(), m.group(2).strip()
    title, body = split_first_sentence(block)
    return title, body


def inject_problem_bold(body: str) -> str:
    return re.sub(
        r"(300\s*(?:to|až|bis|à|a|till|til|до|do|kuni|līdz|iki|έως|hasta|até|"
        r"fino a|tot|hasta|od|von)?\s*1[\s.]?000)",
        r"<bold>\1</bold>",
        body,
        count=1,
        flags=re.I,
    )


def inject_solution_bold(body: str) -> str:
    return re.sub(
        r"((?:approximately|about|environ|etwa|přibližně|približne|około|circa|"
        r"alrededor de|circa|ongeveer|cerca de|cirka|noin|περίπου|körülbelül|"
        r"aproximativ|около|oko|približno|umbes|aptuveni|apie)\s+)?"
        r"(~?\s*1\s*%(?:\s+(?:of\s+|d['’])?(?:additif\s+|aditivo\s+|aditiv(?:a|u|e)?\s+|prísady\s+|přísady\s+|dodatku\s+|lisäainetta\s+| πρόσθετο\s+)?)?Eco-One™)",
        r"<bold>\1\2</bold>",
        body,
        count=1,
        flags=re.I,
    )


def inject_testing_bold(body: str) -> str:
    body = re.sub(
        r"(ASTM D5511(?:-02)?(?:\s*(?:and|a|und|et|e|y|och|og|ja|και|és|și|и|i|in|ir|/|,)\s*)ISO 15985(?::2014)?)",
        r"<bold>\1</bold>",
        body,
        count=1,
        flags=re.I,
    )
    body = re.sub(
        r"(93(?:[.,]31)?\s*%[^.]{0,90}(?:3[,.]5|3 ans et demi)[^.]{0,50})",
        r"<bold>\1</bold>",
        body,
        count=1,
    )
    return body


def chrome(loc: str) -> dict[str, str]:
    path = DICT_DIR / f"{loc}.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    old = data.get("ecoOne", {})
    chart = old.get("problem", {}).get("chart", {})
    bar = old.get("testing", {}).get("barChart", {})
    tl = old.get("testing", {}).get("timelineChart", {})
    en_fallback = {
        "withoutLabel": "Products without Eco-One™",
        "withoutValue": "300-1,000 years",
        "withValue": "3.5-5 years",
        "withoutDetail": "Without a biodegradation additive, conventional plastic can remain in landfill for centuries.",
        "withDetail": "With the Eco-One™ additive, independent testing shows ~93% biodegradation in about 3.5 years, and up to 99% within five years.",
        "axisLabel": "Years to break down (landfill)",
        "scaleLabel": "Chart scale",
        "scaleFull": "0-1,000 yrs",
        "scaleZoom": "0-10 yrs",
        "clippedNote": "continues ->",
        "yAxis": "Biodegradation (%)",
        "xAxis": "Years",
        "zeroNote": "0% the whole time",
        "measured": "measured",
        "projected": "projected",
        "yearsUnit": "yrs",
        "withBarDetail": "93.31% biodegradation measured in an independent ASTM D5511 / ISO 15985 lab test after about 3.5 years.",
        "withoutBarDetail": "The same product without Eco-One™ showed no measurable biodegradation over the same test period.",
        "shopCta": "Shop",
    }
    return {
        "withoutLabel": chart.get("withoutLabel", en_fallback["withoutLabel"]),
        "withoutValue": ascii_hyphens(chart.get("withoutValue", en_fallback["withoutValue"])),
        "withValue": ascii_hyphens(chart.get("withValue", en_fallback["withValue"])),
        "withoutDetail": chart.get("withoutDetail", en_fallback["withoutDetail"]),
        "withDetail": chart.get("withDetail", en_fallback["withDetail"]),
        "axisLabel": chart.get("axisLabel", en_fallback["axisLabel"]),
        "scaleLabel": chart.get("scaleLabel", en_fallback["scaleLabel"]),
        "scaleFull": ascii_hyphens(chart.get("scaleFull", en_fallback["scaleFull"])),
        "scaleZoom": ascii_hyphens(chart.get("scaleZoom", en_fallback["scaleZoom"])),
        "clippedNote": chart.get("clippedNote", en_fallback["clippedNote"]).replace("→", "->"),
        "yAxis": bar.get("yAxis", en_fallback["yAxis"]),
        "xAxis": tl.get("xAxis", en_fallback["xAxis"]),
        "zeroNote": tl.get("zeroNote", en_fallback["zeroNote"]),
        "measured": tl.get("measured", en_fallback["measured"]),
        "projected": tl.get("projected", en_fallback["projected"]),
        "yearsUnit": tl.get("yearsUnit", en_fallback["yearsUnit"]),
        "withBarDetail": bar.get("withDetail", en_fallback["withBarDetail"]),
        "withoutBarDetail": bar.get("withoutDetail", en_fallback["withoutBarDetail"]),
        "shopCta": old.get("closing", {}).get("shopCta", en_fallback["shopCta"]),
    }


def parse_locale(loc: str) -> dict:
    raw = (FLOW_DIR / f"{loc}.txt").read_text(encoding="utf-8")
    pages = raw.split("\x0c")
    if len(pages) < 3:
        raise ValueError(f"{loc}: expected 3 pages, got {len(pages)}")

    p1 = paragraphs(clean_lines(pages[0]))
    p2 = paragraphs(clean_lines(pages[1]))
    p3 = paragraphs(clean_lines(pages[2]))

    if len(p1) < 4 or len(p2) < 4 or len(p3) < 5:
        raise ValueError(f"{loc}: unexpected block counts p1={len(p1)} p2={len(p2)} p3={len(p3)}")

    title, tagline = split_title_tagline(p1[0])
    hero_body = p1[1]
    after_heading = p1[2]
    after_title = p1[3]

    problem_title, problem_body = split_problem(p2[0])
    chart_caption = p2[1].rstrip(".") + "."
    solution_title, solution_body1, solution_body2 = split_solution(p2[2])
    callout_title, callout_body = split_first_sentence(p2[3])

    testing_title, testing_body = split_testing(p3[0])
    bar_subtitle = p3[1]
    timeline_note = p3[2].rstrip(".") + "."
    closing_title, closing_body = split_closing(p3[3])
    footnote = p3[4]

    ch = chrome(loc)
    with_label = closing_title
    without_label = ch["withoutLabel"]

    return {
        "hero": {"title": title, "tagline": tagline, "body": hero_body},
        "afterUse": {"heading": after_heading, "title": after_title},
        "metrics": METRICS[loc],
        "problem": {
            "title": problem_title,
            "body": inject_problem_bold(problem_body),
            "chartAlt": chart_caption.rstrip("."),
            "chartCaption": chart_caption,
            "chart": {
                "ariaLabel": chart_caption.rstrip("."),
                "withoutLabel": without_label,
                "withLabel": with_label,
                "withoutValue": ch["withoutValue"],
                "withValue": ch["withValue"],
                "withoutDetail": ch["withoutDetail"],
                "withDetail": ch["withDetail"],
                "axisLabel": ch["axisLabel"],
                "caption": chart_caption,
                "scaleLabel": ch["scaleLabel"],
                "scaleFull": ch["scaleFull"],
                "scaleZoom": ch["scaleZoom"],
                "clippedNote": ch["clippedNote"],
            },
        },
        "solution": {
            "title": solution_title,
            "body1": inject_solution_bold(solution_body1),
            "body2": solution_body2,
            "calloutTitle": callout_title,
            "calloutBody": callout_body,
        },
        "testing": {
            "title": testing_title,
            "body": inject_testing_bold(testing_body),
            "barChart": {
                "ariaLabel": testing_title,
                "yAxis": ch["yAxis"],
                "withLabel": with_label,
                "withoutLabel": without_label,
                "withDetail": ch["withBarDetail"],
                "withoutDetail": ch["withoutBarDetail"],
                "subtitle": bar_subtitle,
            },
            "timelineChart": {
                "ariaLabel": testing_title,
                "yAxis": ch["yAxis"],
                "xAxis": ch["xAxis"],
                "withLabel": with_label,
                "withoutLabel": without_label,
                "zeroNote": ch["zeroNote"],
                "measured": ch["measured"],
                "projected": ch["projected"],
                "yearsUnit": ch["yearsUnit"],
                "projectedNote": timeline_note.rstrip("."),
                "caption": timeline_note,
            },
        },
        "closing": {
            "title": closing_title,
            "body": closing_body,
            "shopCta": ch["shopCta"],
        },
        "footnote": footnote,
    }


def main() -> None:
    for loc in sorted(METRICS):
        eco = parse_locale(loc)
        eco = json.loads(ascii_hyphens(json.dumps(eco, ensure_ascii=False)))
        path = DICT_DIR / f"{loc}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        data["ecoOne"] = eco
        if "Metadata" in data and "ecoOneDescription" in data["Metadata"]:
            data["Metadata"]["ecoOneDescription"] = eco["hero"]["body"]
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(
            f"ok {loc}: {eco['hero']['title']!r} | sol2={bool(eco['solution']['body2'])} | "
            f"close={eco['closing']['title']!r}"
        )


if __name__ == "__main__":
    main()
