import axios from "axios";

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

    // Add Type custom field if provided
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

type UpdateIssueStateParams = {
  issueId: string;
  stateName: string;
};

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
