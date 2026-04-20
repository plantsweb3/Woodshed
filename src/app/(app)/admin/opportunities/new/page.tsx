import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewOpportunityForm } from "./form";
import { ArrowLeft } from "lucide-react";

export default function NewOpportunityPage() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <Link href="/admin/opportunities" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Post an opportunity</CardTitle>
          <CardDescription>
            Point students somewhere specific — an audition page, a camp registration form, a scholarship listing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewOpportunityForm />
        </CardContent>
      </Card>
    </div>
  );
}
