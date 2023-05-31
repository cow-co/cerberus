package cowco.ricebowl.cerberus.db;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import cowco.ricebowl.cerberus.api.representation.BeaconDTO;

// The database representation of an active implant
// This allows us to keep track of what we have and where
@Document("implants")
public class ImplantEntity {
    @Id
    private String id;

    private String implantId; // Different than the MongoDB ID, which may vary if the implant becomes
                              // temporarily inactive
    private String ip;
    private String os;
    private long beaconIntervalSeconds; // TODO implement logic that makes an implant inactive if it has missed a
                                        // configurable number of beacons
    private long lastCheckinTimeSeconds;
    private boolean isActive;

    public ImplantEntity(BeaconDTO beacon) {
        updateFromBeacon(beacon);
    }

    // TODO Default the last checkin time and active status to now and true
    // respectively?
    public ImplantEntity(String implantId, String ip, String os, long beaconIntervalSeconds,
            long lastCheckinTimeSeconds, boolean isActive) {
        this.implantId = implantId;
        this.ip = ip;
        this.os = os;
        this.beaconIntervalSeconds = beaconIntervalSeconds;
    }

    public String getId() {
        return id;
    }

    public String getImplantId() {
        return implantId;
    }

    public String getIp() {
        return ip;
    }

    public String getOs() {
        return os;
    }

    public long getBeaconIntervalSeconds() {
        return beaconIntervalSeconds;
    }

    public void updateFromBeacon(BeaconDTO beacon) {
        ip = beacon.getIp();
        os = beacon.getOs();
        beaconIntervalSeconds = beacon.getBeaconIntervalSeconds();
    }
}
