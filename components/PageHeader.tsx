import { QueryTimer } from "@/components/QueryTimer";

export function PageHeader({
  title,
  subtitle,
  ms,
  engine,
  label,
}: {
  title: string;
  subtitle?: string;
  ms: number;
  engine: "Postgres" | "MongoDB";
  label?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground mt-1">{subtitle}</p> : null}
      </div>
      <QueryTimer ms={ms} engine={engine} label={label} />
    </div>
  );
}
