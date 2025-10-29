"use client";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";

interface PaginationInfo {
  page: number;
  perPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const [repos, setRepos] = useState<any[]>([]);
  const [totalRepos, setTotalRepos] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    perPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [selectedRepo, setSelectedRepo] = useState<any | null>(null);
  const [youtrackProjectId, setYoutrackProjectId] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  useEffect(() => {
    if (session) {
      fetchRepos(currentPage);
    }
  }, [session, currentPage]);

  const fetchRepos = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/github/repos?page=${page}&per_page=10`);
      const data = await res.json();
      setRepos(data.repos || []);
      setTotalRepos(data.totalRepos || 0);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching repos:", error);
    }
    setLoading(false);
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const totalPages = Math.ceil(totalRepos / pagination.perPage);
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      // Adjust if we're near the beginning or end
      if (currentPage <= 3) {
        endPage = maxPagesToShow;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxPagesToShow + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const requestAdditionalScopes = async () => {
    await authClient.linkSocial({
      provider: "github",
      scopes: ["read:user", "user:email", "repo", "read:org"],
    });
  };

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

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button
          onClick={async () => {
            await authClient.signIn.social({
              provider: "github",
              callbackURL: "/",
            });
          }}
        >
          Sign in with GitHub
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        {session.user.image && (
          <div className="flex justify-center mb-6">
            <img
              src={session.user.image}
              alt="User avatar"
              className="w-20 h-20 rounded-full"
            />
          </div>
        )}

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {session.user.name || "Welcome"}
          </h1>
          <p className="text-gray-600">{session.user.email}</p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={requestAdditionalScopes}
            variant="outline"
            className="w-full"
          >
            Request Additional GitHub Permissions
          </Button>

          <Button
            onClick={async () => {
              await authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    window.location.href = "/";
                  },
                },
              });
            }}
            variant="destructive"
            className="w-full"
          >
            Sign Out
          </Button>
        </div>

        {selectedRepo && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">
              Import Issues to YouTrack
            </h3>
            <p className="text-sm mb-3">
              Selected:{" "}
              <span className="font-medium">{selectedRepo.full_name}</span>
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  YouTrack Project ID
                </label>
                <input
                  type="text"
                  value={youtrackProjectId}
                  onChange={(e) => setYoutrackProjectId(e.target.value)}
                  placeholder="e.g., 0-0"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={importing}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleImportIssues}
                  disabled={importing || !youtrackProjectId}
                  className="flex-1"
                >
                  {importing ? "Importing..." : "Import Issues"}
                </Button>
                <Button
                  onClick={() => {
                    setSelectedRepo(null);
                    setYoutrackProjectId("");
                  }}
                  variant="outline"
                  disabled={importing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {importResult && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-sm font-semibold text-green-800 mb-2">
              ✓ Import Successful
            </h3>
            <p className="text-sm text-green-700">{importResult.message}</p>
            <Button
              onClick={() => setImportResult(null)}
              variant="outline"
              className="mt-3 w-full"
            >
              Dismiss
            </Button>
          </div>
        )}

        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Your Repositories</h2>
            {totalRepos > 0 && (
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {totalRepos} {totalRepos === 1 ? "repo" : "repos"}
              </span>
            )}
          </div>
          {loading ? (
            <p className="text-gray-500">Loading repos...</p>
          ) : (
            <>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {repos.length > 0 ? (
                  repos.map((repo) => (
                    <div
                      key={repo.id}
                      className={`p-3 border rounded hover:bg-gray-50 transition-colors ${
                        selectedRepo?.id === repo.id
                          ? "border-blue-500 bg-blue-50"
                          : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 font-medium hover:underline"
                          >
                            {repo.full_name}
                          </a>
                          {repo.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {repo.description}
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={() => setSelectedRepo(repo)}
                          variant={
                            selectedRepo?.id === repo.id ? "default" : "outline"
                          }
                          size="sm"
                          className="ml-2"
                        >
                          {selectedRepo?.id === repo.id ? "Selected" : "Select"}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No repositories found</p>
                )}
              </div>

              {repos.length > 0 && totalRepos > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={(e) => {
                            e.preventDefault();
                            handlePrevPage();
                          }}
                          className={
                            !pagination.hasPrevPage
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {getPageNumbers().map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={page === currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageClick(page);
                            }}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={(e) => {
                            e.preventDefault();
                            handleNextPage();
                          }}
                          className={
                            !pagination.hasNextPage
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Page {currentPage} of{" "}
                    {Math.ceil(totalRepos / pagination.perPage)} ({totalRepos}{" "}
                    total repos)
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
