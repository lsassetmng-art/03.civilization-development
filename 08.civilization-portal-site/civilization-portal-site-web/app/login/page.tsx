import { Suspense } from "react";
import { LoginEntryPage } from "../../features/auth-entry/login-entry-page";

export default function Page() {
  return (
    <Suspense fallback={<div className="page-stack" />}>
      <LoginEntryPage />
    </Suspense>
  );
}
