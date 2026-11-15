import { AuthGate } from "@/components/auth-gate";
import { SalesDashboard } from "@/components/sales-dashboard";

export default function SalesPage() {
  return (
    <AuthGate route="dashboard">
      <SalesDashboard />
    </AuthGate>
  );
}
