import { updateIssueState } from "@/lib/youtrack";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    switch (payload.action) {
      case "closed":
        const labels = payload.issue.labels.map((label: any) => label.name);
        const youtrackLabel = labels.find((label: any) =>
          label.startsWith("youtrack:")
        );
        const youtrackIssueId = youtrackLabel.split(":")[1];
        await updateIssueState({
          issueId: youtrackIssueId,
          stateName: "Fixed",
        });
        break;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
