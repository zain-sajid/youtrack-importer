import useSWR from "swr";
import { fetcher } from "@/lib/utils";

export type YouTrackProject = {
  id: string;
  name: string;
  shortName: string;
};

export function useYoutrackProjects() {
  const { data, error, isLoading } = useSWR<YouTrackProject[]>(
    "/api/youtrack/projects",
    fetcher
  );

  return {
    projects: data || [],
    loading: isLoading,
    error: error?.message || null,
  };
}
