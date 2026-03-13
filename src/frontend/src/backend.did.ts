// Candid interface definition for the backend canister
// This file provides the IDL factory for creating actors

import { IDL } from "@icp-sdk/core/candid";

export const idlFactory = ({ IDL }: { IDL: any }) => {
  const UserRole = IDL.Variant({
    admin: IDL.Null,
    user: IDL.Null,
    guest: IDL.Null,
  });

  const UserProfile = IDL.Record({
    name: IDL.Text,
  });

  const UnitInfo = IDL.Record({
    portNumber: IDL.Text,
    unitName: IDL.Text,
  });

  const ControlsType = IDL.Variant({
    stock: IDL.Null,
    reliable: IDL.Null,
    wattmaster: IDL.Null,
    niagara: IDL.Null,
  });

  const CradlepointModel = IDL.Variant({
    ibr600C150M: IDL.Null,
    ibr700C4D: IDL.Null,
  });

  const Device = IDL.Record({
    id: IDL.Nat,
    deviceAddress: IDL.Text,
    needsAttention: IDL.Bool,
    customer: IDL.Text,
    jobName: IDL.Text,
    isActive: IDL.Bool,
    lastModified: IDL.Int,
    notes: IDL.Text,
    controlsType: ControlsType,
    dateExpiration: IDL.Int,
    dateDeployed: IDL.Int,
    unlicensed: IDL.Bool,
    offline: IDL.Bool,
    unitAmount: IDL.Nat,
    cradlepointModel: IDL.Opt(CradlepointModel),
    ipAddress: IDL.Text,
    unitInfo: IDL.Vec(UnitInfo),
    simCardNumber: IDL.Opt(IDL.Text),
    anyDeskAddress: IDL.Opt(IDL.Text),
  });

  return IDL.Service({
    addDevice: IDL.Func(
      [
        IDL.Text,
        IDL.Text,
        IDL.Int,
        IDL.Opt(IDL.Int),
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Bool,
        IDL.Nat,
        IDL.Vec(UnitInfo),
        ControlsType,
        IDL.Bool,
        IDL.Bool,
        IDL.Bool,
        IDL.Opt(IDL.Text),
        IDL.Opt(CradlepointModel),
        IDL.Opt(IDL.Text),
      ],
      [IDL.Nat],
      [],
    ),
    assignCallerUserRole: IDL.Func([IDL.Principal, UserRole], [], []),
    deleteDevice: IDL.Func([IDL.Nat], [], []),
    getActiveDevices: IDL.Func([], [IDL.Vec(Device)], ["query"]),
    getAllDevices: IDL.Func([], [IDL.Vec(Device)], ["query"]),
    getCallerUserProfile: IDL.Func([], [IDL.Opt(UserProfile)], ["query"]),
    getCallerUserRole: IDL.Func([], [UserRole], ["query"]),
    getCurrentTime: IDL.Func([], [IDL.Int], ["query"]),
    getDevice: IDL.Func([IDL.Nat], [IDL.Opt(Device)], ["query"]),
    getDeviceCounts: IDL.Func(
      [],
      [
        IDL.Record({
          active: IDL.Nat,
          expired: IDL.Nat,
          stock: IDL.Nat,
          reliable: IDL.Nat,
          wattmaster: IDL.Nat,
          niagara: IDL.Nat,
        }),
      ],
      ["query"],
    ),
    getDevicesByType: IDL.Func([ControlsType], [IDL.Vec(Device)], ["query"]),
    getExpiredDevices: IDL.Func([], [IDL.Vec(Device)], ["query"]),
    getInactiveDevices: IDL.Func([], [IDL.Vec(Device)], ["query"]),
    getUserProfile: IDL.Func(
      [IDL.Principal],
      [IDL.Opt(UserProfile)],
      ["query"],
    ),
    initializeAccessControl: IDL.Func([], [], []),
    isCallerAdmin: IDL.Func([], [IDL.Bool], ["query"]),
    saveCallerUserProfile: IDL.Func([UserProfile], [], []),
    toggleDeviceStatus: IDL.Func([IDL.Nat], [], []),
    updateDevice: IDL.Func(
      [
        IDL.Nat,
        IDL.Text,
        IDL.Text,
        IDL.Int,
        IDL.Opt(IDL.Int),
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Bool,
        IDL.Nat,
        IDL.Vec(UnitInfo),
        ControlsType,
        IDL.Bool,
        IDL.Bool,
        IDL.Bool,
        IDL.Opt(IDL.Text),
        IDL.Opt(CradlepointModel),
        IDL.Opt(IDL.Text),
      ],
      [],
      [],
    ),
    validateIpAddress: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Opt(IDL.Nat)],
      [IDL.Bool],
      ["query"],
    ),
  });
};
