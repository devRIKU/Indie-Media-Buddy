import { searchAll } from "@/lib/data";
import SearchClient from "./SearchClient";

export const revalidate = 600;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const results = q ? await searchAll(q) : [];
  return <SearchClient initialQuery={q} initialResults={results} />;
}
