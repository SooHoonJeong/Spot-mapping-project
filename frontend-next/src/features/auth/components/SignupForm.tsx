"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { authService } from "../services/authService";
import { Button } from "@/components/ui/button";
import { Field } from "./Field";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

const INITIAL_FORM_DATA = {
  email: "",
  password: "",
  passwordConfirm: "",
  gender: "",
  username: "",
  nickname: "",
  birthDate: "",
  phoneNumber: "",
  agreedToTerms: false as boolean | string,
  agreedToMarketing: false as boolean | string,
};

// backend expects LocalDate as "yyyy-MM-dd"; the input collects plain 8-digit birthdates.
function toIsoBirthDate(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 8) return raw;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

// backend requires hyphens (^01[0-9]-\d{3,4}-\d{4}$); the input collects plain digits.
function toHyphenatedPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  return raw;
}

export default function SignupForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // mail verification
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | boolean = value;

    if (type === "radio") {
      if (value === "true") finalValue = true;
      if (value === "false") finalValue = false;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  // mail verification
  const handleSendCode = async () => {
    if (!formData.email) return alert(t("auth.signup.emailFirstAlert"));
    try {
      await authService.sendVerificationEmail(formData.email);
      setIsEmailSent(true);
      alert(t("auth.signup.codeSentAlert"));
    } catch (err: any) {
      alert(
        t("auth.signup.codeSendFailAlert", {
          message: err.response?.data?.message || t("auth.signup.codeSendFailDefault"),
        }),
      );
    }
  };

  const handleVerifyCode = async () => {
    try {
      const body = await authService.checkVerificationEmail(
        formData.email,
        verificationCode,
      );
      setVerificationToken(body.data.verificationToken);
      setIsEmailVerified(true);
      alert(t("auth.signup.codeVerifiedAlert"));
    } catch (err) {
      alert(t("auth.signup.codeInvalidAlert"));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isEmailVerified) {
      setError(t("auth.signup.errorEmailNotVerified"));
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError(t("auth.signup.errorPasswordMismatch"));
      setLoading(false);
      return;
    }

    if (
      formData.agreedToTerms === false ||
      formData.agreedToTerms === "false"
    ) {
      setError(t("auth.signup.errorTermsRequired"));
      setLoading(false);
      return;
    }

    try {
      await authService.signup({
        email: formData.email,
        verificationToken,
        password: formData.password,
        gender: formData.gender,
        username: formData.username,
        nickname: formData.nickname,
        birthDate: toIsoBirthDate(formData.birthDate),
        phoneNumber: toHyphenatedPhone(formData.phoneNumber),
        agreedToTerms: Boolean(formData.agreedToTerms),
        agreedToMarketing: Boolean(formData.agreedToMarketing),
      });
      alert(t("auth.signup.successAlert", { nickname: formData.nickname }));

      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || t("auth.signup.errorDefault"));
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
          {t("auth.signup.title")}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t("auth.signup.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <Field
                  id="email"
                  name="email"
                  label={t("auth.signup.emailLabel")}
                  type="email"
                  placeholder={t("auth.signup.emailPlaceholder")}
                  disabled={isEmailVerified}
                  required
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleSendCode}
                disabled={isEmailVerified || loading}
                className="mt-auto h-11"
              >
                {isEmailSent ? t("auth.signup.resendCode") : t("auth.signup.sendCode")}
              </Button>
            </div>
            {isEmailSent && !isEmailVerified && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t("auth.signup.verificationPlaceholder")}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="h-11 flex-1 rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
                <Button type="button" onClick={handleVerifyCode} className="h-11">
                  {t("auth.signup.verifyCode")}
                </Button>
              </div>
            )}
            {isEmailVerified && (
              <p className="text-xs font-bold text-primary">
                {t("auth.signup.verifiedMessage")}
              </p>
            )}
          </div>

          <Field
            id="password"
            name="password"
            label={t("auth.signup.passwordLabel")}
            type="password"
            placeholder={t("auth.signup.passwordPlaceholder")}
            required
            onChange={handleChange}
            autoComplete="new-password"
          />
          <Field
            id="passwordConfirm"
            name="passwordConfirm"
            label={t("auth.signup.passwordConfirmLabel")}
            type="password"
            placeholder={t("auth.signup.passwordConfirmPlaceholder")}
            required
            onChange={handleChange}
            autoComplete="new-password"
          />
          <Field
            id="username"
            name="username"
            label={t("auth.signup.usernameLabel")}
            type="text"
            placeholder={t("auth.signup.usernamePlaceholder")}
            required
            onChange={handleChange}
          />
          <Field
            id="nickname"
            name="nickname"
            label={t("auth.signup.nicknameLabel")}
            type="text"
            placeholder={t("auth.signup.nicknamePlaceholder")}
            required
            onChange={handleChange}
          />
          <Field
            id="birthDate"
            name="birthDate"
            label={t("auth.signup.birthDateLabel")}
            type="text"
            placeholder={t("auth.signup.birthDatePlaceholder")}
            required
            onChange={handleChange}
          />
          <Field
            id="phoneNumber"
            name="phoneNumber"
            label={t("auth.signup.phoneNumberLabel")}
            type="text"
            placeholder={t("auth.signup.phoneNumberPlaceholder")}
            required
            onChange={handleChange}
          />

          {/* 성별 선택 (다중일택) */}
          <div className="flex justify-around rounded-xl bg-secondary/40 p-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="gender"
                value="MALE"
                checked={formData.gender === "MALE"}
                onChange={handleChange}
              />
              {t("auth.signup.genderMale")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="gender"
                value="FEMALE"
                checked={formData.gender === "FEMALE"}
                onChange={handleChange}
              />
              {t("auth.signup.genderFemale")}
            </label>
          </div>

          <div className="flex justify-around rounded-xl bg-secondary/40 p-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="agreedToTerms"
                value="true"
                checked={formData.agreedToTerms === true}
                onChange={handleChange}
              />
              {t("auth.signup.agree")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="agreedToTerms"
                value="false"
                checked={formData.agreedToTerms === false}
                onChange={handleChange}
              />
              {t("auth.signup.disagree")}
            </label>
          </div>

          <div className="flex justify-around rounded-xl bg-secondary/40 p-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="agreedToMarketing"
                value="true"
                checked={formData.agreedToMarketing === true}
                onChange={handleChange}
              />
              {t("auth.signup.agree")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="agreedToMarketing"
                value="false"
                checked={formData.agreedToMarketing === false}
                onChange={handleChange}
              />
              {t("auth.signup.disagree")}
            </label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 w-full text-base"
          >
            {loading ? t("auth.signup.submitting") : t("auth.signup.submit")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.signup.haveAccount")}{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            {t("auth.signup.loginLink")}
          </Link>
        </p>
      </div>

      <Link
        href="/"
        className="mt-6 text-center text-sm text-muted-foreground hover:text-foreground"
      >
        {t("auth.signup.backHome")}
      </Link>
    </div>
  );
}
