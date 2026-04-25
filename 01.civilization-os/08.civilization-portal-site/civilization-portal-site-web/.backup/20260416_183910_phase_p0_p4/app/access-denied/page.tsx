import { StatusMessage } from "@/components/feedback/status-message";

export default function AccessDeniedPage() {
  return (
    <StatusMessage
      title="Access Denied"
      description="利用条件を満たしていないため、この入口は利用できない。"
    />
  );
}
