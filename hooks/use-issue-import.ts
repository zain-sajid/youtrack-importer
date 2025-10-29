import { useState } from "react";

interface UseIssueImportReturn {
  selectedRepo: any | null;
  setSelectedRepo: (repo: any | null) => void;
  youtrackProjectId: string;
  setYoutrackProjectId: (id: string) => void;
  importing: boolean;
  importResult: any;
  setImportResult: (result: any) => void;
  handleImportIssues: () => Promise<void>;
  cancelImport: () => void;
}

export function useIssueImport(): UseIssueImportReturn {
  const [selectedRepo, setSelectedRepo] = useState<any | null>(null);
  const [youtrackProjectId, setYoutrackProjectId] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const handleImportIssues = async () => {
    if (!selectedRepo || !youtrackProjectId) {
      alert("Please select a repository and enter a YouTrack project ID");
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const [owner, repo] = selectedRepo.full_name.split("/");
      const res = await fetch("/api/import-issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner,
          repo,
          projectId: youtrackProjectId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to import issues");
      }

      setImportResult(data);
      setSelectedRepo(null);
      setYoutrackProjectId("");
    } catch (error: any) {
      alert(error.message || "Failed to import issues");
      console.error("Error importing issues:", error);
    } finally {
      setImporting(false);
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
    importing,
    importResult,
    setImportResult,
    handleImportIssues,
    cancelImport,
  };
}

