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
  const body = await req.json();
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("properties")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", propertyId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "team") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { propertyId } = await params;
  const supabase = getServiceClient();
  const { error } = await supabase.from("properties").delete().eq("id", propertyId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
