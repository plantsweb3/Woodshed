import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "./form";

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter the Woodshed</CardTitle>
        <CardDescription>
          You&apos;ll need the current invite code from the band hall. Your director or drum major can share it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
      <CardFooter className="justify-between text-sm">
        <span className="text-muted-foreground">Already approved?</span>
        <Link href="/signin" className="text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
