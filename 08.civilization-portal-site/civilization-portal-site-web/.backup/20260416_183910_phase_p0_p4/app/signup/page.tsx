import { PageTitleBlock } from "@/components/common/page-title-block";

export default function SignupPage() {
  return (
    <div>
      <PageTitleBlock
        title="Signup 案内"
        description="新規登録の正本は CivilizationOS が担う。"
      />
      <p>P0 では案内ページのみ実装する。P2 で CivilizationOS signup 導線へ接続する。</p>
    </div>
  );
}
