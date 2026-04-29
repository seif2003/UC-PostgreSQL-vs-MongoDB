import { EngineNav } from "@/components/EngineNav";

export default function MongoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <EngineNav engine="mongo" />
      <main className="container py-8 max-w-7xl">{children}</main>
    </div>
  );
}
