import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, AlertCircle } from "lucide-react";
import { t } from "@/lib/translations";

export function MongoEmpty() {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          {t("empty.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-3">
        <p>{t("empty.description")}</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Ouvrez <a className="underline" href="http://localhost:5678" target="_blank" rel="noreferrer">http://localhost:5678</a></li>
          <li>Importez <code className="bg-muted px-1 rounded">n8n/postgres-to-mongo.json</code></li>
          <li>Configurez les identifiants PostgreSQL et MongoDB (voir README)</li>
          <li>Cliquez sur <b>Exécuter le workflow</b></li>
          <li>Rechargez cette page</li>
        </ol>
        <p className="flex items-center gap-2 pt-2">
          <Leaf className="h-4 w-4 text-emerald-600" />
          {t("empty.instructions")}
        </p>
      </CardContent>
    </Card>
  );
}
