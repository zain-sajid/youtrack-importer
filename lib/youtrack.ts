import axios from "axios";

interface CreateIssueParams {
  projectId: string;
  summary: string;
  description: string;
}

export async function createYouTrackIssue({
  projectId,
  summary,
  description,
}: CreateIssueParams) {
  try {
    const response = await axios.post(
      `${process.env.YOUTRACK_BASE_URL}/api/issues`,
      {
        project: {
          id: projectId,
        },
        summary,
        description,
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

interface UpdateIssueStateParams {
  issueId: string;
  stateName: string;
}

export async function updateIssueState({
  issueId,
  stateName,
}: UpdateIssueStateParams) {
  try {
    const response = await axios.post(
      `${process.env.YOUTRACK_BASE_URL}/api/issues/${issueId}`,
      {
        customFields: [
          {
            name: "State",
            $type: "StateIssueCustomField",
            value: {
              name: stateName,
            },
          },
        ],
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
    console.error("Error updating YouTrack issue state:", error);
    throw error;
  }
}
