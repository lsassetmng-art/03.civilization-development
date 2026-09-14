import { Suspense } from "react";
import { SignupEntryPage } from "../../features/auth-entry/signup-entry-page";

export default function Page() {
  return (
    <Suspense fallback={<div className="page-stack" />}>
      <SignupEntryPage />
    </Suspense>
  );
}
