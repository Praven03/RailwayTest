import { redirect } from "next/navigation";
import { createReport } from "@/lib/store";

export default async function NewReportPage() {
  const report = await createReport();
  redirect(`/reports/${report.id}`);
}
