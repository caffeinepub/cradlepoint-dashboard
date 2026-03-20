import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UnitInfo {
    portNumber: string;
    unitName: string;
}
export interface DeviceCounts {
    active: bigint;
    expired: bigint;
    stock: bigint;
    reliable: bigint;
    wattmaster: bigint;
    niagara: bigint;
}
export interface UserProfile {
    username: string;
    name: string;
}
export interface Device {
    id: bigint;
    deviceAddress: string;
    needsAttention: boolean;
    customer: string;
    jobName: string;
    isActive: boolean;
    lastModified: bigint;
    notes: string;
    controlsType: ControlsType;
    dateExpiration: bigint;
    dateDeployed: bigint;
    unlicensed: boolean;
    offline: boolean;
    unitAmount: bigint;
    cradlepointModel?: CradlepointModel;
    ipAddress: string;
    unitInfo: Array<UnitInfo>;
    simCardNumber?: string;
    anyDeskAddress?: string;
}
export enum ControlsType {
    stock = "stock",
    reliable = "reliable",
    wattmaster = "wattmaster",
    niagara = "niagara"
}
export enum CradlepointModel {
    ibr600C150M = "ibr600C150M",
    ibr700C4D = "ibr700C4D"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDevice(username: string, password: string, jobName: string, ipAddress: string, dateDeployed: bigint, dateExpiration: bigint | null, notes: string, deviceAddress: string, customer: string, isActive: boolean, unitAmount: bigint, unitInfo: Array<UnitInfo>, controlsType: ControlsType, offline: boolean, unlicensed: boolean, needsAttention: boolean, anyDeskAddress: string | null, cradlepointModel: CradlepointModel | null, simCardNumber: string | null): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    authenticate(username: string, password: string): Promise<boolean>;
    deleteDevice(username: string, password: string, id: bigint): Promise<void>;
    getActiveDevices(username: string, password: string): Promise<Array<Device>>;
    getAllDevices(username: string, password: string): Promise<Array<Device>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentTime(username: string, password: string): Promise<bigint>;
    getDevice(username: string, password: string, id: bigint): Promise<Device | null>;
    getDeviceCounts(username: string, password: string): Promise<DeviceCounts>;
    getDevicesByType(username: string, password: string, deviceType: ControlsType): Promise<Array<Device>>;
    getExpiredDevices(username: string, password: string): Promise<Array<Device>>;
    getInactiveDevices(username: string, password: string): Promise<Array<Device>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleDeviceStatus(username: string, password: string, id: bigint): Promise<void>;
    updateDevice(username: string, password: string, id: bigint, jobName: string, ipAddress: string, dateDeployed: bigint, dateExpiration: bigint | null, notes: string, deviceAddress: string, customer: string, isActive: boolean, unitAmount: bigint, unitInfo: Array<UnitInfo>, controlsType: ControlsType, offline: boolean, unlicensed: boolean, needsAttention: boolean, anyDeskAddress: string | null, cradlepointModel: CradlepointModel | null, simCardNumber: string | null): Promise<void>;
    validateIpAddress(username: string, password: string, ipAddress: string, jobName: string, excludeDeviceId: bigint | null): Promise<boolean>;
    getNetCloudKeyStatus(username: string, password: string): Promise<{ hasKeys: boolean; lastSyncTime: bigint; lastSyncStatus: string }>;
    saveNetCloudKeys(username: string, password: string, cpApiId: string, cpApiKey: string, ecmApiId: string, ecmApiKey: string): Promise<void>;
    pollNetCloud(username: string, password: string): Promise<string>;
}
