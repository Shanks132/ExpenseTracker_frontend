import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { TOKEN_KEY } from "../api/client";
import { NO_ERROR, parseError, type FormError } from "../api/errors";
import  {AuthLayout}  from "../components/AuthLayout.tsx";
import  {Field}  from "../components/Field.tsx";

const BAD_CREDENTIALS = "Username or password is incorrect.";

export default function Login() :ReactNode{
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered =
    (location.state as { registered?: boolean } | null)?.registered === true;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<FormError>(NO_ERROR);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(NO_ERROR);
    try {
      const token = await login({ username: username.trim(), password });
      localStorage.setItem(TOKEN_KEY, token);
      navigate("/transactions", { replace: true });
    } catch (err) {
      // 401 (wrong password) and 404 (unknown user) share one message on purpose,
      // so the form doesn’t reveal which usernames exist.
      setError(
        parseError(
          err,
          { 401: BAD_CREDENTIALS, 404: BAD_CREDENTIALS },
          "Something went wrong on the server. Try again in a moment.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Log in" subtitle="Pick up where you left off.">
      <form onSubmit={handleSubmit}>
        {justRegistered && (
          <p className="alert ok" role="status">
            Account created. Log in to continue.
          </p>
        )}
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
          required
          autoFocus
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error.fields.password}
          required
        />

        <button className="primary" type="submit" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="switch">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
