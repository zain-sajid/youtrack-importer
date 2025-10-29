import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Octokit } from "octokit";
import { createYouTrackIssue, extractTypeFromLabels } from "@/lib/youtrack";
import { GitHubIssue } from "@/types/github";
import { YouTrackIssue } from "@/types/youtrack";
import { GITHUB_PROVIDER_ID, YOUTRACK_LABEL_PREFIX } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const { accessToken } = await auth.api.getAccessToken({
      body: { providerId: GITHUB_PROVIDER_ID },
      headers: headersList,
    });

    const octokit = new Octokit({ auth: accessToken });
    const { data: issues } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
    });

    const createdIssues = await importGitHubIssuesToYouTrack({
      issues,
      projectId,
      octokit,
      owner,
      repo,
    });

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

async function importGitHubIssuesToYouTrack({
  issues,
  projectId,
  octokit,
  owner,
  repo,
}: {
  issues: GitHubIssue[];
  projectId: string;
  octokit: Octokit;
  owner: string;
  repo: string;
}): Promise<YouTrackIssue[]> {
  const createdIssues: YouTrackIssue[] = [];

  for (const issue of issues) {
    const issueType = extractTypeFromLabels(issue.labels);
    const youtrackIssue = await createYouTrackIssue({
      projectId,
      summary: issue.title,
      description: issue.body || "",
      type: issueType,
    });

    await addYouTrackLabelToGitHubIssue({
      octokit,
      owner,
      repo,
      issueNumber: issue.number,
      youtrackIssueId: youtrackIssue.id,
    });

    createdIssues.push(youtrackIssue);
  }

  return createdIssues;
}

async function addYouTrackLabelToGitHubIssue({
  octokit,
  owner,
  repo,
  issueNumber,
  youtrackIssueId,
}: {
  octokit: Octokit;
  owner: string;
  repo: string;
  issueNumber: number;
  youtrackIssueId: string;
}): Promise<void> {
  const youtrackLabel = `${YOUTRACK_LABEL_PREFIX}${youtrackIssueId}`;
  await octokit.rest.issues.addLabels({
    owner,
    repo,
    issue_number: issueNumber,
    labels: [youtrackLabel],
  });
}
