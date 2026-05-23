"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { signInAction, signUpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/toast-provider";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: ""
  });

  const isLogin = mode === "login";

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const action = isLogin ? signInAction : signUpAction;
      const result = await action(form);
      toast({
        title: result.message,
        tone: result.ok ? "success" : "error"
      });
      if (result.ok && isLogin) router.push("/dashboard");
      if (result.ok && !isLogin) router.push("/login");
    });
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10 text-ink">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">
            Decision Debt
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">
            {isLogin ? "Log in" : "Create account"}
          </h1>
        </div>
        <Card>
          <CardContent>
            <form className="space-y-4" onSubmit={submit}>
              {!isLogin ? (
                <Field label="Name" htmlFor="fullName">
                  <Input
                    id="fullName"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        fullName: event.target.value
                      }))
                    }
                  />
                </Field>
              ) : null}
              <Field label="Email" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="Password" htmlFor="password">
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      password: event.target.value
                    }))
                  }
                />
              </Field>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isLogin ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {isPending ? "Working" : isLogin ? "Log in" : "Sign up"}
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-ink/60">
              {isLogin ? "Need an account?" : "Already have an account?"}{" "}
              <Link
                className="font-semibold text-moss underline-offset-4 hover:underline"
                href={isLogin ? "/sign-up" : "/login"}
              >
                {isLogin ? "Sign up" : "Log in"}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
