import { AuthGate } from "@/components/auth-gate";
import { KpiDashboard } from "@/components/kpi-dashboard";

export default function KpiPage() {
  return (
    <AuthGate route="kpi">
      <KpiDashboard />
    </AuthGate>
  );
}
