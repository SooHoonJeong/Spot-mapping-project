import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { EditProfileForm } from "@/features/mypage/components/edit-profile-form";

export const metadata: Metadata = {
  title: "Edit Profile — Spot",
  description: "Update your account information.",
};

export default function EditProfilePage() {
  return (
    <PageShell>
      <EditProfileForm />
    </PageShell>
  );
}
