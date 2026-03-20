import { Toaster } from "@/components/ui/sonner";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Dashboard />
      <Toaster />
    </div>
  );
}
