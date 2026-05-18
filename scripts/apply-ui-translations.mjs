import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function deepSet(obj, pathStr, value) {
  const parts = pathStr.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i]
    if (!cur[p]) cur[p] = {}
    cur = cur[p]
  }
  cur[parts[parts.length - 1]] = value
}

const ui = {
  de: {
    'Metadata.title': 'ëkcos — Premium-Sanitärlösungen',
    'Metadata.description':
      'ëkcos entwickelt Premium-Waschraumlösungen mit Eco-One™-Kompatibilität und Custom Branding für professionelle Objekte.',
    'Metadata.productsTitle': 'Produkte',
    'Metadata.productsDescription':
      'ëkcos-Produkte entdecken: Modelle, Oberflächen und Optionen wählen — dann zum offiziellen Shop.',
    'Metadata.ecoOneTitle': 'Eco-One™',
    'Metadata.ecoOneDescription':
      'Erfahren Sie, wie Eco-One™ verantwortungsvolle End-of-Life-Ergebnisse bei kompatiblen Materialien unterstützt.',
    'Metadata.brandingTitle': 'Custom Branding',
    'Metadata.brandingDescription': 'Eigenmarke, Ausschnitte und Druck für B2B-Programme.',
    'Metadata.contactTitle': 'Kontakt',
    'Metadata.contactDescription':
      'Kontaktieren Sie das ëkcos-Team für Spezifikationen, Programme und Partnerschaften.',
    'LocaleSwitcher.label': 'Sprache',
    'LocaleSwitcher.cs': 'Tschechisch',
    'nav.aria': 'Hauptnavigation',
    'nav.openMenu': 'Menü öffnen',
    'nav.mobileMenuTitle': 'Menü',
    'nav.home.label': 'Start',
    'nav.products.label': 'Produkte',
    'nav.customBranding.label': 'Custom Branding',
    'nav.contact.label': 'Kontakt',
    'footer.tagline':
      'Premium-Sanitärinnovation für professionelle Objekte — entwickelt für Performance, Auftritt und verantwortungsvolle Materialien.',
    'footer.explore': 'Entdecken',
    'footer.newsletterTitle': 'Newsletter',
    'footer.newsletterHint': 'Produktupdates und Programm-News. Jederzeit abmeldbar.',
    'footer.legalNote':
      'Informationswebsite. Käufe erfolgen im offiziellen Shop.',
    'common.shopCta': 'Im Shop auf ekcos.eu kaufen',
    'common.learnMore': 'Mehr erfahren',
    'common.getInTouch': 'Kontakt aufnehmen',
    'newsletter.popupTitle': 'Bleiben Sie informiert',
    'newsletter.popupDescription':
      'Gelegentliche Updates zu Produkten, Eco-One™ und Custom-Branding-Programmen.',
    'newsletter.emailLabel': 'E-Mail',
    'newsletter.emailPlaceholder': 'sie@firma.de',
    'newsletter.submit': 'Abonnieren',
    'newsletter.configureBrevo':
      'Setzen Sie NEXT_PUBLIC_BREVO_FORM_ACTION auf Ihre Brevo-Formular-URL.',
    'newsletter.dismiss': 'Nicht jetzt',
    'home.hero.eyebrow': 'Premium-Sanitärinnovation',
    'home.hero.title': 'Performance zum Spezifizieren. Auftritt, den Gäste merken.',
    'home.hero.subtitle':
      'Entdecken Sie ëkcos Urinal-Siebe, Zubehör und Programme — für professionelle Waschräume, mit Eco-One™-Kompatibilität und Custom Branding.',
    'home.hero.ctaProducts': 'Produkte ansehen',
    'home.hero.ctaEco': 'Eco-One™ entdecken',
    'home.hero.ctaShop': 'Zum Shop',
    'home.ecoTeaser.title': 'Eco-One™: verantwortungsvolles End-of-Life',
    'home.ecoTeaser.body':
      'Eco-One™ ist eine Additiv-Technologie, die kompatiblen Kunststoffen hilft, in biologisch aktiven Umgebungen abzubauen.',
    'home.ecoTeaser.link': 'So funktioniert Eco-One™',
    'home.productsTeaser.title': 'Das Produktsystem erkunden',
    'home.productsTeaser.body':
      'Wechseln Sie Modelle, Oberflächen und Optionen im Vollbild-Konfigurator — ohne Seitenreload.',
    'home.productsTeaser.link': 'Konfigurator öffnen',
    'home.brandingTeaser.title': 'Custom Branding für B2B',
    'home.brandingTeaser.body':
      'Eigenmarke, Ausschnitte und Druckoptionen für Rollouts mit konsistenter Markenstory.',
    'home.brandingTeaser.link': 'Custom Branding',
    'home.trust.title': 'Gebaut für anspruchsvolle Objekte',
    'home.trust.body':
      'Von Campus bis Hospitality: ëkcos fokussiert zuverlässige Hygiene-Performance und einen Premium-Eindruck vor Ort.',
    'home.newsletter.title': 'Spezifikationen, Launches und Programm-Updates',
    'home.newsletter.body':
      'Ein kurzer Newsletter für Facility-Teams und Partner. Kein Ballast.',
    'home.finalCta.title': 'Bereit zu spezifizieren?',
    'home.finalCta.body':
      'Besuchen Sie den offiziellen Shop für Verfügbarkeit oder kontaktieren Sie uns für B2B und Custom Branding.',
    'home.finalCta.shop': 'Shop ekcos.eu',
    'home.finalCta.contact': 'Kontakt',
    'ecoOne.hero.subtitle':
      'Ein Technologieansatz für kompatible Kunststoffe — für verantwortungsvolle End-of-Life-Ergebnisse in biologisch aktiven Umgebungen.',
    'ecoOne.what.title': 'Was Eco-One™ ist',
    'ecoOne.how.title': 'So funktioniert es (überblick)',
    'ecoOne.value.title': 'Warum Teams danach fragen',
    'ecoOne.claims.title': 'Aussagen und Dokumentation',
    'ecoOne.faq.title': 'FAQ',
    'ecoOne.cta.products': 'Produkte durchsuchen',
    'ecoOne.cta.contact': 'Team kontaktieren',
    'customBranding.hero.subtitle':
      'Eigenmarke, Ausschnitte und Druck — für konsistente Rollouts.',
    'customBranding.process.title': 'Ein einfacher Prozess',
    'customBranding.inquiry.title': 'Informationen anfragen',
    'customBranding.inquiry.hint':
      'Nennen Sie Volumen, Regionen und Branding-Anforderungen.',
    'contact.hero.eyebrow': 'Technische & kommerzielle Unterstützung',
    'contact.hero.title': 'Kontakt',
    'contact.hero.subtitle':
      'Kontaktieren Sie uns zu Spezifikationen, Eco-One™-Dokumentation, B2B-Programmen und Custom Branding. Für Einkäufe nutzen Sie den offiziellen Shop.',
    'contact.details.title': 'Kontakt',
    'contact.form.name': 'Name',
    'contact.form.company': 'Firma',
    'contact.form.email': 'E-Mail',
    'contact.form.phone': 'Telefon',
    'contact.form.message': 'Nachricht',
    'contact.form.submit': 'Nachricht senden',
    'contact.form.success': 'Vielen Dank — wir melden uns bald.',
    'contact.form.error': 'Etwas ist schiefgelaufen. Bitte erneut versuchen.',
    'products.page.title': 'Produkte',
    'products.page.intro':
      'Sortiment erkunden. Modelle, Oberflächen und Optionen wechseln — dann zum offiziellen Shop.',
    'products.configurator.color': 'Oberfläche',
    'products.configurator.selectProduct': 'Produkt wählen',
    'products.configurator.fragrance': 'Duftoptionen',
    'products.configurator.benefits': 'Vorteile',
    'products.configurator.useCases': 'Typische Einsatzbereiche',
    'products.configurator.brandingNote': 'Custom Branding für qualifizierte Aufträge verfügbar.',
  },
  es: {
    'Metadata.title': 'ëkcos — Soluciones sanitarias premium',
    'Metadata.description':
      'ëkcos diseña soluciones premium para baños con compatibilidad Eco-One™ y marca personalizada para instalaciones profesionales.',
    'Metadata.productsTitle': 'Productos',
    'Metadata.productsDescription':
      'Explora productos ëkcos: cambia modelos, acabados y opciones — luego visita la tienda oficial.',
    'Metadata.ecoOneTitle': 'Eco-One™',
    'Metadata.ecoOneDescription':
      'Descubre cómo Eco-One™ apoya resultados responsables al final de la vida útil en materiales compatibles.',
    'Metadata.brandingTitle': 'Marca personalizada',
    'Metadata.brandingDescription': 'Marca propia, recortes e impresión para programas B2B.',
    'Metadata.contactTitle': 'Contacto',
    'Metadata.contactDescription':
      'Contacta al equipo ëkcos para especificaciones, programas y alianzas.',
    'LocaleSwitcher.label': 'Idioma',
    'LocaleSwitcher.cs': 'Checo',
    'nav.aria': 'Principal',
    'nav.openMenu': 'Abrir menú',
    'nav.mobileMenuTitle': 'Menú',
    'nav.home.label': 'Inicio',
    'nav.products.label': 'Productos',
    'nav.customBranding.label': 'Marca personalizada',
    'nav.contact.label': 'Contacto',
    'footer.tagline':
      'Innovación sanitaria premium para instalaciones profesionales — diseñada para rendimiento, imagen y materiales responsables.',
    'footer.explore': 'Explorar',
    'footer.newsletterTitle': 'Newsletter',
    'footer.newsletterHint': 'Novedades de producto y programas. Baja cuando quieras.',
    'footer.legalNote':
      'Sitio informativo. Las compras se realizan en la tienda oficial.',
    'common.shopCta': 'Comprar en ekcos.eu',
    'common.learnMore': 'Saber más',
    'common.getInTouch': 'Contacto',
    'newsletter.popupTitle': 'Mantente informado',
    'newsletter.popupDescription':
      'Actualizaciones ocasionales sobre productos, Eco-One™ y programas de marca.',
    'newsletter.emailLabel': 'Email',
    'newsletter.emailPlaceholder': 'tu@empresa.com',
    'newsletter.submit': 'Suscribirse',
    'newsletter.configureBrevo':
      'Configura NEXT_PUBLIC_BREVO_FORM_ACTION con la URL del formulario Brevo.',
    'newsletter.dismiss': 'Ahora no',
    'home.hero.eyebrow': 'Innovación sanitaria premium',
    'home.hero.title': 'Rendimiento para especificar. Una imagen memorable.',
    'home.hero.subtitle':
      'Explora pantallas para urinario, accesorios y programas ëkcos — con compatibilidad Eco-One™ y opciones de marca personalizada.',
    'home.hero.ctaProducts': 'Ver productos',
    'home.hero.ctaEco': 'Descubrir Eco-One™',
    'home.hero.ctaShop': 'Ir a la tienda',
    'home.ecoTeaser.title': 'Eco-One™: fin de vida responsable',
    'home.ecoTeaser.body':
      'Eco-One™ es una tecnología aditiva que ayuda a que plásticos compatibles se biodegraden en entornos biológicamente activos.',
    'home.ecoTeaser.link': 'Cómo funciona Eco-One™',
    'home.productsTeaser.title': 'Explora el sistema de productos',
    'home.productsTeaser.body':
      'Cambia modelos, acabados y opciones en el configurador a pantalla completa — sin recargar la página.',
    'home.productsTeaser.link': 'Abrir configurador',
    'home.brandingTeaser.title': 'Marca personalizada B2B',
    'home.brandingTeaser.body':
      'Marca propia, recortes e impresión para despliegues con narrativa consistente.',
    'home.brandingTeaser.link': 'Marca personalizada',
    'home.trust.title': 'Diseñado para instalaciones exigentes',
    'home.trust.body':
      'De oficinas a hostelería: ëkcos prioriza higiene fiable y una impresión premium in situ.',
    'home.newsletter.title': 'Especificaciones, lanzamientos y novedades',
    'home.newsletter.body':
      'Newsletter breve para equipos de facility y partners. Sin ruido.',
    'home.finalCta.title': '¿Listo para especificar?',
    'home.finalCta.body':
      'Visita la tienda oficial para disponibilidad o contáctanos para B2B y marca personalizada.',
    'home.finalCta.shop': 'Tienda ekcos.eu',
    'home.finalCta.contact': 'Contacto',
    'ecoOne.hero.subtitle':
      'Un enfoque tecnológico para plásticos compatibles — para resultados responsables al final de la vida útil.',
    'ecoOne.what.title': 'Qué es Eco-One™',
    'ecoOne.how.title': 'Cómo funciona (resumen)',
    'ecoOne.value.title': 'Por qué lo piden los equipos',
    'ecoOne.claims.title': 'Afirmaciones y documentación',
    'ecoOne.faq.title': 'FAQ',
    'ecoOne.cta.products': 'Ver productos',
    'ecoOne.cta.contact': 'Hablar con el equipo',
    'customBranding.hero.subtitle':
      'Marca propia, recortes e impresión — para despliegues coherentes.',
    'customBranding.process.title': 'Un proceso sencillo',
    'customBranding.inquiry.title': 'Solicitar información',
    'customBranding.inquiry.hint':
      'Indica volúmenes, regiones y requisitos de marca.',
    'contact.hero.eyebrow': 'Soporte técnico y comercial',
    'contact.hero.title': 'Contacto',
    'contact.hero.subtitle':
      'Escríbanos para especificaciones, documentación Eco-One™, programas B2B y branding personalizado. Para compras, use la tienda oficial.',
    'contact.details.title': 'Contacto',
    'contact.form.name': 'Nombre',
    'contact.form.company': 'Empresa',
    'contact.form.email': 'Email',
    'contact.form.phone': 'Teléfono',
    'contact.form.message': 'Mensaje',
    'contact.form.submit': 'Enviar mensaje',
    'contact.form.success': 'Gracias — te responderemos pronto.',
    'contact.form.error': 'Algo salió mal. Inténtalo de nuevo.',
    'products.page.title': 'Productos',
    'products.page.intro':
      'Explora la gama. Cambia modelos, acabados y opciones — luego visita la tienda oficial.',
    'products.configurator.color': 'Acabado',
    'products.configurator.selectProduct': 'Seleccionar producto',
    'products.configurator.fragrance': 'Opciones de fragancia',
    'products.configurator.benefits': 'Beneficios',
    'products.configurator.useCases': 'Aplicaciones típicas',
    'products.configurator.brandingNote': 'Marca personalizada disponible para pedidos cualificados.',
  },
  fr: {
    'Metadata.title': 'ëkcos — Solutions sanitaires premium',
    'Metadata.description':
      'ëkcos conçoit des solutions premium pour sanitaires avec compatibilité Eco-One™ et marque personnalisée pour les sites professionnels.',
    'Metadata.productsTitle': 'Produits',
    'Metadata.productsDescription':
      'Découvrez les produits ëkcos : modèles, finitions et options — puis rendez-vous sur la boutique officielle.',
    'Metadata.ecoOneTitle': 'Eco-One™',
    'Metadata.ecoOneDescription':
      'Comprenez comment Eco-One™ soutient des résultats responsables en fin de vie pour les matériaux compatibles.',
    'Metadata.brandingTitle': 'Marque personnalisée',
    'Metadata.brandingDescription': 'Marque propre, découpes et impression pour programmes B2B.',
    'Metadata.contactTitle': 'Contact',
    'Metadata.contactDescription':
      'Contactez l’équipe ëkcos pour les spécifications, programmes et partenariats.',
    'LocaleSwitcher.label': 'Langue',
    'LocaleSwitcher.cs': 'Tchèque',
    'nav.aria': 'Principal',
    'nav.openMenu': 'Ouvrir le menu',
    'nav.mobileMenuTitle': 'Menu',
    'nav.home.label': 'Accueil',
    'nav.products.label': 'Produits',
    'nav.customBranding.label': 'Marque personnalisée',
    'nav.contact.label': 'Contact',
    'footer.tagline':
      'Innovation sanitaire premium pour sites professionnels — pensée pour la performance, l’image et des matériaux responsables.',
    'footer.explore': 'Explorer',
    'footer.newsletterTitle': 'Newsletter',
    'footer.newsletterHint': 'Actualités produits et programmes. Désinscription à tout moment.',
    'footer.legalNote':
      'Site d’information. Les achats se finalisent sur la boutique officielle.',
    'common.shopCta': 'Acheter sur ekcos.eu',
    'common.learnMore': 'En savoir plus',
    'common.getInTouch': 'Nous contacter',
    'newsletter.popupTitle': 'Restez informé',
    'newsletter.popupDescription':
      'Mises à jour ponctuelles sur les produits, Eco-One™ et les programmes de marque.',
    'newsletter.emailLabel': 'E-mail',
    'newsletter.emailPlaceholder': 'vous@entreprise.com',
    'newsletter.submit': 'S’abonner',
    'newsletter.configureBrevo':
      'Définissez NEXT_PUBLIC_BREVO_FORM_ACTION sur l’URL du formulaire Brevo.',
    'newsletter.dismiss': 'Pas maintenant',
    'home.hero.eyebrow': 'Innovation sanitaire premium',
    'home.hero.title': 'Des performances à spécifier. Une image mémorable.',
    'home.hero.subtitle':
      'Découvrez les écrans pour urinoirs, accessoires et programmes ëkcos — compatibilité Eco-One™ et options de marque personnalisée.',
    'home.hero.ctaProducts': 'Voir les produits',
    'home.hero.ctaEco': 'Découvrir Eco-One™',
    'home.hero.ctaShop': 'Aller à la boutique',
    'home.ecoTeaser.title': 'Eco-One™ : fin de vie responsable',
    'home.ecoTeaser.body':
      'Eco-One™ est une technologie additive qui aide les plastiques compatibles à se biodégrader dans des environnements biologiquement actifs.',
    'home.ecoTeaser.link': 'Comment fonctionne Eco-One™',
    'home.productsTeaser.title': 'Explorer le système produit',
    'home.productsTeaser.body':
      'Changez modèles, finitions et options dans le configurateur plein écran — sans recharger la page.',
    'home.productsTeaser.link': 'Ouvrir le configurateur',
    'home.brandingTeaser.title': 'Marque personnalisée B2B',
    'home.brandingTeaser.body':
      'Marque propre, découpes et impression pour des déploiements cohérents.',
    'home.brandingTeaser.link': 'Marque personnalisée',
    'home.trust.title': 'Conçu pour les sites exigeants',
    'home.trust.body':
      'Des campus à l’hôtellerie : ëkcos met l’accent sur l’hygiène fiable et une impression premium sur site.',
    'home.newsletter.title': 'Spécifications, lancements et actualités',
    'home.newsletter.body':
      'Une newsletter courte pour les équipes facility et partenaires. Sans superflu.',
    'home.finalCta.title': 'Prêt à spécifier ?',
    'home.finalCta.body':
      'Visitez la boutique officielle pour la disponibilité ou contactez-nous pour le B2B et la marque personnalisée.',
    'home.finalCta.shop': 'Boutique ekcos.eu',
    'home.finalCta.contact': 'Contact',
    'ecoOne.hero.subtitle':
      'Une approche technologique pour plastiques compatibles — pour des résultats responsables en fin de vie.',
    'ecoOne.what.title': 'Ce qu’est Eco-One™',
    'ecoOne.how.title': 'Comment ça fonctionne (aperçu)',
    'ecoOne.value.title': 'Pourquoi les équipes l’exigent',
    'ecoOne.claims.title': 'Affirmations et documentation',
    'ecoOne.faq.title': 'FAQ',
    'ecoOne.cta.products': 'Parcourir les produits',
    'ecoOne.cta.contact': 'Parler à l’équipe',
    'customBranding.hero.subtitle':
      'Marque propre, découpes et impression — pour des déploiements cohérents.',
    'customBranding.process.title': 'Un processus simple',
    'customBranding.inquiry.title': 'Demander des informations',
    'customBranding.inquiry.hint':
      'Indiquez volumes, régions et exigences de marque.',
    'contact.hero.eyebrow': 'Support technique & commercial',
    'contact.hero.title': 'Contact',
    'contact.hero.subtitle':
      'Contactez-nous pour les spécifications, la documentation Eco-One™, les programmes B2B et le branding personnalisé. Pour les achats, utilisez la boutique officielle.',
    'contact.details.title': 'Contact',
    'contact.form.name': 'Nom',
    'contact.form.company': 'Société',
    'contact.form.email': 'E-mail',
    'contact.form.phone': 'Téléphone',
    'contact.form.message': 'Message',
    'contact.form.submit': 'Envoyer le message',
    'contact.form.success': 'Merci — nous revenons vers vous rapidement.',
    'contact.form.error': 'Une erreur s’est produite. Réessayez.',
    'products.page.title': 'Produits',
    'products.page.intro':
      'Explorez la gamme. Changez modèles, finitions et options — puis visitez la boutique officielle.',
    'products.configurator.color': 'Finition',
    'products.configurator.selectProduct': 'Sélectionner un produit',
    'products.configurator.fragrance': 'Options de parfum',
    'products.configurator.benefits': 'Avantages',
    'products.configurator.useCases': 'Applications typiques',
    'products.configurator.brandingNote': 'Marque personnalisée disponible pour commandes qualifiées.',
  },
  it: {
    'Metadata.title': 'ëkcos — Soluzioni sanitarie premium',
    'Metadata.description':
      'ëkcos progetta soluzioni premium per bagni con compatibilità Eco-One™ e branding personalizzato per strutture professionali.',
    'Metadata.productsTitle': 'Prodotti',
    'Metadata.productsDescription':
      'Esplora i prodotti ëkcos: modelli, finiture e opzioni — poi visita lo store ufficiale.',
    'Metadata.ecoOneTitle': 'Eco-One™',
    'Metadata.ecoOneDescription':
      'Scopri come Eco-One™ supporta esiti responsabili a fine vita per materiali compatibili.',
    'Metadata.brandingTitle': 'Branding personalizzato',
    'Metadata.brandingDescription': 'Marchio privato, sagome e stampa per programmi B2B.',
    'Metadata.contactTitle': 'Contatti',
    'Metadata.contactDescription':
      'Contatta il team ëkcos per specifiche, programmi e partnership.',
    'LocaleSwitcher.label': 'Lingua',
    'LocaleSwitcher.cs': 'Ceco',
    'nav.aria': 'Principale',
    'nav.openMenu': 'Apri menu',
    'nav.mobileMenuTitle': 'Menu',
    'nav.home.label': 'Home',
    'nav.products.label': 'Prodotti',
    'nav.customBranding.label': 'Branding personalizzato',
    'nav.contact.label': 'Contatti',
    'footer.tagline':
      'Innovazione sanitaria premium per strutture professionali — progettata per performance, immagine e materiali responsabili.',
    'footer.explore': 'Esplora',
    'footer.newsletterTitle': 'Newsletter',
    'footer.newsletterHint': 'Aggiornamenti su prodotti e programmi. Disiscriviti quando vuoi.',
    'footer.legalNote':
      'Sito informativo. Gli acquisti avvengono nello store ufficiale.',
    'common.shopCta': 'Acquista su ekcos.eu',
    'common.learnMore': 'Scopri di più',
    'common.getInTouch': 'Contattaci',
    'newsletter.popupTitle': 'Resta aggiornato',
    'newsletter.popupDescription':
      'Aggiornamenti occasionali su prodotti, Eco-One™ e programmi di branding.',
    'newsletter.emailLabel': 'Email',
    'newsletter.emailPlaceholder': 'tu@azienda.it',
    'newsletter.submit': 'Iscriviti',
    'newsletter.configureBrevo':
      'Imposta NEXT_PUBLIC_BREVO_FORM_ACTION sull’URL del modulo Brevo.',
    'newsletter.dismiss': 'Non ora',
    'home.hero.eyebrow': 'Innovazione sanitaria premium',
    'home.hero.title': 'Prestazioni da specificare. Un’immagine memorabile.',
    'home.hero.subtitle':
      'Esplora schermi per orinatoio, accessori e programmi ëkcos — con compatibilità Eco-One™ e branding personalizzato.',
    'home.hero.ctaProducts': 'Vedi prodotti',
    'home.hero.ctaEco': 'Scopri Eco-One™',
    'home.hero.ctaShop': 'Vai allo store',
    'home.ecoTeaser.title': 'Eco-One™: fine vita responsabile',
    'home.ecoTeaser.body':
      'Eco-One™ è una tecnologia additiva che aiuta le plastiche compatibili a biodegradarsi in ambienti biologicamente attivi.',
    'home.ecoTeaser.link': 'Come funziona Eco-One™',
    'home.productsTeaser.title': 'Esplora il sistema prodotti',
    'home.productsTeaser.body':
      'Cambia modelli, finiture e opzioni nel configuratore a schermo intero — senza ricaricare la pagina.',
    'home.productsTeaser.link': 'Apri configuratore',
    'home.brandingTeaser.title': 'Branding personalizzato B2B',
    'home.brandingTeaser.body':
      'Marchio privato, sagome e stampa per rollout con narrativa coerente.',
    'home.brandingTeaser.link': 'Branding personalizzato',
    'home.trust.title': 'Progettato per strutture esigenti',
    'home.trust.body':
      'Da campus a hospitality: ëkcos punta su igiene affidabile e un’impressione premium sul posto.',
    'home.newsletter.title': 'Specifiche, lanci e aggiornamenti',
    'home.newsletter.body':
      'Newsletter breve per team facility e partner. Senza rumore.',
    'home.finalCta.title': 'Pronto a specificare?',
    'home.finalCta.body':
      'Visita lo store ufficiale per la disponibilità o contattaci per B2B e branding personalizzato.',
    'home.finalCta.shop': 'Store ekcos.eu',
    'home.finalCta.contact': 'Contatti',
    'ecoOne.hero.subtitle':
      'Un approccio tecnologico per plastiche compatibili — per esiti responsabili a fine vita.',
    'ecoOne.what.title': 'Cos’è Eco-One™',
    'ecoOne.how.title': 'Come funziona (panoramica)',
    'ecoOne.value.title': 'Perché lo chiedono i team',
    'ecoOne.claims.title': 'Dichiarazioni e documentazione',
    'ecoOne.faq.title': 'FAQ',
    'ecoOne.cta.products': 'Sfoglia prodotti',
    'ecoOne.cta.contact': 'Parla con il team',
    'customBranding.hero.subtitle':
      'Marchio privato, sagome e stampa — per rollout coerenti.',
    'customBranding.process.title': 'Un processo semplice',
    'customBranding.inquiry.title': 'Richiedi informazioni',
    'customBranding.inquiry.hint':
      'Indica volumi, regioni e requisiti di branding.',
    'contact.hero.eyebrow': 'Supporto tecnico e commerciale',
    'contact.hero.title': 'Contatti',
    'contact.hero.subtitle':
      'Scriveteci per specifiche, documentazione Eco-One™, programmi B2B e branding personalizzato. Per gli acquisti usate lo store ufficiale.',
    'contact.details.title': 'Contatti',
    'contact.form.name': 'Nome',
    'contact.form.company': 'Azienda',
    'contact.form.email': 'Email',
    'contact.form.phone': 'Telefono',
    'contact.form.message': 'Messaggio',
    'contact.form.submit': 'Invia messaggio',
    'contact.form.success': 'Grazie — ti risponderemo a breve.',
    'contact.form.error': 'Qualcosa è andato storto. Riprova.',
    'products.page.title': 'Prodotti',
    'products.page.intro':
      'Esplora la gamma. Cambia modelli, finiture e opzioni — poi visita lo store ufficiale.',
    'products.configurator.color': 'Finitura',
    'products.configurator.selectProduct': 'Seleziona prodotto',
    'products.configurator.fragrance': 'Opzioni fragranza',
    'products.configurator.benefits': 'Benefici',
    'products.configurator.useCases': 'Applicazioni tipiche',
    'products.configurator.brandingNote': 'Branding personalizzato disponibile per ordini qualificati.',
  },
  cs: {
    'Metadata.title': 'ëkcos — Prémiová sanitární řešení',
    'Metadata.description':
      'ëkcos navrhuje prémiová řešení pro toalety s kompatibilitou Eco-One™ a vlastním brandingem pro profesionální provozy.',
    'Metadata.productsTitle': 'Produkty',
    'Metadata.productsDescription':
      'Prohlédněte si produkty ëkcos: přepínejte modely, povrchové úpravy a varianty — poté přejděte do oficiálního obchodu.',
    'Metadata.ecoOneTitle': 'Eco-One™',
    'Metadata.ecoOneDescription':
      'Zjistěte, jak Eco-One™ podporuje odpovědné chování na konci životnosti u kompatibilních materiálů.',
    'Metadata.brandingTitle': 'Vlastní branding',
    'Metadata.brandingDescription': 'Vlastní značka, výřezy a tisk pro B2B programy.',
    'Metadata.contactTitle': 'Kontakt',
    'Metadata.contactDescription':
      'Kontaktujte tým ëkcos ohledně specifikací, programů a partnerství.',
    'LocaleSwitcher.label': 'Jazyk',
    'LocaleSwitcher.en': 'Angličtina',
    'LocaleSwitcher.es': 'Španělština',
    'LocaleSwitcher.fr': 'Francouzština',
    'LocaleSwitcher.de': 'Němčina',
    'LocaleSwitcher.it': 'Italština',
    'LocaleSwitcher.cs': 'Čeština',
    'nav.aria': 'Hlavní navigace',
    'nav.openMenu': 'Otevřít menu',
    'nav.mobileMenuTitle': 'Menu',
    'nav.home.label': 'Úvod',
    'nav.products.label': 'Produkty',
    'nav.customBranding.label': 'Vlastní branding',
    'nav.contact.label': 'Kontakt',
    'footer.tagline':
      'Prémiová sanitární inovace pro profesionální provozy — navrženo pro výkon, vzhled a odpovědné materiály.',
    'footer.explore': 'Prozkoumat',
    'footer.newsletterTitle': 'Newsletter',
    'footer.newsletterHint': 'Novinky o produktech a programech. Odhlášení kdykoli.',
    'footer.legalNote':
      'Informační web. Nákupy se dokončují v oficiálním obchodě.',
    'common.shopCta': 'Nakoupit na ekcos.eu',
    'common.learnMore': 'Zjistit více',
    'common.getInTouch': 'Kontaktovat nás',
    'newsletter.popupTitle': 'Zůstaňte v obraze',
    'newsletter.popupDescription':
      'Občasné novinky o produktech, Eco-One™ a programech vlastního brandingu.',
    'newsletter.emailLabel': 'E-mail',
    'newsletter.emailPlaceholder': 'vy@firma.cz',
    'newsletter.submit': 'Odebírat',
    'newsletter.configureBrevo':
      'Nastavte NEXT_PUBLIC_BREVO_FORM_ACTION na URL formuláře Brevo.',
    'newsletter.dismiss': 'Teď ne',
    'home.hero.eyebrow': 'Prémiová sanitární inovace',
    'home.hero.title': 'Výkon, který můžete specifikovat. Dojem, na který hosté nezapomenou.',
    'home.hero.subtitle':
      'Objevte síta na pisoár, příslušenství a programy ëkcos — pro profesionální toalety s kompatibilitou Eco-One™ a možností vlastního brandingu.',
    'home.hero.ctaProducts': 'Zobrazit produkty',
    'home.hero.ctaEco': 'Objevit Eco-One™',
    'home.hero.ctaShop': 'Do obchodu',
    'home.ecoTeaser.title': 'Eco-One™: odpovědný konec životnosti',
    'home.ecoTeaser.body':
      'Eco-One™ je aditivní technologie, která pomáhá kompatibilním plastům biodegradovat v biologicky aktivních prostředích.',
    'home.ecoTeaser.link': 'Jak funguje Eco-One™',
    'home.productsTeaser.title': 'Prozkoumejte produktový systém',
    'home.productsTeaser.body':
      'Přepínejte modely, povrchové úpravy a varianty v konfigurátoru na celou obrazovku — bez obnovení stránky.',
    'home.productsTeaser.link': 'Otevřít konfigurátor',
    'home.brandingTeaser.title': 'Vlastní branding pro B2B',
    'home.brandingTeaser.body':
      'Vlastní značka, výřezy a tisk pro nasazení s jednotným brandovým příběhem.',
    'home.brandingTeaser.link': 'Vlastní branding',
    'home.trust.title': 'Navrženo pro náročné provozy',
    'home.trust.body':
      'Od kanceláří po hotely: ëkcos klade důraz na spolehlivou hygienu a prémiový dojem na místě.',
    'home.newsletter.title': 'Specifikace, novinky a programové aktuality',
    'home.newsletter.body':
      'Krátký newsletter pro facility týmy a partnery. Bez balastu.',
    'home.finalCta.title': 'Připraveni specifikovat?',
    'home.finalCta.body':
      'Navštivte oficiální obchod ohledně dostupnosti nebo nás kontaktujte pro B2B a vlastní branding.',
    'home.finalCta.shop': 'Obchod ekcos.eu',
    'home.finalCta.contact': 'Kontakt',
    'ecoOne.hero.subtitle':
      'Technologický přístup ke kompatibilním plastům — pro odpovědné výsledky na konci životnosti v biologicky aktivních prostředích.',
    'ecoOne.what.title': 'Co je Eco-One™',
    'ecoOne.how.title': 'Jak to funguje (přehled)',
    'ecoOne.value.title': 'Proč to týmy chtějí',
    'ecoOne.claims.title': 'Tvrzení a dokumentace',
    'ecoOne.faq.title': 'Časté dotazy',
    'ecoOne.cta.products': 'Prohlédnout produkty',
    'ecoOne.cta.contact': 'Mluvit s týmem',
    'ecoOne.reference.linkLabel': 'Ecologic LLC — jak funguje Eco-One',
    'ecoOne.reference.disclaimer':
      'Externí odkaz pro vzdělávací kontext; vždy ověřte tvrzení pro váš region a aplikaci.',
    'customBranding.hero.subtitle':
      'Vlastní značka, výřezy a tisk — pro konzistentní nasazení.',
    'customBranding.process.title': 'Jednoduchý proces',
    'customBranding.inquiry.title': 'Vyžádat informace',
    'customBranding.inquiry.hint':
      'Uveďte objemy, regiony a požadavky na branding.',
    'contact.hero.eyebrow': 'Technická a obchodní podpora',
    'contact.hero.title': 'Kontakt',
    'contact.hero.subtitle':
      'Kontaktujte nás ohledně specifikací, dokumentace Eco-One™, B2B programů a vlastního brandingu. Na nákupy použijte oficiální obchod.',
    'contact.details.title': 'Kontakt',
    'contact.form.name': 'Jméno',
    'contact.form.company': 'Firma',
    'contact.form.email': 'E-mail',
    'contact.form.phone': 'Telefon',
    'contact.form.message': 'Zpráva',
    'contact.form.submit': 'Odeslat zprávu',
    'contact.form.success': 'Děkujeme — brzy se ozveme.',
    'contact.form.error': 'Něco se pokazilo. Zkuste to znovu.',
    'products.page.title': 'Produkty',
    'products.page.intro':
      'Prohlédněte si nabídku. Přepínejte modely, povrchové úpravy a varianty — poté přejděte do oficiálního obchodu.',
    'products.configurator.color': 'Povrchová úprava',
    'products.configurator.selectProduct': 'Vybrat produkt',
    'products.configurator.fragrance': 'Varianty vůně',
    'products.configurator.benefits': 'Přínosy',
    'products.configurator.productBenefits': 'Přínosy produktu',
    'products.configurator.availableColorsFragrances': 'Dostupné barvy a vůně',
    'products.configurator.sixtyDayBadge': '60denní PLUS protistříkací sítko na pisoár',
    'products.configurator.byBrand': 'značka ëkcos',
    'products.configurator.siteUrl': 'www.ekcos.eu',
    'products.configurator.useCases': 'Typické aplikace',
    'products.configurator.brandingNote': 'Vlastní branding u kvalifikovaných objednávek.',
    'products.xcrenHd.badge': 'Xtreme protistříkací sítko na pisoár',
    'products.xcrenHd.benefits.0':
      'Patentovaný systém štětin pokrývá 95 % plochy, brání stříkání moči a chrání před viry a bakteriemi',
    'products.xcrenHd.benefits.1':
      'Vlastní materiál s vůní na bázi deodorantu, která se uvolňuje postupně 60+ dní',
    'products.xcrenHd.benefits.2':
      'Až dvojnásobná životnost a intenzita vůně oproti běžným produktům na trhu',
    'products.xcrenHd.benefits.3':
      'Navrženo pro rušné toalety — restaurace, bary, letiště, nákupní centra atd.',
    'products.xcrenHd.benefits.4': '100% recyklovatelné a také biologicky odbouratelné',
    'products.xcrenHd.benefits.5': 'Splňuje evropské normy VOC',
    'products.xcrenHd.benefits.6': 'Netoxické pro životní prostředí, zejména vodní zdroje',
    'products.xcrenHd.benefits.7': 'Ideální pro bezvodé pisoáry',
    'products.xcrenHd.benefits.8': 'Jedinečný design, široká škála barev a příjemné vůně',
    'products.xcrenHd.benefits.9': 'Možnost vlastního brandingu výřezy nebo tiskem',
    'products.xcrenHd.variants.xhd1p': 'Fialová / lesní ovoce',
    'products.xcrenHd.variants.xhd2g': 'Světle zelená / jablko',
    'products.xcrenHd.variants.xhd3b': 'Modrá / svěží',
    'products.xcrenHd.variants.xhd4o': 'Oranžová / tropické ovoce',
    'products.xcrenHd.variants.xhd6c': 'Čirá / tropické ovoce',
    'products.xcrenHd.variants.xhd7bk': 'Černá / máta',
    'products.xcrenHd.variants.xhd8bm': 'Plamen / mango',
    'products.xcrenHd.variants.xhd9g': 'Tmavě zelená / borovice',
    'products.xcrenHd.variants.xhd10r': 'Červená / meloun',
    'products.xcrenHd.variants.xhd12p': 'Tmavě fialová / levandule',
    'products.xcrenHd.variants.xhd13c': 'Žlutá / citrus',
  },
}

for (const [locale, paths] of Object.entries(ui)) {
  const base = JSON.parse(fs.readFileSync(path.join(root, 'dictionaries/en.json'), 'utf8'))
  for (const [p, val] of Object.entries(paths)) {
    deepSet(base, p, val)
  }
  fs.writeFileSync(
    path.join(root, `dictionaries/${locale}.json`),
    JSON.stringify(base, null, 2),
    'utf8',
  )
  console.log('Wrote dictionaries/' + locale + '.json')
}
