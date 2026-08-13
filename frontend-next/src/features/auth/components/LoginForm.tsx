"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { authService } from "../services/authService";
import { useAuthStore } from "../../../stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Field } from "./Field";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export default function LoginForm() {
  const { t } = useTranslation();
  // TODO: BUG (pre-existing, preserved as-is): there is no `login` action on this store (see
  // stores/useAuthStore.ts). This is always undefined and is never invoked; dead code. Left
  // unfixed per migration parity requirements.
  const login = useAuthStore((state) => (state as { login?: unknown }).login);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authService.login(formData.email, formData.password);
      const token = result.data.accessToken;

      useAuthStore.getState().setAccessToken(token);

      const userData = await authService.getProfile();
      useAuthStore.getState().setUser(userData);

      router.replace("/");
      alert(
        t("auth.login.successAlert", {
          nickname: userData.nickname || t("auth.login.successFallbackName"),
        }),
      );
    } catch (err: any) {
      setError(err.response?.data?.message || t("auth.login.errorDefault"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-4 py-12">
      <Link href="/" className="mb-8 flex items-center justify-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <MapPin className="size-5" />
        </span>
        <span className="text-xl font-bold tracking-tight">Spot</span>
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-balance text-2xl font-bold tracking-tight">
          {t("auth.login.title")}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t("auth.login.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Field
            id="email"
            name="email"
            label={t("auth.login.emailLabel")}
            type="email"
            placeholder={t("auth.login.emailPlaceholder")}
            required
            onChange={handleChange}
            autoComplete="email"
          />
          <Field
            id="password"
            name="password"
            label={t("auth.login.passwordLabel")}
            type="password"
            placeholder={t("auth.login.passwordPlaceholder")}
            required
            onChange={handleChange}
            autoComplete="current-password"
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 w-full text-base"
          >
            {loading ? t("auth.login.submitting") : t("auth.login.submit")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.login.noAccount")}{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary hover:underline"
          >
            {t("auth.login.signupLink")}
          </Link>
        </p>
      </div>

      <Link
        href="/"
        className="mt-6 text-center text-sm text-muted-foreground hover:text-foreground"
      >
        {t("auth.login.backHome")}
      </Link>
    </div>
  );
}
