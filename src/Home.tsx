import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSummary } from "../api/transactions";
import { PieChart } from "../components/PieChart";
import { money } from "../format";
import type { Summary } from "../types";

// Local-time "YYYY-MM" (toISOString would use UTC and can be off near month ends)
function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function Home() {
  const [month, setMonth] = useState(currentMonth);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getSummary(month)
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch(() => {
        if (!cancelled)
          setError("Couldn’t load your summary. Check that the backend is running.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month]);

  return (
    <main className="page" aria-busy={loading}>
      <div className="page-head">
        <div>
          <h1>Overview</h1>
          <p className="sub">Your income and spending for the month.</p>
        </div>
        <div className="head-actions">
          <label className="month-pick">
            Month
            <input
              type="month"
              value={month}
              max={currentMonth()}
              onChange={(e) => e.target.value && setMonth(e.target.value)}
            />
          </label>
          <Link className="primary-link" to="/transactions/new">
            Add transaction
          </Link>
          <Link className="secondary-link" to="/history">
            View history
          </Link>
        </div>
      </div>

      {error && (
        <p className="alert error" role="alert">
          {error}
        </p>
      )}

      {loading && !summary && <p className="empty">Loading…</p>}

      {summary && (
        <>
          <dl className="figures">
            <div className="figure">
              <dt>Income</dt>
              <dd>{money(summary.totalIncome)}</dd>
            </div>
            <div className="figure">
              <dt>Expenses</dt>
              <dd>{money(summary.totalExpense)}</dd>
            </div>
            <div className="figure">
              <dt>Balance</dt>
              <dd>{money(summary.balance)}</dd>
            </div>
          </dl>

          <div className="dash-grid">
            <section className="panel">
              <h2>Spending by category</h2>
              {summary.expenseByCategory.length === 0 ? (
                <p className="empty">No expenses recorded for this month.</p>
              ) : (
                <PieChart
                  slices={summary.expenseByCategory.map((c) => ({
                    label: c.category,
                    value: c.total,
                  }))}
                />
              )}
            </section>

            <section className="panel ai-panel">
              <h2>AI finance review</h2>
              <span className="badge">Coming soon</span>
              <p>
                A plain-language read on your spending, with suggestions for
                where to cut back. Not available yet.
              </p>
            </section>
          </div>
        </>
      )}
    </main>
  );
}
