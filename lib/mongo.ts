import { MongoClient, type Collection, type Db } from "mongodb";

export type MongoClientDoc = {
  _id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  createdAt: Date;
};

export type MongoProductDoc = {
  _id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  category: string;
  createdAt: Date;
};

export type MongoInvoiceItem = {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type MongoInvoiceDoc = {
  _id: number;
  invoiceNumber: string;
  client: { _id: number; name: string; email: string };
  issuedAt: Date;
  status: string;
  total: number;
  items: MongoInvoiceItem[];
};

const uri =
  process.env.MONGODB_URI ??
  "mongodb://facturia:facturia@localhost:27017/?authSource=admin";
const dbName = process.env.MONGODB_DB ?? "facturia";

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
  mongoReady?: Promise<MongoClient>;
};

async function getClient(): Promise<MongoClient> {
  if (globalForMongo.mongoClient) return globalForMongo.mongoClient;
  if (!globalForMongo.mongoReady) {
    const client = new MongoClient(uri);
    globalForMongo.mongoReady = client.connect().then(async (c) => {
      globalForMongo.mongoClient = c;
      await ensureIndexes(c.db(dbName));
      return c;
    });
  }
  return globalForMongo.mongoReady;
}

let indexesEnsured = false;
async function ensureIndexes(db: Db) {
  if (indexesEnsured) return;
  try {
    await db.collection<MongoInvoiceDoc>("invoices").createIndex({ invoiceNumber: 1 }, { unique: true });
    await db.collection<MongoInvoiceDoc>("invoices").createIndex({ "client._id": 1 });
    await db.collection<MongoInvoiceDoc>("invoices").createIndex({ issuedAt: -1 });
    await db.collection<MongoInvoiceDoc>("invoices").createIndex({ status: 1 });
    await db.collection<MongoProductDoc>("products").createIndex({ category: 1 });
  } catch {
    // ignore — collections may not yet exist before ETL runs
  }
  indexesEnsured = true;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(dbName);
}

export async function collections(): Promise<{
  clients: Collection<MongoClientDoc>;
  products: Collection<MongoProductDoc>;
  invoices: Collection<MongoInvoiceDoc>;
}> {
  const db = await getDb();
  return {
    clients: db.collection<MongoClientDoc>("clients"),
    products: db.collection<MongoProductDoc>("products"),
    invoices: db.collection<MongoInvoiceDoc>("invoices"),
  };
}
