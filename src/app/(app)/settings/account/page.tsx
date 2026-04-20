import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireApprovedOrAlumniNoOnboarding } from "@/lib/session";
import { graduationDate } from "@/lib/graduation";
import { VisibilityToggle } from "./visibility-toggle";
import { formatDate } from "@/lib/utils";

export default async function AccountPage() {
  const user = await requireApprovedOrAlumniNoOnboarding();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Graduation</CardTitle>
          <CardDescription>
            {user.graduationYear
              ? `You'll become alumni on ${formatDate(graduationDate(user.graduationYear))}. Your profile stays visible but your role shifts to "alumni" and mentor requests stop.`
              : "No graduation year on file."}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Directory visibility</CardTitle>
          <CardDescription>
            Turn this off if you&apos;d rather not appear in the directory. Drum majors and the director can still see your profile for moderation. Applies most often to alumni who want to stay anonymous.
          </CardDescription>
        </CardHeader>
        <div className="p-5 pt-0">
          <VisibilityToggle initialVisible={user.profileVisible} />
        </div>
      </Card>

      {user.status === "alumni" && (
        <Card>
          <CardHeader>
            <CardTitle>You&apos;re alumni</CardTitle>
            <CardDescription>
              Thanks for the years you put in. Your profile is preserved. You can update it, but posting mentor
              requests is turned off now that you&apos;re out of the program.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
