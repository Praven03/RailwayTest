import Link from "next/link";
import { listReports } from "@/lib/store";

export default async function ReportsPage() {
  const reports = await listReports();

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">
            Service Reports
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            All reports stored in Supabase.
          </p>
        </div>
        <Link
          href="/reports/new"
          className="bg-amber text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 active:scale-[0.98] transition"
        >
          + New Service Report
        </Link>
      </div>

      <div className="bg-paper border border-line rounded-xl overflow-hidden">
        {reports.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-ink-soft">
            No reports yet.{" "}
            <Link href="/reports/new" className="text-amber font-semibold">
              Create your first one
            </Link>
            .
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left text-[11px] uppercase tracking-wide text-ink-soft font-semibold px-6 py-3">
                  Job No
                </th>
                <th className="text-left text-[11px] uppercase tracking-wide text-ink-soft font-semibold px-6 py-3">
                  Client
                </th>
                <th className="text-left text-[11px] uppercase tracking-wide text-ink-soft font-semibold px-6 py-3">
                  Date
                </th>
                <th className="text-left text-[11px] uppercase tracking-wide text-ink-soft font-semibold px-6 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="px-6 py-3.5">
                    <Link
                      href={`/reports/${r.id}`}
                      className="font-data font-semibold text-sm text-navy hover:underline"
                    >
                      {r.jobNo}
                    </Link>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-ink">
                    {r.clientName || (
                      <span className="text-ink-soft italic">No client set</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-ink-soft">
                    {r.date || "—"}
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                        r.status === "completed"
                          ? "bg-ok-soft text-ok"
                          : "bg-[#EEF1F4] text-ink-soft"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
