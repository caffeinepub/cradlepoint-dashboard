# Cradlepoint Dashboard

## Current State
The app has a working basic login (Admin/Adams2014!), device CRUD stored in stable memory, and a dashboard with device cards. Backend uses the authorization component. No NetCloud API integration exists yet.

## Requested Changes (Diff)

### Add
- Stable storage for four NetCloud API keys: X-CP-API-ID, X-CP-API-KEY, X-ECM-API-ID, X-ECM-API-KEY
- Backend `saveNetCloudKeys` function (authenticated) to persist API keys
- Backend `getNetCloudKeyStatus` function to return whether keys are saved (not the raw keys for security)
- Backend `pollNetCloud` function: HTTP outcall to Cradlepoint NetCloud API `https://www.cradlepointecm.com/api/v2/routers/?format=json&limit=500`, parse JSON response, update existing devices' online status, and return a sync result summary
- Backend `getLastSyncTime` query function returning the last successful poll timestamp
- Frontend: NetCloud Settings dialog (accessible from dashboard header) with four key input fields, save button
- Frontend: "Refresh from NetCloud" button on the Active Devices tab
- Frontend: Last sync time display near the refresh button
- Frontend: Loading spinner state during poll
- Frontend: Error message display if poll fails

### Modify
- Backend main.mo: add stable vars for API keys and last sync time, add polling logic using http-outcalls
- Dashboard.tsx: add Refresh button, last sync time, loading/error states for NetCloud sync
- Header or Dashboard: add NetCloud Settings gear icon/button

### Remove
- Nothing removed

## Implementation Plan
1. Select http-outcalls component
2. Regenerate backend with new stable vars (netCloudCpApiId, netCloudCpApiKey, netCloudEcmApiId, netCloudEcmApiKey, lastSyncTime), saveNetCloudKeys, getNetCloudKeyStatus, pollNetCloud (HTTP outcall + JSON parse + device status update), getLastSyncTime
3. Frontend: NetCloudSettingsDialog component with 4 key fields
4. Frontend: NetCloudSyncBar component showing last sync time, Refresh button, spinner, error
5. Wire into Dashboard page and Header
