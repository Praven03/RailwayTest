import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Used inside Server Components, Server Actions, and API routes.
// Reads/writes the auth session via cookies, so the user stays logged
// in across requests without you having to manage tokens manually.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component that can't set cookies —
            // safe to ignore if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
