import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import { NO_ERROR, parseError, type FormError } from "../api/errors";
import { AuthLayout } from "../components/AuthLayout.tsx";
import { Field } from "../components/Field.tsx";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<FormError>(NO_ERROR);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(NO_ERROR);
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (err) {
      // The backend currently answers a duplicate username/email with a 500,
      // so that status is treated as "already taken" here.
      setError(
        parseError(
          err,
          {
            500: "Couldn’t create the account. That username or email may already be taken.",
          },
          "Something went wrong. Try again in a moment.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking income and expenses in one place."
    >
      <form onSubmit={handleSubmit}>
        {error.message && (
          <p className="alert error" role="alert">
            {error.message}
          </p>
        )}

        <Field
          id="username"
          label="Username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={error.fields.username}
          hint="3 to 30 characters."
          minLength={3}
          maxLength={30}
          required
          autoFocus
        />
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error.fields.email}
          required
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error.fields.password}
          hint="At least 6 characters."
          minLength={6}
          required
        />

        <button className="primary" type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
