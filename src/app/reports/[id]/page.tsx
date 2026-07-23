import { notFound } from "next/navigation";
import { getReport } from "@/lib/store";
import ReportForm from "@/components/ReportForm";

export default async function ReportEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      <ReportForm initialReport={report} />
    </div>
  );
}
