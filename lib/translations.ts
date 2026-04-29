export const translations: Record<string, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "home",
    "nav.dashboard": "Dashboard",
    "nav.invoices": "Invoices",
    "nav.new_invoice": "New invoice",
    "nav.products": "Products",
    "nav.clients": "Clients",
    "nav.stats": "Stats",
    "nav.migrate": "Why migrate?",

    // Engines
    "engine.postgres": "PostgreSQL",
    "engine.mongodb": "MongoDB",

    // Home page
    "home.title": "Facturia",
    "home.subtitle":
      "The same invoicing app, built twice — once on PostgreSQL, once on MongoDB. Every page shows how long its query took. Compare. Decide.",
    "home.postgres.title": "PostgreSQL",
    "home.postgres.desc":
      "Normalized schema, 500 clients / 1 000 products / 10 000 invoices, read via Prisma.",
    "home.postgres.detail": "JOIN-heavy queries. This is the baseline.",
    "home.migrate.title": "Why migrate?",
    "home.migrate.desc":
      "Where the relational model stops helping and the document model starts.",
    "home.migrate.detail": "Read this before comparing the two sides.",
    "home.mongo.title": "MongoDB",
    "home.mongo.desc":
      "Document-oriented schema, invoices embed their line items and a client snapshot.",
    "home.mongo.detail": "Empty by default — run the n8n ETL workflow to populate it.",
    "home.how_to_read": "How to read the numbers",
    "home.badge_explanation":
      "Each data page displays a ⏱ badge showing the query duration in milliseconds.",
    "home.cold_start":
      "The first request after the server starts is always cold — reload once or twice for warm timings.",
    "home.timing_coverage":
      "Timing covers only the database call, not React rendering or network transport.",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.postgres.subtitle":
      "Counts + 5 most recent invoices (JOIN on clients)",
    "dashboard.mongo.subtitle":
      "Counts + 5 most recent invoices (no JOIN needed — client is embedded)",
    "dashboard.label.postgres": "COUNT × 3 + JOIN",
    "dashboard.label.mongo": "3 counts + 1 find",
    "dashboard.invoices": "invoices",
    "dashboard.clients": "clients",
    "dashboard.products": "products",
    "dashboard.recent": "Most recent invoices",

    // Table headers
    "table.number": "Number",
    "table.client": "Client",
    "table.date": "Date",
    "table.status": "Status",
    "table.total": "Total",
    "table.month": "Month",
    "table.revenue": "Revenue",
    "table.product": "Product",
    "table.units": "Units",
    "table.quantity": "Quantity",
    "table.unit_price": "Unit Price",
    "table.subtotal": "Subtotal",

    // Status
    "status.paid": "paid",
    "status.pending": "pending",
    "status.overdue": "overdue",

    // Invoice detail
    "invoice.title": "Invoice",
    "invoice.label": "Invoice detail (4-way JOIN)",
    "invoice.mongo.label": "Invoice detail (single find, client embedded)",
    "invoice.number": "Invoice Number",
    "invoice.client": "Client",
    "invoice.date": "Date",
    "invoice.status": "Status",
    "invoice.total": "Total",
    "invoice.items": "Line Items",

    // Stats
    "stats.title": "Statistics",
    "stats.postgres.subtitle": "Revenue per month + top 10 products",
    "stats.mongo.subtitle": "Revenue per month + top 10 products",
    "stats.postgres.label": "2 GROUP BY queries with JOINs",
    "stats.mongo.label": "1 pipeline",
    "stats.revenue_by_month": "Revenue by Month",
    "stats.top_products": "Top 10 Products",

    // Products page
    "products.title": "Products",
    "products.label": "All products (paginated)",
    "products.name": "Name",
    "products.category": "Category",
    "products.price": "Price",
    "products.stock": "Stock",

    // Clients page
    "clients.title": "Clients",
    "clients.label": "Top clients (correlated subquery)",
    "clients.name": "Name",
    "clients.email": "Email",
    "clients.phone": "Phone",
    "clients.invoices_count": "# Invoices",

    // Invoices page
    "invoices.title": "Invoices",
    "invoices.label": "Invoices (paginated)",
    "invoices.number": "Number",
    "invoices.client": "Client",
    "invoices.date": "Date",
    "invoices.status": "Status",
    "invoices.total": "Total",

    // Empty state
    "empty.title": "No data yet",
    "empty.description": "MongoDB is empty. Run the n8n ETL workflow to populate it.",
    "empty.instructions":
      "Open n8n at http://localhost:5678, import the workflow from n8n/postgres-to-mongo.json, and click Execute.",
  },
  fr: {
    // Navigation
    "nav.home": "accueil",
    "nav.dashboard": "Tableau de bord",
    "nav.invoices": "Factures",
    "nav.new_invoice": "Nouvelle facture",
    "nav.products": "Produits",
    "nav.clients": "Clients",
    "nav.stats": "Statistiques",
    "nav.migrate": "Pourquoi migrer ?",

    // Engines
    "engine.postgres": "PostgreSQL",
    "engine.mongodb": "MongoDB",

    // Home page
    "home.title": "Facturia",
    "home.subtitle":
      "La même application de facturation, construite deux fois — une fois sur PostgreSQL, une fois sur MongoDB. Chaque page indique le temps que sa requête a pris. Comparez. Décidez.",
    "home.postgres.title": "PostgreSQL",
    "home.postgres.desc":
      "Schéma normalisé, 500 clients / 1 000 produits / 10 000 factures, lues via Prisma.",
    "home.postgres.detail": "Requêtes avec beaucoup de JOINs. C'est la ligne de base.",
    "home.migrate.title": "Pourquoi migrer ?",
    "home.migrate.desc":
      "Là où le modèle relationnel cesse d'aider et le modèle de documents commence.",
    "home.migrate.detail": "Lisez ceci avant de comparer les deux côtés.",
    "home.mongo.title": "MongoDB",
    "home.mongo.desc":
      "Schéma orienté document, les factures intègrent leurs articles et un instantané du client.",
    "home.mongo.detail": "Vide par défaut — exécutez le workflow ETL n8n pour le remplir.",
    "home.how_to_read": "Comment lire les chiffres",
    "home.badge_explanation":
      "Chaque page de données affiche un badge ⏱ indiquant la durée de la requête en millisecondes.",
    "home.cold_start":
      "La première requête après le démarrage du serveur est toujours froide — rechargez une ou deux fois pour avoir des timings chauds.",
    "home.timing_coverage":
      "Le timing couvre uniquement l'appel à la base de données, pas le rendu React ou le transport réseau.",

    // Dashboard
    "dashboard.title": "Tableau de bord",
    "dashboard.postgres.subtitle":
      "Comptes + 5 factures les plus récentes (JOIN sur clients)",
    "dashboard.mongo.subtitle":
      "Comptes + 5 factures les plus récentes (pas de JOIN nécessaire — client intégré)",
    "dashboard.label.postgres": "COUNT × 3 + JOIN",
    "dashboard.label.mongo": "3 comptes + 1 recherche",
    "dashboard.invoices": "factures",
    "dashboard.clients": "clients",
    "dashboard.products": "produits",
    "dashboard.recent": "Factures les plus récentes",

    // Table headers
    "table.number": "Numéro",
    "table.client": "Client",
    "table.date": "Date",
    "table.status": "Statut",
    "table.total": "Total",
    "table.month": "Mois",
    "table.revenue": "Revenu",
    "table.product": "Produit",
    "table.units": "Unités",
    "table.quantity": "Quantité",
    "table.unit_price": "Prix unitaire",
    "table.subtotal": "Sous-total",

    // Status
    "status.paid": "payée",
    "status.pending": "en attente",
    "status.overdue": "en retard",

    // Invoice detail
    "invoice.title": "Facture",
    "invoice.label": "Détail de facture (JOIN à 4 voies)",
    "invoice.mongo.label": "Détail de facture (recherche unique, client intégré)",
    "invoice.number": "Numéro de facture",
    "invoice.client": "Client",
    "invoice.date": "Date",
    "invoice.status": "Statut",
    "invoice.total": "Total",
    "invoice.items": "Articles",

    // Stats
    "stats.title": "Statistiques",
    "stats.postgres.subtitle": "Revenu par mois + 10 meilleurs produits",
    "stats.mongo.subtitle": "Revenu par mois + 10 meilleurs produits",
    "stats.postgres.label": "2 requêtes GROUP BY avec JOINs",
    "stats.mongo.label": "1 pipeline",
    "stats.revenue_by_month": "Revenu par mois",
    "stats.top_products": "Top 10 Produits",

    // Products page
    "products.title": "Produits",
    "products.label": "Tous les produits (paginnés)",
    "products.name": "Nom",
    "products.category": "Catégorie",
    "products.price": "Prix",
    "products.stock": "Stock",

    // Clients page
    "clients.title": "Clients",
    "clients.label": "Meilleurs clients (sous-requête corrélée)",
    "clients.name": "Nom",
    "clients.email": "E-mail",
    "clients.phone": "Téléphone",
    "clients.invoices_count": "# Factures",

    // Invoices page
    "invoices.title": "Factures",
    "invoices.label": "Factures (paginées)",
    "invoices.number": "Numéro",
    "invoices.client": "Client",
    "invoices.date": "Date",
    "invoices.status": "Statut",
    "invoices.total": "Total",

    // Empty state
    "empty.title": "Aucune donnée pour le moment",
    "empty.description":
      "MongoDB est vide. Exécutez le workflow ETL n8n pour le remplir.",
    "empty.instructions":
      "Ouvrez n8n à http://localhost:5678, importez le workflow depuis n8n/postgres-to-mongo.json, et cliquez sur Exécuter.",

    // Migrate page
    "migrate.title": "Pourquoi migrer vers MongoDB ?",
    "migrate.intro": "PostgreSQL est une excellente base de données, mais la charge de travail de facturation dans cette application montre plusieurs endroits où le modèle relationnel cesse d'aider. Voici le cas pour passer à un magasin orienté documents - et où Postgres gagne toujours.",
    "migrate.today": "PostgreSQL aujourd'hui",
    "migrate.today.desc1": "4 tables, 5 index, intégrité référentielle via FK.",
    "migrate.today.desc2": "Chaque page de facture fusionne factures × articles × produits × clients.",
    "migrate.today.desc3": "Les statistiques s'appuient sur GROUP BY sur une table d'articles d'un million de lignes.",
    "migrate.after": "MongoDB après migration",
    "migrate.after.desc1": "3 collections. Les factures intègrent les articles et un instantané du client.",
    "migrate.after.desc2": "Détail de facture = une lecture de document, pas de JOIN.",
    "migrate.after.desc3": "Statistiques = pipeline d'agrégation sur des données déjà formées.",
    "migrate.reasons_title": "Cinq raisons de migrer",
    "migrate.reason1_title": "1. Les factures sont des documents, pas des lignes",
    "migrate.reason1_tag": "forme des données",
    "migrate.reason1_desc": "Une facture papier a un en-tête et des articles - c'est un document. Le scinder en factures + invoice_items est un artefact de 1NF, pas une exigence métier. Dans Mongo, la forme naturelle est préservée, donc lire, écrire et mettre en cache une facture est un aller-retour au lieu de quatre.",
    "migrate.reason2_title": "2. Les JOINs lourds en lecture dominent le temps de réponse",
    "migrate.reason2_tag": "performance",
    "migrate.reason2_desc": "Comparez les timings entre les listes de factures - avec 10 000 factures et articles, le JOIN à 4 voies sur les pages de détail et le GROUP BY sur la page de statistiques sont systématiquement plus lents que leurs équivalents Mongo car aucun travail de jointure ne se produit au moment de la lecture.",
    "migrate.reason3_title": "3. Les changements de schéma sont coûteux",
    "migrate.reason3_tag": "flexibilité",
    "migrate.reason3_desc": "Ajouter un champ aux factures - par exemple, une ventilation TVA ou une devise - nécessite une ALTER TABLE. Sur une table avec 10 000+ lignes et des FK actives, c'est une fenêtre de maintenance. Avec Mongo, vous commencez simplement à écrire le nouveau champ ; les anciens documents restent valides.",
    "migrate.reason4_title": "4. Mise à l'échelle horizontale",
    "migrate.reason4_tag": "échelle",
    "migrate.reason4_desc": "Postgres se met à l'échelle verticalement bien, mais le sharding est un projet d'ingénierie impliqué (Citus, partitionnement, répliques de lecture avec lag). Mongo partage en natif sur une clé choisie (par exemple client._id ou issuedAt) et se rééquilibre de lui-même.",
    "migrate.reason5_title": "5. Ergonomie d'agrégation",
    "migrate.reason5_tag": "requêtes",
    "migrate.reason5_desc": "Le pipeline de la page de statistiques s'aligne sur la façon dont vous pensez aux données. L'équivalent SQL est une requête multiligne avec des sous-requêtes corrélées ou des fonctions de fenêtre que la plupart des équipes oublient entre les sprints.",
    "migrate.when_postgres": "Quand Postgres est toujours la bonne réponse",
    "migrate.postgres_1": "Intégrité référentielle stricte entre de nombreuses entités (ERP, registres bancaires).",
    "migrate.postgres_2": "Transactions complexes multi-tables qui doivent être ACID dans les agrégats.",
    "migrate.postgres_3": "Accès SQL ad-hoc par les analystes, outils BI, pipelines de rapports.",
    "migrate.postgres_4": "Schéma bien connu et stable avec des changements peu fréquents.",
    "migrate.postgres_5": "Pour l'application de facturation dans ce référentiel, la plupart de ces n'appliquent - une facture est un agrégat autonome, et c'est exactement la forme où Mongo excelle.",
    "migrate.how_title": "Comment fonctionne la migration dans cette démo",
    "migrate.how_1": "Postgres est amorcé via npx prisma db seed.",
    "migrate.how_2": "Un workflow n8n lit clients, produits et factures (avec articles pré-joints via jsonb_agg) et insère des documents dénormalisés dans Mongo.",
    "migrate.how_3": "Les routes /mongo servent maintenant la même interface utilisateur à partir du nouveau magasin.",

    // Invoice form
    "invoice.form.title": "Nouvelle facture",
    "invoice.form.client": "Client",
    "invoice.form.client_placeholder": "Sélectionner un client",
    "invoice.form.add_item": "Ajouter un article",
    "invoice.form.item_product": "Produit",
    "invoice.form.item_quantity": "Quantité",
    "invoice.form.item_unit_price": "Prix unitaire",
    "invoice.form.item_remove": "Supprimer",
    "invoice.form.submit": "Créer la facture",
    "invoice.form.cancel": "Annuler",
  },
};

type Language = "en" | "fr";

// Default language - set to 'fr' for French by default
export const defaultLanguage: Language = "fr";

export function t(key: string, lang: Language = defaultLanguage): string {
  const langDict = translations[lang];
  
  // Try to get the value in the requested language
  let value = langDict[key];
  
  // If not found, fallback to English
  if (!value) {
    value = translations["en"][key];
  }
  
  // If still not found, return the key
  return value || key;
}
