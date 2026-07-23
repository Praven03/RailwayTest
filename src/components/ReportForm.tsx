"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SignaturePad, { SignaturePadHandle } from "./SignaturePad";
import PartsTable from "./PartsTable";
import type { ServiceReport } from "@/lib/types";
import { SERVICE_TYPES } from "@/lib/types";

interface Props {
  initialReport: ServiceReport;
}

export default function ReportForm({ initialReport }: Props) {
  const router = useRouter();
  const [report, setReport] = useState<ServiceReport>(initialReport);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const custSigRef = useRef<SignaturePadHandle>(null);
  const techSigRef = useRef<SignaturePadHandle>(null);
  const printRef = useRef<HTMLDivElement>(null);

  function field<K extends keyof ServiceReport>(key: K, value: ServiceReport[K]) {
    setReport((r) => ({ ...r, [key]: value }));
  }

  function toggleServiceType(type: string) {
    setReport((r) => {
      const has = r.typeOfService.includes(type);
      return {
        ...r,
        typeOfService: has
          ? r.typeOfService.filter((t) => t !== type)
          : [...r.typeOfService, type],
      };
    });
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  async function persist(updates: Partial<ServiceReport>) {
    const res = await fetch(`/api/reports/${report.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to save");
    return (await res.json()) as ServiceReport;
  }

  async function handleSaveDraft() {
    setSaving(true);
    try {
      const custSig = custSigRef.current?.isEmpty()
        ? null
        : custSigRef.current?.toDataURL() ?? null;
      const techSig = techSigRef.current?.isEmpty()
        ? null
        : techSigRef.current?.toDataURL() ?? null;

      const updated = await persist({
        ...report,
        customerSignature: custSig,
        technicianSignature: techSig,
      });
      setReport(updated);
      showToast(`Saved ${updated.jobNo} as draft.`);
      router.refresh();
    } catch {
      showToast("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkComplete() {
    if (custSigRef.current?.isEmpty() || techSigRef.current?.isEmpty()) {
      showToast("Both signatures are required before marking complete.");
      return;
    }
    setSaving(true);
    try {
      const updated = await persist({
        ...report,
        status: "completed",
        customerSignature: custSigRef.current!.toDataURL(),
        technicianSignature: techSigRef.current!.toDataURL(),
      });
      setReport(updated);
      showToast(`${updated.jobNo} marked completed.`);
      router.refresh();
    } catch {
      showToast("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  async function handleGeneratePdf() {
    setGeneratingPdf(true);
    showToast("Rendering PDF…");
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      await new Promise((r) => setTimeout(r, 60));

      const node = printRef.current;
      if (!node) return;

      const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pdfHeight);
      pdf.save(`${report.jobNo}.pdf`);
      showToast(`Downloaded ${report.jobNo}.pdf`);
    } catch {
      showToast("Could not generate the PDF.");
    } finally {
      setGeneratingPdf(false);
    }
  }

  const custSigValue = report.customerSignature;
  const techSigValue = report.technicianSignature;
  const typesStr =
    report.typeOfService.length > 0
      ? report.typeOfService.join(", ") + (report.othersText ? `, ${report.othersText}` : "")
      : report.othersText || "—";

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <Link href="/reports" className="text-sm text-ink-soft hover:text-navy">
          ← Back to reports
        </Link>
        <span
          className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
            report.status === "completed"
              ? "bg-ok-soft text-ok"
              : "bg-[#EEF1F4] text-ink-soft"
          }`}
        >
          {report.status}
        </span>
      </div>

      <div className="bg-paper border border-line rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-line flex-wrap gap-3">
          <h1 className="font-display text-lg font-semibold text-navy">
            Service Report
          </h1>
          <div className="bg-amber-soft border border-dashed border-amber text-[#7A3D18] rounded-lg px-3.5 py-1.5 -rotate-1">
            <div className="text-[9px] uppercase tracking-widest text-[#A8663A]">
              Job No.
            </div>
            <div className="font-data font-bold text-base">{report.jobNo}</div>
          </div>
        </div>

        <Section title="Report details">
          <Grid cols={3}>
            <Field label="Ref. No">
              <input
                className="input"
                value={report.refNo}
                onChange={(e) => field("refNo", e.target.value)}
                placeholder="e.g. REF-2201"
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                className="input"
                value={report.date}
                onChange={(e) => field("date", e.target.value)}
              />
            </Field>
            <Field label="Contact No">
              <input
                className="input"
                value={report.contactNo}
                onChange={(e) => field("contactNo", e.target.value)}
                placeholder="+60 12-345 6789"
              />
            </Field>
          </Grid>
          <Grid cols={2}>
            <Field label="Customer / Company">
              <input
                className="input"
                value={report.clientName}
                onChange={(e) => field("clientName", e.target.value)}
                placeholder="Client company name"
              />
            </Field>
            <Field label="User (on-site contact)">
              <input
                className="input"
                value={report.userName}
                onChange={(e) => field("userName", e.target.value)}
                placeholder="Name of site contact"
              />
            </Field>
          </Grid>
        </Section>

        <Section title="Equipment">
          <Grid cols={2}>
            <Field label="Equipment">
              <input
                className="input"
                value={report.equipment}
                onChange={(e) => field("equipment", e.target.value)}
                placeholder="e.g. Digital Pressure Gauge"
              />
            </Field>
            <Field label="Brand">
              <input
                className="input"
                value={report.brand}
                onChange={(e) => field("brand", e.target.value)}
                placeholder="e.g. Fluke"
              />
            </Field>
            <Field label="Model">
              <input
                className="input"
                value={report.model}
                onChange={(e) => field("model", e.target.value)}
                placeholder="e.g. 719Pro"
              />
            </Field>
            <Field label="SN & CR No">
              <input
                className="input"
                value={report.snCrNo}
                onChange={(e) => field("snCrNo", e.target.value)}
                placeholder="Serial / cert no."
              />
            </Field>
          </Grid>
        </Section>

        <Section title="Type of service">
          <div className="flex flex-wrap gap-x-6 gap-y-2.5 mb-4">
            {SERVICE_TYPES.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 text-sm text-ink"
              >
                <input
                  type="checkbox"
                  checked={report.typeOfService.includes(type)}
                  onChange={() => toggleServiceType(type)}
                  className="w-4 h-4 accent-amber"
                />
                {type}
              </label>
            ))}
          </div>
          <Field label="Others">
            <input
              className="input"
              value={report.othersText}
              onChange={(e) => field("othersText", e.target.value)}
              placeholder="Specify if not listed above"
            />
          </Field>
        </Section>

        <Section title="Job scope">
          <textarea
            className="input min-h-[90px]"
            value={report.jobScope}
            onChange={(e) => field("jobScope", e.target.value)}
            placeholder="Describe the scope of work requested…"
          />
        </Section>

        <Section title="Action taken">
          <textarea
            className="input min-h-[130px]"
            value={report.actionTaken}
            onChange={(e) => field("actionTaken", e.target.value)}
            placeholder="Describe what was carried out…"
          />
        </Section>

        <Section title="Parts replaced (if any)">
          <PartsTable
            parts={report.parts}
            onChange={(parts) => field("parts", parts)}
          />
        </Section>

        <Section title="Conclusion / effectiveness">
          <textarea
            className="input min-h-[90px]"
            value={report.conclusion}
            onChange={(e) => field("conclusion", e.target.value)}
            placeholder="Summarize outcome and effectiveness…"
          />
        </Section>

        <Section title="Customer acceptance & sign-off">
          <Grid cols={2}>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-2">
                Customer signature
              </div>
              <SignaturePad
                ref={custSigRef}
                initialValue={custSigValue}
                onChange={(v) => field("customerSignature", v)}
              />
              <Grid cols={2}>
                <Field label="Name">
                  <input
                    className="input"
                    value={report.customerName}
                    onChange={(e) => field("customerName", e.target.value)}
                    placeholder="Customer name"
                  />
                </Field>
                <Field label="Date">
                  <input
                    type="date"
                    className="input"
                    value={report.customerDate}
                    onChange={(e) => field("customerDate", e.target.value)}
                  />
                </Field>
              </Grid>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-2">
                Technical personnel signature
              </div>
              <SignaturePad
                ref={techSigRef}
                initialValue={techSigValue}
                onChange={(v) => field("technicianSignature", v)}
              />
              <Grid cols={2}>
                <Field label="Name">
                  <input
                    className="input"
                    value={report.technicianName}
                    onChange={(e) => field("technicianName", e.target.value)}
                    placeholder="Technician name"
                  />
                </Field>
                <Field label="Date">
                  <input
                    type="date"
                    className="input"
                    value={report.technicianDate}
                    onChange={(e) => field("technicianDate", e.target.value)}
                  />
                </Field>
              </Grid>
            </div>
          </Grid>
        </Section>

        <div className="px-6 py-5 flex flex-wrap gap-3 justify-end bg-[#FAFBFC]">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="border border-line bg-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#F7F8FA] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save as draft"}
          </button>
          <button
            onClick={handleMarkComplete}
            disabled={saving}
            className="bg-navy text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60"
          >
            Mark completed
          </button>
          <button
            onClick={handleGeneratePdf}
            disabled={generatingPdf}
            className="bg-amber text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60"
          >
            {generatingPdf ? "Generating…" : "Generate PDF"}
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-navy text-white text-sm px-5 py-3 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="fixed -left-[9999px] top-0 w-[780px]">
        <div ref={printRef} className="bg-white p-9 font-sans text-[#1A2333]">
          <div className="flex justify-between items-start border-b-2 border-navy pb-3.5 mb-4.5">
            <div>
              <div className="font-display font-bold text-xl text-navy">
                Excel Test Sdn. Bhd.
              </div>
              <div className="text-[11px] text-ink-soft mt-1">
                Sales Office: Unit C3A10, Level 3A · Calibration Lab: Unit C717, Level 7
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs">SERVICE REPORT</div>
              <div className="font-data font-bold text-base text-[#8A4A22]">
                {report.jobNo}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs mb-4">
            <PrintRow k="Ref. No" v={report.refNo} />
            <PrintRow k="Date" v={report.date} />
            <PrintRow k="Customer" v={report.clientName} />
            <PrintRow k="Equipment" v={report.equipment} />
            <PrintRow k="User" v={report.userName} />
            <PrintRow k="Brand" v={report.brand} />
            <PrintRow k="Contact No" v={report.contactNo} />
            <PrintRow k="Model" v={report.model} />
            <PrintRow k="SN & CR No" v={report.snCrNo} />
            <PrintRow k="Type of service" v={typesStr} />
          </div>

          <PrintSectionTitle>Job scope</PrintSectionTitle>
          <p className="text-xs whitespace-pre-wrap">{report.jobScope || "—"}</p>

          <PrintSectionTitle>Action taken</PrintSectionTitle>
          <p className="text-xs whitespace-pre-wrap">{report.actionTaken || "—"}</p>

          <PrintSectionTitle>Part replaced</PrintSectionTitle>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="border border-line px-2 py-1 text-left w-9">No.</th>
                <th className="border border-line px-2 py-1 text-left">Description</th>
                <th className="border border-line px-2 py-1 text-left w-14">Qty</th>
              </tr>
            </thead>
            <tbody>
              {report.parts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="border border-line px-2 py-2 text-center text-ink-soft">
                    No parts replaced
                  </td>
                </tr>
              ) : (
                report.parts.map((p, i) => (
                  <tr key={p.id}>
                    <td className="border border-line px-2 py-1">{i + 1}</td>
                    <td className="border border-line px-2 py-1">{p.description}</td>
                    <td className="border border-line px-2 py-1">{p.qty}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <PrintSectionTitle>Conclusion / effectiveness</PrintSectionTitle>
          <p className="text-xs whitespace-pre-wrap">{report.conclusion || "—"}</p>

          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              {custSigValue ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={custSigValue} alt="Customer signature" className="max-h-[70px] border-b border-ink" />
              ) : (
                <div className="h-[70px] border-b border-ink" />
              )}
              <div className="text-[11px] text-ink-soft mt-1.5">
                Customer acceptance — {report.customerName}{" "}
                {report.customerDate && `· ${report.customerDate}`}
              </div>
            </div>
            <div>
              {techSigValue ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={techSigValue} alt="Technician signature" className="max-h-[70px] border-b border-ink" />
              ) : (
                <div className="h-[70px] border-b border-ink" />
              )}
              <div className="text-[11px] text-ink-soft mt-1.5">
                Technical personnel — {report.technicianName}{" "}
                {report.technicianDate && `· ${report.technicianDate}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-6 py-5 border-b border-line">
      <h2 className="text-xs uppercase tracking-wide text-ink-soft font-semibold mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber inline-block" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function Grid({ cols, children }: { cols: 2 | 3; children: React.ReactNode }) {
  const cls = cols === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2";
  return <div className={`grid ${cls} gap-4 mb-3.5`}>{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-soft mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function PrintRow({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <span className="text-ink-soft inline-block w-[110px]">{k}</span>
      {v || "—"}
    </div>
  );
}

function PrintSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-wide text-ink-soft border-b border-line pb-1 mt-4 mb-2">
      {children}
    </div>
  );
}
