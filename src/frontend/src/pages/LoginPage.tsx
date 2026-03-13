import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Wifi } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = login(username, password);
    if (!success) {
      setError("Invalid username or password");
    }
  };

  return (
    <div
      data-ocid="login.page"
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4"
    >
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Wifi className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            Cradlepoint Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                data-ocid="login.input"
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="Enter username"
                required
                autoComplete="username"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                data-ocid="login.password_input"
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p
                data-ocid="login.error_state"
                className="text-sm text-destructive"
              >
                {error}
              </p>
            )}
            <Button
              data-ocid="login.submit_button"
              type="submit"
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
