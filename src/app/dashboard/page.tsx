import Link from "next/link";
import { listReports } from "@/lib/store";

export default async function DashboardPage() {
  const reports = await listReports();
  const total = reports.length;
  const draft = reports.filter((r) => r.status === "draft").length;
  const completed = reports.filter((r) => r.status === "completed").length;
  const recent = reports.slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">
            Dashboard
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Welcome back. Here&apos;s what&apos;s happening with your
            service reports.
          </p>
        </div>
        <Link
          href="/reports/new"
          className="bg-amber text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 active:scale-[0.98] transition"
        >
          + New Service Report
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total reports" value={total} accent="navy" />
        <StatCard label="Drafts" value={draft} accent="amber" />
        <StatCard label="Completed" value={completed} accent="ok" />
      </div>

      <div className="bg-paper border border-line rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="font-display font-semibold text-navy text-sm">
            Recent reports
          </h2>
          <Link
            href="/reports"
            className="text-xs font-semibold text-ink-soft hover:text-navy"
          >
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-ink-soft">
            No reports yet.{" "}
            <Link href="/reports/new" className="text-amber font-semibold">
              Create your first one
            </Link>
            .
          </div>
        ) : (
          <div className="divide-y divide-line">
            {recent.map((r) => (
              <Link
                key={r.id}
                href={`/reports/${r.id}`}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-[#F7F8FA] transition"
              >
                <div>
                  <div className="font-data font-semibold text-sm text-navy">
                    {r.jobNo}
                  </div>
                  <div className="text-xs text-ink-soft mt-0.5">
                    {r.clientName || "No client set"}
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "navy" | "amber" | "ok";
}) {
  const accentClass =
    accent === "navy"
      ? "text-navy"
      : accent === "amber"
      ? "text-amber"
      : "text-ok";
  return (
    <div className="bg-paper border border-line rounded-xl px-5 py-4">
      <div className="text-xs uppercase tracking-wide text-ink-soft font-semibold">
        {label}
      </div>
      <div className={`font-display text-3xl font-bold mt-1.5 ${accentClass}`}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "draft" | "completed" }) {
  const classes =
    status === "completed"
      ? "bg-ok-soft text-ok"
      : "bg-[#EEF1F4] text-ink-soft";
  return (
    <span
      className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${classes}`}
    >
      {status}
    </span>
  );
}
