import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw, Search, Settings, Wifi, X } from "lucide-react";
import React, { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { ControlsType, type Device } from "../backend";
import DeviceFormDialog from "../components/DeviceFormDialog";
import DeviceGrid from "../components/DeviceGrid";
import NetCloudSettingsDialog from "../components/NetCloudSettingsDialog";
import {
  useGetActiveDevices,
  useGetDeviceCounts,
  useGetInactiveDevices,
  useNetCloudStatus,
  usePollNetCloud,
} from "../hooks/useQueries";

const DEVICES_PER_PAGE = 12;

type TabType = "active" | "expired";
type FilterType = "all" | "niagara" | "reliable" | "stock" | "wattmaster";

class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            background: "red",
            color: "white",
            fontSize: "24px",
            padding: "40px",
            textAlign: "center",
            border: "5px solid black",
            minHeight: "50vh",
          }}
        >
          DASHBOARD ERROR:
          <br />
          {this.state.error?.message || "Unknown error"}
          <br />
          <br />
          Stack: {this.state.error?.stack?.slice(0, 400) || "No stack"}
          <br />
          <br />
          Try refreshing the page or check backend data.
        </div>
      );
    }
    return this.props.children;
  }
}

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [controlsFilter, setControlsFilter] = useState<FilterType>("all");
  const [activeCurrentPage, setActiveCurrentPage] = useState(1);
  const [expiredCurrentPage, setExpiredCurrentPage] = useState(1);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [isNetCloudSettingsOpen, setIsNetCloudSettingsOpen] = useState(false);

  const queryClient = useQueryClient();
  const { logout } = useAuth();

  const { data: activeDevices = [], isLoading: isLoadingActive } =
    useGetActiveDevices();
  const { data: inactiveDevices = [], isLoading: isLoadingInactive } =
    useGetInactiveDevices();
  const { data: counts } = useGetDeviceCounts();
  const { data: netCloudStatus } = useNetCloudStatus();
  const pollNetCloud = usePollNetCloud();

  console.log("Devices data:", { activeDevices, inactiveDevices, counts });

  const safeActive: Device[] = useMemo(
    () => (Array.isArray(activeDevices) ? activeDevices : []),
    [activeDevices],
  );
  const safeInactive: Device[] = useMemo(
    () => (Array.isArray(inactiveDevices) ? inactiveDevices : []),
    [inactiveDevices],
  );

  const activeCount = Number(counts?.active ?? BigInt(safeActive.length));
  const expiredCount = Number(counts?.expired ?? BigInt(safeInactive.length));

  const filteredActiveDevices: Device[] = useMemo(() => {
    let result = safeActive;
    if (controlsFilter !== "all") {
      result = result.filter((d) => {
        if (!d) return false;
        switch (controlsFilter) {
          case "niagara":
            return d.controlsType === ControlsType.niagara;
          case "reliable":
            return d.controlsType === ControlsType.reliable;
          case "stock":
            return d.controlsType === ControlsType.stock;
          case "wattmaster":
            return d.controlsType === ControlsType.wattmaster;
          default:
            return true;
        }
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d &&
          ((d.jobName || "").toLowerCase().includes(q) ||
            (d.ipAddress || "").toLowerCase().includes(q) ||
            (d.deviceAddress || "").toLowerCase().includes(q) ||
            (d.customer || "").toLowerCase().includes(q)),
      );
    }
    return [...result].sort((a, b) =>
      (a?.jobName || "").localeCompare(b?.jobName || ""),
    );
  }, [safeActive, controlsFilter, searchQuery]);

  const filteredExpiredDevices: Device[] = useMemo(() => {
    if (!searchQuery.trim()) return safeInactive;
    const q = searchQuery.toLowerCase();
    return safeInactive.filter(
      (d) =>
        d &&
        ((d.jobName || "").toLowerCase().includes(q) ||
          (d.ipAddress || "").toLowerCase().includes(q) ||
          (d.deviceAddress || "").toLowerCase().includes(q)),
    );
  }, [safeInactive, searchQuery]);

  const activeTotalPages = Math.max(
    1,
    Math.ceil(filteredActiveDevices.length / DEVICES_PER_PAGE),
  );
  const expiredTotalPages = Math.max(
    1,
    Math.ceil(filteredExpiredDevices.length / DEVICES_PER_PAGE),
  );

  const pagedActiveDevices = useMemo(() => {
    const start = (activeCurrentPage - 1) * DEVICES_PER_PAGE;
    return filteredActiveDevices.slice(start, start + DEVICES_PER_PAGE);
  }, [filteredActiveDevices, activeCurrentPage]);

  const pagedExpiredDevices = useMemo(() => {
    const start = (expiredCurrentPage - 1) * DEVICES_PER_PAGE;
    return filteredExpiredDevices.slice(start, start + DEVICES_PER_PAGE);
  }, [filteredExpiredDevices, expiredCurrentPage]);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["activeDevices"] });
    await queryClient.invalidateQueries({ queryKey: ["inactiveDevices"] });
    await queryClient.invalidateQueries({ queryKey: ["deviceCounts"] });
    toast.success("Refreshed");
  }, [queryClient]);

  const handleClearSearch = useCallback(() => setSearchQuery(""), []);

  const handleNetCloudRefresh = useCallback(() => {
    pollNetCloud.mutate();
  }, [pollNetCloud]);

  const isLoading = isLoadingActive || isLoadingInactive;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Wifi className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Cradlepoint Dashboard
            </h1>
            <p className="text-xs text-muted-foreground">
              {activeCount} active · {expiredCount} expired
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {netCloudStatus?.hasKeys && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNetCloudRefresh}
              disabled={pollNetCloud.isPending}
              className="h-8 text-xs"
            >
              <RefreshCw
                className={`mr-1 h-3 w-3 ${pollNetCloud.isPending ? "animate-spin" : ""}`}
              />
              Refresh from NetCloud
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNetCloudSettingsOpen(true)}
            className="h-8 text-xs"
            title="NetCloud Settings"
            data-ocid="netcloud.settings.open_modal_button"
          >
            <Settings className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 text-xs"
            data-ocid="dashboard.refresh.button"
          >
            <RefreshCw
              className={`mr-1 h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddDeviceOpen(true)}
            className="h-8 text-xs"
            data-ocid="device.add.open_modal_button"
          >
            <Plus className="mr-1 h-3 w-3" />
            Add Device
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="h-8 text-xs text-muted-foreground"
            data-ocid="auth.logout.button"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "active"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          data-ocid="dashboard.active.tab"
        >
          Active Devices
          <Badge variant="secondary" className="ml-2 text-xs">
            {activeCount}
          </Badge>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("expired")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "expired"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          data-ocid="dashboard.expired.tab"
        >
          Expired Devices
          <Badge variant="secondary" className="ml-2 text-xs">
            {expiredCount}
          </Badge>
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by job name, IP, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-ocid="dashboard.search.input"
          />
        </div>
        {searchQuery && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSearch}
            data-ocid="dashboard.search.clear.button"
          >
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {/* Controls Filter (Active tab only) */}
      {activeTab === "active" && (
        <div className="mb-4 flex flex-wrap gap-2">
          {(["niagara", "reliable", "stock", "wattmaster"] as const).map(
            (filter) => (
              <Button
                key={filter}
                variant={controlsFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setControlsFilter(controlsFilter === filter ? "all" : filter)
                }
                className="h-7 text-xs capitalize"
                data-ocid={`dashboard.filter.${filter}.toggle`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ),
          )}
        </div>
      )}

      {/* Device Grid */}
      {activeTab === "active" ? (
        <DeviceGrid
          devices={pagedActiveDevices}
          isLoading={isLoadingActive}
          isActive={true}
          currentPage={activeCurrentPage}
          totalPages={activeTotalPages}
          onNextPage={() =>
            setActiveCurrentPage((p) => Math.min(p + 1, activeTotalPages))
          }
          onPreviousPage={() => setActiveCurrentPage((p) => Math.max(p - 1, 1))}
        />
      ) : (
        <DeviceGrid
          devices={pagedExpiredDevices}
          isLoading={isLoadingInactive}
          isActive={false}
          currentPage={expiredCurrentPage}
          totalPages={expiredTotalPages}
          onNextPage={() =>
            setExpiredCurrentPage((p) => Math.min(p + 1, expiredTotalPages))
          }
          onPreviousPage={() =>
            setExpiredCurrentPage((p) => Math.max(p - 1, 1))
          }
        />
      )}

      {/* Dialogs */}
      <DeviceFormDialog
        open={isAddDeviceOpen}
        onOpenChange={setIsAddDeviceOpen}
        isActive={activeTab === "active"}
      />
      <NetCloudSettingsDialog
        open={isNetCloudSettingsOpen}
        onOpenChange={setIsNetCloudSettingsOpen}
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <DashboardErrorBoundary>
      <DashboardContent />
    </DashboardErrorBoundary>
  );
}
