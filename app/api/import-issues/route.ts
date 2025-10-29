import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Octokit } from "octokit";
import { createYouTrackIssue } from "@/lib/youtrack";

export async function POST(request: Request) {
  try {
    const { owner, repo, projectId } = await request.json();
    if (!owner || !repo || !projectId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: owner, repo, and projectId are required",
        },
        { status: 400 }
      );
    }

    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accessToken } = await auth.api.getAccessToken({
      body: {
        providerId: "github",
        userId: session.user.id,
      },
      headers: headersList,
    });
    const octokit = new Octokit({
      auth: accessToken,
    });
    const { data: issues } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
    });

    const createdIssues = [];
    for (const issue of issues) {
      const youtrackIssue = await createYouTrackIssue({
        projectId,
        summary: issue.title,
        description: issue.body || "",
      });

      const youtrackLabel = `youtrack:${youtrackIssue.id}`;
      await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: issue.number,
        labels: [youtrackLabel],
      });

      createdIssues.push(youtrackIssue);
    }

    return NextResponse.json({
      message: `Successfully created ${createdIssues.length} issues in YouTrack`,
      issues: createdIssues,
    });
  } catch (error) {
    console.error("Error importing GitHub issues:", error);
    return NextResponse.json(
      { error: "Failed to import GitHub issues" },
      { status: 500 }
    );
  }
}
