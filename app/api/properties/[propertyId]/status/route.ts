import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "team") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { propertyId } = await params;
  const { status } = await req.json();
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("properties")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", propertyId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
