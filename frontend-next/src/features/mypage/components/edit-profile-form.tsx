"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/features/auth/components/Field";
import { authService } from "@/features/auth/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMyProfile } from "../lib/useMyProfile";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground">{value || "—"}</span>
    </div>
  );
}

function roleLabel(role: string, t: (path: string) => string): string {
  const key = `mypage.edit.role.${role}`;
  const label = t(key);
  return label === key ? role : label;
}

export function EditProfileForm() {
  const { t } = useTranslation();
  const { profile, setProfile, loading, ready, error } = useMyProfile();

  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreedToMarketing, setAgreedToMarketing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  // Seed the editable fields once the profile arrives; re-syncs if the fetched profile changes
  // (e.g. after a save round-trips through the backend).
  useEffect(() => {
    if (!profile) return;
    setNickname(profile.nickname);
    setPhoneNumber(profile.phoneNumber);
    setAgreedToMarketing(profile.agreedToMarketing);
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaved(false);
    try {
      const updated = await authService.updateProfile({
        nickname,
        phoneNumber,
        agreedToMarketing,
      });
      setProfile(updated);
      useAuthStore.getState().setUser(updated);
      setSaved(true);
    } catch (err: any) {
      setSaveError(err.response?.data?.message || t("mypage.edit.saveError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="mx-auto flex w-full max-w-2xl items-center justify-center px-4 py-24">
        <span className="text-sm text-muted-foreground">{t("mypage.edit.loading")}</span>
      </section>
    );
  }

  if (!ready) return null;

  if (error || !profile) {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 py-24 text-center">
        <p className="text-sm text-destructive">{t("mypage.edit.loadError")}</p>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link
        href="/my-page"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("mypage.edit.backToMyPage")}
      </Link>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {t("mypage.edit.heading")}
      </h1>
      <p className="mt-1 text-muted-foreground">{t("mypage.edit.subheading")}</p>

      <div className="mt-6 flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        {profile.profileImageUrl && (
          <img
            src={profile.profileImageUrl}
            alt={profile.nickname}
            className="size-16 rounded-full object-cover"
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <ReadOnlyField label={t("mypage.edit.emailLabel")} value={profile.email} />
          <ReadOnlyField label={t("mypage.edit.usernameLabel")} value={profile.username} />
          <ReadOnlyField
            label={t("mypage.edit.genderLabel")}
            value={
              profile.gender === "MALE"
                ? t("auth.signup.genderMale")
                : profile.gender === "FEMALE"
                  ? t("auth.signup.genderFemale")
                  : profile.gender
            }
          />
          <ReadOnlyField label={t("mypage.edit.birthDateLabel")} value={profile.birthDate} />
          <ReadOnlyField label={t("mypage.edit.roleLabel")} value={roleLabel(profile.role, t)} />
          <ReadOnlyField
            label={t("mypage.edit.createdAtLabel")}
            value={profile.createdAt.slice(0, 10)}
          />
        </div>

        <div className="h-px bg-border" />

        <Field
          id="nickname"
          label={t("mypage.edit.nicknameLabel")}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        <Field
          id="phoneNumber"
          label={t("mypage.edit.phoneNumberLabel")}
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={agreedToMarketing}
            onChange={(e) => setAgreedToMarketing(e.target.checked)}
            className="size-4 rounded border-border"
          />
          {t("mypage.edit.agreedToMarketingLabel")}
        </label>

        {saveError && <p className="text-sm text-destructive">{saveError}</p>}
        {saved && <p className="text-sm text-primary">{t("mypage.edit.saveSuccess")}</p>}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            nativeButton={false}
            render={<Link href="/my-page" />}
          >
            {t("mypage.edit.cancel")}
          </Button>
          <Button type="submit" disabled={saving} className="gap-1.5">
            <Check className="size-4" />
            {saving ? t("mypage.edit.saving") : t("mypage.edit.save")}
          </Button>
        </div>
      </div>
    </form>
  );
}
