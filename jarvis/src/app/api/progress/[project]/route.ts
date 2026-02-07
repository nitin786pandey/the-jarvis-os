import { NextResponse } from "next/server";
import { getProgress } from "@/lib/store";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ project: string }> }
) {
  const { project } = await params;
  const data = await getProgress(project);
  return NextResponse.json(data);
}
