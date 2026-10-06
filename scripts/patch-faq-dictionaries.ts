import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const DIR = join(import.meta.dir, '../dictionaries')

type Pack = {
  Metadata: Record<string, string>
  nav: { distributors: string; eshop: string }
  faq: Record<string, unknown>
}

const packs: Record<string, Pack> = {
  en: {
    Metadata: {
      faqTitle: 'FAQ',
      faqDescription:
        'Clear answers about ëkcos products, materials, Eco-One™, private label, and ordering.',
      faqDistributorsTitle: 'FAQ for distributors',
      faqDistributorsDescription:
        'Answers for partners about products, materials, documents, and working with ëkcos.',
      faqEshopTitle: 'FAQ for the e-shop',
      faqEshopDescription:
        'Answers about products, delivery, payment, returns, and ordering on eshop.ekcos.eu.',
    },
    nav: { distributors: 'Distributors', eshop: 'E-shop' },
    faq: {
      error: 'This FAQ section could not be loaded. Please refresh the page.',
      tocLabel: 'In this FAQ',
      switchLabel: 'Looking for a different FAQ?',
      nav: { distributors: 'Distributors', eshop: 'E-shop' },
      audiences: {
        distributors: { eyebrow: 'For partners' },
        eshop: { eyebrow: 'For e-shop customers' },
      },
      hub: {
        title: 'FAQ',
        tagline: 'Your questions, our facts',
        intro:
          'Choose the FAQ that matches how you buy from ëkcos - as a distributor partner, or as an e-shop customer.',
        distributorsDescription:
          'Products, materials, Eco-One™, private label, documents, and working with ëkcos.',
        eshopDescription:
          'Products, orders, payment, delivery, returns, and shopping on eshop.ekcos.eu.',
      },
    },
  },
  cs: {
    Metadata: {
      faqTitle: 'FAQ',
      faqDescription:
        'Jasné odpovědi k výrobkům ëkcos, materiálům, Eco-One™, privátní značce a objednávkám.',
      faqDistributorsTitle: 'FAQ pro distributory',
      faqDistributorsDescription:
        'Odpovědi pro partnery k výrobkům, materiálům, dokumentům a spolupráci s ëkcos.',
      faqEshopTitle: 'FAQ pro e-shop',
      faqEshopDescription:
        'Odpovědi k výrobkům, dopravě, platbě, reklamacím a objednávkám na eshop.ekcos.eu.',
    },
    nav: { distributors: 'Distributoři', eshop: 'E-shop' },
    faq: {
      error: 'Tuto sekci FAQ se nepodařilo načíst. Obnovte prosím stránku.',
      tocLabel: 'Obsah',
      switchLabel: 'Hledáte jiné FAQ?',
      nav: { distributors: 'Distributoři', eshop: 'E-shop' },
      audiences: {
        distributors: { eyebrow: 'Pro partnery' },
        eshop: { eyebrow: 'Pro zákazníky e-shopu' },
      },
      hub: {
        title: 'FAQ',
        tagline: 'Vaše otázky, naše fakta',
        intro:
          'Vyberte FAQ podle toho, jak od ëkcos nakupujete - jako partnerský distributor, nebo jako zákazník e-shopu.',
        distributorsDescription:
          'Výrobky, materiály, Eco-One™, privátní značka, dokumenty a spolupráce s ëkcos.',
        eshopDescription:
          'Výrobky, objednávky, platba, doprava, reklamace a nákup na eshop.ekcos.eu.',
      },
    },
  },
  sk: {
    Metadata: {
      faqTitle: 'FAQ',
      faqDescription:
        'Jasné odpovede k výrobkom ëkcos, materiálom, Eco-One™, privátnej značke a objednávkam.',
      faqDistributorsTitle: 'FAQ pre distributorov',
      faqDistributorsDescription:
        'Odpovede pre partnerov k výrobkom, materiálom, dokumentom a spolupráci s ëkcos.',
      faqEshopTitle: 'FAQ pre e-shop',
      faqEshopDescription:
        'Odpovede k výrobkom, doprave, platbe, reklamáciám a objednávkam na eshop.ekcos.eu.',
    },
    nav: { distributors: 'Distributori', eshop: 'E-shop' },
    faq: {
      error: 'Túto sekciu FAQ sa nepodarilo načítať. Obnovte prosím stránku.',
      tocLabel: 'Obsah',
      switchLabel: 'Hľadáte iné FAQ?',
      nav: { distributors: 'Distributori', eshop: 'E-shop' },
      audiences: {
        distributors: { eyebrow: 'Pre partnerov' },
        eshop: { eyebrow: 'Pre zákazníkov e-shopu' },
      },
      hub: {
        title: 'FAQ',
        tagline: 'Vaše otázky, naše fakty',
        intro:
          'Vyberte FAQ podľa toho, ako od ëkcos nakupujete - ako partnerský distributor, alebo ako zákazník e-shopu.',
        distributorsDescription:
          'Výrobky, materiály, Eco-One™, privátna značka, dokumenty a spolupráca s ëkcos.',
        eshopDescription:
          'Výrobky, objednávky, platba, doprava, reklamácie a nákup na eshop.ekcos.eu.',
      },
    },
  },
  de: {
    Metadata: {
      faqTitle: 'FAQ',
      faqDescription:
        'Klare Antworten zu ëkcos Produkten, Materialien, Eco-One™, Private Label und Bestellungen.',
      faqDistributorsTitle: 'FAQ für Distributoren',
      faqDistributorsDescription:
        'Antworten für Partner zu Produkten, Materialien, Dokumenten und der Zusammenarbeit mit ëkcos.',
      faqEshopTitle: 'FAQ für den E-Shop',
      faqEshopDescription:
        'Antworten zu Produkten, Lieferung, Zahlung, Retouren und Bestellungen auf eshop.ekcos.eu.',
    },
    nav: { distributors: 'Distributoren', eshop: 'E-Shop' },
    faq: {
      error:
        'Dieser FAQ-Bereich konnte nicht geladen werden. Bitte laden Sie die Seite neu.',
      tocLabel: 'In diesem FAQ',
      switchLabel: 'Suchen Sie ein anderes FAQ?',
      nav: { distributors: 'Distributoren', eshop: 'E-Shop' },
      audiences: {
        distributors: { eyebrow: 'Für Partner' },
        eshop: { eyebrow: 'Für E-Shop-Kunden' },
      },
      hub: {
        title: 'FAQ',
        tagline: 'Ihre Fragen, unsere Fakten',
        intro:
          'Wählen Sie das FAQ, das zu Ihrer Art zu kaufen passt - als Distributionspartner oder als E-Shop-Kunde.',
        distributorsDescription:
          'Produkte, Materialien, Eco-One™, Private Label, Dokumente und Zusammenarbeit mit ëkcos.',
        eshopDescription:
          'Produkte, Bestellungen, Zahlung, Lieferung, Retouren und Einkauf auf eshop.ekcos.eu.',
      },
    },
  },
  pl: {
    Metadata: {
      faqTitle: 'FAQ',
      faqDescription:
        'Jasne odpowiedzi o produktach ëkcos, materiałach, Eco-One™, private label i zamówieniach.',
      faqDistributorsTitle: 'FAQ dla dystrybutorów',
      faqDistributorsDescription:
        'Odpowiedzi dla partnerów o produktach, materiałach, dokumentach i współpracy z ëkcos.',
      faqEshopTitle: 'FAQ dla e-sklepu',
      faqEshopDescription:
        'Odpowiedzi o produktach, dostawie, płatności, zwrotach i zamówieniach na eshop.ekcos.eu.',
    },
    nav: { distributors: 'Dystrybutorzy', eshop: 'E-sklep' },
    faq: {
      error: 'Nie udało się wczytać tej sekcji FAQ. Odśwież stronę.',
      tocLabel: 'W tym FAQ',
      switchLabel: 'Szukasz innego FAQ?',
      nav: { distributors: 'Dystrybutorzy', eshop: 'E-sklep' },
      audiences: {
        distributors: { eyebrow: 'Dla partnerów' },
        eshop: { eyebrow: 'Dla klientów e-sklepu' },
      },
      hub: {
        title: 'FAQ',
        tagline: 'Wasze pytania, nasze fakty',
        intro:
          'Wybierz FAQ dopasowane do sposobu zakupu - jako dystrybutor partnerski lub jako klient e-sklepu.',
        distributorsDescription:
          'Produkty, materiały, Eco-One™, private label, dokumenty i współpraca z ëkcos.',
        eshopDescription:
          'Produkty, zamówienia, płatność, dostawa, zwroty i zakupy na eshop.ekcos.eu.',
      },
    },
  },
  fr: {
    Metadata: {
      faqTitle: 'FAQ',
      faqDescription:
        'Réponses claires sur les produits ëkcos, les matériaux, Eco-One™, la marque privée et les commandes.',
      faqDistributorsTitle: 'FAQ distributeurs',
      faqDistributorsDescription:
        'Réponses pour les partenaires sur les produits, matériaux, documents et la collaboration avec ëkcos.',
      faqEshopTitle: 'FAQ e-shop',
      faqEshopDescription:
        'Réponses sur les produits, la livraison, le paiement, les retours et les commandes sur eshop.ekcos.eu.',
    },
    nav: { distributors: 'Distributeurs', eshop: 'E-shop' },
    faq: {
      error:
        'Cette section FAQ n’a pas pu être chargée. Veuillez actualiser la page.',
      tocLabel: 'Dans cette FAQ',
      switchLabel: 'Vous cherchez une autre FAQ ?',
      nav: { distributors: 'Distributeurs', eshop: 'E-shop' },
      audiences: {
        distributors: { eyebrow: 'Pour les partenaires' },
        eshop: { eyebrow: 'Pour les clients e-shop' },
      },
      hub: {
        title: 'FAQ',
        tagline: 'Vos questions, nos faits',
        intro:
          'Choisissez la FAQ adaptée à votre façon d’acheter chez ëkcos - en tant que distributeur partenaire ou client e-shop.',
        distributorsDescription:
          'Produits, matériaux, Eco-One™, marque privée, documents et collaboration avec ëkcos.',
        eshopDescription:
          'Produits, commandes, paiement, livraison, retours et achats sur eshop.ekcos.eu.',
      },
    },
  },
  es: {
    Metadata: {
      faqTitle: 'FAQ',
      faqDescription:
        'Respuestas claras sobre productos ëkcos, materiales, Eco-One™, marca privada y pedidos.',
      faqDistributorsTitle: 'FAQ para distribuidores',
      faqDistributorsDescription:
        'Respuestas para partners sobre productos, materiales, documentos y colaboración con ëkcos.',
      faqEshopTitle: 'FAQ de la tienda online',
      faqEshopDescription:
        'Respuestas sobre productos, entrega, pago, devoluciones y pedidos en eshop.ekcos.eu.',
    },
    nav: { distributors: 'Distribuidores', eshop: 'E-shop' },
    faq: {
      error: 'No se pudo cargar esta sección FAQ. Actualice la página.',
      tocLabel: 'En este FAQ',
      switchLabel: '¿Busca otro FAQ?',
      nav: { distributors: 'Distribuidores', eshop: 'E-shop' },
      audiences: {
        distributors: { eyebrow: 'Para partners' },
        eshop: { eyebrow: 'Para clientes de la tienda' },
      },
      hub: {
        title: 'FAQ',
        tagline: 'Sus preguntas, nuestros hechos',
        intro:
          'Elija el FAQ según cómo compra en ëkcos: como distribuidor partner o como cliente de la tienda online.',
        distributorsDescription:
          'Productos, materiales, Eco-One™, marca privada, documentos y colaboración con ëkcos.',
        eshopDescription:
          'Productos, pedidos, pago, entrega, devoluciones y compras en eshop.ekcos.eu.',
      },
    },
  },
  it: {
    Metadata: {
      faqTitle: 'FAQ',
      faqDescription:
        'Risposte chiare su prodotti ëkcos, materiali, Eco-One™, private label e ordini.',
      faqDistributorsTitle: 'FAQ per distributori',
      faqDistributorsDescription:
        'Risposte per i partner su prodotti, materiali, documenti e collaborazione con ëkcos.',
      faqEshopTitle: 'FAQ e-shop',
      faqEshopDescription:
        'Risposte su prodotti, consegna, pagamento, resi e ordini su eshop.ekcos.eu.',
    },
    nav: { distributors: 'Distributori', eshop: 'E-shop' },
    faq: {
      error: 'Impossibile caricare questa sezione FAQ. Aggiorna la pagina.',
      tocLabel: 'In questa FAQ',
      switchLabel: 'Cerchi un’altra FAQ?',
      nav: { distributors: 'Distributori', eshop: 'E-shop' },
      audiences: {
        distributors: { eyebrow: 'Per i partner' },
        eshop: { eyebrow: 'Per i clienti e-shop' },
      },
      hub: {
        title: 'FAQ',
        tagline: 'Le vostre domande, i nostri fatti',
        intro:
          'Scegliete la FAQ in base a come acquistate da ëkcos - come distributore partner o come cliente e-shop.',
        distributorsDescription:
          'Prodotti, materiali, Eco-One™, private label, documenti e collaborazione con ëkcos.',
        eshopDescription:
          'Prodotti, ordini, pagamento, consegna, resi e acquisti su eshop.ekcos.eu.',
      },
    },
  },
  nl: {
    Metadata: {
      faqTitle: 'FAQ',
      faqDescription:
        'Duidelijke antwoorden over ëkcos-producten, materialen, Eco-One™, private label en bestellingen.',
      faqDistributorsTitle: 'FAQ voor distributeurs',
      faqDistributorsDescription:
        'Antwoorden voor partners over producten, materialen, documenten en samenwerking met ëkcos.',
      faqEshopTitle: 'FAQ voor de webshop',
      faqEshopDescription:
        'Antwoorden over producten, levering, betaling, retouren en bestellingen op eshop.ekcos.eu.',
    },
    nav: { distributors: 'Distributeurs', eshop: 'Webshop' },
    faq: {
      error: 'Dit FAQ-onderdeel kon niet worden geladen. Vernieuw de pagina.',
      tocLabel: 'In deze FAQ',
      switchLabel: 'Op zoek naar een andere FAQ?',
      nav: { distributors: 'Distributeurs', eshop: 'Webshop' },
      audiences: {
        distributors: { eyebrow: 'Voor partners' },
        eshop: { eyebrow: 'Voor webshopklanten' },
      },
      hub: {
        title: 'FAQ',
        tagline: 'Uw vragen, onze feiten',
        intro:
          'Kies de FAQ die past bij hoe u bij ëkcos koopt - als distributiepartner of als webshopklant.',
        distributorsDescription:
          'Producten, materialen, Eco-One™, private label, documenten en samenwerking met ëkcos.',
        eshopDescription:
          'Producten, bestellingen, betaling, levering, retouren en winkelen op eshop.ekcos.eu.',
      },
    },
  },
}

const navOnly: Record<string, { distributors: string; eshop: string }> = {
  pt: { distributors: 'Distribuidores', eshop: 'E-shop' },
  sv: { distributors: 'Distributörer', eshop: 'E-shop' },
  da: { distributors: 'Distributører', eshop: 'E-shop' },
  fi: { distributors: 'Jälleenmyyjät', eshop: 'Verkkokauppa' },
  el: { distributors: 'Διανομείς', eshop: 'E-shop' },
  hu: { distributors: 'Disztribútorok', eshop: 'E-shop' },
  ro: { distributors: 'Distribuitori', eshop: 'E-shop' },
  bg: { distributors: 'Дистрибутори', eshop: 'E-shop' },
  hr: { distributors: 'Distributeri', eshop: 'E-shop' },
  sl: { distributors: 'Distributerji', eshop: 'E-shop' },
  et: { distributors: 'Distribuutorid', eshop: 'E-pood' },
  lv: { distributors: 'Izplatītāji', eshop: 'E-veikals' },
  lt: { distributors: 'Platintojai', eshop: 'E. parduotuvė' },
}

function applyPack(locale: string, pack: Pack) {
  const path = join(DIR, `${locale}.json`)
  const data = JSON.parse(readFileSync(path, 'utf8')) as {
    Metadata: Record<string, string>
    nav: { faq?: { label?: string } }
    faq?: unknown
  }
  Object.assign(data.Metadata, pack.Metadata)
  data.nav.faq = {
    label: data.nav.faq?.label ?? 'FAQ',
    distributors: pack.nav.distributors,
    eshop: pack.nav.eshop,
  }
  data.faq = pack.faq
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
}

for (const [locale, pack] of Object.entries(packs)) {
  applyPack(locale, pack)
  console.log('updated', locale)
}

for (const [locale, nav] of Object.entries(navOnly)) {
  applyPack(locale, {
    Metadata: packs.en.Metadata,
    nav,
    faq: {
      ...packs.en.faq,
      nav: { distributors: nav.distributors, eshop: nav.eshop },
    },
  })
  console.log('updated', locale, '(en chrome)')
}

console.log(
  'done',
  readdirSync(DIR).filter((f) => f.endsWith('.json')).length,
)
