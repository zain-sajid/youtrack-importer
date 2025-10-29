import { useState, useEffect } from "react";

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
  fetchRepos: (page: number) => Promise<void>;
};

const PER_PAGE = 10;

export function useRepositories(session: any): UseRepositoriesReturn {
  const [repos, setRepos] = useState<any[]>([]);
  const [totalRepos, setTotalRepos] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limitedScope, setLimitedScope] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    perPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchRepos = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/github/repos?page=${page}&per_page=${PER_PAGE}`
      );
      const data = await res.json();
      setRepos(data.repos || []);
      setTotalRepos(data.totalRepos || 0);
      setPagination(data.pagination);
      setLimitedScope(data.limitedScope || false);
    } catch (error) {
      console.error("Error fetching repos:", error);
    }
    setLoading(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (session) {
      fetchRepos(currentPage);
    }
  }, [session, currentPage]);

  return {
    repos,
    totalRepos,
    loading,
    currentPage,
    pagination,
    limitedScope,
    handlePageChange,
    fetchRepos,
  };
}
