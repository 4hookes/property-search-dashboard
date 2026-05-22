import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "team") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { propertyId } = await params;
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const supabase = getServiceClient();
  const ext = file.name.split(".").pop();
  const path = `properties/${propertyId}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("property-images")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: urlData } = supabase.storage
    .from("property-images")
    .getPublicUrl(path);

  const { data, error } = await supabase
    .from("property_images")
    .insert({ property_id: propertyId, url: urlData.publicUrl, storage_path: path })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "team") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await params;
  const { imageId, storagePath } = await req.json();
  const supabase = getServiceClient();

  if (storagePath) {
    await supabase.storage.from("property-images").remove([storagePath]);
  }
  const { error } = await supabase.from("property_images").delete().eq("id", imageId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
