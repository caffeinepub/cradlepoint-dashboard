import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  ExternalLink,
  Network,
  Router,
  Trash2,
} from "lucide-react";
import { memo, useMemo, useState } from "react";
import { ControlsType, type Device } from "../backend";
import { useDeleteDevice, useGetCurrentTime } from "../hooks/useQueries";
import DeviceFormDialog from "./DeviceFormDialog";

interface DeviceCardProps {
  device: Device;
  isActive: boolean;
}

const DeviceCard = memo(
  function DeviceCard({ device, isActive }: DeviceCardProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const deleteDevice = useDeleteDevice();
    const { data: currentTime } = useGetCurrentTime();

    // Calculate if device is expired based on current time
    const isExpired = useMemo(() => {
      if (!currentTime) {
        // Fallback to client-side time if backend time not available
        const now = BigInt(Date.now() * 1_000_000);
        return now > device.dateExpiration;
      }
      return currentTime > device.dateExpiration;
    }, [currentTime, device.dateExpiration]);

    const handleDelete = () => {
      deleteDevice.mutate(device.id);
      setIsDeleteDialogOpen(false);
    };

    // Calculate "Days Active" duration (time since deployment)
    const statusDuration = useMemo(() => {
      const now = currentTime || BigInt(Date.now() * 1_000_000);
      const diffMs = Number(now - device.dateDeployed) / 1_000_000;
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (days < 30) return `${days} day${days !== 1 ? "s" : ""}`;
      const months = Math.floor(days / 30);
      if (months < 12) return `${months} month${months !== 1 ? "s" : ""}`;
      const years = Math.floor(months / 12);
      return `${years} year${years !== 1 ? "s" : ""}`;
    }, [currentTime, device.dateDeployed]);

    // Calculate expiration duration (time until/since expiration)
    const expirationDuration = useMemo(() => {
      const now = currentTime || BigInt(Date.now() * 1_000_000);
      const diffMs = Number(device.dateExpiration - now) / 1_000_000;
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (days < 0) {
        // Expired
        const absDays = Math.abs(days);
        if (absDays < 30)
          return `Expired ${absDays} day${absDays !== 1 ? "s" : ""} ago`;
        const months = Math.floor(absDays / 30);
        if (months < 12)
          return `Expired ${months} month${months !== 1 ? "s" : ""} ago`;
        const years = Math.floor(months / 12);
        return `Expired ${years} year${years !== 1 ? "s" : ""} ago`;
      }
      // Active
      if (days < 30) return `Expires in ${days} day${days !== 1 ? "s" : ""}`;
      const months = Math.floor(days / 30);
      if (months < 12)
        return `Expires in ${months} month${months !== 1 ? "s" : ""}`;
      const years = Math.floor(months / 12);
      return `Expires in ${years} year${years !== 1 ? "s" : ""}`;
    }, [currentTime, device.dateExpiration]);

    const controlsTypeLabel = useMemo(() => {
      switch (device.controlsType) {
        case ControlsType.niagara:
          return "Niagara";
        case ControlsType.reliable:
          return "Reliable";
        case ControlsType.stock:
          return "Stock";
        case ControlsType.wattmaster:
          return "Wattmaster";
        default:
          return "";
      }
    }, [device.controlsType]);

    const handleVisitJobSite = (portNumber: string) => {
      const url = `http://${device.ipAddress}:${portNumber}`;
      window.open(url, "_blank", "noopener,noreferrer");
    };

    const handleVisitCradlepoint = () => {
      const url = `http://${device.ipAddress}:8080`;
      window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
      <>
        <div
          className={cn(
            "group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md",
            isExpired
              ? "border-l-4 border-l-red-500"
              : "border-l-4 border-l-green-500",
          )}
        >
          {/* Card Header */}
          <div className="flex items-start justify-between gap-2 border-b border-border/50 bg-gradient-to-r from-blue-50/50 to-transparent p-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Router className="h-4 w-4 shrink-0 text-primary" />
              <h3 className="text-base font-semibold text-foreground truncate">
                {device.jobName}
              </h3>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                className="h-7 w-7 p-0 hover:bg-primary/10"
                title="Edit device"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                title="Delete device"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Card Content */}
          <div className="space-y-2 p-3">
            {/* Status Flags */}
            {(device.unlicensed || device.needsAttention) && (
              <div className="flex flex-wrap gap-1.5">
                {device.unlicensed && (
                  <Badge
                    variant="outline"
                    className="h-5 border-purple-500/30 bg-purple-50 px-2 text-[10px] font-medium text-purple-700"
                  >
                    Unlicensed
                  </Badge>
                )}
                {device.needsAttention && (
                  <Badge
                    variant="outline"
                    className="h-5 border-orange-500/30 bg-orange-50 px-2 text-[10px] font-medium text-orange-700"
                  >
                    Needs Attention
                  </Badge>
                )}
              </div>
            )}

            {/* IP Address */}
            <div className="flex items-center gap-2">
              <Network className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="text-[15px] font-medium text-foreground">
                {device.ipAddress}
              </span>
            </div>

            {/* Site Location */}
            {device.deviceAddress && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {device.deviceAddress}
              </p>
            )}

            {/* Controls Type */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Controls:</span>
              <span className="text-xs font-medium text-foreground">
                {controlsTypeLabel}
              </span>
            </div>

            {/* Any Desk Address (Wattmaster only) */}
            {device.controlsType === ControlsType.wattmaster &&
              device.anyDeskAddress && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    AnyDesk:
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    {device.anyDeskAddress}
                  </span>
                </div>
              )}

            {/* Status Duration - Show "Days Active" for non-expired, "Expired" badge for expired */}
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "h-5 px-2 text-[10px] font-medium",
                  isExpired
                    ? "border-red-500/30 bg-red-50 text-red-700"
                    : "border-green-500/30 bg-green-50 text-green-700",
                )}
              >
                {isExpired ? "Expired" : `Active ${statusDuration}`}
              </Badge>
            </div>

            {/* Expiration Duration - Always show time until/since expiration */}
            <div className="text-xs" style={{ marginTop: "0.25rem" }}>
              <span
                className={cn(
                  "font-medium",
                  isExpired ? "text-red-600" : "text-gray-500",
                )}
              >
                {expirationDuration}
              </span>
            </div>

            {/* Action Buttons - Stacked Vertically */}
            <div className="flex flex-col gap-2 pt-1">
              {/* Visit Job Site (Niagara only) */}
              {device.controlsType === ControlsType.niagara &&
                device.unitInfo.length > 0 &&
                (device.unitInfo.length === 1 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleVisitJobSite(device.unitInfo[0].portNumber)
                    }
                    className="h-8 w-full text-xs"
                  >
                    <ExternalLink className="mr-1 h-3 w-3" />
                    Visit Job Site
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-full text-xs"
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Visit Job Site
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {device.unitInfo.map((unit) => (
                        <DropdownMenuItem
                          key={unit.portNumber}
                          onClick={() => handleVisitJobSite(unit.portNumber)}
                        >
                          {unit.unitName || unit.portNumber}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}

              {/* Visit Cradlepoint */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleVisitCradlepoint}
                className="h-8 w-full text-xs"
              >
                <ExternalLink className="mr-1 h-3 w-3" />
                Visit Cradlepoint
              </Button>
            </div>

            {/* Expandable Details Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 w-full text-xs font-medium text-primary hover:bg-primary/5"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="mr-1 h-3 w-3" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-3 w-3" />
                  Show More
                </>
              )}
            </Button>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="space-y-2 border-t border-border/50 pt-2 text-xs">
                {device.customer && (
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Customer:{" "}
                    </span>
                    <span className="text-foreground">{device.customer}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-muted-foreground">
                    Deployed:{" "}
                  </span>
                  <span className="text-foreground">
                    {new Date(
                      Number(device.dateDeployed) / 1_000_000,
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Expiration:{" "}
                  </span>
                  <span className="text-foreground">
                    {new Date(
                      Number(device.dateExpiration) / 1_000_000,
                    ).toLocaleDateString()}
                  </span>
                </div>
                {device.unitAmount > 0n && (
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Units:{" "}
                    </span>
                    <span className="text-foreground">
                      {device.unitAmount.toString()}
                    </span>
                  </div>
                )}
                {device.unitInfo.length > 0 && (
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Unit Info:
                    </span>
                    <ul className="ml-4 mt-1 list-disc space-y-0.5">
                      {device.unitInfo.map((unit) => (
                        <li key={unit.portNumber} className="text-foreground">
                          {unit.unitName} - Port {unit.portNumber}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {device.cradlepointModel && (
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Model:{" "}
                    </span>
                    <span className="text-foreground">
                      {device.cradlepointModel === "ibr700C4D"
                        ? "IBR700-C4D"
                        : "IBR600-C-150M"}
                    </span>
                  </div>
                )}
                {device.notes && (
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Notes:{" "}
                    </span>
                    <span className="text-foreground">{device.notes}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Edit Dialog */}
        <DeviceFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          device={device}
          isActive={isActive}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Device</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{device.jobName}"? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for memo
    return (
      prevProps.device.id === nextProps.device.id &&
      prevProps.isActive === nextProps.isActive &&
      prevProps.device.jobName === nextProps.device.jobName &&
      prevProps.device.ipAddress === nextProps.device.ipAddress &&
      prevProps.device.dateDeployed === nextProps.device.dateDeployed &&
      prevProps.device.dateExpiration === nextProps.device.dateExpiration &&
      prevProps.device.offline === nextProps.device.offline &&
      prevProps.device.unlicensed === nextProps.device.unlicensed &&
      prevProps.device.needsAttention === nextProps.device.needsAttention
    );
  },
);

export default DeviceCard;
