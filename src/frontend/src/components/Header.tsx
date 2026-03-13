import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, LogOut, Router, Wifi } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface HeaderProps {
  activeTab: "active" | "expired";
  onTabChange: (tab: "active" | "expired") => void;
  activeCount: number;
  expiredCount: number;
}

export default function Header({
  activeTab,
  onTabChange,
  activeCount,
  expiredCount,
}: HeaderProps) {
  const { logout, username } = useAuth();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    queryClient.clear();
  };

  const userInitials = username ? username.slice(0, 2).toUpperCase() : "AD";

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-white/95 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-3 sm:h-16 sm:px-4 lg:px-6">
        {/* Left side: WiFi icon + Insight Controls text */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Wifi className="h-6 w-6 shrink-0 text-primary sm:h-7 sm:w-7" />
          <h1 className="text-lg font-bold text-primary sm:text-xl">
            Insight Controls
          </h1>
        </div>

        {/* Desktop: Center navigation tabs with text labels */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            type="button"
            onClick={() => onTabChange("active")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-base font-medium transition-colors rounded-md",
              activeTab === "active"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            <Router className="h-4 w-4" />
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => onTabChange("expired")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-base font-medium transition-colors rounded-md",
              activeTab === "expired"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            <Bell className="h-4 w-4" />
            Alerts
          </button>
        </nav>

        {/* Right side: Status indicators and user menu */}
        <div className="hidden lg:flex items-center gap-3">
          <Badge
            variant="outline"
            className="h-7 rounded-full border-green-500/30 bg-green-50 px-3 text-xs font-medium text-green-700"
          >
            {activeCount} Active
          </Badge>
          <Badge
            variant="outline"
            className="h-7 rounded-full border-red-500/30 bg-red-50 px-3 text-xs font-medium text-red-700"
          >
            {expiredCount} Expired
          </Badge>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 rounded-full p-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{username}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile: Tab navigation icons and user menu */}
        <div className="flex items-center gap-3 sm:gap-4 lg:hidden">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onTabChange("active")}
                  className={cn(
                    "transition-colors",
                    activeTab === "active"
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-label="Active Devices"
                >
                  <Router className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Active Devices</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onTabChange("expired")}
                  className={cn(
                    "transition-colors",
                    activeTab === "expired"
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-label="Expired Devices"
                >
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Expired Devices</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Mobile User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-full p-0"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{username}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile: Status indicators below header (always visible) */}
      <div className="flex items-center justify-center gap-2 border-t border-border/40 bg-white/95 px-3 py-2 lg:hidden">
        <Badge
          variant="outline"
          className="h-7 rounded-full border-green-500/30 bg-green-50 px-3 text-xs font-medium text-green-700"
        >
          {activeCount} Active
        </Badge>
        <Badge
          variant="outline"
          className="h-7 rounded-full border-red-500/30 bg-red-50 px-3 text-xs font-medium text-red-700"
        >
          {expiredCount} Expired
        </Badge>
      </div>
    </header>
  );
}
