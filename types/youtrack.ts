export type YouTrackIssue = {
  id: string;
  [key: string]: any;
};

export type YouTrackIssueUpdateBody = {
  summary?: string;
  description?: string;
  customFields?: Array<{
    name: string;
    $type: string;
    value: {
      name: string;
    };
  }>;
};
