import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";

type PaginationInfo = {
  page: number;
  perPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

type UseRepositoriesReturn = {
  repos: any[];
  totalRepos: number;
  loading: boolean;
  currentPage: number;
  pagination: PaginationInfo;
  limitedScope: boolean;
  handlePageChange: (page: number) => void;
};

const PER_PAGE = 10;

export function useRepositories(session: any): UseRepositoriesReturn {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useSWR(
    session
      ? `/api/github/repos?page=${currentPage}&per_page=${PER_PAGE}`
      : null,
    fetcher
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    repos: data?.repos || [],
    totalRepos: data?.totalRepos || 0,
    loading: isLoading,
    currentPage,
    pagination: data?.pagination || {
      page: 1,
      perPage: 10,
      hasNextPage: false,
      hasPrevPage: false,
    },
    limitedScope: data?.limitedScope || false,
    handlePageChange,
  };
}
