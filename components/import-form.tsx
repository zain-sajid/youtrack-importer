import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useYoutrackProjects } from "@/hooks/use-youtrack-projects";

type ImportFormProps = {
  selectedRepo: any;
  youtrackProjectId: string;
  importing: boolean;
  onYoutrackProjectIdChange: (value: string) => void;
  onImport: () => void;
  onCancel: () => void;
};

export function ImportForm({
  selectedRepo,
  youtrackProjectId,
  importing,
  onYoutrackProjectIdChange,
  onImport,
  onCancel,
}: ImportFormProps) {
  const { projects, loading, error } = useYoutrackProjects();

  return (
    <div className="mt-6 p-4 border rounded-lg">
      <h3 className="text-sm font-semibold mb-2">Import Issues to YouTrack</h3>
      <p className="text-sm mb-3">
        Selected: <span className="font-medium">{selectedRepo.full_name}</span>
      </p>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            YouTrack Project
          </label>
          {loading ? (
            <div className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-500">
              Loading projects...
            </div>
          ) : error ? (
            <div className="w-full px-3 py-2 border rounded bg-red-50 text-red-600 text-sm">
              Error: {error}
            </div>
          ) : (
            <Select
              value={youtrackProjectId}
              onValueChange={onYoutrackProjectIdChange}
              disabled={importing || loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name} ({project.shortName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onImport}
            disabled={importing || !youtrackProjectId || loading}
            className="flex-1"
          >
            {importing ? "Importing..." : "Import Issues"}
          </Button>
          <Button onClick={onCancel} variant="outline" disabled={importing}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
