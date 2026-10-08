import {createClient} from '@sanity/client'
import {createReadStream, existsSync, readFileSync} from 'node:fs'
import {homedir} from 'node:os'
import {join} from 'node:path'

function loadEnv(): void {
  if (!existsSync('.env.local')) return
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    if (!line || line.startsWith('#')) continue
    const i = line.indexOf('=')
    if (i < 0) continue
    const k = line.slice(0, i).trim()
    let v = line.slice(i + 1).trim()
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1)
    }
    if (!(k in process.env)) process.env[k] = v
  }
}

function findToken(): string | undefined {
  if (process.env.SANITY_API_WRITE_TOKEN) return process.env.SANITY_API_WRITE_TOKEN
  try {
    const cfg = JSON.parse(
      readFileSync(join(homedir(), '.config/sanity/config.json'), 'utf8'),
    ) as {authToken?: string; token?: string}
    return cfg.authToken || cfg.token
  } catch {
    return undefined
  }
}

const DOC_ID = '39d23212-2cf4-432b-b9f9-cfd74cbb0b85'
const DRAFT_ID = `drafts.${DOC_ID}`
const LOCALES = [
  'en',
  'cs',
  'sk',
  'de',
  'pl',
  'fr',
  'es',
  'it',
  'nl',
  'pt',
  'sv',
  'da',
  'fi',
  'el',
  'hu',
  'ro',
  'bg',
  'hr',
  'sl',
  'et',
  'lv',
  'lt',
] as const

const ALTS: Record<(typeof LOCALES)[number], string> = {
  en: 'Blue X-shaped ëkcoscreen urinal screen with anti-splash bristles on a soft white and blue studio background',
  cs: 'Modré X-sítko ëkcoscreen se štětinkami proti rozstřiku na světlém studio pozadí',
  sk: 'Modré X-sítko ëkcoscreen so štetinkami proti rozstreku na svetlom studio pozadí',
  de: 'Blaues X-förmiges ëkcoscreen Urinalsieb mit Anti-Spritz-Borsten auf hellem Studiohintergrund',
  pl: 'Niebieskie sitko ëkcoscreen w kształcie X ze szczecinami anti-splash na jasnym tle studyjnym',
  fr: 'Écran urinal ëkcoscreen bleu en X avec poils anti-éclaboussures sur fond studio clair',
  es: 'Rejilla ëkcoscreen azul en forma de X con cerdas anti-salpicaduras sobre fondo de estudio claro',
  it: 'Schermo urinario ëkcoscreen blu a X con setole anti-splash su sfondo studio chiaro',
  nl: 'Blauw X-vormig ëkcoscreen urinoirrooster met anti-spatborstels op een lichte studioachtergrond',
  pt: 'Ecrã ëkcoscreen azul em X com cerdas anti-salpico sobre fundo de estúdio claro',
  sv: 'Blå X-formad ëkcoscreen urinalsil med anti-stänkborst på ljus studiobakgrund',
  da: 'Blåt X-formet ëkcoscreen urinalsi med anti-stænk-børster på lys studiobaggrund',
  fi: 'Sininen X-muotoinen ëkcoscreen-pisoarisuoja antisplash-harjaksilla vaalealla studiotaustalla',
  el: 'Μπλε οθόνη ουρητηρίου ëkcoscreen σε σχήμα X με τρίχες anti-splash σε ανοιχτό studio φόντο',
  hu: 'Kék X alakú ëkcoscreen vizeldebetét fröccsenésgátló sörtékkel világos stúdióháttéren',
  ro: 'Sită ëkcoscreen albastră în formă de X cu peri anti-stropire pe fundal studio deschis',
  bg: 'Син X-образен ëkcoscreen писоарен екран с противопръскащи четинки на светъл студиен фон',
  hr: 'Plavi X-oblikovani ëkcoscreen pisoarni ulošak s anti-splash čekinjama na svijetloj studio pozadini',
  sl: 'Modro X-sito ëkcoscreen s ščetinami proti brizganju na svetlem studio ozadju',
  et: 'Sinine X-kujuline ëkcoscreen pissuaarisõel pritsmevastaste harjastega heledal stuudio taustal',
  lv: 'Zils X formas ëkcoscreen pisoāra sietiņš ar pretšļakatu sariņiem uz gaiša studijas fona',
  lt: 'Mėlynas X formos ëkcoscreen pisuaro tinklelis su anti-splash šereliais ant šviesaus studijos fono',
}

loadEnv()
const token = findToken()
if (!token) throw new Error('NO_TOKEN')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2026-02-02',
  token,
  useCdn: false,
})

const asset = await client.assets.upload(
  'image',
  createReadStream('scripts/tmp/competition-images/cover.jpg'),
  {filename: 'competition-article-cover.jpg'},
)
console.log('uploaded', asset._id)

const published = await client.getDocument(DOC_ID)
if (!published) throw new Error('missing published doc')

const setFields: Record<string, unknown> = {}
for (const locale of LOCALES) {
  const existing = (published as Record<string, unknown>)[locale]
  const base =
    existing && typeof existing === 'object'
      ? {...(existing as Record<string, unknown>)}
      : {}
  setFields[locale] = {
    ...base,
    mainImage: {
      _type: 'image',
      alt: ALTS[locale],
      asset: {_type: 'reference', _ref: asset._id},
    },
  }
}

const existingDraft = await client.getDocument(DRAFT_ID)
if (!existingDraft) {
  const {_rev, ...rest} = published as Record<string, unknown> & {_rev?: string}
  await client.createOrReplace({...rest, _id: DRAFT_ID, _type: 'post'})
}

await client.patch(DRAFT_ID).set(setFields).commit()
const draft = await client.getDocument(DRAFT_ID)
if (!draft) throw new Error('draft missing')
const {_id, _rev, ...rest} = draft as Record<string, unknown> & {
  _id: string
  _rev?: string
}
await client.createOrReplace({...rest, _id: DOC_ID, _type: 'post'})

const check = await client.fetch(
  `*[_id==$id][0]{ "img": en.mainImage.asset->_id, "alt": en.mainImage.alt, "url": en.mainImage.asset->url }`,
  {id: DOC_ID},
)
console.log('verify', check)
