import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "team") redirect("/team");
  if (session.role === "client") redirect(`/client/${session.searchId}`);
  redirect("/login");
}
