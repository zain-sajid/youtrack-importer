import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function UserProfile() {
  const { data: session } = authClient.useSession();

  if (!session) {
    return null;
  }

  return (
    <div className="text-center mb-6 space-y-2">
      <div className="flex items-center justify-center gap-3">
        {session.user.image && (
          <img
            src={session.user.image}
            alt="User avatar"
            className="w-8 h-8 rounded-full"
          />
        )}
        <h1 className="text-2xl font-bold">{session.user.name || "Welcome"}</h1>
      </div>
      <p className="text-gray-600">{session.user.email}</p>
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
        variant="outline"
      >
        Sign Out
      </Button>
    </div>
  );
}
