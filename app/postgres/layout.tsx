import { EngineNav } from "@/components/EngineNav";

export default function PostgresLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <EngineNav engine="postgres" />
      <main className="container py-8 max-w-7xl">{children}</main>
    </div>
  );
}
