import { notFound } from "next/navigation";
import { OsDetailPage } from "../../../features/os-catalog/os-detail-page";
import { findOsByCode } from "../../../mocks/os/catalog";

type PageProps = {
  params: Promise<{
    os_code: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { os_code } = await params;
  const os = findOsByCode(os_code);

  if (!os) {
    notFound();
  }

  return <OsDetailPage os={os} />;
}
