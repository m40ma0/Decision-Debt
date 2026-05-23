"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const authSchema = z.object({
  email: z.string().email("Use a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  fullName: z.string().optional()
});

export type AuthResult = {
  ok: boolean;
  message: string;
};

export async function signInAction(input: unknown): Promise<AuthResult> {
  const parsed = authSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid login." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Logged in." };
}

export async function signUpAction(input: unknown): Promise<AuthResult> {
  const parsed = authSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid sign up." };
  }

  const origin = headers().get("origin") ?? "";
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: parsed.data.fullName ?? ""
      }
    }
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Account created. Check your email if confirmation is enabled." };
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
