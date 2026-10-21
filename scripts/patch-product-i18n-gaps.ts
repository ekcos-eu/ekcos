/**
 * Fill remaining product i18n gaps:
 * - products.colors / products.fragrances
 * - freshDrop.bases.white (pt, sl, lv)
 * - products.page + products.configurator (locales still on EN)
 * - product imageAlt strings still identical to EN
 *
 *   bun scripts/patch-product-i18n-gaps.ts
 */
import { translate } from 'google-translate-api-x'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIR = join(import.meta.dir, '../dictionaries')

const GT_CODE: Record<string, string> = {
  cs: 'cs',
  sk: 'sk',
  de: 'de',
  pl: 'pl',
  fr: 'fr',
  es: 'es',
  it: 'it',
  nl: 'nl',
  pt: 'pt',
  sv: 'sv',
  da: 'da',
  fi: 'fi',
  el: 'el',
  hu: 'hu',
  ro: 'ro',
  bg: 'bg',
  hr: 'hr',
  sl: 'sl',
  et: 'et',
  lv: 'lv',
  lt: 'lt',
}

/** Lowercase color / fragrance words (used on PDP-style labels). */
const colorsFragrances: Record<
  string,
  {
    colors: { white: string; grey: string; black: string; blue: string }
    fragrances: { fresh: string; citrus: string }
  }
> = {
  cs: {
    colors: { white: 'bílá', grey: 'šedá', black: 'černá', blue: 'modrá' },
    fragrances: { fresh: 'fresh', citrus: 'citrusy' },
  },
  sk: {
    colors: { white: 'biela', grey: 'sivá', black: 'čierna', blue: 'modrá' },
    fragrances: { fresh: 'fresh', citrus: 'citrusy' },
  },
  de: {
    colors: { white: 'weiß', grey: 'grau', black: 'schwarz', blue: 'blau' },
    fragrances: { fresh: 'fresh', citrus: 'zitrone' },
  },
  pl: {
    colors: { white: 'biały', grey: 'szary', black: 'czarny', blue: 'niebieski' },
    fragrances: { fresh: 'fresh', citrus: 'cytrusy' },
  },
  fr: {
    colors: { white: 'blanc', grey: 'gris', black: 'noir', blue: 'bleu' },
    fragrances: { fresh: 'fresh', citrus: 'agrumes' },
  },
  es: {
    colors: { white: 'blanco', grey: 'gris', black: 'negro', blue: 'azul' },
    fragrances: { fresh: 'fresh', citrus: 'cítricos' },
  },
  it: {
    colors: { white: 'bianco', grey: 'grigio', black: 'nero', blue: 'blu' },
    fragrances: { fresh: 'fresh', citrus: 'agrumi' },
  },
  nl: {
    colors: { white: 'wit', grey: 'grijs', black: 'zwart', blue: 'blauw' },
    fragrances: { fresh: 'fresh', citrus: 'citrus' },
  },
  pt: {
    colors: { white: 'branco', grey: 'cinzento', black: 'preto', blue: 'azul' },
    fragrances: { fresh: 'fresh', citrus: 'citrinos' },
  },
  sv: {
    colors: { white: 'vit', grey: 'grå', black: 'svart', blue: 'blå' },
    fragrances: { fresh: 'fresh', citrus: 'citrus' },
  },
  da: {
    colors: { white: 'hvid', grey: 'grå', black: 'sort', blue: 'blå' },
    fragrances: { fresh: 'fresh', citrus: 'citrus' },
  },
  fi: {
    colors: { white: 'valkoinen', grey: 'harmaa', black: 'musta', blue: 'sininen' },
    fragrances: { fresh: 'fresh', citrus: 'sitrus' },
  },
  el: {
    colors: { white: 'λευκό', grey: 'γκρι', black: 'μαύρο', blue: 'μπλε' },
    fragrances: { fresh: 'fresh', citrus: 'εσπεριδοειδή' },
  },
  hu: {
    colors: { white: 'fehér', grey: 'szürke', black: 'fekete', blue: 'kék' },
    fragrances: { fresh: 'fresh', citrus: 'citrus' },
  },
  ro: {
    colors: { white: 'alb', grey: 'gri', black: 'negru', blue: 'albastru' },
    fragrances: { fresh: 'fresh', citrus: 'citrice' },
  },
  bg: {
    colors: { white: 'бял', grey: 'сив', black: 'черен', blue: 'син' },
    fragrances: { fresh: 'fresh', citrus: 'цитрус' },
  },
  hr: {
    colors: { white: 'bijela', grey: 'siva', black: 'crna', blue: 'plava' },
    fragrances: { fresh: 'fresh', citrus: 'citrus' },
  },
  sl: {
    colors: { white: 'bela', grey: 'siva', black: 'črna', blue: 'modra' },
    fragrances: { fresh: 'fresh', citrus: 'citrus' },
  },
  et: {
    colors: { white: 'valge', grey: 'hall', black: 'must', blue: 'sinine' },
    fragrances: { fresh: 'fresh', citrus: 'tsitrus' },
  },
  lv: {
    colors: { white: 'balts', grey: 'pelēks', black: 'melns', blue: 'zils' },
    fragrances: { fresh: 'fresh', citrus: 'citrusaugļi' },
  },
  lt: {
    colors: { white: 'baltas', grey: 'pilkas', black: 'juodas', blue: 'mėlynas' },
    fragrances: { fresh: 'fresh', citrus: 'citrusiniai' },
  },
}

/** Title-case for dictionary keys that still use EN Title Case in source. */
function titleCaseColorPack(locale: string) {
  const pack = colorsFragrances[locale]
  if (!pack) return null
  const tc = (s: string) =>
    s === 'fresh' || s === 'citrus'
      ? s === 'fresh'
        ? 'Fresh'
        : pack.fragrances.citrus.charAt(0).toUpperCase() +
          pack.fragrances.citrus.slice(1)
      : s.charAt(0).toUpperCase() + s.slice(1)
  return {
    colors: {
      white: tc(pack.colors.white),
      grey: tc(pack.colors.grey),
      black: tc(pack.colors.black),
      blue: tc(pack.colors.blue),
    },
    fragrances: {
      // Keep scent name "Fresh" as in variantLabels; localize citrus
      fresh: 'Fresh',
      citrus: tc('citrus'),
    },
  }
}

const pagePacks: Record<
  string,
  {
    title: string
    intro: string
    heroEyebrow: string
    heroTitle: string
    heroSubtitle: string
    heroLinkEco: string
    heroLinkBranding: string
  }
> = {
  sk: {
    title: 'Produkty',
    intro: 'Zmeňte model a povrch - potom nakúpte v oficiálnom obchode.',
    heroEyebrow: 'Prezrite si ponuku',
    heroTitle: 'Každý rad na jednom mieste',
    heroSubtitle: 'Povrchy a vône - otvorte obchod, keď budete chcieť kúpiť.',
    heroLinkEco: 'Viac o Eco-One™',
    heroLinkBranding: 'Vlastný branding',
  },
  pl: {
    title: 'Produkty',
    intro: 'Zmień model i wykończenie - potem kup w oficjalnym sklepie.',
    heroEyebrow: 'Poznaj ofertę',
    heroTitle: 'Każda linia w jednym miejscu',
    heroSubtitle: 'Wykończenia i zapachy - otwórz sklep, gdy będziesz gotowy kupić.',
    heroLinkEco: 'Więcej o Eco-One™',
    heroLinkBranding: 'Własny branding',
  },
  nl: {
    title: 'Producten',
    intro: 'Wissel model en afwerking - koop daarna in de officiële webshop.',
    heroEyebrow: 'Ontdek het assortiment',
    heroTitle: 'Elke lijn op één plek',
    heroSubtitle: 'Afwerkingen en geuren - open de shop wanneer u wilt kopen.',
    heroLinkEco: 'Meer over Eco-One™',
    heroLinkBranding: 'Custom branding',
  },
  pt: {
    title: 'Produtos',
    intro: 'Mude o modelo e o acabamento - depois compre na loja oficial.',
    heroEyebrow: 'Explore a gama',
    heroTitle: 'Cada linha num só lugar',
    heroSubtitle: 'Acabamentos e fragrâncias - abra a loja quando quiser comprar.',
    heroLinkEco: 'Mais sobre Eco-One™',
    heroLinkBranding: 'Branding personalizado',
  },
  sv: {
    title: 'Produkter',
    intro: 'Byt modell och yta - handla sedan i den officiella butiken.',
    heroEyebrow: 'Utforska sortimentet',
    heroTitle: 'Varje linje på ett ställe',
    heroSubtitle: 'Ytor och dofter - öppna butiken när du vill köpa.',
    heroLinkEco: 'Mer om Eco-One™',
    heroLinkBranding: 'Custom branding',
  },
  da: {
    title: 'Produkter',
    intro: 'Skift model og finish - køb derefter i den officielle butik.',
    heroEyebrow: 'Udforsk sortimentet',
    heroTitle: 'Hver linje ét sted',
    heroSubtitle: 'Finishes og dufte - åbn butikken, når du er klar til at købe.',
    heroLinkEco: 'Mere om Eco-One™',
    heroLinkBranding: 'Custom branding',
  },
  fi: {
    title: 'Tuotteet',
    intro: 'Vaihda malli ja pinta - osta sitten virallisesta kaupasta.',
    heroEyebrow: 'Tutustu valikoimaan',
    heroTitle: 'Jokainen linja yhdessä paikassa',
    heroSubtitle: 'Pinnat ja tuoksut - avaa kauppa, kun olet valmis ostamaan.',
    heroLinkEco: 'Lisää Eco-One™:sta',
    heroLinkBranding: 'Custom branding',
  },
  el: {
    title: 'Προϊόντα',
    intro: 'Αλλάξτε μοντέλο και φινίρισμα - μετά αγοράστε στο επίσημο κατάστημα.',
    heroEyebrow: 'Εξερευνήστε τη γκάμα',
    heroTitle: 'Κάθε σειρά σε ένα μέρος',
    heroSubtitle: 'Φινιρίσματα και αρώματα - ανοίξτε το κατάστημα όταν θέλετε να αγοράσετε.',
    heroLinkEco: 'Περισσότερα για το Eco-One™',
    heroLinkBranding: 'Προσαρμοσμένο branding',
  },
  hu: {
    title: 'Termékek',
    intro: 'Váltson modellt és felületet - majd vásároljon a hivatalos boltban.',
    heroEyebrow: 'Fedezze fel a kínálatot',
    heroTitle: 'Minden termékcsalád egy helyen',
    heroSubtitle: 'Felületek és illatok - nyissa meg a boltot, ha vásárolni szeretne.',
    heroLinkEco: 'Többet az Eco-One™-ról',
    heroLinkBranding: 'Egyedi branding',
  },
  ro: {
    title: 'Produse',
    intro: 'Schimbați modelul și finisajul - apoi cumpărați din magazinul oficial.',
    heroEyebrow: 'Explorați gama',
    heroTitle: 'Fiecare linie într-un singur loc',
    heroSubtitle: 'Finisaje și arome - deschideți magazinul când sunteți gata să cumpărați.',
    heroLinkEco: 'Mai multe despre Eco-One™',
    heroLinkBranding: 'Branding personalizat',
  },
  bg: {
    title: 'Продукти',
    intro: 'Сменете модел и покритие - след това купете в официалния магазин.',
    heroEyebrow: 'Разгледайте гамата',
    heroTitle: 'Всяка линия на едно място',
    heroSubtitle: 'Покрития и аромати - отворете магазина, когато сте готови да купите.',
    heroLinkEco: 'Повече за Eco-One™',
    heroLinkBranding: 'Персонализиран брендинг',
  },
  hr: {
    title: 'Proizvodi',
    intro: 'Promijenite model i završnu obradu - zatim kupite u službenoj trgovini.',
    heroEyebrow: 'Istražite ponudu',
    heroTitle: 'Svaka linija na jednom mjestu',
    heroSubtitle: 'Završne obrade i mirisi - otvorite trgovinu kada ste spremni kupiti.',
    heroLinkEco: 'Više o Eco-One™',
    heroLinkBranding: 'Prilagođeni branding',
  },
  sl: {
    title: 'Izdelki',
    intro: 'Zamenjajte model in površino - nato kupite v uradni trgovini.',
    heroEyebrow: 'Raziščite ponudbo',
    heroTitle: 'Vsaka linija na enem mestu',
    heroSubtitle: 'Površine in dišave - odprite trgovino, ko ste pripravljeni kupiti.',
    heroLinkEco: 'Več o Eco-One™',
    heroLinkBranding: 'Prilagojen branding',
  },
  et: {
    title: 'Tooted',
    intro: 'Vahetage mudelit ja viimistlust - seejärel ostke ametlikust poest.',
    heroEyebrow: 'Tutvuge valikuga',
    heroTitle: 'Iga liin ühes kohas',
    heroSubtitle: 'Viimistlused ja lõhnad - avage pood, kui olete valmis ostma.',
    heroLinkEco: 'Rohkem Eco-One™ kohta',
    heroLinkBranding: 'Kohandatud branding',
  },
  lv: {
    title: 'Produkti',
    intro: 'Mainiet modeli un apdari - pēc tam pērciet oficiālajā veikalā.',
    heroEyebrow: 'Izpētiet sortimentu',
    heroTitle: 'Katra līnija vienuviet',
    heroSubtitle: 'Apdares un smaržas - atveriet veikalu, kad esat gatavi pirkt.',
    heroLinkEco: 'Vairāk par Eco-One™',
    heroLinkBranding: 'Pielāgots branding',
  },
  lt: {
    title: 'Produktai',
    intro: 'Keiskite modelį ir apdailą - tada pirkite oficialioje parduotuvėje.',
    heroEyebrow: 'Tyrinėkite asortimentą',
    heroTitle: 'Kiekviena linija vienoje vietoje',
    heroSubtitle: 'Apdailos ir kvapai - atidarykite parduotuvę, kai būsite pasiruošę pirkti.',
    heroLinkEco: 'Daugiau apie Eco-One™',
    heroLinkBranding: 'Individualus branding',
  },
}

const configuratorPacks: Record<
  string,
  {
    color: string
    selectProduct: string
    fragrance: string
    benefits: string
    productBenefits: string
    availableColorsFragrances: string
    sixtyDayBadge: string
    byBrand: string
    siteUrl: string
    useCases: string
    brandingNote: string
  }
> = {
  sk: {
    color: 'Povrchová úprava',
    selectProduct: 'Vybrať produkt',
    fragrance: 'Varianty vône',
    benefits: 'Prínosy',
    productBenefits: 'Prínosy produktu',
    availableColorsFragrances: 'Dostupné farby a vône',
    sixtyDayBadge: '60-dňové PLUS protistrikacie sitko na pisoár',
    byBrand: 'značka ëkcos',
    siteUrl: 'www.ekcos.eu',
    useCases: 'Typické aplikácie',
    brandingNote: 'Vlastný branding pri kvalifikovaných objednávkach.',
  },
  pl: {
    color: 'Wykończenie',
    selectProduct: 'Wybierz produkt',
    fragrance: 'Warianty zapachu',
    benefits: 'Korzyści',
    productBenefits: 'Korzyści produktu',
    availableColorsFragrances: 'Dostępne kolory i zapachy',
    sixtyDayBadge: '60-dniowa PLUS mata pisuarowa anti-splash',
    byBrand: 'marka ëkcos',
    siteUrl: 'www.ekcos.eu',
    useCases: 'Typowe zastosowania',
    brandingNote: 'Własny branding przy kwalifikowanych zamówieniach.',
  },
  nl: {
    color: 'Afwerking',
    selectProduct: 'Product selecteren',
    fragrance: 'Geuropties',
    benefits: 'Voordelen',
    productBenefits: 'Productvoordelen',
    availableColorsFragrances: 'Beschikbare kleuren & geuren',
    sixtyDayBadge: '60 dagen PLUS anti-splash urinoirzeef',
    byBrand: 'van ëkcos',
    siteUrl: 'www.ekcos.eu',
    useCases: 'Typische toepassingen',
    brandingNote: 'Custom branding beschikbaar voor gekwalificeerde orders.',
  },
  pt: {
    color: 'Acabamento',
    selectProduct: 'Selecionar produto',
    fragrance: 'Opções de fragrância',
    benefits: 'Benefícios',
    productBenefits: 'Benefícios do produto',
    availableColorsFragrances: 'Cores e fragrâncias disponíveis',
    sixtyDayBadge: 'Ecrã de urinol anti-salpicos PLUS 60 dias',
    byBrand: 'da ëkcos',
    siteUrl: 'www.ekcos.eu',
    useCases: 'Aplicações típicas',
    brandingNote: 'Branding personalizado disponível para encomendas qualificadas.',
  },
  sv: {
    color: 'Yta',
    selectProduct: 'Välj produkt',
    fragrance: 'Doftalternativ',
    benefits: 'Fördelar',
    productBenefits: 'Produktfördelar',
    availableColorsFragrances: 'Tillgängliga färger & dofter',
    sixtyDayBadge: '60-dagars PLUS anti-stänk urinärsikt',
    byBrand: 'av ëkcos',
    siteUrl: 'www.ekcos.eu',
    useCases: 'Typiska användningsområden',
    brandingNote: 'Custom branding tillgängligt för kvalificerade ordrar.',
  },
  da: {
    color: 'Finish',
    selectProduct: 'Vælg produkt',
    fragrance: 'Duftmuligheder',
    benefits: 'Fordele',
    productBenefits: 'Produktfordele',
    availableColorsFragrances: 'Tilgængelige farver & dufte',
    sixtyDayBadge: '60-dages PLUS anti-stænk urinalsi',
    byBrand: 'fra ëkcos',
    siteUrl: 'www.ekcos.eu',
    useCases: 'Typiske anvendelser',
    brandingNote: 'Custom branding tilgængelig for kvalificerede ordrer.',
  },
  fi: {
    color: 'Pinta',
    selectProduct: 'Valitse tuote',
    fragrance: 'Tuoksuvalinnat',
    benefits: 'Hyödyt',
    productBenefits: 'Tuotehyödyt',
    availableColorsFragrances: 'Saatavilla olevat värit ja tuoksut',
    sixtyDayBadge: '60 päivän PLUS roiskeita estävä pisuaariseula',
    byBrand: 'ëkcos',
    siteUrl: 'www.ekcos.eu',
    useCases: 'Tyypilliset käyttökohteet',
    brandingNote: 'Custom branding saatavilla hyväksytyille tilauksille.',
  },
  el: {
    color: 'Φινίρισμα',
    selectProduct: 'Επιλογή προϊόντος',
    fragrance: 'Επιλογές αρώματος',
    benefits: 'Οφέλη',
    productBenefits: 'Οφέλη προϊόντος',
    availableColorsFragrances: 'Διαθέσιμα χρώματα & αρώματα',
    sixtyDayBadge: 'Σίτα ουρητηρίου anti-splash PLUS 60 ημερών',
    byBrand: 'από ëkcos',
    siteUrl: 'www.ekcos.eu',
    useCases: 'Τυπικές εφαρμογές',
    brandingNote: 'Προσαρμοσμένο branding διαθέσιμο για κατάλληλες παραγγελίες.',
  },
  hu: {
    color: 'Felület',
    selectProduct: 'Termék kiválasztása',
    fragrance: 'Illatváltozatok',
    benefits: 'Előnyök',
    productBenefits: 'Termékelőnyök',
    availableColorsFragrances: 'Elérhető színek és illatok',
    sixtyDayBadge: '60 napos PLUS fröccsenésgátló piszoárrács',
    byBrand: 'ëkcos',
    siteUrl: 'www.ekcos.eu',
    useCases: 'Tipikus alkalmazások',
    brandingNote: 'Egyedi branding minősített rendeléseknél elérhető.',
  },
  ro: {
    color: 'Finisaj',
    selectProduct: 'Selectați produsul',
    fragrance: 'Opțiuni de aromă',
    benefits: 'Beneficii',
    productBenefits: 'Beneficii produs',
    availableColorsFragrances: 'Culori și arome disponibile',
    sixtyDayBadge: 'Sită urinal anti-stropire PLUS 60 zile',
    byBrand: 'de ëkcos',
    siteUrl: 'www.ekcos.eu',
    useCases: 'Aplicații tipice',
    brandingNote: 'Branding personalizat disponibil pentru comenzi calificate.',
  },
  bg: {
    color: 'Покритие',
    selectProduct: 'Изберете продукт',
    fragrance: 'Варианти на аромат',
    benefits: 'Предимства',
    productBenefits: 'Предимства на продукта',
    availableColorsFragrances: 'Налични цветове и аромати',
    sixtyDayBadge: '60-дневна PLUS анти-пръскаща писоарна решетка',
    byBrand: 'от ëkcos',
    siteUrl: 'www.ekcos.eu',
    useCases: 'Типични приложения',
    brandingNote: 'Персонализиран брендинг за квалифицирани поръчки.',
  },
  hr: {
    color: 'Završna obrada',
    selectProduct: 'Odaberite proizvod',
    fragrance: 'Opcije mirisa',
    benefits: 'Prednosti',
    productBenefits: 'Prednosti proizvoda',
    availableColorsFragrances: 'Dostupne boje i mirisi',
    sixtyDayBadge: '60-dnevna PLUS antishplash mreža za pisoar',
    byBrand: 'od ëkcos',
    siteUrl: 'www.ekcos.eu',
    useCases: 'Tipične primjene',
    brandingNote: 'Prilagođeni branding dostupan za kvalificirane narudžbe.',
  },
  sl: {
    color: 'Površina',
    selectProduct: 'Izberite izdelek',
    fragrance: 'Možnosti dišav',
    benefits: 'Prednosti',
    productBenefits: 'Prednosti izdelka',
    availableColorsFragrances: 'Razpoložljive barve in dišave',
    sixtyDayBadge: '60-dnevna PLUS antishplash sito za pisoar',
    byBrand: 'od ëkcos',
    siteUrl: 'www.ekcos.eu',
    useCases: 'Tipične uporabe',
    brandingNote: 'Prilagojen branding na voljo za kvalificirana naročila.',
  },
  et: {
    color: 'Viimistlus',
    selectProduct: 'Valige toode',
    fragrance: 'Lõhnavalikud',
    benefits: 'Eelised',
    productBenefits: 'Toote eelised',
    availableColorsFragrances: 'Saadaolevad värvid ja lõhnad',
    sixtyDayBadge: '60-päevane PLUS pritsmekindel pissuaarisõel',
    byBrand: 'ëkcos',
    siteUrl: 'www.ekcos.eu',
    useCases: 'Tüüpilised kasutusalad',
    brandingNote: 'Kohandatud branding saadaval kvalifitseeritud tellimustele.',
  },
  lv: {
    color: 'Apdare',
    selectProduct: 'Izvēlieties produktu',
    fragrance: 'Smaržu varianti',
    benefits: 'Priekšrocības',
    productBenefits: 'Produkta priekšrocības',
    availableColorsFragrances: 'Pieejamās krāsas un smaržas',
    sixtyDayBadge: '60 dienu PLUS pretšļakatu urināla siets',
    byBrand: 'no ëkcos',
    siteUrl: 'www.ekcos.eu',
    useCases: 'Tipiski pielietojumi',
    brandingNote: 'Pielāgots branding pieejams kvalificētiem pasūtījumiem.',
  },
  lt: {
    color: 'Apdaila',
    selectProduct: 'Pasirinkite produktą',
    fragrance: 'Kvapų variantai',
    benefits: 'Privalumai',
    productBenefits: 'Produkto privalumai',
    availableColorsFragrances: 'Galimos spalvos ir kvapai',
    sixtyDayBadge: '60 dienų PLUS anti-splash pisuaro tinklelis',
    byBrand: 'ëkcos',
    siteUrl: 'www.ekcos.eu',
    useCases: 'Tipiniai pritaikymai',
    brandingNote: 'Individualus branding prieinamas kvalifikuotiems užsakymams.',
  },
}

const freshDropWhite: Record<string, string> = {
  pt: 'base branca',
  sl: 'nosilec bel',
  lv: 'turētājs balts',
}

function protect(text: string): string {
  return text
    .replace(/Eco-One™/g, '__BRAND_ECOONE__')
    .replace(/xcrën HD/gi, '__BRAND_XCRENHD__')
    .replace(/xcrën puck/gi, '__BRAND_XCRENPUCK__')
    .replace(/ëkcoscreen/gi, '__BRAND_EKCOSCREEN__')
    .replace(/powër screen/gi, '__BRAND_POWERSCREEN__')
    .replace(/basic scrëen/gi, '__BRAND_BASICSCREEN__')
    .replace(/üro lite/gi, '__BRAND_UROLITE__')
    .replace(/ëkco clip/gi, '__BRAND_EKCOCLIP__')
    .replace(/ëkco mat/gi, '__BRAND_EKCOMAT__')
    .replace(/frësh drop/gi, '__BRAND_FRESHDROP__')
    .replace(/ëz trap/gi, '__BRAND_EZTRAP__')
    .replace(/ëkcos/gi, '__BRAND_EKCOS__')
}

function unprotect(text: string): string {
  return text
    .replace(/__BRAND_ECOONE__/gi, 'Eco-One™')
    .replace(/__BRAND_XCRENHD__/gi, 'xcrën HD')
    .replace(/__BRAND_XCRENPUCK__/gi, 'xcrën puck')
    .replace(/__BRAND_EKCOSCREEN__/gi, 'ëkcoscreen')
    .replace(/__BRAND_POWERSCREEN__/gi, 'powër screen')
    .replace(/__BRAND_BASICSCREEN__/gi, 'basic scrëen')
    .replace(/__BRAND_UROLITE__/gi, 'üro lite')
    .replace(/__BRAND_EKCOCLIP__/gi, 'ëkco clip')
    .replace(/__BRAND_EKCOMAT__/gi, 'ëkco mat')
    .replace(/__BRAND_FRESHDROP__/gi, 'frësh drop')
    .replace(/__BRAND_EZTRAP__/gi, 'ëz trap')
    .replace(/__BRAND_EKCOS__/gi, 'ëkcos')
}

async function translateTexts(texts: string[], to: string): Promise<string[]> {
  if (!texts.length) return []
  const protectedTexts = texts.map(protect)
  const out: string[] = []
  const chunkSize = 10
  for (let i = 0; i < protectedTexts.length; i += chunkSize) {
    const chunk = protectedTexts.slice(i, i + chunkSize)
    let attempt = 0
    for (;;) {
      try {
        const result = await translate(chunk, { from: 'en', to, forceBatch: true })
        const arr = Array.isArray(result) ? result : [result]
        for (const item of arr) out.push(unprotect(item.text))
        break
      } catch (err) {
        attempt += 1
        if (attempt >= 5) throw err
        await new Promise((r) => setTimeout(r, 800 * attempt))
      }
    }
  }
  return out
}

type Dict = {
  products: Record<string, unknown> & {
    colors?: Record<string, string>
    fragrances?: Record<string, string>
    page?: Record<string, string>
    configurator?: Record<string, string>
    freshDrop?: { bases?: Record<string, string> }
  }
}

async function main() {
  const en = JSON.parse(readFileSync(join(DIR, 'en.json'), 'utf8')) as Dict
  const productKeys = Object.keys(en.products).filter((k) => {
    const p = en.products[k]
    return p && typeof p === 'object' && 'imageAlt' in (p as object)
  })

  const locales = readdirSync(DIR)
    .filter((f) => f.endsWith('.json') && f !== 'en.json')
    .map((f) => f.replace(/\.json$/, ''))

  for (const locale of locales) {
    const path = join(DIR, `${locale}.json`)
    const data = JSON.parse(readFileSync(path, 'utf8')) as Dict
    if (!data.products) continue

    const colorPack = titleCaseColorPack(locale)
    if (colorPack) {
      data.products.colors = colorPack.colors
      data.products.fragrances = colorPack.fragrances
    }

    if (pagePacks[locale]) {
      data.products.page = { ...pagePacks[locale] }
    }
    if (configuratorPacks[locale]) {
      data.products.configurator = { ...configuratorPacks[locale] }
    }

    if (freshDropWhite[locale]) {
      data.products.freshDrop ??= {}
      data.products.freshDrop.bases ??= {}
      data.products.freshDrop.bases.white = freshDropWhite[locale]
    }

    // Translate imageAlt when still EN
    const gt = GT_CODE[locale]
    if (gt) {
      const toTranslate: { key: string; text: string }[] = []
      for (const pk of productKeys) {
        const enAlt = (en.products[pk] as { imageAlt?: string }).imageAlt
        const locProd = data.products[pk] as { imageAlt?: string } | undefined
        if (!enAlt || !locProd) continue
        if (!locProd.imageAlt || locProd.imageAlt === enAlt) {
          toTranslate.push({ key: pk, text: enAlt })
        }
      }
      if (toTranslate.length) {
        process.stdout.write(`${locale}: imageAlt×${toTranslate.length} `)
        const translated = await translateTexts(
          toTranslate.map((t) => t.text),
          gt,
        )
        toTranslate.forEach((item, i) => {
          const prod = data.products[item.key] as { imageAlt: string }
          prod.imageAlt = translated[i] ?? item.text
        })
        console.log('ok')
      } else {
        console.log(`${locale}: imageAlt already localized`)
      }
    }

    writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
  }

  console.log('done')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
