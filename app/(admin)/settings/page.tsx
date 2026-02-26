import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Puzzle } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="grid gap-4">
        <Link href="/settings/team">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team
              </CardTitle>
              <CardDescription>Manage team members and their roles.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Card className="opacity-60 cursor-not-allowed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Puzzle className="h-5 w-5" />
              HubSpot Integration
            </CardTitle>
            <CardDescription>Bidirectional deal sync — coming in Phase 3.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
