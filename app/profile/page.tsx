import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ProfilePageClient from "@/components/profile/profile-page-client";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <ProfilePageClient session={session} />;
}
