import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const SAMPLE_ROWS = [
  { label: "Salary", amount: "+2,500.00" },
  { label: "Rent", amount: "−900.00" },
  { label: "Groceries", amount: "−86.40" },
  { label: "Coffee beans", amount: "−14.25" },
];

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) : ReactNode {
  return (
    <div className="auth">
      <aside className="auth-panel">
        <p className="brand">Money Tracker</p>
        <div>
          <h2>Know where your money went.</h2>
          <ul className="ledger" aria-hidden="true">
            {SAMPLE_ROWS.map((row) => (
              <li key={row.label}>
                <span>{row.label}</span>
                <span className="leader" />
                <span className="amount">{row.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <h1>{title}</h1>
          <p className="sub">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
