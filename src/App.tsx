import type { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { TOKEN_KEY } from "./api/client";
import { AppShell } from "./components/AppShell";
import History from "./pages/History";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TransactionForm from "./pages/TransactionForm.tsx";

function RequireAuth({ children }: { children: ReactElement }) {
  return localStorage.getItem(TOKEN_KEY) ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Everything inside this route gets the header and needs a token */}
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Home />} />
        <Route path="history" element={<History />} />
        <Route path="transactions/new" element={<TransactionForm />} />
        <Route path="transactions/:id/edit" element={<TransactionForm />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
