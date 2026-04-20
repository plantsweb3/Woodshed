import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireApprovedOrAlumniNoOnboarding } from "@/lib/session";
import { getOrCreatePreferences } from "@/lib/notifications";
import { PreferencesForm } from "./form";

export default async function NotificationSettingsPage() {
  const user = await requireApprovedOrAlumniNoOnboarding();
  const prefs = await getOrCreatePreferences(user.id);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification preferences</CardTitle>
        <CardDescription>
          In-app notifications are always on (they show up in the bell). Email is opt-in per category. Zero-tolerance
          reports always email the director regardless of setting.
        </CardDescription>
      </CardHeader>
      <div className="p-5 pt-0">
        <PreferencesForm
          defaults={{
            emailMentorRequestDirect: prefs.emailMentorRequestDirect,
            emailMentorOfferAccepted: prefs.emailMentorOfferAccepted,
            emailSignupApproved: prefs.emailSignupApproved,
            emailSignupRejected: prefs.emailSignupRejected,
            emailZeroTolerance: prefs.emailZeroTolerance,
          }}
          isDirector={user.role === "director"}
        />
      </div>
    </Card>
  );
}
