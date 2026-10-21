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
  pt: {
    Metadata: {
      faqTitle: 'FAQ',
      faqDescription:
        'Respostas claras sobre produtos ëkcos, materiais, Eco-One™, marca própria e encomendas.',
      faqDistributorsTitle: 'FAQ para distribuidores',
      faqDistributorsDescription:
        'Respostas para parceiros sobre produtos, materiais, documentos e colaboração com ëkcos.',
      faqEshopTitle: 'FAQ da loja online',
      faqEshopDescription:
        'Respostas sobre produtos, entrega, pagamento, devoluções e encomendas em eshop.ekcos.eu.',
    },
    nav: { distributors: 'Distribuidores', eshop: 'E-shop' },
    faq: {
      error:
        'Não foi possível carregar esta secção FAQ. Atualize a página.',
      tocLabel: 'Neste FAQ',
      switchLabel: 'Procura um FAQ diferente?',
      nav: { distributors: 'Distribuidores', eshop: 'E-shop' },
      audiences: {
        distributors: { eyebrow: 'Para parceiros' },
        eshop: { eyebrow: 'Para clientes da loja online' },
      },
      hub: {
        title: 'FAQ',
        tagline: 'As suas perguntas, os nossos factos',
        intro:
          'Escolha o FAQ adequado à forma como compra na ëkcos - como parceiro distribuidor ou como cliente da loja online.',
        distributorsDescription:
          'Produtos, materiais, Eco-One™, marca própria, documentos e colaboração com ëkcos.',
        eshopDescription:
          'Produtos, encomendas, pagamento, entrega, devoluções e compras em eshop.ekcos.eu.',
      },
    },
  },
  sv: {
    Metadata: {
      faqTitle: 'FAQ',
      faqDescription:
        'Tydliga svar om ëkcos produkter, material, Eco-One™, private label och beställningar.',
      faqDistributorsTitle: 'FAQ för distributörer',
      faqDistributorsDescription:
        'Svar för partners om produkter, material, dokument och samarbete med ëkcos.',
      faqEshopTitle: 'FAQ för e-handeln',
      faqEshopDescription:
        'Svar om produkter, leverans, betalning, returer och beställningar på eshop.ekcos.eu.',
    },
    nav: { distributors: 'Distributörer', eshop: 'E-shop' },
    faq: {
      error: 'Den här FAQ-sektionen kunde inte laddas. Uppdatera sidan.',
      tocLabel: 'I denna FAQ',
      switchLabel: 'Letar du efter en annan FAQ?',
      nav: { distributors: 'Distributörer', eshop: 'E-shop' },
      audiences: {
        distributors: { eyebrow: 'För partners' },
        eshop: { eyebrow: 'För e-handelskunder' },
      },
      hub: {
        title: 'FAQ',
        tagline: 'Era frågor, våra fakta',
        intro:
          'Välj den FAQ som matchar hur ni handlar hos ëkcos - som distributionspartner eller som e-handelskund.',
        distributorsDescription:
          'Produkter, material, Eco-One™, private label, dokument och samarbete med ëkcos.',
        eshopDescription:
          'Produkter, beställningar, betalning, leverans, returer och shopping på eshop.ekcos.eu.',
      },
    },
  },
  da: {
    Metadata: {
      faqTitle: 'FAQ',
      faqDescription:
        'Klare svar om ëkcos-produkter, materialer, Eco-One™, private label og bestillinger.',
      faqDistributorsTitle: 'FAQ for distributører',
      faqDistributorsDescription:
        'Svar til partnere om produkter, materialer, dokumenter og samarbejde med ëkcos.',
      faqEshopTitle: 'FAQ til webshoppen',
      faqEshopDescription:
        'Svar om produkter, levering, betaling, returnering og bestillinger på eshop.ekcos.eu.',
    },
    nav: { distributors: 'Distributører', eshop: 'E-shop' },
    faq: {
      error: 'Denne FAQ-sektion kunne ikke indlæses. Opdater siden.',
      tocLabel: 'I denne FAQ',
      switchLabel: 'Leder du efter en anden FAQ?',
      nav: { distributors: 'Distributører', eshop: 'E-shop' },
      audiences: {
        distributors: { eyebrow: 'Til partnere' },
        eshop: { eyebrow: 'Til webshopkunder' },
      },
      hub: {
        title: 'FAQ',
        tagline: 'Jeres spørgsmål, vores fakta',
        intro:
          'Vælg den FAQ, der matcher, hvordan I køber hos ëkcos - som distributionspartner eller som webshopkunde.',
        distributorsDescription:
          'Produkter, materialer, Eco-One™, private label, dokumenter og samarbejde med ëkcos.',
        eshopDescription:
          'Produkter, ordrer, betaling, levering, returnering og shopping på eshop.ekcos.eu.',
      },
    },
  },
  fi: {
    Metadata: {
      faqTitle: 'FAQ',
      faqDescription:
        'Selkeät vastaukset ëkcos-tuotteista, materiaaleista, Eco-One™:sta, private labelista ja tilauksista.',
      faqDistributorsTitle: 'FAQ jälleenmyyjille',
      faqDistributorsDescription:
        'Vastauksia kumppaneille tuotteista, materiaaleista, asiakirjoista ja yhteistyöstä ëkcosin kanssa.',
      faqEshopTitle: 'FAQ verkkokaupalle',
      faqEshopDescription:
        'Vastauksia tuotteista, toimituksesta, maksusta, palautuksista ja tilauksista osoitteessa eshop.ekcos.eu.',
    },
    nav: { distributors: 'Jälleenmyyjät', eshop: 'Verkkokauppa' },
    faq: {
      error: 'Tätä FAQ-osiota ei voitu ladata. Päivitä sivu.',
      tocLabel: 'Tässä FAQ:ssa',
      switchLabel: 'Etsitkö toista FAQ:ta?',
      nav: { distributors: 'Jälleenmyyjät', eshop: 'Verkkokauppa' },
      audiences: {
        distributors: { eyebrow: 'Kumppaneille' },
        eshop: { eyebrow: 'Verkkokaupan asiakkaille' },
      },
      hub: {
        title: 'FAQ',
        tagline: 'Kysymyksenne, meidän faktamme',
        intro:
          'Valitse FAQ sen mukaan, miten ostat ëkcosilta - jakelukumppanina tai verkkokaupan asiakkaana.',
        distributorsDescription:
          'Tuotteet, materiaalit, Eco-One™, private label, asiakirjat ja yhteistyö ëkcosin kanssa.',
        eshopDescription:
          'Tuotteet, tilaukset, maksu, toimitus, palautukset ja ostaminen osoitteessa eshop.ekcos.eu.',
      },
    },
  },
  el: {
    Metadata: {
      faqTitle: 'FAQ',
      faqDescription:
        'Σαφείς απαντήσεις για προϊόντα ëkcos, υλικά, Eco-One™, private label και παραγγελίες.',
      faqDistributorsTitle: 'FAQ για διανομείς',
      faqDistributorsDescription:
        'Απαντήσεις για συνεργάτες σχετικά με προϊόντα, υλικά, έγγραφα και συνεργασία με την ëkcos.',
      faqEshopTitle: 'FAQ για το e-shop',
      faqEshopDescription:
        'Απαντήσεις για προϊόντα, παράδοση, πληρωμή, επιστροφές και παραγγελίες στο eshop.ekcos.eu.',
    },
    nav: { distributors: 'Διανομείς', eshop: 'E-shop' },
    faq: {
      error:
        'Αυτή η ενότητα FAQ δεν μπόρεσε να φορτωθεί. Ανανεώστε τη σελίδα.',
      tocLabel: 'Σε αυτό το FAQ',
      switchLabel: 'Ψάχνετε για άλλο FAQ;',
      nav: { distributors: 'Διανομείς', eshop: 'E-shop' },
      audiences: {
        distributors: { eyebrow: 'Για συνεργάτες' },
        eshop: { eyebrow: 'Για πελάτες e-shop' },
      },
      hub: {
        title: 'FAQ',
        tagline: 'Οι ερωτήσεις σας, τα γεγονότα μας',
        intro:
          'Επιλέξτε το FAQ που ταιριάζει στον τρόπο που αγοράζετε από την ëkcos - ως συνεργάτης διανομής ή ως πελάτης e-shop.',
        distributorsDescription:
          'Προϊόντα, υλικά, Eco-One™, private label, έγγραφα και συνεργασία με την ëkcos.',
        eshopDescription:
          'Προϊόντα, παραγγελίες, πληρωμή, παράδοση, επιστροφές και αγορές στο eshop.ekcos.eu.',
      },
    },
  },
  hu: {
    Metadata: {
      faqTitle: 'GYIK',
      faqDescription:
        'Egyértelmű válaszok az ëkcos termékekről, anyagokról, az Eco-One™-ról, a saját márkáról és a rendelésről.',
      faqDistributorsTitle: 'GYIK disztribútoroknak',
      faqDistributorsDescription:
        'Válaszok partnereknek a termékekről, anyagokról, dokumentumokról és az ëkcos-szal való együttműködésről.',
      faqEshopTitle: 'GYIK az e-shophoz',
      faqEshopDescription:
        'Válaszok a termékekről, szállításról, fizetésről, visszaküldésről és a rendelésről az eshop.ekcos.eu oldalon.',
    },
    nav: { distributors: 'Disztribútorok', eshop: 'E-shop' },
    faq: {
      error: 'Ezt a GYIK-szekciót nem sikerült betölteni. Frissítse az oldalt.',
      tocLabel: 'Ebben a GYIK-ben',
      switchLabel: 'Másik GYIK-et keres?',
      nav: { distributors: 'Disztribútorok', eshop: 'E-shop' },
      audiences: {
        distributors: { eyebrow: 'Partnereknek' },
        eshop: { eyebrow: 'E-shop ügyfeleknek' },
      },
      hub: {
        title: 'GYIK',
        tagline: 'Az Ön kérdései, a mi tényeink',
        intro:
          'Válassza ki a GYIK-et aszerint, hogyan vásárol az ëkcos-tól - disztribútori partnerként vagy e-shop ügyfélként.',
        distributorsDescription:
          'Termékek, anyagok, Eco-One™, saját márka, dokumentumok és együttműködés az ëkcos-szal.',
        eshopDescription:
          'Termékek, rendelések, fizetés, szállítás, visszaküldés és vásárlás az eshop.ekcos.eu oldalon.',
      },
    },
  },
  ro: {
    Metadata: {
      faqTitle: 'FAQ',
      faqDescription:
        'Răspunsuri clare despre produsele ëkcos, materiale, Eco-One™, private label și comenzi.',
      faqDistributorsTitle: 'FAQ pentru distribuitori',
      faqDistributorsDescription:
        'Răspunsuri pentru parteneri despre produse, materiale, documente și colaborarea cu ëkcos.',
      faqEshopTitle: 'FAQ pentru e-shop',
      faqEshopDescription:
        'Răspunsuri despre produse, livrare, plată, retururi și comenzi pe eshop.ekcos.eu.',
    },
    nav: { distributors: 'Distribuitori', eshop: 'E-shop' },
    faq: {
      error:
        'Această secțiune FAQ nu a putut fi încărcată. Reîmprospătați pagina.',
      tocLabel: 'În acest FAQ',
      switchLabel: 'Căutați un alt FAQ?',
      nav: { distributors: 'Distribuitori', eshop: 'E-shop' },
      audiences: {
        distributors: { eyebrow: 'Pentru parteneri' },
        eshop: { eyebrow: 'Pentru clienții e-shop' },
      },
      hub: {
        title: 'FAQ',
        tagline: 'Întrebările dvs., faptele noastre',
        intro:
          'Alegeți FAQ-ul potrivit modului în care cumpărați de la ëkcos - ca partener distribuitor sau ca client e-shop.',
        distributorsDescription:
          'Produse, materiale, Eco-One™, private label, documente și colaborare cu ëkcos.',
        eshopDescription:
          'Produse, comenzi, plată, livrare, retururi și cumpărături pe eshop.ekcos.eu.',
      },
    },
  },
  bg: {
    Metadata: {
      faqTitle: 'ЧЗВ',
      faqDescription:
        'Ясни отговори за продуктите на ëkcos, материалите, Eco-One™, private label и поръчките.',
      faqDistributorsTitle: 'ЧЗВ за дистрибутори',
      faqDistributorsDescription:
        'Отговори за партньори относно продукти, материали, документи и работа с ëkcos.',
      faqEshopTitle: 'ЧЗВ за онлайн магазина',
      faqEshopDescription:
        'Отговори за продукти, доставка, плащане, връщания и поръчки на eshop.ekcos.eu.',
    },
    nav: { distributors: 'Дистрибутори', eshop: 'E-shop' },
    faq: {
      error:
        'Този раздел ЧЗВ не можа да бъде зареден. Моля, презаредете страницата.',
      tocLabel: 'В това ЧЗВ',
      switchLabel: 'Търсите друго ЧЗВ?',
      nav: { distributors: 'Дистрибутори', eshop: 'E-shop' },
      audiences: {
        distributors: { eyebrow: 'За партньори' },
        eshop: { eyebrow: 'За клиенти на онлайн магазина' },
      },
      hub: {
        title: 'ЧЗВ',
        tagline: 'Вашите въпроси, нашите факти',
        intro:
          'Изберете ЧЗВ според начина, по който купувате от ëkcos - като дистрибуторски партньор или като клиент на онлайн магазина.',
        distributorsDescription:
          'Продукти, материали, Eco-One™, private label, документи и работа с ëkcos.',
        eshopDescription:
          'Продукти, поръчки, плащане, доставка, връщания и пазаруване на eshop.ekcos.eu.',
      },
    },
  },
  hr: {
    Metadata: {
      faqTitle: 'FAQ',
      faqDescription:
        'Jasni odgovori o ëkcos proizvodima, materijalima, Eco-One™, private labelu i narudžbama.',
      faqDistributorsTitle: 'FAQ za distributere',
      faqDistributorsDescription:
        'Odgovori za partnere o proizvodima, materijalima, dokumentima i suradnji s ëkcos.',
      faqEshopTitle: 'FAQ za e-trgovinu',
      faqEshopDescription:
        'Odgovori o proizvodima, dostavi, plaćanju, povratima i narudžbama na eshop.ekcos.eu.',
    },
    nav: { distributors: 'Distributeri', eshop: 'E-shop' },
    faq: {
      error: 'Ovaj FAQ odjeljak nije se mogao učitati. Osvježite stranicu.',
      tocLabel: 'U ovom FAQ-u',
      switchLabel: 'Tražite drugi FAQ?',
      nav: { distributors: 'Distributeri', eshop: 'E-shop' },
      audiences: {
        distributors: { eyebrow: 'Za partnere' },
        eshop: { eyebrow: 'Za kupce e-trgovine' },
      },
      hub: {
        title: 'FAQ',
        tagline: 'Vaša pitanja, naše činjenice',
        intro:
          'Odaberite FAQ prema tome kako kupujete od ëkcos - kao distributerski partner ili kao kupac e-trgovine.',
        distributorsDescription:
          'Proizvodi, materijali, Eco-One™, private label, dokumenti i suradnja s ëkcos.',
        eshopDescription:
          'Proizvodi, narudžbe, plaćanje, dostava, povrati i kupovina na eshop.ekcos.eu.',
      },
    },
  },
  sl: {
    Metadata: {
      faqTitle: 'FAQ',
      faqDescription:
        'Jasni odgovori o izdelkih ëkcos, materialih, Eco-One™, private labelu in naročilih.',
      faqDistributorsTitle: 'FAQ za distributerje',
      faqDistributorsDescription:
        'Odgovori za partnerje o izdelkih, materialih, dokumentih in sodelovanju z ëkcos.',
      faqEshopTitle: 'FAQ za spletno trgovino',
      faqEshopDescription:
        'Odgovori o izdelkih, dostavi, plačilu, vračilih in naročilih na eshop.ekcos.eu.',
    },
    nav: { distributors: 'Distributerji', eshop: 'E-shop' },
    faq: {
      error: 'Tega razdelka FAQ ni bilo mogoče naložiti. Osvežite stran.',
      tocLabel: 'V tem FAQ',
      switchLabel: 'Iščete drug FAQ?',
      nav: { distributors: 'Distributerji', eshop: 'E-shop' },
      audiences: {
        distributors: { eyebrow: 'Za partnerje' },
        eshop: { eyebrow: 'Za kupce spletne trgovine' },
      },
      hub: {
        title: 'FAQ',
        tagline: 'Vaša vprašanja, naša dejstva',
        intro:
          'Izberite FAQ glede na to, kako kupujete pri ëkcos - kot distributerski partner ali kot kupec spletne trgovine.',
        distributorsDescription:
          'Izdelki, materiali, Eco-One™, private label, dokumenti in sodelovanje z ëkcos.',
        eshopDescription:
          'Izdelki, naročila, plačilo, dostava, vračila in nakupovanje na eshop.ekcos.eu.',
      },
    },
  },
  et: {
    Metadata: {
      faqTitle: 'KKK',
      faqDescription:
        'Selged vastused ëkcos toodete, materjalide, Eco-One™, private labeli ja tellimuste kohta.',
      faqDistributorsTitle: 'KKK edasimüüjatele',
      faqDistributorsDescription:
        'Vastused partneritele toodete, materjalide, dokumentide ja ëkcosiga koostöö kohta.',
      faqEshopTitle: 'KKK e-poe jaoks',
      faqEshopDescription:
        'Vastused toodete, tarne, makse, tagastuste ja tellimuste kohta aadressil eshop.ekcos.eu.',
    },
    nav: { distributors: 'Distribuutorid', eshop: 'E-pood' },
    faq: {
      error: 'Seda KKK jaotist ei õnnestunud laadida. Värskendage lehte.',
      tocLabel: 'Selles KKK-s',
      switchLabel: 'Otsite teist KKK-d?',
      nav: { distributors: 'Distribuutorid', eshop: 'E-pood' },
      audiences: {
        distributors: { eyebrow: 'Partneritele' },
        eshop: { eyebrow: 'E-poe klientidele' },
      },
      hub: {
        title: 'KKK',
        tagline: 'Teie küsimused, meie faktid',
        intro:
          'Valige KKK vastavalt sellele, kuidas te ëkcosilt ostate - edasimüüja partnerina või e-poe kliendina.',
        distributorsDescription:
          'Tooted, materjalid, Eco-One™, private label, dokumendid ja koostöö ëkcosiga.',
        eshopDescription:
          'Tooted, tellimused, makse, tarne, tagastused ja ostmine aadressil eshop.ekcos.eu.',
      },
    },
  },
  lv: {
    Metadata: {
      faqTitle: 'BUJ',
      faqDescription:
        'Skaidras atbildes par ëkcos produktiem, materiāliem, Eco-One™, private label un pasūtījumiem.',
      faqDistributorsTitle: 'BUJ izplatītājiem',
      faqDistributorsDescription:
        'Atbildes partneriem par produktiem, materiāliem, dokumentiem un sadarbību ar ëkcos.',
      faqEshopTitle: 'BUJ e-veikalam',
      faqEshopDescription:
        'Atbildes par produktiem, piegādi, maksājumu, atgriešanu un pasūtījumiem vietnē eshop.ekcos.eu.',
    },
    nav: { distributors: 'Izplatītāji', eshop: 'E-veikals' },
    faq: {
      error: 'Šo BUJ sadaļu neizdevās ielādēt. Atsvaidziniet lapu.',
      tocLabel: 'Šajā BUJ',
      switchLabel: 'Meklējat citu BUJ?',
      nav: { distributors: 'Izplatītāji', eshop: 'E-veikals' },
      audiences: {
        distributors: { eyebrow: 'Partneriem' },
        eshop: { eyebrow: 'E-veikala klientiem' },
      },
      hub: {
        title: 'BUJ',
        tagline: 'Jūsu jautājumi, mūsu fakti',
        intro:
          'Izvēlieties BUJ atbilstoši tam, kā pērkat no ëkcos - kā izplatītāja partneris vai kā e-veikala klients.',
        distributorsDescription:
          'Produkti, materiāli, Eco-One™, private label, dokumenti un sadarbība ar ëkcos.',
        eshopDescription:
          'Produkti, pasūtījumi, maksājums, piegāde, atgriešana un iepirkšanās vietnē eshop.ekcos.eu.',
      },
    },
  },
  lt: {
    Metadata: {
      faqTitle: 'DUK',
      faqDescription:
        'Aiškūs atsakymai apie ëkcos produktus, medžiagas, Eco-One™, private label ir užsakymus.',
      faqDistributorsTitle: 'DUK platintojams',
      faqDistributorsDescription:
        'Atsakymai partneriams apie produktus, medžiagas, dokumentus ir bendradarbiavimą su ëkcos.',
      faqEshopTitle: 'DUK el. parduotuvei',
      faqEshopDescription:
        'Atsakymai apie produktus, pristatymą, mokėjimą, grąžinimus ir užsakymus eshop.ekcos.eu.',
    },
    nav: { distributors: 'Platintojai', eshop: 'E. parduotuvė' },
    faq: {
      error: 'Šios DUK skilties nepavyko įkelti. Atnaujinkite puslapį.',
      tocLabel: 'Šiame DUK',
      switchLabel: 'Ieškote kito DUK?',
      nav: { distributors: 'Platintojai', eshop: 'E. parduotuvė' },
      audiences: {
        distributors: { eyebrow: 'Partneriams' },
        eshop: { eyebrow: 'El. parduotuvės klientams' },
      },
      hub: {
        title: 'DUK',
        tagline: 'Jūsų klausimai, mūsų faktai',
        intro:
          'Pasirinkite DUK pagal tai, kaip perkate iš ëkcos - kaip platintojo partneris arba kaip el. parduotuvės klientas.',
        distributorsDescription:
          'Produktai, medžiagos, Eco-One™, private label, dokumentai ir bendradarbiavimas su ëkcos.',
        eshopDescription:
          'Produktai, užsakymai, mokėjimas, pristatymas, grąžinimai ir apsipirkimas eshop.ekcos.eu.',
      },
    },
  },
}

function applyPack(locale: string, pack: Pack) {
  const path = join(DIR, `${locale}.json`)
  const data = JSON.parse(readFileSync(path, 'utf8')) as {
    Metadata: Record<string, string>
    nav: { faq?: { label?: string } }
    faq?: unknown
  }
  Object.assign(data.Metadata, pack.Metadata)
  const hubTitle = (pack.faq as { hub?: { title?: string } }).hub?.title
  data.nav.faq = {
    label: hubTitle ?? data.nav.faq?.label ?? 'FAQ',
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

console.log(
  'done',
  readdirSync(DIR).filter((f) => f.endsWith('.json')).length,
)
