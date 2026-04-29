import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Leaf, ArrowRight, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { t } from "@/lib/translations";

export const metadata = {
  title: `${t("migrate.title")} — Facturia`,
};

export default function MigratePage() {
  return (
    <main className="container py-12 max-w-4xl">
      <div className="mb-10">
        <Link href="/" className="text-xs text-muted-foreground hover:underline">← {t("nav.home")}</Link>
        <h1 className="text-4xl font-bold tracking-tight mt-2">{t("migrate.title")}</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {t("migrate.intro")}
        </p>
      </div>

      <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-sky-200 bg-sky-50/40">
          <CardHeader className="flex flex-row items-center gap-2">
            <Database className="h-5 w-5 text-sky-700" />
            <CardTitle className="text-base">{t("migrate.today")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>{t("migrate.today.desc1")}</div>
            <div>{t("migrate.today.desc2")}</div>
            <div>{t("migrate.today.desc3")}</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardHeader className="flex flex-row items-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-700" />
            <CardTitle className="text-base">{t("migrate.after")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>{t("migrate.after.desc1")}</div>
            <div>{t("migrate.after.desc2")}</div>
            <div>{t("migrate.after.desc3")}</div>
          </CardContent>
        </Card>
      </section>

      <h2 className="text-2xl font-semibold mb-4">{t("migrate.reasons_title")}</h2>
      <div className="space-y-4 mb-12">
        <Limitation
          title={t("migrate.reason1_title")}
          badge={t("migrate.reason1_tag")}
          content={t("migrate.reason1_desc")}
        />
        <Limitation
          title={t("migrate.reason2_title")}
          badge={t("migrate.reason2_tag")}
          content={
            <>
              {t("migrate.reason2_desc")}
            </>
          }
        />
        <Limitation
          title={t("migrate.reason3_title")}
          badge={t("migrate.reason3_tag")}
          content={t("migrate.reason3_desc")}
        />
        <Limitation
          title={t("migrate.reason4_title")}
          badge={t("migrate.reason4_tag")}
          content={t("migrate.reason4_desc")}
        />
        <Limitation
          title={t("migrate.reason5_title")}
          badge={t("migrate.reason5_tag")}
          content={t("migrate.reason5_desc")}
        />
      </div>

      <h2 className="text-2xl font-semibold mb-4">{t("migrate.when_postgres")}</h2>
      <Card className="mb-12">
        <CardContent className="pt-6 space-y-2 text-sm">
          <Row ok>{t("migrate.postgres_1")}</Row>
          <Row ok>{t("migrate.postgres_2")}</Row>
          <Row ok>{t("migrate.postgres_3")}</Row>
          <Row ok>{t("migrate.postgres_4")}</Row>
          <Row>{t("migrate.postgres_5")}</Row>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mb-4">{t("migrate.how_title")}</h2>
      <Card>
        <CardContent className="pt-6 text-sm space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline">1</Badge>
            <span>{t("migrate.how_1")}</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">2</Badge>
            <span>{t("migrate.how_2")}</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">3</Badge>
            <span>{t("migrate.how_3")}</span>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Link href="/postgres" className="inline-flex items-center gap-1 underline">Postgres <ArrowRight className="h-3 w-3" /></Link>
            <Link href="/mongo" className="inline-flex items-center gap-1 underline ml-4">MongoDB <ArrowRight className="h-3 w-3" /></Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function Limitation({
  title,
  badge,
  content,
}: {
  title: string;
  badge: string;
  content: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          {title}
        </CardTitle>
        <Badge variant="outline">{badge}</Badge>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground leading-relaxed">{content}</CardContent>
    </Card>
  );
}

function Row({ ok = false, children }: { ok?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      )}
      <div>{children}</div>
    </div>
  );
}
