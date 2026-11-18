import { useState, type FormEvent } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { createTransaction, updateTransaction } from "../api/transactions";
import {
  NO_ERROR,
  parseError,
  serverDetail,
  type FormError,
} from "../api/errors";
import { Field } from "../components/Field";
import { toDateTimeInput } from "../format";
import type { Transaction, TransactionInput, TransactionType } from "../types";

// One page for both routes:
//   /transactions/new       -> add
//   /transactions/:id/edit  -> edit (the row arrives via router state from History)
export default function TransactionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const existing = (location.state as { transaction?: Transaction } | null)
    ?.transaction;
  const editing = id !== undefined;

  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [type, setType] = useState<TransactionType>(existing?.type ?? "EXPENSE");
  const [category, setCategory] = useState(existing?.category ?? "");
  const [date, setDate] = useState(() =>
    existing ? existing.transactionDate.slice(0, 16) : toDateTimeInput(new Date()),
  );
  const [error, setError] = useState<FormError>(NO_ERROR);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);

  // Edit page opened directly (a refresh drops router state), so there is
  // nothing to prefill. Send the user back to pick a row again.
  if (editing && (!existing || String(existing.id) !== id)) {
    return <Navigate to="/history" replace />;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(NO_ERROR);
    setDetail(null);

    const payload: TransactionInput = {
      amount: Number(amount),
      description: description.trim(),
      type,
      // datetime-local omits seconds; the backend's LocalDateTime is happiest with them
      transactionDate: date.length === 16 ? `${date}:00` : date,
      ...(category.trim() ? { category: category.trim() } : {}),
    };

    try {
      if (existing) {
        await updateTransaction(existing.id, payload);
      } else {
        await createTransaction(payload);
      }
      navigate("/history");
    } catch (err) {
      setDetail(serverDetail(err));
      setError(
        parseError(
          err,
          {
            404: editing
              ? "This transaction no longer exists."
              : "The server couldn’t process this request.",
          },
          "Couldn’t save the transaction. Try again in a moment.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page">
      <div className="form-card">
        <h1>{editing ? "Edit transaction" : "Add transaction"}</h1>
        <p className="sub">
          {editing ? "Change any field, then save." : "Record income or an expense."}
        </p>

        <form onSubmit={handleSubmit}>
          {error.message && (
            <p className="alert error" role="alert">
              {error.message}
              {detail && (
                <>
                  <br />
                  <small>Server response: {detail}</small>
                </>
              )}
            </p>
          )}

          <fieldset className="segmented">
            <legend>Type</legend>
            <div className="options">
              <label>
                <input
                  type="radio"
                  name="type"
                  value="EXPENSE"
                  checked={type === "EXPENSE"}
                  onChange={() => setType("EXPENSE")}
                />
                <span>Expense</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="type"
                  value="INCOME"
                  checked={type === "INCOME"}
                  onChange={() => setType("INCOME")}
                />
                <span>Income</span>
              </label>
            </div>
            {error.fields.type && (
              <p className="field-error">{error.fields.type}</p>
            )}
          </fieldset>

          <Field
            id="amount"
            label="Amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={error.fields.amount}
            required
            autoFocus
          />
          <Field
            id="description"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={error.fields.description}
            maxLength={255}
            required
          />
          <Field
            id="category"
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            error={error.fields.category}
            hint="Optional. Groups your spending in the pie chart."
            maxLength={100}
          />
          <Field
            id="date"
            label="Date and time"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={error.fields.transactionDate}
            required
          />

          <div className="form-actions">
            <button className="primary" type="submit" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add transaction"}
            </button>
            <Link className="secondary-link" to="/history">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}