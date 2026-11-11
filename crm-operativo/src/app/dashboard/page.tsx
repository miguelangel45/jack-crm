import { AuthGate } from "@/components/auth-gate";
import { Dashboard } from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <AuthGate route="dashboard">
      <Dashboard />
    </AuthGate>
  );
}