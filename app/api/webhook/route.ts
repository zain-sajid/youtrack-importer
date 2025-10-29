import { extractTypeFromLabels, updateYouTrackIssue } from "@/lib/youtrack";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    console.log("payload", payload);

    switch (payload.action) {
      case "closed": {
        const youtrackIssueId = getYouTrackIssueId(payload);
        if (!youtrackIssueId) break;

        await updateYouTrackIssue({
          issueId: youtrackIssueId,
          stateName: "Fixed",
        });
        break;
      }
      case "reopened": {
        const youtrackIssueId = getYouTrackIssueId(payload);
        if (!youtrackIssueId) break;

        await updateYouTrackIssue({
          issueId: youtrackIssueId,
          stateName: "Open",
        });
        break;
      }
      case "labeled": {
        const youtrackIssueId = getYouTrackIssueId(payload);
        if (!youtrackIssueId) break;

        const type = extractTypeFromLabels(payload.issue.labels);

        if (!type) break;

        await updateYouTrackIssue({
          issueId: youtrackIssueId,
          type,
        });
        break;
      }

      case "edited": {
        const youtrackIssueId = getYouTrackIssueId(payload);
        if (!youtrackIssueId) break;

        const { title, body } = payload.issue;

        await updateYouTrackIssue({
          issueId: youtrackIssueId,
          summary: title,
          description: body,
        });
        break;
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

function getYouTrackIssueId(payload: any): string | null {
  const labels = payload.issue.labels.map((label: any) => label.name);
  const youtrackLabel = labels.find((label: any) =>
    label.startsWith("youtrack:")
  );
  const youtrackIssueId = youtrackLabel?.split(":")[1];

  if (!youtrackIssueId) {
    console.log("No valid YouTrack label found, skipping webhook processing");
    return null;
  }

  return youtrackIssueId;
}
