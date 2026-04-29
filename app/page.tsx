import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Leaf, ArrowRightLeft } from "lucide-react";
import { t } from "@/lib/translations";

export default function Home() {
  return (
    <main className="container py-16 max-w-5xl">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">{t("home.title")}</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {t("home.subtitle")}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/postgres" className="no-underline">
          <Card className="h-full hover:border-sky-400 transition-colors">
            <CardHeader>
              <Database className="h-8 w-8 text-sky-600 mb-2" />
              <CardTitle>{t("home.postgres.title")}</CardTitle>
              <CardDescription>
                {t("home.postgres.desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t("home.postgres.detail")}
            </CardContent>
          </Card>
        </Link>

        <Link href="/migrate" className="no-underline">
          <Card className="h-full hover:border-amber-400 transition-colors">
            <CardHeader>
              <ArrowRightLeft className="h-8 w-8 text-amber-600 mb-2" />
              <CardTitle>{t("home.migrate.title")}</CardTitle>
              <CardDescription>
                {t("home.migrate.desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t("home.migrate.detail")}
            </CardContent>
          </Card>
        </Link>

        <Link href="/mongo" className="no-underline">
          <Card className="h-full hover:border-emerald-400 transition-colors">
            <CardHeader>
              <Leaf className="h-8 w-8 text-emerald-600 mb-2" />
              <CardTitle>{t("home.mongo.title")}</CardTitle>
              <CardDescription>
                {t("home.mongo.desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t("home.mongo.detail")}
            </CardContent>
          </Card>
        </Link>
      </div>

      <section className="mt-16 text-sm text-muted-foreground">
        <h2 className="text-base font-semibold text-foreground mb-2">{t("home.how_to_read")}</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>{t("home.badge_explanation")}</li>
          <li>{t("home.cold_start")}</li>
          <li>{t("home.timing_coverage")}</li>
        </ul>
      </section>
    </main>
  );
}
