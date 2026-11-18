import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Link } from "react-router-dom";
import { parseError } from "../api/errors";
import { deleteTransaction, getTransactions } from "../api/transactions";
import { money, shortDate } from "../format";
import type { Page, Transaction } from "../types";

const PAGE_SIZE = 10;

export default function History() {
  const [page, setPage] = useState(0);
  const [reloadKey, setReloadKey] = useState(0); // bump to refetch the current page
  const [data, setData] = useState<Page<Transaction> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
  }, [page, reloadKey]);

  async function handleDelete(id: number) {
    setDeletingId(id);
    setActionError(null);
    try {
      await deleteTransaction(id);
      setConfirmingId(null);
      // Deleting the last row on a later page would leave an empty page, so step back.
      if (data && data.content.length === 1 && page > 0) {
        setPage((p) => p - 1);
      } else {
        setReloadKey((k) => k + 1);
      }
    } catch (err) {
      const parsed = parseError(
        err,
        { 404: "That transaction was already deleted." },
        "Couldn’t delete the transaction. Try again in a moment.",
      );
      setActionError(parsed.message);
      setConfirmingId(null);
      if (isAxiosError(err) && err.response?.status === 404) {
        setReloadKey((k) => k + 1);
      }
    } finally {
      setDeletingId(null);
    }
  }

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
      {actionError && (
        <p className="alert error" role="alert">
          {actionError}
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
                      {confirmingId === t.id ? (
                        <div className="row-actions">
                          <span className="confirm-text">Delete this?</span>
                          <button
                            className="row-btn danger"
                            onClick={() => handleDelete(t.id)}
                            disabled={deletingId === t.id}
                          >
                            {deletingId === t.id ? "Deleting…" : "Yes, delete"}
                          </button>
                          <button
                            className="row-btn"
                            onClick={() => setConfirmingId(null)}
                            disabled={deletingId === t.id}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="row-actions">
                          <Link
                            className="row-link"
                            to={`/transactions/${t.id}/edit`}
                            state={{ transaction: t }}
                            aria-label={`Edit ${t.description}`}
                          >
                            Edit
                          </Link>
                          <button
                            className="row-btn danger"
                            onClick={() => {
                              setActionError(null);
                              setConfirmingId(t.id);
                            }}
                            aria-label={`Delete ${t.description}`}
                          >
                            Delete
                          </button>
                        </div>
                      )}
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