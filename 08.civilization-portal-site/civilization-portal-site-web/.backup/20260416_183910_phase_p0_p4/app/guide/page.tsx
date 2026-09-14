import { PageTitleBlock } from "@/components/common/page-title-block";

export default function GuidePage() {
  return (
    <div>
      <PageTitleBlock
        title="利用案内"
        description="Portal Site の使い方と、登録・ログイン・OS 利用開始までの流れを示す。"
      />
      <ol className="list-decimal pl-6">
        <li>Portal Site で OS を探す</li>
        <li>必要なら CivilizationOS でログインする</li>
        <li>対象OSの入口へ進む</li>
      </ol>
    </div>
  );
}
