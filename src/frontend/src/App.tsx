import { Toaster } from "@/components/ui/sonner";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";

export default function App() {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Dashboard />
      <Toaster />
    </div>
  );
}
