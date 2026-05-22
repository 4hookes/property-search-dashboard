import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession, COOKIE_NAME } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const { mode, password, clientSlug } = await req.json();

  if (mode === "team") {
    const teamPassword = process.env.TEAM_PASSWORD || "eastcondos2026";
    if (password !== teamPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    const token = await createSession({ role: "team" });
    const res = NextResponse.json({ redirect: "/team" });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  }

  if (mode === "client") {
    if (!clientSlug) {
      return NextResponse.json({ error: "Search ID required" }, { status: 400 });
    }
    const supabase = getServiceClient();
    const { data: search, error } = await supabase
      .from("client_searches")
      .select("id, client_name, client_password_hash, client_slug")
      .eq("client_slug", clientSlug.toLowerCase())
      .eq("is_active", true)
      .single();

    if (error || !search) {
      return NextResponse.json({ error: "Search not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, search.client_password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = await createSession({
      role: "client",
      searchId: search.id,
      clientName: search.client_name,
    });
    const res = NextResponse.json({ redirect: `/client/${search.id}` });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  }

  return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
