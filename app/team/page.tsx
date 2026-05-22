import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import TeamDashboard from "./TeamDashboard";

export default async function TeamPage() {
  const session = await getSession();
  if (!session || session.role !== "team") redirect("/login");

  const supabase = getServiceClient();
  const { data: searches } = await supabase
    .from("client_searches")
    .select("id, client_name, client_slug, is_active, created_at")
    .order("created_at", { ascending: false });

  return <TeamDashboard searches={searches || []} />;
}
