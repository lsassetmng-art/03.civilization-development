import { PageTitleBlock } from "@/components/common/page-title-block";

export default function AuthReturnPage() {
  return (
    <div>
      <PageTitleBlock
        title="Auth Return"
        description="認証後の復帰先解決ページ。P2 で return context を接続する。"
      />
      <p>P0 ではプレースホルダー。</p>
    </div>
  );
}
