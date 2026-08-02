"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, Phone, Sprout } from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const registerSchema = z
  .object({
    name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
    email: z.string().min(1, "ইমেইল দিন").email("সঠিক ইমেইল দিন"),
    phone: z.string().optional(),
    password: z.string().min(6, "কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন"),
    confirmPassword: z.string().min(1, "পাসওয়ার্ড আবার লিখুন"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "পাসওয়ার্ড দুটো মিলছে না",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { locale } = useUIStore();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterValues) {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            password: values.password,
            ...(values.phone ? { phone: values.phone } : {}),
          }),
        },
      );

      const result = await res.json();

      if (!res.ok || !result.success) {
        const msg = Array.isArray(result.message)
          ? result.message[0]
          : result.message;
        throw new Error(
          msg ??
            (locale === "bn"
              ? "রেজিস্ট্রেশন করা যায়নি"
              : "Couldn't complete registration"),
        );
      }

      // backend shape: { success, data: { user, accessToken } }
      localStorage.setItem("farmiq_access_token", result.data.accessToken);
      localStorage.setItem("farmiq_user", JSON.stringify(result.data.user));

      window.location.href = "/";
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : locale === "bn"
            ? "কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন"
            : "Something went wrong, please try again",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleSignup() {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  }

  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-background px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[440px]"
      >
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 font-bangla text-xl font-bold text-primary"
          >
            <Sprout className="h-7 w-7" strokeWidth={2.2} />
            FarmIQ
          </Link>
          <h1 className="font-bangla text-2xl font-bold text-foreground">
            {locale === "bn" ? "অ্যাকাউন্ট তৈরি করুন" : "Create your account"}
          </h1>
          <p className="mt-1.5 font-bangla text-sm text-muted-foreground">
            {locale === "bn"
              ? "কেনা বা বেচা শুরু করতে রেজিস্ট্রেশন করুন"
              : "Sign up to start buying or selling"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogleSignup}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09A6.6 6.6 0 015.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 001 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 00-9.82 6.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
              />
            </svg>
            {locale === "bn"
              ? "Google দিয়ে রেজিস্ট্রেশন করুন"
              : "Continue with Google"}
          </Button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="font-bangla text-xs text-muted-foreground">
              {locale === "bn" ? "অথবা" : "or"}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="rounded-lg bg-danger/10 px-3.5 py-2.5 font-bangla text-sm text-danger">
                  {serverError}
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bangla">
                      {locale === "bn" ? "পুরো নাম" : "Full name"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder={
                            locale === "bn" ? "আপনার নাম" : "Your name"
                          }
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bangla">
                      {locale === "bn" ? "ইমেইল" : "Email"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bangla">
                      {locale === "bn"
                        ? "ফোন নম্বর (ঐচ্ছিক)"
                        : "Phone (optional)"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="tel"
                          placeholder="01XXXXXXXXX"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bangla">
                      {locale === "bn" ? "পাসওয়ার্ড" : "Password"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-9 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bangla">
                      {locale === "bn"
                        ? "পাসওয়ার্ড নিশ্চিত করুন"
                        : "Confirm password"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type={showConfirm ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-9 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full bg-primary text-white hover:bg-primary-hover"
              >
                {isSubmitting
                  ? locale === "bn"
                    ? "তৈরি হচ্ছে..."
                    : "Creating account..."
                  : locale === "bn"
                    ? "রেজিস্ট্রেশন করুন"
                    : "Create account"}
              </Button>

              <p className="text-center font-bangla text-xs leading-relaxed text-muted-foreground">
                {locale === "bn"
                  ? "রেজিস্ট্রেশন করে আপনি আমাদের "
                  : "By signing up, you agree to our "}
                <Link href="/terms" className="text-primary hover:underline">
                  {locale === "bn" ? "শর্তাবলী" : "Terms"}
                </Link>{" "}
                {locale === "bn" ? "ও " : "and "}
                <Link href="/privacy" className="text-primary hover:underline">
                  {locale === "bn" ? "গোপনীয়তা নীতি" : "Privacy Policy"}
                </Link>{" "}
                {locale === "bn" ? "মেনে নিচ্ছেন" : "agree"}
              </p>
            </form>
          </Form>
        </div>

        <p className="mt-6 text-center font-bangla text-sm text-muted-foreground">
          {locale === "bn" ? "অ্যাকাউন্ট আছে?" : "Already have an account?"}{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            {locale === "bn" ? "লগইন করুন" : "Log in"}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
