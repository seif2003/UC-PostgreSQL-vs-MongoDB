import { PrismaClient, Prisma } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const SEED_PROFILE = process.env.SEED_PROFILE === "extreme" ? "extreme" : "standard";

const SEED_CONFIG = {
  standard: {
    clientCount: 500,
    productCount: 1_000,
    invoiceCount: 10_000,
    itemCountMin: 3,
    itemCountMax: 5,
  },
  extreme: {
    clientCount: 2_000,
    productCount: 5_000,
    invoiceCount: 30_000,
    itemCountMin: 8,
    itemCountMax: 14,
  },
} as const;

const { clientCount, productCount, invoiceCount, itemCountMin, itemCountMax } = SEED_CONFIG[SEED_PROFILE];

const CATEGORIES = [
  "Electronics",
  "Office Supplies",
  "Furniture",
  "Software",
  "Books",
  "Hardware",
  "Cleaning",
  "Food & Beverage",
  "Tools",
  "Services",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedStatus(): string {
  const r = Math.random();
  if (r < 0.7) return "paid";
  if (r < 0.9) return "pending";
  return "overdue";
}

async function main() {
  console.log("Resetting database...");
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.product.deleteMany();
  await prisma.client.deleteMany();

  console.log(`Creating ${clientCount} clients (${SEED_PROFILE} profile)...`);
  const clientData: Prisma.ClientCreateManyInput[] = [];
  const emails = new Set<string>();
  while (clientData.length < clientCount) {
    const email = faker.internet.email({ provider: `c${clientData.length}.example.com` }).toLowerCase();
    if (emails.has(email)) continue;
    emails.add(email);
    clientData.push({
      name: faker.company.name(),
      email,
      phone: faker.phone.number(),
      address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
    });
  }
  await prisma.client.createMany({ data: clientData });
  const clients = await prisma.client.findMany({ select: { id: true } });

  console.log(`Creating ${productCount} products...`);
  const productData: Prisma.ProductCreateManyInput[] = [];
  for (let i = 0; i < productCount; i++) {
    const price = Number(faker.commerce.price({ min: 5, max: 2500, dec: 2 }));
    productData.push({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: new Prisma.Decimal(price),
      stock: faker.number.int({ min: 0, max: 500 }),
      category: pick(CATEGORIES),
    });
  }
  await prisma.product.createMany({ data: productData });
  const products = await prisma.product.findMany({
    select: { id: true, price: true },
  });

  console.log(`Creating ${invoiceCount} invoices (with items)...`);
  const BATCH = 500;
  let created = 0;

  for (let batchStart = 0; batchStart < invoiceCount; batchStart += BATCH) {
    const size = Math.min(BATCH, invoiceCount - batchStart);

    const invoiceRows: Prisma.InvoiceCreateManyInput[] = [];
    const itemsPerInvoice: { qty: number; productIdx: number; unitPrice: Prisma.Decimal }[][] = [];

    for (let i = 0; i < size; i++) {
      const globalIdx = batchStart + i;
      const itemCount = faker.number.int({ min: itemCountMin, max: itemCountMax });
      const theseItems: { qty: number; productIdx: number; unitPrice: Prisma.Decimal }[] = [];
      let total = new Prisma.Decimal(0);
      for (let j = 0; j < itemCount; j++) {
        const productIdx = Math.floor(Math.random() * products.length);
        const qty = faker.number.int({ min: 1, max: 10 });
        const unitPrice = products[productIdx].price as Prisma.Decimal;
        const subtotal = unitPrice.mul(qty);
        total = total.add(subtotal);
        theseItems.push({ qty, productIdx, unitPrice });
      }
      itemsPerInvoice.push(theseItems);
      invoiceRows.push({
        invoiceNumber: `INV-${String(globalIdx + 1).padStart(6, "0")}`,
        clientId: pick(clients).id,
        issuedAt: faker.date.between({
          from: new Date(Date.now() - 1000 * 60 * 60 * 24 * 730),
          to: new Date(),
        }),
        status: weightedStatus(),
        total,
      });
    }

    await prisma.invoice.createMany({ data: invoiceRows });
    const insertedInvoices = await prisma.invoice.findMany({
      where: { invoiceNumber: { in: invoiceRows.map((r) => r.invoiceNumber!) } },
      select: { id: true, invoiceNumber: true },
      orderBy: { id: "asc" },
    });
    const invoiceByNumber = new Map(insertedInvoices.map((r) => [r.invoiceNumber, r.id]));

    const itemRows: Prisma.InvoiceItemCreateManyInput[] = [];
    for (let i = 0; i < size; i++) {
      const invoiceId = invoiceByNumber.get(invoiceRows[i].invoiceNumber!)!;
      for (const it of itemsPerInvoice[i]) {
        itemRows.push({
          invoiceId,
          productId: products[it.productIdx].id,
          quantity: it.qty,
          unitPrice: it.unitPrice,
          subtotal: it.unitPrice.mul(it.qty),
        });
      }
    }
    await prisma.invoiceItem.createMany({ data: itemRows });

    created += size;
    if (created % 1000 === 0 || created === invoiceCount) {
      console.log(`  ${created} / ${invoiceCount}`);
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });