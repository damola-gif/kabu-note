
import { AppShell } from "@/components/layout/AppShell";
import { useParams } from "react-router-dom";

export default function Profile() {
  const { username } = useParams();
  return (
    <AppShell>
      <div className="flex flex-col h-full w-full items-center justify-center">
        <h1 className="text-3xl font-bold mb-2">Profile: {username}</h1>
        <p className="text-muted-foreground">User profile will appear here.</p>
      </div>
    </AppShell>
  );
}
