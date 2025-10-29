"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { UserProfile } from "@/components/user-profile";
import { ImportForm } from "@/components/import-form";
import { ImportResult } from "@/components/import-result";
import { RepositoryList } from "@/components/repository-list";
import { useRepositories } from "@/hooks/use-repositories";
import { useIssueImport } from "@/hooks/use-issue-import";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();

  const {
    repos,
    totalRepos,
    loading,
    currentPage,
    pagination,
    limitedScope,
    handlePageChange,
  } = useRepositories(session);

  const {
    selectedRepo,
    setSelectedRepo,
    youtrackProjectId,
    setYoutrackProjectId,
    importing,
    importResult,
    resetImportResult,
    handleImportIssues,
    cancelImport,
  } = useIssueImport();

  const handleGitHubSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/",
    });
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={handleGitHubSignIn}>Sign in with GitHub</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-lg w-full bg-white border rounded-lg p-8">
        <UserProfile />

        {selectedRepo && (
          <ImportForm
            selectedRepo={selectedRepo}
            youtrackProjectId={youtrackProjectId}
            importing={importing}
            onYoutrackProjectIdChange={setYoutrackProjectId}
            onImport={handleImportIssues}
            onCancel={cancelImport}
          />
        )}

        {importResult && (
          <ImportResult
            result={importResult}
            onDismiss={resetImportResult}
          />
        )}

        <RepositoryList
          repos={repos}
          totalRepos={totalRepos}
          loading={loading}
          currentPage={currentPage}
          pagination={pagination}
          selectedRepo={selectedRepo}
          onSelectRepo={setSelectedRepo}
          onPageChange={handlePageChange}
          limitedScope={limitedScope}
        />
      </div>
    </div>
  );
}
