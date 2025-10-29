import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Octokit } from "octokit";
import { createYouTrackIssue } from "@/lib/youtrack";

const GITHUB_PROVIDER_ID = "github";
const YOUTRACK_LABEL_PREFIX = "youtrack:";

const TYPE_LABELS = [
  "Bug",
  "Cosmetics",
  "Exception",
  "Feature",
  "Task",
  "Usability Problem",
  "Performance Problem",
  "Еріс",
];

type GitHubIssue = {
  number: number;
  title: string;
  body?: string | null;
  labels?: Array<string | { name?: string }>;
};

type YouTrackIssue = {
  id: string;
  [key: string]: any;
};

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

    const createdIssues = await importIssues({
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

async function importIssues({
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
    console.log("issue", issue);
    
    // Extract Type from labels if present
    const issueType = extractTypeFromLabels(issue.labels);
    
    const youtrackIssue = await createYouTrackIssue({
      projectId,
      summary: issue.title,
      description: issue.body || "",
      type: issueType,
    });

    await addYouTrackLabel({
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

async function addYouTrackLabel({
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

function extractTypeFromLabels(
  labels?: Array<string | { name?: string }>
): string | undefined {
  if (!labels) return undefined;

  for (const label of labels) {
    const labelName = typeof label === "string" ? label : label.name;
    if (!labelName) continue;

    const matchedType = TYPE_LABELS.find(
      (type) => type.toLowerCase() === labelName.toLowerCase()
    );
    if (matchedType) {
      return matchedType;
    }
  }

  return undefined;
}
