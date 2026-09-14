import { StatusMessage } from "@/components/feedback/status-message";

export default function ErrorPage() {
  return (
    <StatusMessage
      title="Error"
      description="想定外の問題が発生した。P0 では基本エラー導線のみ提供する。"
    />
  );
}
