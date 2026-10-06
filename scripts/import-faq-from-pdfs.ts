/**
 * Import FAQ PDFs → content/faq/{audience}/{locale}.json
 * Usage: bun scripts/import-faq-from-pdfs.ts
 */
import { mkdirSync, readdirSync, writeFileSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { spawnSync } from 'child_process'

const ROOT = join(import.meta.dir, '..')
const DOWNLOADS = join(process.env.HOME ?? '', 'Downloads/ekcos')
const OUT = join(ROOT, 'content/faq')

const LANG_TO_LOCALE: Record<string, string> = {
  English: 'en', Czech: 'cs', Slovak: 'sk', German: 'de', Polish: 'pl',
  French: 'fr', Spanish: 'es', Italian: 'it', Dutch: 'nl', Portuguese: 'pt',
  Swedish: 'sv', Danish: 'da', Finnish: 'fi', Greek: 'el', Hungarian: 'hu',
  Romanian: 'ro', Bulgarian: 'bg', Croatian: 'hr', Slovenian: 'sl',
  Estonian: 'et', Latvian: 'lv', Lithuanian: 'lt',
}

type Audience = 'distributors' | 'eshop'
type AnswerBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }

type FaqItem = { id: string; question: string; answer: AnswerBlock[] }
type FaqCategory = { id: string; title: string; items: FaqItem[] }
type FaqMetric = { value: string; label: string }
type FaqContent = {
  hero: { title: string; tagline: string; intro: string }
  metrics: FaqMetric[]
  categories: FaqCategory[]
  contact: { title: string; body: string }
  footnote: string
}

const DISTRIBUTOR_IDS = [
  'about', 'urinal-screens', 'ez-trap-ekco-mat', 'air-fresheners',
  'materials', 'private-label', 'working-with',
] as const
const ESHOP_IDS = [
  'about', 'urinal-screens', 'ez-trap-ekco-mat', 'air-fresheners',
  'materials', 'private-label', 'orders',
] as const
const DISTRIBUTOR_COUNTS = [2, 11, 3, 6, 6, 3, 8] as const
const ESHOP_COUNTS = [2, 11, 3, 6, 7, 3, 13] as const

/** Case-sensitive openers — FAQ questions start with a capital letter. */
const Q_START =
  /^(Who|What|Which|How|Why|Is|Are|Can|Will|Do|Does|Where|When|Whose|May|Should|Could|Would|Kdo|Co|Čím|Jak|Jaké|Jaká|Jaký|Jakou|Proč|Je|Jsou|Mohu|Můžu|Lze|Kde|Kdy|Který|Která|Které|Existuje|Dá|Pasuje|Funguje|Bude|Budou|Může|Můžete|Dostanu|Kde|Kam|Kolik|Z čeho|Na kterých|Wer|Was|Wie|Warum|Weshalb|Ist|Sind|Kann|Können|Wird|Werden|Wo|Wann|Welche|Welcher|Welches|Gibt|Haben|Passt|Qui|Que|Quel|Quelle|Quels|Quelles|Comment|Pourquoi|Est|Sont|Puis|Peut|Où|Quand|Avez|Quién|Quiénes|Qué|Cuál|Cuáles|Cómo|Por|Está|Están|Puedo|Puede|Dónde|Cuándo|Hay|Chi|Cosa|Che|Quale|Quali|Come|Perché|È|Sono|Posso|Può|Dove|Quando|Esiste|Avete|Wat|Welke|Waarom|Zijn|Kan|Kunnen|Wordt|Waar|Wanneer|Heb|Heeft|Hebt|Past|Quem|Qual|Quais|Como|Estão|Pode|Onde|Quando|Há|Vad|Vilken|Vilka|Hur|Varför|Är|Var|När|Finns|Har|Hvem|Hvad|Hvilken|Hvordan|Hvorfor|Er|Hvor|Hvornår|Mikä|Mitä|Millainen|Miten|Miksi|Onko|Voiko|Missä|Milloin|Sopiiko|Ποια|Ποιο|Ποιες|Ποιος|Τι|Πώς|Γιατί|Είναι|Μπορώ|Μπορεί|Πού|Πότε|Υπάρχει|Σε τι|Έχετε|Ki|Mi|Milyen|Hogyan|Miért|Van|Lehet|Hol|Mikor|Melyik|Care|Ce|Cum|Este|Sunt|Pot|Poate|Unde|Când|Există|Mai|Кой|Какво|Как|Защо|Коя|Кое|Кои|Има|Мога|Къде|Кога|Имате|Tko|Što|Koji|Koja|Koje|Kako|Zašto|Mogu|Gdje|Kada|Ima|Imate|Kaj|Kateri|Katera|Katero|Zakaj|Lahko|Kje|Kdaj|Kes|Mis|Milline|Kuidas|Miks|On|Kas|Kus|Millal|Kurš|Kāda|Kā|Kāpēc|Ir|Vai|Kur|Kad|Koks|Kokia|Kaip|Kodėl|Yra|Ar|Vis)(?=[\s?/;;]|$)/

const CONTACT_RE =
  /still have a question|máte ještě otázku|máte ešte otázku|haben sie noch eine frage|jeszcze jakieś pytanie|¿aún tiene|avez encore une question|avete ancora una domanda|hebt u nog een vraag|ainda tem alguma|har ni fortfarande|har du stadig|onko teillä vielä|έχετε ακόμη|van még kérdése|mai aveți întrebări|имате още въпроси|imate još pitanja|imate še vprašanje|kas teil on veel|vai jums vēl|vis dar turite/i

function pdftotext(pdfPath: string): string {
  const r = spawnSync('pdftotext', ['-layout', pdfPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  })
  if (r.status !== 0) throw new Error(`pdftotext failed: ${pdfPath}`)
  return r.stdout
}

function cleanLines(text: string): string[] {
  return text.split(/\r?\n/).map((l) => l.replace(/\f/g, '')).filter((l) => {
    const t = l.trim()
    if (!t) return true
    if (/ëkcos innovations ·/i.test(t)) return false
    if (/^\d+\/\d+$/.test(t)) return false
    if (
      /asked questions|časté dotazy|häufig gestellte|preguntas frecuentes|questions fréquentes|domande frequenti|veelgestelde|perguntas frequentes|vanliga frågor|ofte stillede|usein kysytyt|συχνέσ|gyakran ismételt|întrebări frecvente|често задавани|često postavljana|pogosto zastavljena|korduma kippuvad|biežāk uzdotie|dažnai užduodami/i.test(
        t,
      ) &&
      t.length < 70
    ) {
      return false
    }
    return true
  })
}

function detectSplitCol(lines: string[]): number {
  const counts = new Map<number, number>()
  for (const line of lines) {
    for (let i = 20; i <= 48; i++) {
      if (line[i] === ' ' && line[i + 1] === ' ') {
        let j = i
        while (line[j] === ' ') j++
        if (j >= i + 2 && line[j]) counts.set(j, (counts.get(j) ?? 0) + 1)
        break
      }
    }
  }
  let best = 34
  let n = 0
  for (const [col, c] of counts) {
    if (c > n) {
      best = col
      n = c
    }
  }
  return best
}

function findLargestGap(line: string, minStart = 25, maxStart = 75): number | null {
  let bestPos: number | null = null
  let bestLen = 0
  let i = minStart
  while (i < Math.min(line.length, maxStart)) {
    if (line[i] !== ' ') {
      i++
      continue
    }
    let j = i
    while (j < line.length && line[j] === ' ') j++
    const len = j - i
    if (len >= 3 && len > bestLen && j < line.length && line.slice(0, i).trim()) {
      bestLen = len
      bestPos = j
    }
    i = Math.max(j, i + 1)
  }
  return bestPos
}

function splitLine(line: string, splitCol: number): { L: string; R: string } {
  if (line.length <= splitCol) return { L: line.trim(), R: '' }
  if (!line.slice(0, splitCol).trim()) {
    return { L: '', R: line.slice(splitCol).trim() }
  }
  let col = splitCol
  const leftFixed = line.slice(0, splitCol)
  if (leftFixed.trim() && !/\s{2,}$/.test(leftFixed) && line.length > splitCol + 5) {
    for (let i = splitCol - 6; i < splitCol + 20 && i < line.length - 2; i++) {
      if (line[i] === ' ' && line[i + 1] === ' ') {
        let j = i
        while (line[j] === ' ') j++
        if (j > i + 1) {
          col = j
          break
        }
      }
    }
  }
  return { L: line.slice(0, col).trim(), R: line.slice(col).trim() }
}

function qDone(q: string): boolean {
  return /[?;؟;]\s*$/.test(q.trim())
}

function isNoiseLeft(left: string): boolean {
  if (!left) return true
  if (left.startsWith('•') || left.startsWith('-')) return true
  // Product / table headers — case-sensitive so "screen last?" / "sítko do…" still work
  if (/^(ëkcoscreen|xcrën|powër|üro lite|basic scrëen|xcrën puck)\b/i.test(left)) {
    return true
  }
  if (/^(Screen|Fragrance|Shipping|Sítko|Velikost|Vůně|Countries|Best for)\b/.test(left)) {
    return true
  }
  if (/^[\d.,]+\s*EUR\b/i.test(left)) return true
  // Table scraps
  if (/^(úd|dní|cm|g|%)$/i.test(left)) return true
  return false
}

function isQuestionStart(left: string): boolean {
  if (!left || isNoiseLeft(left)) return false
  if (left.length < 10 && qDone(left)) return false
  return Q_START.test(left)
}

function isCategory(line: string): boolean {
  const t = line.trim()
  const ind = line.length - line.trimStart().length
  if (ind < 6 || ind > 14 || !t || t.length > 80) return false
  if (t.includes('?') || /;\s*$/.test(t)) return false
  if (/^\d/.test(t)) return false
  if (/questions?|otázk|fragen|pregunta|ερωτ|kérdés|întrebăr|въпрос|pitanj|vprašanj|küsimus|jautājum|klausim/i.test(t) && t.length < 40) {
    return false
  }
  if (CONTACT_RE.test(t) || /data source|zdroj dat|support@/i.test(t)) return false
  if (/\S\s{2,}\S/.test(line)) return false
  return true
}

function parseHero(lines: string[]): FaqContent['hero'] {
  const nonempty = lines.map((l) => l.trim()).filter(Boolean)
  let tagline = ''
  let subtitle = ''
  for (let i = 1; i < Math.min(10, nonempty.length); i++) {
    const line = nonempty[i]
    if (/^(ëkcos|In this FAQ|Obsah|0\d)/i.test(line) || /at a glance|v kostce/i.test(line)) break
    if (!tagline) {
      tagline = line
      continue
    }
    if (!subtitle) {
      subtitle = line
      break
    }
  }
  const intro: string[] = []
  let collect = false
  for (const raw of lines) {
    const t = raw.trim()
    if (/at a glance|v kostce|auf einen|In this FAQ|Obsah/i.test(t)) break
    if (!t) {
      if (collect && intro.length) break
      continue
    }
    const ind = raw.length - raw.trimStart().length
    if (ind >= 2 && t.length > 40 && t !== tagline && t !== subtitle) {
      collect = true
      intro.push(t)
    } else if (collect) break
  }
  return {
    title: 'FAQ',
    tagline: [tagline, subtitle].filter(Boolean).join('. ').replace(/\s+/g, ' ').trim(),
    intro: intro.join(' ').replace(/\s+/g, ' ').trim(),
  }
}

function parseMetrics(lines: string[]): FaqMetric[] {
  const start = lines.findIndex((l) =>
    /at a glance|v kostce|auf einen Blick|en un vistazo|en bref|in het kort|a colpo|w skrócie|num rei|i korthet|lyhyesti|pillantással|pe scurt|накратко|u kratko|lühidalt|īsumā|trumpai|på et øjeblik|με μια/i.test(l),
  )
  if (start < 0) return []
  const end = lines.findIndex(
    (l, i) =>
      i > start &&
      /In this FAQ|Obsah|^0\d\s|In diesem|Dans cette|En este|In deze|In questa|W tym|Neste|I denna|Tässä|Ebben|În acest|В тези|U ovom|V tem|Selles|Šajā|Šiame|I denne/i.test(
        l.trim(),
      ),
  )
  const block = lines.slice(start + 1, end > 0 ? end : start + 40)
  type Cell = { value: string; labels: string[] }
  const out: FaqMetric[] = []
  let pair: [Cell, Cell] | null = null
  const isVal = (s: string) => {
    const x = s.replace(/\s/g, '')
    return /^[\d.]+%?$/.test(x) || /^\d+g$/i.test(x) || /^\d+\+$/.test(x)
  }
  const flush = () => {
    if (!pair) return
    for (const c of pair) {
      if (c.value && c.labels.length) {
        out.push({
          value: c.value,
          label: c.labels.join(' ').replace(/\s+/g, ' ').trim(),
        })
      }
    }
    pair = null
  }
  for (const line of block) {
    if (!line.trim()) {
      flush()
      continue
    }
    const gap = findLargestGap(line, 25, 75)
    if (!gap) continue
    const L = line.slice(0, gap).trimEnd().trim()
    const R = line.slice(gap).trim()
    if (!pair) {
      if (isVal(L) || isVal(R)) pair = [{ value: L, labels: [] }, { value: R, labels: [] }]
      continue
    }
    if (L) pair[0].labels.push(L)
    if (R) pair[1].labels.push(R)
  }
  flush()
  return out
}

function buildAnswer(raw: string[]): AnswerBlock[] {
  const blocks: AnswerBlock[] = []
  let para: string[] = []
  let list: string[] = []
  let table: { headers: string[]; rows: string[][]; buf: string[] } | null = null

  const flushP = () => {
    if (para.length) {
      blocks.push({ type: 'paragraph', text: para.join(' ').replace(/\s+/g, ' ').trim() })
      para = []
    }
  }
  const flushL = () => {
    if (list.length) {
      blocks.push({ type: 'list', items: list })
      list = []
    }
  }
  const flushT = () => {
    if (!table) return
    if (table.buf.length) {
      table.rows.push(rowOf(table.buf.join(' '), table.headers.length))
    }
    if (table.rows.length) {
      blocks.push({ type: 'table', headers: table.headers, rows: table.rows })
    }
    table = null
  }

  for (const line of raw) {
    const t = line.trim()
    if (!t) {
      flushP()
      flushL()
      continue
    }
    if (
      (/\bScreen\b/i.test(t) && /\bFragrance\b/i.test(t)) ||
      (/^Shipping\b/i.test(t) && /Countr/i.test(t)) ||
      (/^Sítko\b/i.test(t) && /Vůně/i.test(t))
    ) {
      flushP()
      flushL()
      table = {
        headers: /Shipping|Doprav/i.test(t)
          ? ['Shipping', 'Countries']
          : ['Screen', 'Fragrance', 'Size', 'Best for'],
        rows: [],
        buf: [],
      }
      continue
    }
    if (table) {
      const rowStart = /^(ëkcoscreen|xcrën|powër|üro|basic|[\d.,]+\s*EUR)/i.test(t)
      if (rowStart && table.buf.length) {
        table.rows.push(rowOf(table.buf.join(' '), table.headers.length))
        table.buf = [t]
      } else if (rowStart) table.buf = [t]
      else if (table.buf.length) table.buf.push(t)
      else {
        flushT()
        para.push(t)
      }
      continue
    }
    if (t.startsWith('•') || t.startsWith('- ')) {
      flushP()
      list.push(t.replace(/^[•\-]\s*/, '').trim())
      continue
    }
    if (list.length) {
      list[list.length - 1] = `${list[list.length - 1]} ${t}`.replace(/\s+/g, ' ')
      continue
    }
    para.push(t)
  }
  flushP()
  flushL()
  flushT()
  return blocks.filter((b) =>
    b.type === 'paragraph' ? Boolean(b.text) : b.type === 'list' ? b.items.length > 0 : b.rows.length > 0,
  )
}

function rowOf(text: string, cols: number): string[] {
  const c = text.replace(/\s+/g, ' ').trim()
  if (cols === 2) {
    const m = c.match(/^([\d.,]+\s*EUR)\s+(.+)$/i)
    return m ? [m[1], m[2]] : [c, '']
  }
  const names =
    'ëkcoscreen 60\\+|xcrën HD 60\\+|powër screen|üro lite|basic scrëen|xcrën puck'
  const m = c.match(
    new RegExp(
      `^(${names})\\s+(.+?)\\s+(\\d+\\s*x\\s*\\d+\\s*cm)\\s+(.+)$`,
      'i',
    ),
  )
  if (m) return [m[1], m[2].trim(), m[3], m[4]]
  return [c, '', '', '']
}

type Raw = { q: string; a: string[] }

function mergeFragments(items: Raw[]): Raw[] {
  const out: Raw[] = []
  for (const it of items) {
    let q = it.q.replace(/\s+/g, ' ').trim()
    q = q.replace(/\s+úd\b/gi, '').replace(/\s{2,}/g, ' ').trim()
    if (CONTACT_RE.test(q)) continue

    if (out.length) {
      const prev = out[out.length - 1]
      const prevDone = qDone(prev.q)
      const curStartsLower = /^[a-záčďéěíňóřšťúůýžäöüàèéìòùáéíóúăâîșțα-ωа-я]/u.test(q)
      const curIsShortTail = q.length < 40 && qDone(q) && !Q_START.test(q)

      // Merge wrapped question tails: "…skládce a" + "jak se to testovalo?"
      if (!prevDone && (curStartsLower || curIsShortTail || !Q_START.test(q))) {
        prev.q = `${prev.q} ${q}`.replace(/\s+/g, ' ').trim()
        prev.a.push(...it.a)
        continue
      }
      // Merge orphan short question into previous if previous also looks broken
      if (prevDone && curIsShortTail && prev.q.length < 25) {
        prev.q = `${prev.q} ${q}`.replace(/\s+/g, ' ').trim()
        prev.a.push(...it.a)
        continue
      }
    }
    out.push({ q, a: [...it.a] })
  }
  return out
}

function extract(lines: string[], splitCol: number) {
  const titles: string[] = []
  const items: Raw[] = []
  let item: Raw | null = null
  let body = false
  let inContact = false
  let contact = { title: '', body: '' }
  let footnote = ''
  let past = false
  const contactBits: string[] = []

  const commit = () => {
    if (!item) return
    const q = item.q.replace(/\s+/g, ' ').trim()
    if (q) items.push({ q, a: [...item.a] })
    item = null
  }

  for (const line of lines) {
    const t = line.trim()
    if (!t) continue

    if (/^(Data source:|Zdroj dat:|Datenquelle:|Źródło|Fonte dei|Tietolähde|Datakilde|Datakälla|Adatforrás|Sursa datelor|Източник|Πηγή|Datu avots|Duomenų|Fuente de|Bron van|Source des)/i.test(t)) {
      past = true
      inContact = false
      footnote = t
      continue
    }
    if (past) {
      footnote = `${footnote} ${t}`.trim()
      continue
    }

    if (CONTACT_RE.test(t)) {
      commit()
      contact.title = t
      inContact = true
      body = false
      continue
    }
    if (inContact) {
      if (/market leader|visit our|central warehouse|tržní lídr|lídr trhu|navštivte|marktführer|zapraszamy/i.test(t)) {
        continue
      }
      if (/ekcos\.eu/i.test(t) && t.length < 55) continue
      contactBits.push(t)
      continue
    }

    if (isCategory(line)) {
      body = true
      commit()
      titles.push(t)
      continue
    }

    if (!body) continue

    const { L, R } = splitLine(line, splitCol)

    // Answer-only continuation
    if (!L && R) {
      if (item) item.a.push(R)
      continue
    }

    if (!L || isNoiseLeft(L)) {
      if (item && R) item.a.push(R)
      else if (item && L?.startsWith('•')) item.a.push(L)
      continue
    }

    const starts = isQuestionStart(L)

    if (item && !qDone(item.q)) {
      if (starts && item.q.length > 15) {
        // New question while previous unfinished — commit previous as-is
        commit()
        item = { q: L, a: R ? [R] : [] }
      } else {
        item.q = `${item.q} ${L}`.replace(/\s+/g, ' ')
        if (R) item.a.push(R)
      }
      continue
    }

    if (starts && (item === null || qDone(item.q))) {
      commit()
      item = { q: L, a: R ? [R] : [] }
      continue
    }

    if (!item) continue

    if (R) item.a.push(R)
    else if (L.startsWith('•') || L.startsWith('-')) item.a.push(L)
    else if (!starts) {
      const ind = line.length - line.trimStart().length
      if (ind >= 5) item.a.push(L)
    }
  }
  commit()

  contact.body = contactBits.join(' ').replace(/\s+/g, ' ').trim()
  // Trim market-leader blurbs from contact body
  contact.body = contact.body
    .replace(
      /\s*(Market leader|Marktführer|Lider rynku|Leader di|Olemme markkina|Markedsleder|Marknadsledare|Piacvezető|Lider de piață|Пазарен|Ηγέτιδα|Tirgus|Esame rinkos|Tržní lídr|Lídr trhu|Vodeći|Turuliider|Vodilni).*$/i,
      '',
    )
    .trim()

  return {
    titles,
    items: mergeFragments(items),
    contact: {
      title: contact.title || 'Still have a question?',
      body: contact.body,
    },
    footnote,
  }
}

function assemble(
  audience: Audience,
  hero: FaqContent['hero'],
  metrics: FaqMetric[],
  titles: string[],
  items: Raw[],
  contact: FaqContent['contact'],
  footnote: string,
): FaqContent {
  const ids = audience === 'distributors' ? DISTRIBUTOR_IDS : ESHOP_IDS
  const counts = audience === 'distributors' ? DISTRIBUTOR_COUNTS : ESHOP_COUNTS

  let cats = titles.filter((t) => t.length > 2 && t.length < 80 && !/@/.test(t))
  if (cats.length > counts.length) cats = cats.slice(0, counts.length)
  while (cats.length < counts.length) cats.push(`Section ${cats.length + 1}`)

  const categories: FaqCategory[] = []
  let offset = 0
  for (let i = 0; i < counts.length; i++) {
    const slice = items.slice(offset, offset + counts[i])
    offset += counts[i]
    categories.push({
      id: ids[i],
      title: cats[i],
      items: slice.map((it, j) => ({
        id: `${ids[i]}-${j + 1}`,
        question: it.q,
        answer: buildAnswer(it.a),
      })),
    })
  }
  if (offset < items.length && categories.length) {
    const last = categories[categories.length - 1]
    for (let j = offset; j < items.length; j++) {
      last.items.push({
        id: `${last.id}-${last.items.length + 1}`,
        question: items[j].q,
        answer: buildAnswer(items[j].a),
      })
    }
  }
  return { hero, metrics, categories, contact, footnote }
}

function parsePdf(text: string, audience: Audience): FaqContent {
  const lines = cleanLines(text)
  const splitCol = detectSplitCol(lines)
  const hero = parseHero(lines)
  const metrics = parseMetrics(lines)
  const { titles, items, contact, footnote } = extract(lines, splitCol)
  return assemble(audience, hero, metrics, titles, items, contact, footnote)
}

function findPdfs(audience: Audience) {
  const dir =
    audience === 'distributors'
      ? join(DOWNLOADS, 'FAQ - distributors')
      : join(DOWNLOADS, 'FAQ - eshop')
  const prefix =
    audience === 'distributors' ? 'ekcos_FAQ_distributors_' : 'ekcos_FAQ_eshop_'
  return readdirSync(dir)
    .filter((f) => f.endsWith('.pdf') && f.startsWith(prefix))
    .map((f) => {
      const lang = f.slice(prefix.length, -4)
      return { locale: LANG_TO_LOCALE[lang], path: join(dir, f) }
    })
    .filter((x): x is { locale: string; path: string } => Boolean(x.locale))
    .sort((a, b) => a.locale.localeCompare(b.locale))
}

/** Preserve previously polished contact if new parse is empty. */
function mergeContact(
  audience: Audience,
  locale: string,
  content: FaqContent,
): FaqContent {
  if (content.contact.title && content.contact.title !== 'Still have a question?') {
    return content
  }
  const prevPath = join(OUT, audience, `${locale}.json`)
  if (!existsSync(prevPath)) return content
  try {
    const prev = JSON.parse(readFileSync(prevPath, 'utf8')) as FaqContent
    if (prev.contact?.title && prev.contact.title !== 'Still have a question?') {
      content.contact = prev.contact
    }
  } catch {
    /* ignore */
  }
  return content
}

function main() {
  for (const audience of ['distributors', 'eshop'] as Audience[]) {
    mkdirSync(join(OUT, audience), { recursive: true })
    console.log(`\n${audience}`)
    const expected = audience === 'distributors' ? 39 : 45
    for (const { locale, path } of findPdfs(audience)) {
      let content = parsePdf(pdftotext(path), audience)
      content = mergeContact(audience, locale, content)
      const n = content.categories.reduce((s, c) => s + c.items.length, 0)
      const empty = content.categories
        .flatMap((c) => c.items)
        .filter((i) => !i.answer.length).length
      const short = content.categories
        .flatMap((c) => c.items)
        .filter((i) => i.question.length < 12).length
      console.log(
        `  ${locale}: ${n}/${expected} empty=${empty} short=${short} metrics=${content.metrics.length}`,
      )
      writeFileSync(join(OUT, audience, `${locale}.json`), `${JSON.stringify(content, null, 2)}\n`)
    }
  }
}

main()
