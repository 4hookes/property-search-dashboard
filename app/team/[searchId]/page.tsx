import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import PipelineView from "./PipelineView";

export default async function SearchPipelinePage({
  params,
}: {
  params: Promise<{ searchId: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "team") redirect("/login");

  const { searchId } = await params;
  const supabase = getServiceClient();

  const [{ data: search }, { data: properties }] = await Promise.all([
    supabase
      .from("client_searches")
      .select("id, client_name, client_slug")
      .eq("id", searchId)
      .single(),
    supabase
      .from("properties")
      .select("*, images:property_images(*), notes:property_notes(*)")
      .eq("search_id", searchId)
      .order("created_at", { ascending: false }),
  ]);

  if (!search) redirect("/team");

  return (
    <PipelineView
      search={search}
      initialProperties={properties || []}
    />
  );
}
