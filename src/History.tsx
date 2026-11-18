import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTransactions } from "./api/transactions";
import { money, shortDate } from "./format.ts";
import type { Page, Transaction } from "./types.ts";

const PAGE_SIZE = 10;

export default function History() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page<Transaction> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getTransactions(page, PAGE_SIZE)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled)
          setError("Couldn’t load your transactions. Check that the backend is running.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const totalPages = data?.totalPages ?? 0;

  return (
    <main className="page" aria-busy={loading}>
      <div className="page-head">
        <div>
          <h1>History</h1>
          <p className="sub">
            {data
              ? `${data.totalElements} transaction${data.totalElements === 1 ? "" : "s"}, newest first.`
              : "Every transaction, newest first."}
          </p>
        </div>
        <Link className="primary-link" to="/transactions/new">
          Add transaction
        </Link>
      </div>

      {error && (
        <p className="alert error" role="alert">
          {error}
        </p>
      )}

      {loading && !data && <p className="empty">Loading…</p>}

      {data && data.content.length === 0 && (
        <p className="empty">No transactions yet. Add your first one to get started.</p>
      )}

      {data && data.content.length > 0 && (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th className="num">Amount</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((t) => (
                  <tr key={t.id}>
                    <td>{shortDate(t.transactionDate)}</td>
                    <td>{t.description}</td>
                    <td>{t.category ?? "—"}</td>
                    <td
                      className={`num ${t.type === "INCOME" ? "income" : "expense"}`}
                    >
                      {t.type === "INCOME" ? "+" : "−"}
                      {money(t.amount)}
                    </td>
                    <td className="num">
                      <Link
                        className="row-link"
                        to={`/transactions/${t.id}/edit`}
                        state={{ transaction: t }}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pager">
            <button
              className="secondary"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0 || loading}
            >
              Previous
            </button>
            <span>
              Page {page + 1} of {Math.max(totalPages, 1)}
            </span>
            <button
              className="secondary"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1 || loading}
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}
