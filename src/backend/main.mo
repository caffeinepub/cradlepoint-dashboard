import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import Principal "mo:core/Principal";



actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();

  // Application-Specific Types
  type CradlepointModel = {
    #ibr700C4D;
    #ibr600C150M;
  };

  type Device = {
    id : Nat;
    jobName : Text;
    ipAddress : Text;
    dateDeployed : Int;
    dateExpiration : Int;
    notes : Text;
    deviceAddress : Text;
    customer : Text;
    isActive : Bool;
    unitAmount : Nat;
    unitInfo : [UnitInfo];
    controlsType : ControlsType;
    offline : Bool;
    unlicensed : Bool;
    needsAttention : Bool;
    anyDeskAddress : ?Text;
    cradlepointModel : ?CradlepointModel;
    simCardNumber : ?Text;
    lastModified : Int;
  };

  type DeviceCounts = {
    active : Nat;
    expired : Nat;
    niagara : Nat;
    reliable : Nat;
    stock : Nat;
    wattmaster : Nat;
  };

  type ControlsType = {
    #niagara;
    #reliable;
    #stock;
    #wattmaster;
  };

  type UnitInfo = {
    unitName : Text;
    portNumber : Text;
  };

  public type UserProfile = {
    name : Text;
    username : Text;
  };

  // -------------------------------------------------------
  // STABLE STORAGE — survives every canister upgrade/redeploy
  // -------------------------------------------------------
  var stableDevices : [(Nat, Device)] = [];
  var nextDeviceId : Nat = 1;

  // Runtime map — loaded from stable storage on startup
  let devices = Map.empty<Nat, Device>();

  // Restore devices from stable storage on canister start
  for ((k, v) in stableDevices.vals()) {
    devices.add(k, v);
    if (k >= nextDeviceId) { nextDeviceId := k + 1 };
  };

  // Persist runtime map to stable storage before every upgrade
  system func preupgrade() {
    stableDevices := devices.entries().toArray();
  };

  // Clear the temporary stable array after upgrade completes
  system func postupgrade() {
    stableDevices := [];
  };

  // User profiles storage
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Hardcoded admin credentials
  let adminUsername = "Admin";
  let adminPassword = "Adams2014!";

  // Access Control Functions (required by instructions)
  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Basic authentication validation
  private func authorizeUser(username : Text, password : Text) {
    if (username != adminUsername or password != adminPassword) {
      Runtime.trap("Invalid credentials");
    };
  };

  // CRUD Operations - All require authentication
  public shared ({ caller }) func addDevice(
    username : Text,
    password : Text,
    jobName : Text,
    ipAddress : Text,
    dateDeployed : Int,
    dateExpiration : ?Int,
    notes : Text,
    deviceAddress : Text,
    customer : Text,
    isActive : Bool,
    unitAmount : Nat,
    unitInfo : [UnitInfo],
    controlsType : ControlsType,
    offline : Bool,
    unlicensed : Bool,
    needsAttention : Bool,
    anyDeskAddress : ?Text,
    cradlepointModel : ?CradlepointModel,
    simCardNumber : ?Text,
  ) : async Nat {
    authorizeUser(username, password);

    // Validate IP address uniqueness
    for ((id, device) in devices.entries()) {
      if (device.ipAddress == ipAddress and device.jobName != jobName) {
        Runtime.trap("This IP address is already used by another job");
      };
    };

    let device : Device = {
      id = nextDeviceId;
      jobName;
      ipAddress;
      dateDeployed;
      dateExpiration = switch (dateExpiration) {
        case (?d) { d };
        case (null) { dateDeployed + 365 * 24 * 60 * 60 * 1_000_000_000 };
      };
      notes;
      deviceAddress;
      customer;
      isActive;
      unitAmount;
      unitInfo;
      controlsType;
      offline;
      unlicensed;
      needsAttention;
      anyDeskAddress;
      cradlepointModel;
      simCardNumber;
      lastModified = Time.now();
    };

    devices.add(nextDeviceId, device);
    nextDeviceId += 1;
    device.id;
  };

  public shared ({ caller }) func updateDevice(
    username : Text,
    password : Text,
    id : Nat,
    jobName : Text,
    ipAddress : Text,
    dateDeployed : Int,
    dateExpiration : ?Int,
    notes : Text,
    deviceAddress : Text,
    customer : Text,
    isActive : Bool,
    unitAmount : Nat,
    unitInfo : [UnitInfo],
    controlsType : ControlsType,
    offline : Bool,
    unlicensed : Bool,
    needsAttention : Bool,
    anyDeskAddress : ?Text,
    cradlepointModel : ?CradlepointModel,
    simCardNumber : ?Text,
  ) : async () {
    authorizeUser(username, password);

    switch (devices.get(id)) {
      case (?_existingDevice) {
        // Validate IP address uniqueness (excluding current device)
        for ((deviceId, device) in devices.entries()) {
          if (deviceId != id and device.ipAddress == ipAddress and device.jobName != jobName) {
            Runtime.trap("This IP address is already used by another job");
          };
        };

        let updatedDevice : Device = {
          id;
          jobName;
          ipAddress;
          dateDeployed;
          dateExpiration = switch (dateExpiration) {
            case (?d) { d };
            case (null) { dateDeployed + 365 * 24 * 60 * 60 * 1_000_000_000 };
          };
          notes;
          deviceAddress;
          customer;
          isActive;
          unitAmount;
          unitInfo;
          controlsType;
          offline;
          unlicensed;
          needsAttention;
          anyDeskAddress;
          cradlepointModel;
          simCardNumber;
          lastModified = Time.now();
        };
        devices.add(id, updatedDevice);
      };
      case (null) { Runtime.trap("Device not found") };
    };
  };

  public shared ({ caller }) func toggleDeviceStatus(username : Text, password : Text, id : Nat) : async () {
    authorizeUser(username, password);

    switch (devices.get(id)) {
      case (?device) {
        let updatedDevice : Device = { device with isActive = not device.isActive; lastModified = Time.now() };
        devices.add(id, updatedDevice);
      };
      case (null) { Runtime.trap("Device not found") };
    };
  };

  public shared ({ caller }) func deleteDevice(username : Text, password : Text, id : Nat) : async () {
    authorizeUser(username, password);

    if (not devices.containsKey(id)) {
      Runtime.trap("Device not found");
    };
    devices.remove(id);
  };

  // Read Operations - All require authentication
  public query func getDevice(username : Text, password : Text, id : Nat) : async ?Device {
    authorizeUser(username, password);
    devices.get(id);
  };

  public query func getAllDevices(username : Text, password : Text) : async [Device] {
    authorizeUser(username, password);
    devices.values().toArray();
  };

  public query func getActiveDevices(username : Text, password : Text) : async [Device] {
    authorizeUser(username, password);
    let activeDevices = List.empty<Device>();
    for (device in devices.values()) {
      if (device.isActive) {
        activeDevices.add(device);
      };
    };
    activeDevices.toArray();
  };

  public query func getInactiveDevices(username : Text, password : Text) : async [Device] {
    authorizeUser(username, password);
    let inactiveDevices = List.empty<Device>();
    for (device in devices.values()) {
      if (not device.isActive) {
        inactiveDevices.add(device);
      };
    };
    inactiveDevices.toArray();
  };

  public query func getDevicesByType(username : Text, password : Text, deviceType : ControlsType) : async [Device] {
    authorizeUser(username, password);
    let matchingDevices = List.empty<Device>();
    for (device in devices.values()) {
      switch (deviceType) {
        case (#niagara) { if (device.controlsType == #niagara) { matchingDevices.add(device) } };
        case (#reliable) {
          if (device.controlsType == #reliable) {
            matchingDevices.add(device);
          };
        };
        case (#stock) {
          if (device.controlsType == #stock) { matchingDevices.add(device) };
        };
        case (#wattmaster) {
          if (device.controlsType == #wattmaster) {
            matchingDevices.add(device);
          };
        };
      };
    };
    matchingDevices.toArray();
  };

  public query func getDeviceCounts(username : Text, password : Text) : async DeviceCounts {
    authorizeUser(username, password);
    var active = 0;
    var expired = 0;
    var niagara = 0;
    var reliable = 0;
    var stock = 0;
    var wattmaster = 0;

    for (device in devices.values()) {
      if (device.isActive) { active += 1 } else { expired += 1 };

      switch (device.controlsType) {
        case (#niagara) { niagara += 1 };
        case (#reliable) { reliable += 1 };
        case (#stock) { stock += 1 };
        case (#wattmaster) { wattmaster += 1 };
      };
    };

    { active; expired; niagara; reliable; stock; wattmaster };
  };

  public query func getCurrentTime(username : Text, password : Text) : async Int {
    authorizeUser(username, password);
    Time.now();
  };

  public query func validateIpAddress(username : Text, password : Text, ipAddress : Text, jobName : Text, excludeDeviceId : ?Nat) : async Bool {
    authorizeUser(username, password);
    for ((id, device) in devices.entries()) {
      let isExcluded = switch (excludeDeviceId) {
        case (null) { false };
        case (?eid) { eid == id };
      };
      if (
        not isExcluded and
        device.ipAddress == ipAddress and
        device.jobName != jobName
      ) {
        return false;
      };
    };
    true;
  };

  public query func getExpiredDevices(username : Text, password : Text) : async [Device] {
    authorizeUser(username, password);
    let expiredDevices = List.empty<Device>();
    let currentTime = Time.now();

    for (device in devices.values()) {
      if (device.dateExpiration < currentTime) {
        expiredDevices.add(device);
      };
    };
    expiredDevices.toArray();
  };

  // Public authentication endpoint for login validation
  public shared ({ caller }) func authenticate(username : Text, password : Text) : async Bool {
    if (username == adminUsername and password == adminPassword) {
      return true;
    };
    false;
  };
};
