export type DashboardView = "gerente" | "supervisor" | "asesor";

export const DASHBOARD_VIEW_STORAGE_KEY = "crm-dashboard-view";

export const dashboardViewOptions: { id: DashboardView; label: string }[] = [
  { id: "gerente", label: "Gerente" },
  { id: "supervisor", label: "Supervisor" },
  { id: "asesor", label: "Vendedor / asesor de servicio" },
];
