import { collections } from "@/lib/mongo";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { measure } from "@/lib/timing";
import { MongoEmpty } from "@/components/MongoEmpty";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function createInvoice(formData: FormData) {
  "use server";
  const clientId = Number(formData.get("clientId"));
  const productIds = formData.getAll("productId").map((v) => Number(v));
  const quantities = formData.getAll("quantity").map((v) => Number(v));

  const { clients, products, invoices } = await collections();
  const client = await clients.findOne({ _id: clientId });
  if (!client) return;

  const ids = productIds.filter((n) => Number.isFinite(n) && n > 0);
  const productDocs = await products.find({ _id: { $in: ids } }).toArray();
  const productMap = new Map(productDocs.map((p) => [p._id, p]));

  const items = productIds
    .map((pid, i) => ({ pid, qty: quantities[i] }))
    .filter((it) => productMap.has(it.pid) && it.qty > 0)
    .map((it) => {
      const p = productMap.get(it.pid)!;
      return {
        productId: p._id,
        productName: p.name,
        quantity: it.qty,
        unitPrice: p.price,
        subtotal: +(p.price * it.qty).toFixed(2),
      };
    });

  if (items.length === 0) return;

  const total = +items.reduce((s, it) => s + it.subtotal, 0).toFixed(2);
  const maxDoc = await invoices.find({}, { sort: { _id: -1 }, limit: 1 }).toArray();
  const nextId = (maxDoc[0]?._id ?? 0) + 1;

  await invoices.insertOne({
    _id: nextId,
    invoiceNumber: `INV-${String(nextId).padStart(6, "0")}`,
    client: { _id: client._id, name: client.name, email: client.email },
    issuedAt: new Date(),
    status: "pending",
    total,
    items,
  });

  revalidatePath("/mongo/invoices");
  redirect("/mongo/invoices");
}

export default async function NewMongoInvoice() {
  const { data, ms } = await measure("load clients + products", async () => {
    const { clients, products } = await collections();
    const [cs, ps, cTotal] = await Promise.all([
      clients.find({}, { sort: { name: 1 }, limit: 200 }).toArray(),
      products.find({}, { sort: { name: 1 }, limit: 200 }).toArray(),
      clients.estimatedDocumentCount(),
    ]);
    return { clients: cs, products: ps, empty: cTotal === 0 };
  });

  if (data.empty) return (<><PageHeader title="New invoice" ms={ms} engine="MongoDB" /><MongoEmpty /></>);

  return (
    <>
      <PageHeader
        title="New invoice"
        subtitle="Insert 1 document with items embedded — no transaction needed"
        ms={ms}
        engine="MongoDB"
        label="loaded form data"
      />
      <Card>
        <CardHeader><CardTitle>Create</CardTitle></CardHeader>
        <CardContent>
          <form action={createInvoice} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client</Label>
              <select id="clientId" name="clientId" className="w-full border rounded-md h-9 px-3 text-sm">
                {data.clients.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Line items</Label>
              {[0, 1, 2].map((i) => (
                <div key={i} className="grid grid-cols-[1fr_120px] gap-2">
                  <select name="productId" className="border rounded-md h-9 px-3 text-sm">
                    <option value="0">— no product —</option>
                    {data.products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.price} €)
                      </option>
                    ))}
                  </select>
                  <Input name="quantity" type="number" min={0} defaultValue={i === 0 ? 1 : 0} />
                </div>
              ))}
            </div>

            <Button type="submit">Create invoice</Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
