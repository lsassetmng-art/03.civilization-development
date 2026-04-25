import Link from "next/link";
import { PageTitleBlock } from "@/components/common/page-title-block";
import { ROUTES } from "@/lib/routing/routes";

export default function HomePage() {
  return (
    <div>
      <PageTitleBlock
        title="Civilization Portal Site"
        description="Civilization 全体の公開入口。各OSへの唯一の公式Web導線を提供する。"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Link href={ROUTES.civilization} className="rounded-lg border p-6">
          Civilization 紹介へ
        </Link>
        <Link href={ROUTES.osList} className="rounded-lg border p-6">
          OS 一覧へ
        </Link>
        <Link href={ROUTES.login} className="rounded-lg border p-6">
          Login 案内へ
        </Link>
        <Link href={ROUTES.guide} className="rounded-lg border p-6">
          利用案内へ
        </Link>
      </div>
    </div>
  );
}
