"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { signUpAction } from "@/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_NAME } from "@/constants/app";
import { signInSchema, signUpSchema } from "@/lib/validations/auth";
import type { FieldErrors } from "@/lib/errors";

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

export default function SignInPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [signInErrors, setSignInErrors] = useState<FieldErrors>({});
  const [signUpErrors, setSignUpErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleSignIn = () => {
    setFormError(null);
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setSignInErrors(parsed.error.flatten().fieldErrors);
      return;
    }
    setSignInErrors({});
    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.ok) {
        toast.success("Welcome back");
        router.push("/dashboard");
      } else {
        setFormError("Invalid email or password.");
        toast.error("Invalid email or password.");
      }
    });
  };

  const handleSignUp = () => {
    setFormError(null);
    const parsed = signUpSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      setSignUpErrors(parsed.error.flatten().fieldErrors);
      return;
    }
    setSignUpErrors({});
    startTransition(async () => {
      const created = await signUpAction({ name, email, password });
      if (!created.ok) {
        setSignUpErrors(created.fieldErrors ?? {});
        setFormError(created.message);
        toast.error(created.message);
        return;
      }
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.ok) {
        toast.success(created.message ?? "Account created");
        router.push("/dashboard");
      } else {
        setFormError("Account created, but sign-in failed. Try signing in with your new account.");
      }
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{APP_NAME}</CardTitle>
          <CardDescription>Track your internship pipeline from discovery to decision.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="space-y-3 pt-3">
              {formError ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p> : null}
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={email} aria-invalid={Boolean(signInErrors.email)} onChange={(e) => setEmail(e.target.value)} />
                <FieldError message={signInErrors.email?.[0]} />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  aria-invalid={Boolean(signInErrors.password)}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <FieldError message={signInErrors.password?.[0]} />
              </div>
              <Button disabled={pending} className="w-full" onClick={handleSignIn}>
                {pending ? "Signing in..." : "Sign in"}
              </Button>
            </TabsContent>
            <TabsContent value="signup" className="space-y-3 pt-3">
              {formError ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p> : null}
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={name} aria-invalid={Boolean(signUpErrors.name)} onChange={(e) => setName(e.target.value)} />
                <FieldError message={signUpErrors.name?.[0]} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={email} aria-invalid={Boolean(signUpErrors.email)} onChange={(e) => setEmail(e.target.value)} />
                <FieldError message={signUpErrors.email?.[0]} />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  aria-invalid={Boolean(signUpErrors.password)}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
                <FieldError message={signUpErrors.password?.[0]} />
              </div>
              <Button disabled={pending} className="w-full" onClick={handleSignUp}>
                {pending ? "Creating..." : "Create account"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
