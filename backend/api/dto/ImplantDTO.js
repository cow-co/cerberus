class ImplantDTO {
  /**
   *
   * @param {string} implantId Determined by the implant itself; separate from the Database key
   * @param {string} ip
   * @param {string} os Operating system
   * @param {number} beaconIntervalSeconds
   * @param {Date} lastCheckinTime
   * @param {boolean} isActive
   */
  constructor(
    implantId,
    ip,
    os,
    beaconIntervalSeconds,
    lastCheckinTime,
    isActive
  ) {
    this.implantId = implantId;
    this.ip = ip;
    this.os = os;
    this.beaconIntervalSeconds = beaconIntervalSeconds;
    this.lastCheckinTime = lastCheckinTime;
    this.isActive = isActive;
  }
}

module.exports = ImplantDTO;
