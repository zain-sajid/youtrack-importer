import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Info } from "lucide-react";

type PaginationInfo = {
  page: number;
  perPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

type Repository = {
  id: number;
  full_name: string;
  html_url: string;
  description?: string;
};

type RepositoryListProps = {
  repos: Repository[];
  totalRepos: number;
  loading: boolean;
  currentPage: number;
  pagination: PaginationInfo;
  selectedRepo: Repository | null;
  onSelectRepo: (repo: Repository) => void;
  onPageChange: (page: number) => void;
  limitedScope?: boolean;
};

export function RepositoryList({
  repos,
  totalRepos,
  loading,
  currentPage,
  pagination,
  selectedRepo,
  onSelectRepo,
  onPageChange,
  limitedScope,
}: RepositoryListProps) {
  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      onPageChange(currentPage - 1);
    }
  };

  const getPageNumbers = () => {
    const totalPages = Math.ceil(totalRepos / pagination.perPage);
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

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

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Your Repositories</h2>
        {totalRepos > 0 && (
          <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-md">
            {totalRepos} {totalRepos === 1 ? "repo" : "repos"}
          </span>
        )}
      </div>

      {limitedScope && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 mb-2">
                You're viewing{" "}
                <span className="font-semibold">public repositories only</span>.
                Grant additional permissions to access private repositories.
              </p>
              <Button
                onClick={async () => {
                  await authClient.linkSocial({
                    provider: "github",
                    scopes: ["read:user", "user:email", "repo", "read:org"],
                  });
                }}
                size="sm"
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Grant Access to Private Repos
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2 p-1">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="p-3 border rounded">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-2 overflow-y-auto p-1">
            {repos.length > 0 ? (
              repos.map((repo) => (
                <div
                  key={repo.id}
                  className={cn(
                    "p-3 border rounded hover:bg-gray-50 transition-colors",
                    selectedRepo?.id === repo.id && "border-blue-500 bg-blue-50"
                  )}
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
                      onClick={() => onSelectRepo(repo)}
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
            <div className="mt-4 pt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={(e) => {
                        e.preventDefault();
                        handlePrevPage();
                      }}
                      className={cn(
                        !pagination.hasPrevPage
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      )}
                    />
                  </PaginationItem>

                  {getPageNumbers().map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(page);
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
                      className={cn(
                        !pagination.hasNextPage
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <p className="text-xs text-gray-500 text-center mt-2">
                Page {currentPage} of{" "}
                {Math.ceil(totalRepos / pagination.perPage)} ({totalRepos} total
                repos)
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
