"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { MapPin, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuthStore();
  const { t } = useTranslation();

  const NAV_LINKS = [
    { href: "/events", label: t("nav.events") },
    { href: "/map", label: t("nav.map") },
    { href: "/community", label: t("nav.community") },
    { href: "/my-page", label: t("nav.myPage") },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = () => {
    if (window.confirm("로그아웃 하겠습니까?")) {
      logout();
      setOpen(false);
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MapPin className="size-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">Spot</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {isLoggedIn ? (
            <div className="hidden items-center gap-3 sm:flex">
              <Link href="/my-page" className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-accent text-sm font-bold text-accent-foreground">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user?.nickname?.charAt(0) || "U"
                  )}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {t("nav.greeting", {
                    nickname: user?.nickname || t("nav.guestNickname"),
                  })}
                </span>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                {t("nav.logout")}
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                className="hidden sm:inline-flex"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                {t("nav.login")}
              </Button>
              <Button nativeButton={false} render={<Link href="/signup" />}>
                {t("nav.signup")}
              </Button>
            </>
          )}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-secondary md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border/70 bg-background px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-secondary"
              >
                {t("nav.logout")}
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground sm:hidden"
              >
                {t("nav.login")}
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
