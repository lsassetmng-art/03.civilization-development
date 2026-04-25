import { PageTitleBlock } from "@/components/common/page-title-block";

export default function LoginPage() {
  return (
    <div>
      <PageTitleBlock
        title="Login 案内"
        description="各OSの利用には CivilizationOS でのログインが必要。"
      />
      <p>P0 では案内ページのみ実装する。P2 で CivilizationOS 認証導線へ接続する。</p>
    </div>
  );
}
