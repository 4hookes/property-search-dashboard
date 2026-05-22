import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import ClientView from "./ClientView";
import { CLIENT_VISIBLE_STATUSES } from "@/lib/types";

export default async function ClientSearchPage({
  params,
}: {
  params: Promise<{ searchId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { searchId } = await params;

  if (session.role === "client" && session.searchId !== searchId) redirect("/login");
  if (session.role !== "team" && session.role !== "client") redirect("/login");

  const supabase = getServiceClient();
  const [{ data: search }, { data: properties }] = await Promise.all([
    supabase.from("client_searches").select("id, client_name").eq("id", searchId).single(),
    supabase
      .from("properties")
      .select("*, images:property_images(*), notes:property_notes(*)")
      .eq("search_id", searchId)
      .in("status", CLIENT_VISIBLE_STATUSES)
      .order("created_at", { ascending: false }),
  ]);

  if (!search) redirect("/login");

  return <ClientView search={search} properties={properties || []} />;
}
