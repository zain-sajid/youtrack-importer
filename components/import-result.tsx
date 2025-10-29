import { Button } from "@/components/ui/button";

interface ImportResultProps {
  result: {
    message: string;
  };
  onDismiss: () => void;
}

export function ImportResult({ result, onDismiss }: ImportResultProps) {
  return (
    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-sm font-semibold text-green-800 mb-2">
        ✓ Import Successful
      </h3>
      <p className="text-sm text-green-700">{result.message}</p>
      <Button
        onClick={onDismiss}
        variant="outline"
        className="mt-3 w-full"
      >
        Dismiss
      </Button>
    </div>
  );
}

