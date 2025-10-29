import { Button } from "@/components/ui/button";

interface ImportFormProps {
  selectedRepo: any;
  youtrackProjectId: string;
  importing: boolean;
  onYoutrackProjectIdChange: (value: string) => void;
  onImport: () => void;
  onCancel: () => void;
}

export function ImportForm({
  selectedRepo,
  youtrackProjectId,
  importing,
  onYoutrackProjectIdChange,
  onImport,
  onCancel,
}: ImportFormProps) {
  return (
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
            onChange={(e) => onYoutrackProjectIdChange(e.target.value)}
            placeholder="e.g., 0-0"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={importing}
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onImport}
            disabled={importing || !youtrackProjectId}
            className="flex-1"
          >
            {importing ? "Importing..." : "Import Issues"}
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={importing}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

