import axios from "axios";
import { GitHubLabel } from "@/types/github";
import { YouTrackIssueUpdateBody } from "@/types/youtrack";

const TYPE_LABELS = [
  "Bug",
  "Cosmetics",
  "Exception",
  "Feature",
  "Task",
  "Usability Problem",
  "Performance Problem",
  "Epic",
];

export function extractTypeFromLabels(
  labels?: Array<string | GitHubLabel>
): string | undefined {
  if (!labels) return;

  for (const label of labels) {
    const labelName = typeof label === "string" ? label : label.name;
    if (!labelName) continue;

    const matchedType = TYPE_LABELS.find(
      (type) => type.toLowerCase() === labelName.toLowerCase().trim()
    );

    if (matchedType) {
      return matchedType;
    }
  }

  return undefined;
}

type CreateIssueParams = {
  projectId: string;
  summary: string;
  description: string;
  type?: string;
};

export async function createYouTrackIssue({
  projectId,
  summary,
  description,
  type,
}: CreateIssueParams) {
  try {
    const customFields = [];

    if (type) {
      customFields.push({
        name: "Type",
        $type: "SingleEnumIssueCustomField",
        value: {
          name: type,
        },
      });
    }

    const response = await axios.post(
      `${process.env.YOUTRACK_BASE_URL}/api/issues`,
      {
        project: {
          id: projectId,
        },
        summary,
        description,
        ...(customFields.length > 0 && { customFields }),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.YOUTRACK_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating YouTrack issue:", error);
    throw error;
  }
}

type UpdateYouTrackIssueParams = {
  issueId: string;
  stateName?: string;
  type?: string;
  summary?: string;
  description?: string;
};

export async function updateYouTrackIssue({
  issueId,
  stateName,
  type,
  summary,
  description,
}: UpdateYouTrackIssueParams) {
  try {
    const customFields: YouTrackIssueUpdateBody["customFields"] = [];

    if (stateName) {
      customFields.push({
        name: "State",
        $type: "StateIssueCustomField",
        value: {
          name: stateName,
        },
      });
    }

    if (type) {
      customFields.push({
        name: "Type",
        $type: "SingleEnumIssueCustomField",
        value: {
          name: type,
        },
      });
    }

    const body: YouTrackIssueUpdateBody = {};
    if (summary !== undefined) body.summary = summary;
    if (description !== undefined) body.description = description;
    if (customFields.length > 0) body.customFields = customFields;

    const response = await axios.post(
      `${process.env.YOUTRACK_BASE_URL}/api/issues/${issueId}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${process.env.YOUTRACK_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating YouTrack issue:", error);
    throw error;
  }
}
