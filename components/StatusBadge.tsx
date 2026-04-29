import { Badge } from "@/components/ui/badge";
import { t } from "@/lib/translations";

export function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "paid" ? "success" : status === "pending" ? "warning" : "destructive";
  const label = t(`status.${status}`);
  return <Badge variant={variant as any}>{label}</Badge>;
}
