import type { InputHTMLAttributes, ReactNode } from "react";

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
}

export function Field({ id, label, error, hint, ...inputProps }: FieldProps): ReactNode {
  const noteId = `${id}-note`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? noteId : undefined}
        {...inputProps}
      />
      {error ? (
        <p id={noteId} className="field-error">
          {error}
        </p>
      ) : hint ? (
        <p id={noteId} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
