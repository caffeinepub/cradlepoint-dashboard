import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Router } from "lucide-react";
import { memo } from "react";
import type { Device } from "../backend";
import DeviceCard from "./DeviceCard";

interface DeviceGridProps {
  devices: Device[];
  isLoading: boolean;
  isActive: boolean;
  currentPage?: number;
  totalPages?: number;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
}

const DeviceGrid = memo(
  function DeviceGrid({
    devices,
    isLoading,
    isActive,
    currentPage,
    totalPages,
    onNextPage,
    onPreviousPage,
  }: DeviceGridProps) {
    const showPagination =
      currentPage !== undefined && totalPages !== undefined && totalPages > 1;

    if (isLoading) {
      return (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">
              Loading devices...
            </p>
          </div>
        </div>
      );
    }

    if (devices.length === 0) {
      return (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <Router
              className="mx-auto h-16 w-16 text-muted-foreground/40"
              strokeWidth={1.5}
            />
            <p className="mt-4 text-base font-medium text-muted-foreground">
              No devices found
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <div
              key={device.id.toString()}
              style={{
                contentVisibility: "auto",
                containIntrinsicSize: "0 400px",
              }}
            >
              <DeviceCard device={device} isActive={isActive} />
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {showPagination && (
          <div className="flex items-center justify-center gap-4 border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-900">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memo optimization
    return (
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.isActive === nextProps.isActive &&
      prevProps.currentPage === nextProps.currentPage &&
      prevProps.totalPages === nextProps.totalPages &&
      prevProps.devices.length === nextProps.devices.length &&
      prevProps.devices.every(
        (device, index) => device.id === nextProps.devices[index]?.id,
      )
    );
  },
);

export default DeviceGrid;
