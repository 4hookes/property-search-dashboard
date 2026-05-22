import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "team") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("client_searches")
    .select("id, client_name, client_slug, is_active, created_at, search_criteria")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "team") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { client_name, client_slug, password, search_criteria } = await req.json();
  if (!client_name || !client_slug || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("client_searches")
    .insert({ client_name, client_slug: client_slug.toLowerCase(), client_password_hash: hash, search_criteria })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
