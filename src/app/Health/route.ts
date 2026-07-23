import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Railway (and Docker HEALTHCHECK) hit this to confirm the app is not
// just running, but actually able to reach the database. A 200 here
// means: server is up AND Supabase is reachable AND the schema exists.
export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("service_reports")
      .select("id", { count: "exact", head: true })
      .limit(1);

    if (error) {
      return NextResponse.json(
        { status: "error", database: "unreachable", detail: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { status: "error", detail: err instanceof Error ? err.message : "Unknown error" },
      { status: 503 }
    );
  }
}
