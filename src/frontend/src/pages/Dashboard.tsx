import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, Plus, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ControlsType } from "../backend";
import DeviceFormDialog from "../components/DeviceFormDialog";
import DeviceGrid from "../components/DeviceGrid";
import Footer from "../components/Footer";
import Header from "../components/Header";
import {
  useGetActiveDevices,
  useGetAllDevices,
  useGetCurrentTime,
  useGetInactiveDevices,
} from "../hooks/useQueries";

type FilterType = "all" | ControlsType;

const DEVICES_PER_PAGE = 12;

export default function Dashboard() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "expired">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Automatically fetch all device data in the background after authentication
  const {
    data: activeDevices = [],
    isLoading: loadingActive,
    error: activeError,
  } = useGetActiveDevices();
  const { data: inactiveDevices = [] } = useGetInactiveDevices();
  const {
    data: allDevices = [],
    isLoading: loadingAll,
    error: allError,
  } = useGetAllDevices();
  const { data: currentTime } = useGetCurrentTime();

  // Determine if we're in initial loading state (for internal logging only)
  const isInitialLoading =
    (loadingActive || loadingAll) && allDevices.length === 0;

  // Check if there's a connection error
  const hasConnectionError = useMemo(() => {
    return !!(activeError || allError);
  }, [activeError, allError]);

  // Silent background logging for connection status (no UI display)
  useEffect(() => {
    if (isInitialLoading) {
      console.log("═══════════════════════════════════════════════════════");
      console.log("🔄 INITIALIZING CRADLEPOINT DASHBOARD (AUTHENTICATED)");
      console.log("═══════════════════════════════════════════════════════");
      console.log(
        "📡 Connecting to production backend canister: f4pwe-iiaaa-aaaau-actnq-cai",
      );
      console.log(
        "🔍 Attempting to fetch device data (authenticated read-only operation)...",
      );
      console.log("💾 All localStorage configurations will be preserved");
      console.log("🔐 Authenticated access - Basic login session active");
      console.log("═══════════════════════════════════════════════════════");
    }
  }, [isInitialLoading]);

  useEffect(() => {
    if (hasConnectionError) {
      console.log("═══════════════════════════════════════════════════════");
      console.log("❌ BACKEND CONNECTION ERROR");
      console.log("═══════════════════════════════════════════════════════");
      console.log("⚠️  Failed to connect to production backend canister");
      console.log("🔄 Please check your internet connection and try again");
      console.log(
        "💡 If the canister was recently restarted, it may take a moment to become available",
      );
      console.log("═══════════════════════════════════════════════════════");
    }
  }, [hasConnectionError]);

  // Log successful data fetch
  useEffect(() => {
    if (allDevices.length > 0 && !isInitialLoading) {
      console.log("═══════════════════════════════════════════════════════");
      console.log("✅ DATA LOADED SUCCESSFULLY (AUTHENTICATED)");
      console.log("═══════════════════════════════════════════════════════");
      console.log(`📊 Total devices loaded: ${allDevices.length}`);
      console.log(`✓ Active devices: ${activeDevices.length}`);
      console.log(`✓ Inactive devices: ${inactiveDevices.length}`);
      console.log(
        "🔒 All data fetched from production backend (authenticated read-only)",
      );
      console.log("⚠️  No write operations performed during initialization");
      console.log("💾 LocalStorage configurations preserved");
      console.log("═══════════════════════════════════════════════════════");
    }
  }, [
    allDevices.length,
    activeDevices.length,
    inactiveDevices.length,
    isInitialLoading,
  ]);

  // Calculate truly active devices (isActive=true AND not expired) - for header count only
  const trulyActiveDevices = useMemo(() => {
    if (!currentTime) return [];
    return allDevices.filter(
      (device) => device.isActive && currentTime <= device.dateExpiration,
    );
  }, [allDevices, currentTime]);

  // Calculate expired devices (past expiration date, regardless of isActive flag)
  const expiredDevices = useMemo(() => {
    if (!currentTime) return [];
    return allDevices.filter((device) => currentTime > device.dateExpiration);
  }, [allDevices, currentTime]);

  // Get current devices based on active tab
  const getCurrentDevices = useCallback(() => {
    switch (activeTab) {
      case "active":
        return activeDevices;
      case "expired":
        return expiredDevices;
      default:
        return [];
    }
  }, [activeTab, activeDevices, expiredDevices]);

  const currentDevices = getCurrentDevices();
  const isLoading = activeTab === "active" ? loadingActive : loadingAll;

  // Filter devices by search query and type, then sort alphabetically by Job Name for active devices
  const filteredDevices = useMemo(() => {
    let filtered = currentDevices;

    // Apply search filter only for active devices tab
    if (activeTab === "active" && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (device) =>
          device.jobName.toLowerCase().includes(query) ||
          device.ipAddress.toLowerCase().includes(query) ||
          device.customer.toLowerCase().includes(query),
      );
    }

    // Apply type filter (only for active devices tab)
    if (activeTab === "active" && selectedFilter !== "all") {
      filtered = filtered.filter(
        (device) => device.controlsType === selectedFilter,
      );
    }

    // Sort active devices alphabetically by Job Name
    if (activeTab === "active") {
      filtered = [...filtered].sort((a, b) =>
        a.jobName.localeCompare(b.jobName, "en", { sensitivity: "base" }),
      );
    }

    return filtered;
  }, [currentDevices, searchQuery, selectedFilter, activeTab]);

  // Calculate pagination
  const totalPages = useMemo(
    () => Math.ceil(filteredDevices.length / DEVICES_PER_PAGE),
    [filteredDevices.length],
  );

  const paginatedDevices = useMemo(() => {
    const startIndex = (currentPage - 1) * DEVICES_PER_PAGE;
    const endIndex = startIndex + DEVICES_PER_PAGE;
    return filteredDevices.slice(startIndex, endIndex);
  }, [filteredDevices, currentPage]);

  // Calculate filter counts for active devices
  const filterCounts = useMemo(() => {
    const counts = {
      [ControlsType.niagara]: 0,
      [ControlsType.reliable]: 0,
      [ControlsType.stock]: 0,
      [ControlsType.wattmaster]: 0,
    };

    for (const device of activeDevices) {
      counts[device.controlsType]++;
    }

    return counts;
  }, [activeDevices]);

  // Clear search handler
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((filter: FilterType) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  }, []);

  // Handle tab change
  const handleTabChange = useCallback((tab: "active" | "expired") => {
    setActiveTab(tab);
    setCurrentPage(1);
  }, []);

  // Handle page navigation
  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage, totalPages]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setCurrentPage(1);
    },
    [],
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        activeCount={trulyActiveDevices.length}
        expiredCount={expiredDevices.length}
      />

      <main className="flex-1 px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto max-w-7xl space-y-3">
          {/* Connection Error Alert - Only show if there's an actual error, not during initial loading */}
          {hasConnectionError && !isInitialLoading && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-900 font-semibold">
                Backend Connection Failed
              </AlertTitle>
              <AlertDescription className="text-red-800">
                <div className="space-y-2">
                  <p>
                    Unable to connect to the production backend canister. Please
                    check your internet connection and try refreshing the page.
                  </p>
                  <p className="text-sm">
                    If the canister was recently restarted, it may take a moment
                    to become available again.
                  </p>
                  <p className="text-xs text-red-700">
                    Your localStorage data is preserved and will be available
                    when connection is restored.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              handleTabChange(value as typeof activeTab)
            }
            className="w-full"
          >
            <TabsList className="hidden">
              <TabsTrigger value="active">Active Devices</TabsTrigger>
              <TabsTrigger value="expired">Expired Devices</TabsTrigger>
            </TabsList>

            {/* Active Devices Tab - Shows all active devices including expired */}
            <TabsContent value="active" className="space-y-3">
              {/* Add Device Button - Full width on mobile, right-aligned on desktop */}
              <div className="flex justify-end">
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  size="sm"
                  className="h-10 w-full text-sm font-semibold sm:w-auto"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Device
                </Button>
              </div>

              {/* Search Bar with Clear Button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search for Cradlepoints"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="h-10 pl-9 text-sm"
                  />
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearSearch}
                        disabled={!searchQuery}
                        className="h-10 px-3"
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear search</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={
                    selectedFilter === ControlsType.niagara
                      ? "default"
                      : "outline"
                  }
                  onClick={() => handleFilterChange(ControlsType.niagara)}
                  className="h-8 rounded-full px-3 text-[13px]"
                  size="sm"
                >
                  Niagara ({filterCounts[ControlsType.niagara]})
                </Button>
                <Button
                  variant={
                    selectedFilter === ControlsType.reliable
                      ? "default"
                      : "outline"
                  }
                  onClick={() => handleFilterChange(ControlsType.reliable)}
                  className="h-8 rounded-full px-3 text-[13px]"
                  size="sm"
                >
                  Reliable ({filterCounts[ControlsType.reliable]})
                </Button>
                <Button
                  variant={
                    selectedFilter === ControlsType.stock
                      ? "default"
                      : "outline"
                  }
                  onClick={() => handleFilterChange(ControlsType.stock)}
                  className="h-8 rounded-full px-3 text-[13px]"
                  size="sm"
                >
                  Stock ({filterCounts[ControlsType.stock]})
                </Button>
                <Button
                  variant={
                    selectedFilter === ControlsType.wattmaster
                      ? "default"
                      : "outline"
                  }
                  onClick={() => handleFilterChange(ControlsType.wattmaster)}
                  className="h-8 rounded-full px-3 text-[13px]"
                  size="sm"
                >
                  Wattmaster ({filterCounts[ControlsType.wattmaster]})
                </Button>
              </div>

              {/* Device Grid with Pagination */}
              <DeviceGrid
                devices={paginatedDevices}
                isLoading={isLoading}
                isActive={true}
                currentPage={currentPage}
                totalPages={totalPages}
                onNextPage={handleNextPage}
                onPreviousPage={handlePreviousPage}
              />
            </TabsContent>

            {/* Expired Devices Tab */}
            <TabsContent value="expired" className="space-y-3">
              {/* Device Grid - No search bar or count badge */}
              <DeviceGrid
                devices={filteredDevices}
                isLoading={isLoading}
                isActive={false}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      <DeviceFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        isActive={true}
      />
    </div>
  );
}
