export type GitHubLabel = {
  id?: number;
  node_id?: string;
  url?: string;
  name?: string;
  color?: string | null;
  default?: boolean;
  description?: string | null;
};

export type GitHubIssue = {
  number: number;
  title: string;
  body?: string | null;
  labels?: Array<string | GitHubLabel>;
};
