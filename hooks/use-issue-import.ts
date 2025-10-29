import { useState } from "react";
import useSWRMutation from "swr/mutation";
import axios from "axios";

type ImportPayload = {
  owner: string;
  repo: string;
  projectId: string;
};

type UseIssueImportReturn = {
  selectedRepo: any | null;
  setSelectedRepo: (repo: any | null) => void;
  youtrackProjectId: string;
  setYoutrackProjectId: (id: string) => void;
  importing: boolean;
  importResult: any;
  resetImportResult: () => void;
  handleImportIssues: () => Promise<void>;
  cancelImport: () => void;
};

const importIssues = async (url: string, { arg }: { arg: ImportPayload }) => {
  const { data } = await axios.post(url, arg);
  return data;
};

export function useIssueImport(): UseIssueImportReturn {
  const [selectedRepo, setSelectedRepo] = useState<any | null>(null);
  const [youtrackProjectId, setYoutrackProjectId] = useState("");

  const { trigger, isMutating, data, reset } = useSWRMutation(
    "/api/import-issues",
    importIssues
  );

  const handleImportIssues = async () => {
    if (!selectedRepo || !youtrackProjectId) {
      alert("Please select a repository and enter a YouTrack project ID");
      return;
    }

    try {
      const [owner, repo] = selectedRepo.full_name.split("/");
      await trigger({ owner, repo, projectId: youtrackProjectId });
      setSelectedRepo(null);
      setYoutrackProjectId("");
    } catch (error: any) {
      alert(error.message || "Failed to import issues");
      console.error("Error importing issues:", error);
    }
  };

  const cancelImport = () => {
    setSelectedRepo(null);
    setYoutrackProjectId("");
  };

  return {
    selectedRepo,
    setSelectedRepo,
    youtrackProjectId,
    setYoutrackProjectId,
    importing: isMutating,
    importResult: data,
    resetImportResult: reset,
    handleImportIssues,
    cancelImport,
  };
}
