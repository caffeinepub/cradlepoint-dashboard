import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Device, UnitInfo } from "../backend";
import { ControlsType, CradlepointModel } from "../backend";
import {
  useAddDevice,
  useUpdateDevice,
  useValidateIpAddress,
} from "../hooks/useQueries";

interface DeviceFormDialogProps {
  device?: Device;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isActive: boolean;
}

// Helper function to calculate date one year later
function addOneYear(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split("T")[0];
}

export default function DeviceFormDialog({
  device,
  open,
  onOpenChange,
  isActive,
}: DeviceFormDialogProps) {
  const isEdit = !!device;
  const { mutate: addDevice, isPending: isAdding } = useAddDevice();
  const { mutate: updateDevice, isPending: isUpdating } = useUpdateDevice();

  const [formData, setFormData] = useState({
    jobName: "",
    ipAddress: "",
    dateDeployed: "",
    dateExpiration: "",
    notes: "",
    deviceAddress: "",
    customer: "",
    unitAmount: "0",
    controlsType: ControlsType.niagara,
    offline: false,
    unlicensed: false,
    needsAttention: false,
    anyDeskAddress: "",
    cradlepointModel: CradlepointModel.ibr700C4D,
  });

  const [unitInfo, setUnitInfo] = useState<UnitInfo[]>([]);
  const [initialIpAddress, setInitialIpAddress] = useState("");
  const [initialJobName, setInitialJobName] = useState("");

  // Determine if IP validation should run
  const ipChanged =
    formData.ipAddress.trim() !== "" && formData.ipAddress !== initialIpAddress;
  const jobNameChanged =
    formData.jobName.trim() !== "" && formData.jobName !== initialJobName;
  const shouldValidateIp =
    open && formData.ipAddress.trim() !== "" && (ipChanged || jobNameChanged);

  // Real-time IP validation - pass device ID when editing to exclude current device
  const { data: isIpValid, isLoading: isValidating } = useValidateIpAddress(
    formData.ipAddress,
    formData.jobName,
    device?.id,
  );

  // Show error only if validation has run and returned false
  const hasIpError = shouldValidateIp && isIpValid === false;

  useEffect(() => {
    if (device) {
      const deployedDate = new Date(Number(device.dateDeployed) / 1_000_000);
      const expirationDate = new Date(
        Number(device.dateExpiration) / 1_000_000,
      );

      setFormData({
        jobName: device.jobName,
        ipAddress: device.ipAddress,
        dateDeployed: deployedDate.toISOString().split("T")[0],
        dateExpiration: expirationDate.toISOString().split("T")[0],
        notes: device.notes,
        deviceAddress: device.deviceAddress,
        customer: device.customer,
        unitAmount: device.unitAmount.toString(),
        controlsType: device.controlsType,
        offline: device.offline,
        unlicensed: device.unlicensed,
        needsAttention: device.needsAttention,
        anyDeskAddress: device.anyDeskAddress || "",
        cradlepointModel: device.cradlepointModel || CradlepointModel.ibr700C4D,
      });
      setUnitInfo(device.unitInfo || []);
      setInitialIpAddress(device.ipAddress);
      setInitialJobName(device.jobName);
    } else {
      // Auto-populate dates for new device
      const today = new Date().toISOString().split("T")[0];
      const oneYearLater = addOneYear(today);

      setFormData({
        jobName: "",
        ipAddress: "",
        dateDeployed: today,
        dateExpiration: oneYearLater,
        notes: "",
        deviceAddress: "",
        customer: "",
        unitAmount: "0",
        controlsType: ControlsType.niagara,
        offline: false,
        unlicensed: false,
        needsAttention: false,
        anyDeskAddress: "",
        cradlepointModel: CradlepointModel.ibr700C4D,
      });
      setUnitInfo([]);
      setInitialIpAddress("");
      setInitialJobName("");
    }
  }, [device]);

  const handleUnitAmountChange = (value: string) => {
    const amount = Number.parseInt(value) || 0;
    setFormData({ ...formData, unitAmount: value });

    // Adjust unitInfo array to match the new amount
    if (amount > unitInfo.length) {
      // Add new empty units
      const newUnits: UnitInfo[] = Array(amount - unitInfo.length)
        .fill(null)
        .map(() => ({
          unitName: "",
          portNumber: "",
        }));
      setUnitInfo([...unitInfo, ...newUnits]);
    } else if (amount < unitInfo.length) {
      // Remove excess units
      setUnitInfo(unitInfo.slice(0, amount));
    }
  };

  const handleUnitInfoChange = (
    index: number,
    field: "unitName" | "portNumber",
    value: string,
  ) => {
    const newUnitInfo = [...unitInfo];
    newUnitInfo[index] = {
      ...newUnitInfo[index],
      [field]: value,
    };
    setUnitInfo(newUnitInfo);
  };

  const handleIpAddressChange = (value: string) => {
    setFormData({ ...formData, ipAddress: value });
  };

  const handleJobNameChange = (value: string) => {
    setFormData({ ...formData, jobName: value });
  };

  // Handle date deployed change with automatic expiration calculation
  const handleDateDeployedChange = (value: string) => {
    const newExpiration = addOneYear(value);
    setFormData({
      ...formData,
      dateDeployed: value,
      dateExpiration: newExpiration,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if IP is invalid
    if (hasIpError) {
      return;
    }

    // If IP validation is still in progress, wait for it
    if (isValidating && shouldValidateIp) {
      return;
    }

    const deployedTimestamp = BigInt(
      new Date(formData.dateDeployed).getTime() * 1_000_000,
    );

    // If expiration date is empty, pass null to backend for auto-calculation
    let expirationTimestamp: bigint | null = null;
    if (formData.dateExpiration.trim()) {
      expirationTimestamp = BigInt(
        new Date(formData.dateExpiration).getTime() * 1_000_000,
      );
    }

    const deviceData = {
      jobName: formData.jobName,
      ipAddress: formData.ipAddress,
      dateDeployed: deployedTimestamp,
      dateExpiration: expirationTimestamp,
      notes: formData.notes,
      deviceAddress: formData.deviceAddress,
      customer: formData.customer,
      isActive,
      unitAmount: BigInt(formData.unitAmount),
      unitInfo: unitInfo,
      controlsType: formData.controlsType,
      offline: formData.offline,
      unlicensed: formData.unlicensed,
      needsAttention: formData.needsAttention,
      anyDeskAddress: formData.anyDeskAddress.trim() || null,
      cradlepointModel: formData.cradlepointModel || null,
      simCardNumber: null,
    };

    if (isEdit && device) {
      updateDevice(
        { id: device.id, ...deviceData },
        {
          onSuccess: () => onOpenChange(false),
          onError: (error: Error) => {
            // Keep dialog open if authentication is required
            if (error.message !== "Authentication required") {
              // Other errors can close the dialog
            }
          },
        },
      );
    } else {
      addDevice(deviceData, {
        onSuccess: () => onOpenChange(false),
        onError: (error: Error) => {
          // Keep dialog open if authentication is required
          if (error.message !== "Authentication required") {
            // Other errors can close the dialog
          }
        },
      });
    }
  };

  const isPending = isAdding || isUpdating;
  const unitAmount = Number.parseInt(formData.unitAmount) || 0;
  const isWattmaster = formData.controlsType === ControlsType.wattmaster;
  const isSubmitDisabled =
    isPending || hasIpError || (isValidating && shouldValidateIp);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Device" : "Add New Device"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the device information below."
              : "Enter the details for the new device."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jobName">Job Name *</Label>
              <Input
                id="jobName"
                value={formData.jobName}
                onChange={(e) => handleJobNameChange(e.target.value)}
                placeholder="Enter job name"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP Address *</Label>
              <Input
                id="ipAddress"
                value={formData.ipAddress}
                onChange={(e) => handleIpAddressChange(e.target.value)}
                placeholder="192.168.1.1"
                required
                disabled={isPending}
                className={
                  hasIpError
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {hasIpError && (
                <div className="flex items-center gap-1.5 text-sm text-destructive font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>This IP address is already used by another job</span>
                </div>
              )}
              {isValidating && shouldValidateIp && !hasIpError && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                  <span>Validating IP address...</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateDeployed">Date Deployed *</Label>
              <Input
                id="dateDeployed"
                type="date"
                value={formData.dateDeployed}
                onChange={(e) => handleDateDeployedChange(e.target.value)}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateExpiration">Date Expiration</Label>
              <Input
                id="dateExpiration"
                type="date"
                value={formData.dateExpiration}
                onChange={(e) =>
                  setFormData({ ...formData, dateExpiration: e.target.value })
                }
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Input
                id="customer"
                value={formData.customer}
                onChange={(e) =>
                  setFormData({ ...formData, customer: e.target.value })
                }
                placeholder="Customer name"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceAddress">Site Location</Label>
              <Input
                id="deviceAddress"
                value={formData.deviceAddress}
                onChange={(e) =>
                  setFormData({ ...formData, deviceAddress: e.target.value })
                }
                placeholder="Full address"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="controlsType">Controls Type</Label>
              <Select
                value={formData.controlsType}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    controlsType: value as ControlsType,
                  })
                }
                disabled={isPending}
              >
                <SelectTrigger id="controlsType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ControlsType.niagara}>Niagara</SelectItem>
                  <SelectItem value={ControlsType.reliable}>
                    Reliable
                  </SelectItem>
                  <SelectItem value={ControlsType.stock}>Stock</SelectItem>
                  <SelectItem value={ControlsType.wattmaster}>
                    Wattmaster
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitAmount">Unit Amount</Label>
              <Input
                id="unitAmount"
                type="number"
                min="0"
                value={formData.unitAmount}
                onChange={(e) => handleUnitAmountChange(e.target.value)}
                placeholder="0"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cradlepointModel">Cradlepoint Model</Label>
              <Select
                value={formData.cradlepointModel}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    cradlepointModel: value as CradlepointModel,
                  })
                }
                disabled={isPending}
              >
                <SelectTrigger id="cradlepointModel">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CradlepointModel.ibr700C4D}>
                    IBR700-C4D
                  </SelectItem>
                  <SelectItem value={CradlepointModel.ibr600C150M}>
                    IBR600-C-150M
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isWattmaster && (
            <div className="space-y-2">
              <Label htmlFor="anyDeskAddress">Any Desk Address</Label>
              <Input
                id="anyDeskAddress"
                value={formData.anyDeskAddress}
                onChange={(e) =>
                  setFormData({ ...formData, anyDeskAddress: e.target.value })
                }
                placeholder="Enter Any Desk Address"
                disabled={isPending}
              />
            </div>
          )}

          {unitAmount > 0 && (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <Label className="text-sm font-semibold">Unit Information</Label>
              <div className="space-y-3">
                {unitInfo.map((unit, index) => {
                  const unitKey = unit.unitName
                    ? `${unit.unitName}-${index}`
                    : `unit-pos-${index}`;
                  return (
                    <div
                      key={unitKey}
                      className="grid gap-3 rounded-md border bg-background p-3 sm:grid-cols-2"
                    >
                      <div className="space-y-2">
                        <Label
                          htmlFor={`unitName-${index}`}
                          className="text-xs"
                        >
                          Unit {index + 1} Name
                        </Label>
                        <Input
                          id={`unitName-${index}`}
                          value={unit.unitName}
                          onChange={(e) =>
                            handleUnitInfoChange(
                              index,
                              "unitName",
                              e.target.value,
                            )
                          }
                          placeholder={`Unit ${index + 1} name`}
                          disabled={isPending}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor={`portNumber-${index}`}
                          className="text-xs"
                        >
                          Port Number
                        </Label>
                        <Input
                          id={`portNumber-${index}`}
                          value={unit.portNumber}
                          onChange={(e) =>
                            handleUnitInfoChange(
                              index,
                              "portNumber",
                              e.target.value,
                            )
                          }
                          placeholder="Port number"
                          disabled={isPending}
                          className="h-9"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes about this device"
              rows={4}
              disabled={isPending}
            />
          </div>

          <div className="space-y-3">
            <Label>Status Flags</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="offline"
                  checked={formData.offline}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, offline: checked as boolean })
                  }
                  disabled={isPending}
                />
                <Label htmlFor="offline" className="font-normal">
                  Offline
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unlicensed"
                  checked={formData.unlicensed}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, unlicensed: checked as boolean })
                  }
                  disabled={isPending}
                />
                <Label htmlFor="unlicensed" className="font-normal">
                  Unlicensed
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="needsAttention"
                  checked={formData.needsAttention}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      needsAttention: checked as boolean,
                    })
                  }
                  disabled={isPending}
                />
                <Label htmlFor="needsAttention" className="font-normal">
                  Needs Attention
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>{isEdit ? "Update Device" : "Add Device"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
