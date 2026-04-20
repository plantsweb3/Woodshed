import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireApprovedOrAlumniNoOnboarding } from "@/lib/session";
import { DataActions } from "./actions";

export default async function DataPage() {
  await requireApprovedOrAlumniNoOnboarding();
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Export your data</CardTitle>
          <CardDescription>
            One click and you&apos;ll get a JSON file with your profile, practice logs, mentor requests, milestones, and notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataActions mode="export" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delete your account</CardTitle>
          <CardDescription>
            Soft-deleted immediately and permanently removed after 7 days. If you sign back in during the grace period, you can cancel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataActions mode="delete" />
        </CardContent>
      </Card>
    </div>
  );
}
