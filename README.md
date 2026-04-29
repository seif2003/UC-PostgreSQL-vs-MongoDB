# Facturia — PostgreSQL → MongoDB migration demo

## Résumé du projet

Facturia est une application Next.js de facturation construite deux fois pour comparer deux approches de conception:

- une version **PostgreSQL** avec un schéma relationnel normalisé;
- une version **MongoDB** avec des documents embarqués.

L’objectif est de montrer comment une structure classique en tables devient une structure orientée documents, pourquoi cette migration peut améliorer certaines lectures, et dans quels cas PostgreSQL reste le bon choix.

### Idée centrale

Dans PostgreSQL, les données sont séparées en plusieurs tables:

- `clients`
- `products`
- `invoices`
- `invoice_items`

Pour afficher une facture complète, l’application doit faire plusieurs `JOIN`.

Dans MongoDB, la facture devient un **document autonome**:

- le client est stocké en **snapshot** dans la facture;
- les lignes de facture sont **intégrées** dans un tableau `items`;
- l’affichage se fait avec une seule lecture du document.

### Ce que couvre le projet

- l’architecture complète avec **Next.js**, **Prisma**, **MongoDB**, **PostgreSQL**, **n8n** et **Docker Compose**;
- la génération de données de test avec **500 clients**, **1 000 produits** et **10 000 factures**;
- la migration de données avec un workflow **n8n** entre PostgreSQL et MongoDB;
- la comparaison des performances sur les pages de dashboard, factures, produits, clients et statistiques;
- une page d’explication sur les limites du modèle relationnel et les avantages du modèle document.

### Pourquoi migrer vers MongoDB

- les factures sont naturellement des **agrégats** complets;
- les lectures deviennent plus simples car il n’y a plus de jointures à exécuter au moment de l’affichage;
- le schéma est plus flexible pour ajouter de nouveaux champs;
- les statistiques se prêtent bien aux pipelines d’agrégation;
- le modèle document est souvent plus proche du besoin métier pour une facture.

### Quand PostgreSQL reste pertinent

- si l’on a besoin d’une forte intégrité référentielle;
- si plusieurs tables doivent être mises à jour dans une seule transaction complexe;
- si les analyses SQL ad hoc sont centrales;
- si le schéma est très stable et peu évolutif.

### Résultat obtenu

Le projet montre concrètement qu’une facture relationnelle devient un document MongoDB en:

1. regroupant les données nécessaires à l’affichage;
2. embarquant le client dans la facture sous forme de snapshot;
3. embarquant les lignes de facture dans un tableau;
4. supprimant le besoin de plusieurs jointures à chaque lecture.

En pratique, cela permet d’illustrer la différence entre **normalisation** et **dénormalisation** de manière simple et mesurable.

## Diagrammes Mermaid

### 1) Architecture globale

```mermaid
flowchart TB
  UI["Next.js app\nlocalhost:3000"]
  PG["PostgreSQL\nPrisma"]
  MG["MongoDB\nMongo driver"]
  ETL["n8n ETL\nlocalhost:5678"]

  UI --> PG
  UI --> MG
  ETL --> PG
  ETL --> MG
  PG -->|Pages relationnelles| UI
  MG -->|Pages documentaires| UI
```

### 2) Comment une table devient un document

```mermaid
flowchart LR
  CLIENTS["clients"] --> INVOICE["invoices"]
  ITEMS["invoice_items"] --> INVOICE
  PRODUCTS["products"] --> ITEMS

  INVOICE --> DOC["Document MongoDB\ninvoice complet"]
  DOC --> SNAPSHOT["client snapshot"]
  DOC --> LINES["items[]\n(lignes embarquées)"]
```

### 2b) Tables PostgreSQL

```mermaid
erDiagram
  CLIENTS ||--o{ INVOICES : places
  INVOICES ||--o{ INVOICE_ITEMS : contains
  PRODUCTS ||--o{ INVOICE_ITEMS : referenced_by

  CLIENTS {
    int id PK
    string name
    string email
    string phone
    string address
  }

  PRODUCTS {
    int id PK
    string name
    string category
    float price
    int stock
  }

  INVOICES {
    int id PK
    string invoice_number
    int client_id FK
    date issued_at
    string status
    float total
  }

  INVOICE_ITEMS {
    int id PK
    int invoice_id FK
    int product_id FK
    int quantity
    float unit_price
    float subtotal
  }
```

### 2c) Diagramme de classes UML

```mermaid
classDiagram
  class Client {
    +int id
    +string name
    +string email
    +string phone
    +string address
  }

  class Product {
    +int id
    +string name
    +string category
    +float price
    +int stock
  }

  class Invoice {
    +int id
    +string invoiceNumber
    +date issuedAt
    +string status
    +float total
  }

  class InvoiceItem {
    +int id
    +int quantity
    +float unitPrice
    +float subtotal
  }

  class MongoInvoiceDocument {
    +string _id
    +ClientSnapshot client
    +InvoiceLine[] items
  }

  class ClientSnapshot {
    +string id
    +string name
    +string email
    +string phone
    +string address
  }

  class InvoiceLine {
    +string productId
    +string productName
    +int quantity
    +float unitPrice
    +float subtotal
  }

  Client "1" --> "0..*" Invoice : places
  Invoice "1" --> "1..*" InvoiceItem : contains
  Product "1" --> "0..*" InvoiceItem : referenced by
  MongoInvoiceDocument "1" *-- "1" ClientSnapshot : embeds
  MongoInvoiceDocument "1" *-- "1..*" InvoiceLine : embeds
```

### 3) Flux de migration avec n8n

```mermaid
sequenceDiagram
  participant N8N as n8n workflow
  participant PG as PostgreSQL
  participant M as MongoDB
  participant APP as Next.js app

  N8N->>PG: SELECT clients, products, invoices
  PG-->>N8N: lignes + items agrégés
  N8N->>M: insertMany(clients, products, invoices)
  APP->>M: find / findOne / aggregate
  M-->>APP: documents prêts à afficher
```

A small Next.js invoicing app built **twice**: once on PostgreSQL with a normalized schema, once on MongoDB with an embedded-document schema. Every page prints the time its database query took, so you can see exactly where the document model wins and where the relational model is fine.

A separate **n8n workflow** performs the ETL from Postgres into Mongo so you can watch the migration happen.

---

## Goals

- Show a realistic invoicing workload: clients, products, invoices, line items.
- Measure and display query duration on every data page.
- Explain when and why migrating from Postgres to Mongo pays off — and when it doesn't.
- Keep the UI identical on both sides so differences are only in the data layer.

---

## Architecture

```
                     ┌───────────────────────────┐
                     │   Next.js (shadcn/ui)     │
                     │   http://localhost:3000   │
                     └────────────┬──────────────┘
                                  │
                ┌─────────────────┴──────────────────┐
                │                                    │
            /postgres/*                            /mongo/*
                │                                    │
                ▼                                    ▼
        ┌───────────────┐                  ┌────────────────┐
        │  PostgreSQL   │                  │    MongoDB     │
        │  (Prisma)     │                  │ (official drv) │
        │  seeded ~10k  │                  │  empty → ETL   │
        └───────┬───────┘                  └────────▲───────┘
                │                                    │
                │              n8n                   │
                │       http://localhost:5678        │
                └───────────► ETL workflow ──────────┘
```

- **postgres** — seeded with 500 clients, 1 000 products, 10 000 invoices and their items.
- **mongodb** — starts empty; you populate it by running the n8n ETL workflow.
- **n8n** — imports `n8n/postgres-to-mongo.json`, reads from Postgres, writes denormalized documents to Mongo.
- **pgAdmin** (port 5050) and **mongo-express** (port 8081) are included for inspection.

---

## Prerequisites

| Tool           | Version tested |
|----------------|----------------|
| Docker Desktop | 4.x+           |
| Node.js        | 20 LTS         |
| npm            | 10+            |

---

## Quick start

```bash
# 1. clone / cd into the repo
cp .env.example .env

# 2. start all infra services (Postgres, Mongo, n8n, pgAdmin, mongo-express)
docker compose up -d

# 3. install JS deps and generate the Prisma client
npm install
npx prisma generate

# 4. create the Postgres schema + seed 10 000 invoices (~30–60 s)
npx prisma migrate dev --name init
npx prisma db seed

# Optional: use a much larger dataset to make Mongo's document model stand out more
# npm run seed:extreme

# 5. run the app
npm run dev
# → http://localhost:3000
```

### Running the ETL (populate MongoDB)

1. Open **n8n** at [http://localhost:5678](http://localhost:5678).
2. Create two credentials:
   - **Postgres** — host `postgres`, port `5432`, database `facturia`, user `facturia`, password `facturia`, SSL off.
   - **MongoDB** — connection string `mongodb://facturia:facturia@mongo:27017/?authSource=admin`, database `facturia`.
3. Import the workflow: **Workflows → Import from file → `n8n/postgres-to-mongo.json`**.
4. Open the workflow, reassign credentials on each node (the nodes ship with placeholder credential IDs).
5. Click **Execute workflow**. The three branches (clients, products, invoices) run in parallel. Expect a few seconds for the small collections and ~10–30 s for invoices depending on your machine.
6. Reload `/mongo/invoices` in the app — the Mongo side now shows the same data.

To re-run the ETL from scratch:

```bash
npm run mongo:reset   # drops clients, products, invoices in Mongo
# then re-execute the n8n workflow
```

---

## Pages

Each page displays a ⏱ badge with the query duration and a label for what was run.

| Route                               | What it queries                                            |
|-------------------------------------|------------------------------------------------------------|
| `/`                                 | Landing / navigation                                       |
| `/migrate`                          | Why-migrate essay, Postgres limitations, trade-offs        |
| `/postgres`                         | Dashboard: counts + 5 latest invoices with client JOIN     |
| `/postgres/products`                | Paginated list of products                                 |
| `/postgres/clients`                 | Top 100 clients + invoice count (correlated subquery)      |
| `/postgres/invoices`                | Paginated invoices with client + items JOINed              |
| `/postgres/invoices/[id]`           | Single invoice — 4-way JOIN (invoice × client × items × products) |
| `/postgres/invoices/new`            | Create form; server action inserts in a transaction        |
| `/postgres/stats`                   | Revenue per month + top 10 products (GROUP BY + JOINs)     |
| `/mongo/*`                          | Same pages, reading from Mongo                             |

### How to read the ⏱ numbers

- Durations cover **only the database call**, measured around the Prisma / MongoDB driver call using `performance.now()`.
- The first request after a server start is always cold (connection pool warm-up, query planner caching). Reload once or twice to see warm timings.
- Expect the biggest Mongo advantage on **invoice detail** (no 4-way JOIN) and **stats** (pre-shaped data). Simple list pages may be close.
- For a more dramatic Mongo advantage, seed the `extreme` profile: `npm run seed:extreme`.

---

## Schema comparison

### PostgreSQL (normalized)

```
clients         (id, name, email, phone, address, created_at)
products        (id, name, description, price, stock, category, created_at)
invoices        (id, invoice_number, client_id → clients.id, issued_at, status, total)
invoice_items   (id, invoice_id → invoices.id, product_id → products.id, quantity, unit_price, subtotal)
```

Full source: [`prisma/schema.prisma`](prisma/schema.prisma).

### MongoDB (document-oriented)

```js
// clients
{ _id, name, email, phone, address, createdAt }

// products
{ _id, name, description, price, stock, category, createdAt }

// invoices
{
  _id, invoiceNumber,
  client: { _id, name, email },     // snapshot — denormalized
  issuedAt, status, total,
  items: [
    { productId, productName, quantity, unitPrice, subtotal }
  ]
}
```

Indexes created automatically on first connection: `invoices.invoiceNumber (unique)`, `invoices.client._id`, `invoices.issuedAt`, `invoices.status`, `products.category`. See [`lib/mongo.ts`](lib/mongo.ts).

---

## Project layout

```
.
├── docker-compose.yml            # Postgres, Mongo, n8n, pgAdmin, mongo-express
├── .env.example                  # DATABASE_URL, MONGODB_URI, MONGODB_DB
├── app/
│   ├── page.tsx                  # landing
│   ├── migrate/page.tsx          # why-migrate essay
│   ├── postgres/                 # Prisma-backed routes
│   └── mongo/                    # Mongo-backed routes (mirror)
├── components/
│   ├── ui/                       # shadcn primitives (Button, Card, Table, Badge, Input, Label)
│   ├── QueryTimer.tsx            # the ⏱ badge
│   ├── EngineNav.tsx             # per-engine top nav
│   ├── PageHeader.tsx            # title + timer
│   ├── StatusBadge.tsx
│   └── MongoEmpty.tsx            # empty-state shown before ETL runs
├── lib/
│   ├── prisma.ts                 # Prisma singleton
│   ├── mongo.ts                  # Mongo client + typed collections
│   ├── timing.ts                 # measure()
│   └── utils.ts                  # cn(), formatCurrency(), formatDate()
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                   # faker-based seed (500 / 1k / 10k)
├── n8n/
│   └── postgres-to-mongo.json    # importable ETL workflow
└── scripts/
    └── reset-mongo.ts            # drops Mongo collections for re-running the ETL
```

---

## n8n workflow in detail

File: [`n8n/postgres-to-mongo.json`](n8n/postgres-to-mongo.json)

Nodes:

1. **Manual Trigger** — fan-out into three parallel branches.
2. **PG: SELECT clients** → **Mongo: Insert clients** — maps `id → _id`.
3. **PG: SELECT products** → **Mongo: Insert products** — same, plus `price::float` cast.
4. **PG: SELECT invoices (with embedded items)** — uses `jsonb_build_object` + `jsonb_agg` to pre-embed the client snapshot and the items list in a single query:
   ```sql
   SELECT
     i.id AS _id, i.invoice_number AS "invoiceNumber", i.issued_at AS "issuedAt",
     i.status, i.total::float AS total,
     jsonb_build_object('_id', c.id, 'name', c.name, 'email', c.email) AS client,
     COALESCE(jsonb_agg(
       jsonb_build_object(
         'productId', p.id, 'productName', p.name,
         'quantity', ii.quantity,
         'unitPrice', ii.unit_price::float,
         'subtotal', ii.subtotal::float
       ) ORDER BY ii.id
     ) FILTER (WHERE ii.id IS NOT NULL), '[]'::jsonb) AS items
   FROM invoices i
   JOIN clients c ON c.id = i.client_id
   LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
   LEFT JOIN products p ON p.id = ii.product_id
   GROUP BY i.id, c.id;
   ```
5. **Transform invoices** (Code node) — defensive JSON parse, casts numbers, wraps `issuedAt` as `Date`.
6. **Mongo: Insert invoices** — writes to `facturia.invoices`.
7. **Done** — sentinel `{ status: "ETL complete" }`.

All three Mongo credentials point at `mongo:27017` (Docker service-name DNS, not `localhost`).

---

## Limitations of this demo

- MongoDB runs as a **single node**, not a replica set — good enough for this demo, but no multi-document transactions.
- Postgres is not tuned (default `shared_buffers` etc.). Real comparisons should pin both databases to similar resources.
- The seed data is synthetic (faker). Real invoicing workloads typically have hotter clients and more skew, which would make the document model look even better.
- The app is development-mode (no build step tested in this doc). `next build` should work but hasn't been part of the verification loop here.

---

## Troubleshooting

| Symptom                                                      | Fix                                                                                   |
|--------------------------------------------------------------|---------------------------------------------------------------------------------------|
| `npx prisma migrate dev` errors on connection                | Make sure `docker compose ps` shows Postgres `healthy`; check `DATABASE_URL` in `.env`. |
| n8n's Mongo node can't connect                               | In the credential, host must be `mongo` (the Docker service name), not `localhost`.   |
| `/mongo/*` pages show the empty-state card forever           | The ETL didn't run; open n8n and click **Execute workflow**.                          |
| Ports 5432 / 27017 / 5678 already in use                     | Stop the conflicting local service or change the host-side port in `docker-compose.yml`. |
| After re-seeding Postgres, Mongo is out of sync              | Run `npm run mongo:reset` then re-execute the n8n workflow.                           |
| Prisma client missing types                                  | `npx prisma generate`.                                                                |

---

## Credentials / ports cheat sheet

| Service        | URL / host                             | User        | Pass       |
|----------------|----------------------------------------|-------------|------------|
| Postgres       | `localhost:5433` (from host)           | `facturia`  | `facturia` |
|                | `postgres:5432` (from n8n container)   |             |            |
| MongoDB        | `localhost:27017` (from host)          | `facturia`  | `facturia` |
|                | `mongo:27017` (from n8n container)     |             |            |
| n8n            | http://localhost:5678                  | —           | —          |
| pgAdmin        | http://localhost:5050                  | admin@facturia.local | admin |
| mongo-express  | http://localhost:8081                  | —           | —          |

---

## License

MIT — this is a teaching project; feel free to fork, rewrite, translate, or use as a template for a class.
