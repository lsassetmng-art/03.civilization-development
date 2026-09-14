import { Suspense } from "react";
import { AuthReturnPage } from "../../../features/auth-entry/auth-return-page";

export default function Page() {
  return (
    <Suspense fallback={<div className="page-stack" />}>
      <AuthReturnPage />
    </Suspense>
  );
}
