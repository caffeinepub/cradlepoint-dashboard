import { getCredentials } from "@/lib/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Device, UnitInfo } from "../backend";
import type { ControlsType, CradlepointModel } from "../backend";
import { useActor } from "./useActor";

const QUERY_RETRY_ATTEMPTS = 5;
const QUERY_RETRY_DELAY = 2000;

// Read-only query for all devices with enhanced fail-safe error handling and restart recovery
export function useGetAllDevices() {
  const { actor, isFetching } = useActor();
  const { username, password } = getCredentials();

  return useQuery<Device[]>({
    queryKey: ["allDevices"],
    queryFn: async () => {
      if (!actor) {
        console.log("[useGetAllDevices] Actor not yet initialized, waiting...");
        return [];
      }

      console.log(
        "[useGetAllDevices] Fetching all devices from production backend canister (f4pwe-iiaaa-aaaau-actnq-cai)...",
      );
      try {
        const devices = await actor.getAllDevices(username, password);
        console.log(
          `[useGetAllDevices] ✓ Successfully fetched ${devices.length} devices from backend`,
        );
        return devices;
      } catch (error: any) {
        console.error("[useGetAllDevices] Failed to fetch devices:", error);

        // Check if this is a canister restart scenario
        const errorMessage = error?.message || error?.toString() || "";
        if (
          errorMessage.includes("stopped") ||
          errorMessage.includes("unavailable")
        ) {
          console.log(
            "[useGetAllDevices] ⚠️  Canister may be restarting, will retry...",
          );
        }

        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: (failureCount, error: any) => {
      const errorMessage = error?.message || error?.toString() || "";

      // Don't retry on authentication errors
      if (errorMessage.includes("Invalid credentials")) {
        console.log("[useGetAllDevices] Authentication failed - not retrying");
        return false;
      }

      // Retry for connection/canister errors
      if (failureCount < QUERY_RETRY_ATTEMPTS) {
        console.log(
          `[useGetAllDevices] Retry ${failureCount + 1}/${QUERY_RETRY_ATTEMPTS}...`,
        );
        return true;
      }

      return false;
    },
    retryDelay: (attemptIndex) =>
      Math.min(QUERY_RETRY_DELAY * 2 ** attemptIndex, 30000),
  });
}

// Read-only query for active devices with enhanced fail-safe error handling and restart recovery
export function useGetActiveDevices() {
  const { actor, isFetching } = useActor();
  const { username, password } = getCredentials();

  return useQuery<Device[]>({
    queryKey: ["activeDevices"],
    queryFn: async () => {
      if (!actor) {
        console.log(
          "[useGetActiveDevices] Actor not yet initialized, waiting...",
        );
        return [];
      }

      console.log(
        "[useGetActiveDevices] Fetching active devices from production backend canister...",
      );
      try {
        const devices = await actor.getActiveDevices(username, password);
        console.log(
          `[useGetActiveDevices] ✓ Successfully fetched ${devices.length} active devices`,
        );
        return devices;
      } catch (error: any) {
        console.error(
          "[useGetActiveDevices] Failed to fetch active devices:",
          error,
        );

        const errorMessage = error?.message || error?.toString() || "";
        if (
          errorMessage.includes("stopped") ||
          errorMessage.includes("unavailable")
        ) {
          console.log(
            "[useGetActiveDevices] ⚠️  Canister may be restarting, will retry...",
          );
        }

        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: (failureCount, error: any) => {
      const errorMessage = error?.message || error?.toString() || "";
      if (errorMessage.includes("Invalid credentials")) {
        console.log(
          "[useGetActiveDevices] Authentication failed - not retrying",
        );
        return false;
      }
      return failureCount < QUERY_RETRY_ATTEMPTS;
    },
    retryDelay: (attemptIndex) =>
      Math.min(QUERY_RETRY_DELAY * 2 ** attemptIndex, 30000),
  });
}

// Read-only query for inactive devices with enhanced fail-safe error handling and restart recovery
export function useGetInactiveDevices() {
  const { actor, isFetching } = useActor();
  const { username, password } = getCredentials();

  return useQuery<Device[]>({
    queryKey: ["inactiveDevices"],
    queryFn: async () => {
      if (!actor) {
        console.log(
          "[useGetInactiveDevices] Actor not yet initialized, waiting...",
        );
        return [];
      }

      console.log(
        "[useGetInactiveDevices] Fetching inactive devices from production backend canister...",
      );
      try {
        const devices = await actor.getInactiveDevices(username, password);
        console.log(
          `[useGetInactiveDevices] ✓ Successfully fetched ${devices.length} inactive devices`,
        );
        return devices;
      } catch (error: any) {
        console.error(
          "[useGetInactiveDevices] Failed to fetch inactive devices:",
          error,
        );

        const errorMessage = error?.message || error?.toString() || "";
        if (
          errorMessage.includes("stopped") ||
          errorMessage.includes("unavailable")
        ) {
          console.log(
            "[useGetInactiveDevices] ⚠️  Canister may be restarting, will retry...",
          );
        }

        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: (failureCount, error: any) => {
      const errorMessage = error?.message || error?.toString() || "";
      if (errorMessage.includes("Invalid credentials")) {
        console.log(
          "[useGetInactiveDevices] Authentication failed - not retrying",
        );
        return false;
      }
      return failureCount < QUERY_RETRY_ATTEMPTS;
    },
    retryDelay: (attemptIndex) =>
      Math.min(QUERY_RETRY_DELAY * 2 ** attemptIndex, 30000),
  });
}

// Read-only query for device counts with enhanced fail-safe error handling and restart recovery
export function useGetDeviceCounts() {
  const { actor, isFetching } = useActor();
  const { username, password } = getCredentials();

  return useQuery<{
    active: bigint;
    expired: bigint;
    niagara: bigint;
    reliable: bigint;
    stock: bigint;
    wattmaster: bigint;
  }>({
    queryKey: ["deviceCounts"],
    queryFn: async () => {
      if (!actor) {
        return {
          active: BigInt(0),
          expired: BigInt(0),
          niagara: BigInt(0),
          reliable: BigInt(0),
          stock: BigInt(0),
          wattmaster: BigInt(0),
        };
      }

      console.log(
        "[useGetDeviceCounts] Fetching device counts from production backend canister...",
      );
      try {
        const counts = await actor.getDeviceCounts(username, password);
        console.log(
          "[useGetDeviceCounts] ✓ Successfully fetched device counts",
        );
        return counts;
      } catch (error: any) {
        console.error(
          "[useGetDeviceCounts] Failed to fetch device counts:",
          error,
        );

        const errorMessage = error?.message || error?.toString() || "";
        if (
          errorMessage.includes("stopped") ||
          errorMessage.includes("unavailable")
        ) {
          console.log(
            "[useGetDeviceCounts] ⚠️  Canister may be restarting, will retry...",
          );
        }

        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: (failureCount, error: any) => {
      const errorMessage = error?.message || error?.toString() || "";
      if (errorMessage.includes("Invalid credentials")) {
        return false;
      }
      return failureCount < QUERY_RETRY_ATTEMPTS;
    },
    retryDelay: (attemptIndex) =>
      Math.min(QUERY_RETRY_DELAY * 2 ** attemptIndex, 30000),
  });
}

// Read-only query for current time with enhanced fail-safe error handling and restart recovery
export function useGetCurrentTime() {
  const { actor, isFetching } = useActor();
  const { username, password } = getCredentials();

  return useQuery<bigint>({
    queryKey: ["currentTime"],
    queryFn: async () => {
      if (!actor) {
        return BigInt(Date.now() * 1_000_000);
      }

      try {
        const time = await actor.getCurrentTime(username, password);
        return time;
      } catch (error: any) {
        console.warn(
          "[useGetCurrentTime] Failed to fetch backend time, using local time:",
          error,
        );
        // Fallback to local time if backend is unreachable
        return BigInt(Date.now() * 1_000_000);
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60000,
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: false, // Don't retry time queries, just use local time
  });
}

// IP validation query - requires authentication for write operations
export function useValidateIpAddress(
  ipAddress: string,
  jobName: string,
  deviceId?: bigint,
) {
  const { actor, isFetching } = useActor();
  const { username, password } = getCredentials();

  return useQuery<boolean>({
    queryKey: ["validateIpAddress", ipAddress, jobName, deviceId?.toString()],
    queryFn: async () => {
      if (!ipAddress.trim() || !actor) {
        return true;
      }

      try {
        const isValid = await actor.validateIpAddress(
          username,
          password,
          ipAddress,
          jobName,
          deviceId !== undefined ? deviceId : null,
        );
        return isValid;
      } catch (error: any) {
        console.error("[useValidateIpAddress] IP validation error:", error);
        return true;
      }
    },
    enabled: !!ipAddress.trim() && !!actor && !isFetching,
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

// Mutation for adding devices - requires authentication, prevents writes during initial load
export function useAddDevice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { username, password } = getCredentials();

  return useMutation({
    mutationFn: async (device: {
      jobName: string;
      ipAddress: string;
      dateDeployed: bigint;
      dateExpiration: bigint | null;
      notes: string;
      deviceAddress: string;
      customer: string;
      isActive: boolean;
      unitAmount: bigint;
      unitInfo: UnitInfo[];
      controlsType: ControlsType;
      offline: boolean;
      unlicensed: boolean;
      needsAttention: boolean;
      anyDeskAddress: string | null;
      cradlepointModel: CradlepointModel | null;
      simCardNumber: string | null;
    }) => {
      if (!actor) {
        console.error("[useAddDevice] Cannot add device: Actor not available");
        throw new Error(
          "Backend connection not available. Please refresh the page.",
        );
      }

      console.log(
        "[useAddDevice] Adding new device to production backend canister...",
      );
      const backendId = await actor.addDevice(
        username,
        password,
        device.jobName,
        device.ipAddress,
        device.dateDeployed,
        device.dateExpiration,
        device.notes,
        device.deviceAddress,
        device.customer,
        device.isActive,
        device.unitAmount,
        device.unitInfo,
        device.controlsType,
        device.offline,
        device.unlicensed,
        device.needsAttention,
        device.anyDeskAddress,
        device.cradlepointModel,
        device.simCardNumber,
      );

      console.log(
        `[useAddDevice] ✓ Device added successfully with ID: ${backendId}`,
      );
      return backendId;
    },
    onSuccess: async () => {
      console.log(
        "[useAddDevice] Invalidating device queries after successful add...",
      );
      await queryClient.invalidateQueries({ queryKey: ["activeDevices"] });
      await queryClient.invalidateQueries({ queryKey: ["inactiveDevices"] });
      await queryClient.invalidateQueries({ queryKey: ["allDevices"] });
      await queryClient.invalidateQueries({ queryKey: ["deviceCounts"] });
      await queryClient.invalidateQueries({ queryKey: ["validateIpAddress"] });
      await queryClient.invalidateQueries({ queryKey: ["currentTime"] });

      toast.success("Device added successfully");
    },
    onError: (error: Error) => {
      const errorMessage = error.message || "Unknown error occurred";
      console.error("[useAddDevice] Failed to add device:", errorMessage);

      if (
        errorMessage.includes("Duplicate IP") ||
        errorMessage.includes("already used")
      ) {
        toast.error(errorMessage);
      } else if (errorMessage.includes("Invalid credentials")) {
        toast.error("Authentication failed. Please log in again.");
      } else {
        toast.error(`Failed to add device: ${errorMessage}`);
      }
    },
  });
}

// Mutation for updating devices - requires authentication, prevents writes during initial load
export function useUpdateDevice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { username, password } = getCredentials();

  return useMutation({
    mutationFn: async (device: {
      id: bigint;
      jobName: string;
      ipAddress: string;
      dateDeployed: bigint;
      dateExpiration: bigint | null;
      notes: string;
      deviceAddress: string;
      customer: string;
      isActive: boolean;
      unitAmount: bigint;
      unitInfo: UnitInfo[];
      controlsType: ControlsType;
      offline: boolean;
      unlicensed: boolean;
      needsAttention: boolean;
      anyDeskAddress: string | null;
      cradlepointModel: CradlepointModel | null;
      simCardNumber: string | null;
    }) => {
      if (!actor) {
        console.error(
          "[useUpdateDevice] Cannot update device: Actor not available",
        );
        throw new Error(
          "Backend connection not available. Please refresh the page.",
        );
      }

      console.log(
        `[useUpdateDevice] Updating device ${device.id} in production backend canister...`,
      );
      await actor.updateDevice(
        username,
        password,
        device.id,
        device.jobName,
        device.ipAddress,
        device.dateDeployed,
        device.dateExpiration,
        device.notes,
        device.deviceAddress,
        device.customer,
        device.isActive,
        device.unitAmount,
        device.unitInfo,
        device.controlsType,
        device.offline,
        device.unlicensed,
        device.needsAttention,
        device.anyDeskAddress,
        device.cradlepointModel,
        device.simCardNumber,
      );
      console.log(
        `[useUpdateDevice] ✓ Device ${device.id} updated successfully`,
      );
    },
    onSuccess: async () => {
      console.log(
        "[useUpdateDevice] Invalidating device queries after successful update...",
      );
      await queryClient.invalidateQueries({ queryKey: ["activeDevices"] });
      await queryClient.invalidateQueries({ queryKey: ["inactiveDevices"] });
      await queryClient.invalidateQueries({ queryKey: ["allDevices"] });
      await queryClient.invalidateQueries({ queryKey: ["deviceCounts"] });
      await queryClient.invalidateQueries({ queryKey: ["validateIpAddress"] });
      await queryClient.invalidateQueries({ queryKey: ["currentTime"] });

      toast.success("Device updated successfully");
    },
    onError: (error: Error) => {
      const errorMessage = error.message || "Unknown error occurred";
      console.error("[useUpdateDevice] Failed to update device:", errorMessage);

      if (
        errorMessage.includes("Duplicate IP") ||
        errorMessage.includes("already used")
      ) {
        toast.error(errorMessage);
      } else if (errorMessage.includes("Invalid credentials")) {
        toast.error("Authentication failed. Please log in again.");
      } else {
        toast.error(`Failed to update device: ${errorMessage}`);
      }
    },
  });
}

// Mutation for toggling device status - requires authentication
export function useToggleDeviceStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { username, password } = getCredentials();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) {
        console.error(
          "[useToggleDeviceStatus] Cannot toggle status: Actor not available",
        );
        throw new Error(
          "Backend connection not available. Please refresh the page.",
        );
      }

      console.log(
        `[useToggleDeviceStatus] Toggling status for device ${id}...`,
      );
      await actor.toggleDeviceStatus(username, password, id);
      console.log(
        `[useToggleDeviceStatus] ✓ Device ${id} status toggled successfully`,
      );
    },
    onSuccess: async () => {
      console.log(
        "[useToggleDeviceStatus] Invalidating device queries after status toggle...",
      );
      await queryClient.invalidateQueries({ queryKey: ["activeDevices"] });
      await queryClient.invalidateQueries({ queryKey: ["inactiveDevices"] });
      await queryClient.invalidateQueries({ queryKey: ["allDevices"] });
      await queryClient.invalidateQueries({ queryKey: ["deviceCounts"] });
      await queryClient.invalidateQueries({ queryKey: ["currentTime"] });

      toast.success("Device status updated");
    },
    onError: (error: Error) => {
      const errorMessage = error.message || "Unknown error occurred";
      console.error(
        "[useToggleDeviceStatus] Failed to toggle device status:",
        errorMessage,
      );

      if (errorMessage.includes("Invalid credentials")) {
        toast.error("Authentication failed. Please log in again.");
      } else {
        toast.error(`Failed to update device status: ${errorMessage}`);
      }
    },
  });
}

// Mutation for deleting devices - requires authentication
export function useDeleteDevice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { username, password } = getCredentials();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) {
        console.error(
          "[useDeleteDevice] Cannot delete device: Actor not available",
        );
        throw new Error(
          "Backend connection not available. Please refresh the page.",
        );
      }

      console.log(
        `[useDeleteDevice] Deleting device ${id} from production backend canister...`,
      );
      await actor.deleteDevice(username, password, id);
      console.log(`[useDeleteDevice] ✓ Device ${id} deleted successfully`);
    },
    onSuccess: async () => {
      console.log(
        "[useDeleteDevice] Invalidating device queries after successful delete...",
      );
      await queryClient.invalidateQueries({ queryKey: ["activeDevices"] });
      await queryClient.invalidateQueries({ queryKey: ["inactiveDevices"] });
      await queryClient.invalidateQueries({ queryKey: ["allDevices"] });
      await queryClient.invalidateQueries({ queryKey: ["deviceCounts"] });
      await queryClient.invalidateQueries({ queryKey: ["currentTime"] });

      toast.success("Device deleted successfully");
    },
    onError: (error: Error) => {
      const errorMessage = error.message || "Unknown error occurred";
      console.error("[useDeleteDevice] Failed to delete device:", errorMessage);

      if (errorMessage.includes("Invalid credentials")) {
        toast.error("Authentication failed. Please log in again.");
      } else {
        toast.error(`Failed to delete device: ${errorMessage}`);
      }
    },
  });
}
