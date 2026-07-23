"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-display font-bold text-2xl text-navy">Excel Test</div>
          <div className="text-xs uppercase tracking-wider text-ink-soft mt-1">
            Service Report Portal
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-paper border border-line rounded-xl shadow-sm p-7"
        >
          <h1 className="font-display text-lg font-semibold text-navy mb-1">
            Sign in
          </h1>
          <p className="text-sm text-ink-soft mb-6">
            Enter your technician credentials to continue.
          </p>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-ink-soft mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@exceltest.com.my"
              autoFocus
              className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-[#FCFCFD] focus:outline-none focus:ring-2 focus:ring-[#9DB6E0]"
            />
          </div>

          <div className="mb-2">
            <label className="block text-xs font-semibold text-ink-soft mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-[#FCFCFD] focus:outline-none focus:ring-2 focus:ring-[#9DB6E0]"
            />
          </div>

          {error && (
            <div className="mt-3 text-sm text-warn bg-warn-soft border border-[#EBD0C7] rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-amber text-white font-semibold text-sm rounded-lg py-2.5 hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
