# Cradlepoint Dashboard

## Current State
The backend `main.mo` declares device storage as `let devices = Map.empty<Nat, Device>()` — regular heap memory. This means all device data is wiped on every canister upgrade/redeploy. The `nextDeviceId` counter is also heap-only and resets to 1 on every deploy.

## Requested Changes (Diff)

### Add
- Stable pre/postupgrade hooks to serialize/deserialize device data across canister upgrades
- `stable var` backing store for devices and nextDeviceId

### Modify
- Convert `devices` map to use a stable backing array `stableDevices : [(Nat, Device)]` with pre/postupgrade hooks
- Convert `nextDeviceId` to `stable var nextDeviceId`
- Add `preupgrade` system function that saves map to stable array
- Add `postupgrade` system function that restores map from stable array

### Remove
- Nothing removed from user-facing functionality

## Implementation Plan
1. Add `stable var stableDevices : [(Nat, Device)] = []` and `stable var nextDeviceId : Nat = 1`
2. Change `let devices = Map.empty...` to `let devices = Map.empty...` (keep as mutable map for runtime use)
3. Add `system func preupgrade()` that copies map entries to stableDevices
4. Add `system func postupgrade()` that reloads map from stableDevices and clears stableDevices
5. Remove the `var nextDeviceId = 1` declaration since stable var replaces it
