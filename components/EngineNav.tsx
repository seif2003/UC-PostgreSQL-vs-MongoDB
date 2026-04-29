import Link from "next/link";
import { cn } from "@/lib/utils";
import { Database, Leaf, ArrowLeft } from "lucide-react";
import { t } from "@/lib/translations";

type Engine = "postgres" | "mongo";

const LINKS: { href: string; label: string }[] = [
  { href: "", label: t("nav.dashboard") },
  { href: "/invoices", label: t("nav.invoices") },
  { href: "/invoices/new", label: t("nav.new_invoice") },
  { href: "/products", label: t("nav.products") },
  { href: "/clients", label: t("nav.clients") },
  { href: "/stats", label: t("nav.stats") },
];

export function EngineNav({ engine }: { engine: Engine }) {
  const base = `/${engine}`;
  const Icon = engine === "postgres" ? Database : Leaf;
  const tone =
    engine === "postgres"
      ? "bg-sky-50 border-sky-200 text-sky-900"
      : "bg-emerald-50 border-emerald-200 text-emerald-900";

  return (
    <header className={cn("border-b", tone)}>
      <div className="container flex h-14 items-center gap-4 max-w-7xl">
        <Link href="/" className="flex items-center gap-1 text-xs opacity-70 hover:opacity-100">
          <ArrowLeft className="h-3 w-3" /> {t("nav.home")}
        </Link>
        <div className="flex items-center gap-2 font-semibold">
          <Icon className="h-5 w-5" />
          {engine === "postgres" ? t("engine.postgres") : t("engine.mongodb")}
        </div>
        <nav className="flex items-center gap-4 text-sm ml-6">
          {LINKS.map((l) => (
            <Link key={l.href} href={base + l.href} className="hover:underline">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
