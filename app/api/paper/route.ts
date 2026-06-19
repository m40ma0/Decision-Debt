import { NextResponse } from "next/server";
import { buildMoonshotPaperMarkdown } from "@/lib/moonshot";

export async function GET() {
  return new NextResponse(buildMoonshotPaperMarkdown(), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": 'attachment; filename="moonshot-paper.md"'
    }
  });
}
