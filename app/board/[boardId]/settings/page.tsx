import { redirect } from "next/navigation";

type SettingsPageProps = {
  params: Promise<{
    boardId: string;
  }>;
};

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { boardId } = await params;
  redirect(`/board/${boardId}`);
}