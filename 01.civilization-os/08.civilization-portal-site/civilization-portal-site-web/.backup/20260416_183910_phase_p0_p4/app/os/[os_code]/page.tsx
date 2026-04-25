import { notFound } from "next/navigation";
import Link from "next/link";
import { PageTitleBlock } from "@/components/common/page-title-block";
import { ROUTES } from "@/lib/routing/routes";
import { OS_CATALOG } from "@/mocks/os/catalog";

type Props = {
  params: Promise<{ os_code: string }>;
};

export default async function OsDetailPage({ params }: Props) {
  const { os_code } = await params;
  const os = OS_CATALOG.find((item) => item.osCode === os_code);

  if (!os) notFound();

  return (
    <div>
      <PageTitleBlock title={os.osName} description={os.shortDescription} />
      <p>headline: {os.headline}</p>
      <p className="mt-2">eligibility: {os.eligibilitySummary}</p>
      <div className="mt-6 flex gap-4">
        <Link href={ROUTES.login} className="rounded-lg border px-4 py-2">
          Login 案内へ
        </Link>
        <Link href={ROUTES.osList} className="rounded-lg border px-4 py-2">
          OS 一覧へ戻る
        </Link>
      </div>
    </div>
  );
}
