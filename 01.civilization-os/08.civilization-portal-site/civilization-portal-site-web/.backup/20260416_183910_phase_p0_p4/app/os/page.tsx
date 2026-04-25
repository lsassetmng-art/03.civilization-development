import Link from "next/link";
import { PageTitleBlock } from "@/components/common/page-title-block";
import { osDetailRoute } from "@/lib/routing/routes";
import { OS_CATALOG } from "@/mocks/os/catalog";

export default function OsListPage() {
  return (
    <div>
      <PageTitleBlock
        title="OS 一覧"
        description="各OSへの唯一の一覧入口。P0 では mock データで表示する。"
      />
      <div className="grid gap-4 md:grid-cols-2">
        {OS_CATALOG.map((os) => (
          <Link key={os.osCode} href={osDetailRoute(os.osCode)} className="rounded-lg border p-6">
            <div className="text-lg font-semibold">{os.osName}</div>
            <div className="mt-1 text-sm">{os.headline}</div>
            <div className="mt-3 text-sm opacity-80">{os.shortDescription}</div>
            <div className="mt-3 text-xs">status: {os.status}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
