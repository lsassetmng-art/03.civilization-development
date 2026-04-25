import { StatusMessage } from "@/components/feedback/status-message";

export default function MaintenancePage() {
  return (
    <StatusMessage
      title="Maintenance"
      description="現在この入口はメンテナンス中。後ほど再度確認してください。"
    />
  );
}
