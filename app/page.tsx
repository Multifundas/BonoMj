import { redirect } from "next/navigation";
import { getUser } from "@/lib/data/queries";

export default async function Home() {
  const user = await getUser();
  redirect(user ? "/dashboard" : "/login");
}
