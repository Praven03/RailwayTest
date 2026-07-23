import { NextResponse } from "next/server";
import { createReport, listReports } from "@/lib/store";

export async function GET() {
  const reports = await listReports();
  return NextResponse.json(reports);
}

export async function POST() {
  // job_no is assigned automatically by the database.
  const report = await createReport();
  return NextResponse.json(report, { status: 201 });
}
