import { Clock, Database, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Engine = "Postgres" | "MongoDB";

export function QueryTimer({
  ms,
  engine,
  label,
  className,
}: {
  ms: number;
  engine: Engine;
  label?: string;
  className?: string;
}) {
  const Icon = engine === "Postgres" ? Database : Leaf;
  const tone =
    engine === "Postgres"
      ? "bg-sky-100 text-sky-800 border-sky-200"
      : "bg-emerald-100 text-emerald-800 border-emerald-200";
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-mono border", tone, className)}
      title={label}
    >
      <Icon className="h-3 w-3" />
      <Clock className="h-3 w-3" />
      <span>{ms.toFixed(2)} ms</span>
      <span className="opacity-70">· {engine}</span>
      {label ? <span className="opacity-60">· {label}</span> : null}
    </Badge>
  );
}
