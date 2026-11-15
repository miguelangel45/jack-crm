export type CrmIconName =
  | "i-panel"
  | "i-kpi"
  | "i-conversaciones"
  | "i-reclamaciones"
  | "i-integraciones"
  | "i-inbox"
  | "i-tickets"
  | "i-clientes"
  | "i-alertas"
  | "i-ajustes";

export function CrmIcon({ name, className = "h-5 w-5 shrink-0" }: { name: CrmIconName; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`icon ${className}`} fill="none" focusable="false">
      <use href={`#${name}`} />
    </svg>
  );
}

export function CrmIconSprite() {
  return (
    <svg aria-hidden="true" className="crm-icon-sprite" focusable="false">
      <defs>
        <symbol id="i-panel" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round">
            <rect x="3" y="3" width="8" height="10" rx="2" />
            <rect x="13" y="3" width="8" height="5" rx="2" />
            <rect x="3" y="15" width="8" height="6" rx="2" />
          </g>
          <rect x="13" y="10" width="8" height="11" rx="2" fill="var(--icon-accent)" />
        </symbol>

        <symbol id="i-kpi" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18" />
            <rect x="4.5" y="13" width="4" height="8" rx="1" />
            <rect x="10" y="9" width="4" height="12" rx="1" />
          </g>
          <rect x="15.5" y="4" width="4" height="17" rx="1" fill="var(--icon-accent)" />
        </symbol>

        <symbol id="i-conversaciones" viewBox="0 0 24 24">
          <path d="M3 3h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8l-3 3v-3H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
          <path d="M14 13.5h6a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-.3v2.2l-2.5-2.2H14a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z" fill="var(--icon-accent)" />
        </symbol>

        <symbol id="i-reclamaciones" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3h8l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
            <path d="M14 3v5h5" />
          </g>
          <path d="M11.5 11.5v3.5" fill="none" stroke="var(--icon-accent)" strokeWidth="1.9" strokeLinecap="round" />
          <circle cx="11.5" cy="18" r="1.1" fill="var(--icon-accent)" />
        </symbol>

        <symbol id="i-integraciones" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="5" cy="5" r="2" />
            <circle cx="19" cy="5" r="2" />
            <circle cx="12" cy="21" r="2" />
            <path d="M6.5 6.5l3.4 3.4M17.5 6.5l-3.4 3.4M12 14.8V19" />
          </g>
          <circle cx="12" cy="12" r="3.2" fill="var(--icon-accent)" />
        </symbol>

        <symbol id="i-inbox" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 13l2.5-7.5A2 2 0 0 1 7.4 4h9.2a2 2 0 0 1 1.9 1.5L21 13" />
            <path d="M3 13v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5h-5l-1.5 2.5h-5L8 13z" />
          </g>
          <path d="M9 8.5h6" fill="none" stroke="var(--icon-accent)" strokeWidth="1.9" strokeLinecap="round" />
        </symbol>

        <symbol id="i-tickets" viewBox="0 0 24 24">
          <path d="M4 7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2.5a2.5 2.5 0 0 0 0 5V17a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2.5a2.5 2.5 0 0 0 0-5z" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
          <path d="M14 7.5v9" fill="none" stroke="var(--icon-accent)" strokeWidth="1.9" strokeLinecap="round" strokeDasharray="0.1 3" />
        </symbol>

        <symbol id="i-clientes" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
          </g>
          <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.4c1.9.8 3 2.6 3 5.6" fill="none" stroke="var(--icon-accent)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>

        <symbol id="i-alertas" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z" />
            <path d="M10 21h4" />
          </g>
          <circle cx="18" cy="5" r="2.6" fill="var(--icon-accent)" />
        </symbol>

        <symbol id="i-ajustes" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
          </g>
          <circle cx="15" cy="7" r="2.2" fill="var(--icon-accent)" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="9" cy="17" r="2.2" fill="var(--icon-accent)" stroke="currentColor" strokeWidth="1.75" />
        </symbol>
      </defs>
    </svg>
  );
}
