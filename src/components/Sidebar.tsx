"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "▢" },
  { href: "/reports", label: "Service Reports", icon: "☰" },
];

function NavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      suppressHydrationWarning
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
        active
          ? "bg-white/10 text-white"
          : "text-white/70 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className="text-base leading-none opacity-80">{icon}</span>
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 shrink-0 bg-navy text-white min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="font-display font-bold text-lg">Excel Test</div>
        <div className="text-[11px] uppercase tracking-wider text-white/50 mt-0.5">
          Service Reports
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
        ))}
      </nav>

      <div className="px-3 py-5 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition"
        >
          ⏻ Log out
        </button>
      </div>
    </aside>
  );
}
