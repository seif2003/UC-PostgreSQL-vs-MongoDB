import { MongoClient } from "mongodb";
import "dotenv/config";

const uri = process.env.MONGODB_URI ?? "mongodb://facturia:facturia@localhost:27017/?authSource=admin";
const dbName = process.env.MONGODB_DB ?? "facturia";

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  console.log(`Dropping collections in ${dbName}...`);
  for (const name of ["clients", "products", "invoices"]) {
    try {
      await db.collection(name).drop();
      console.log(`  dropped ${name}`);
    } catch {
      console.log(`  ${name} did not exist`);
    }
  }
  await client.close();
  console.log("Done. Run your n8n ETL workflow to repopulate.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
