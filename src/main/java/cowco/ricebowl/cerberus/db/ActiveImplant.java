package cowco.ricebowl.cerberus.db;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

// The database representation of an active implant
// This allows us to keep track of what we have and where
@Document("activeimplants")
public class ActiveImplant {
	@Id
	private String id;
	
	private String implantId;	// Different than the MongoDB ID, which may vary if the implant becomes temporarily inactive
	private String ip;
	private String os;
	private long beaconIntervalSeconds;	// TODO implement logic that makes an implant inactive if it has missed a configurable number of beacons
	private int missedBeacons = 0;
	
	public ActiveImplant(String id, String implantId, String ip, String os, long beaconIntervalSeconds) {
		this.id = id;
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
	
	public int getMissedBeacons() {
		return missedBeacons;
	}
	
	public void incrementMissedBeacons() {
		missedBeacons++;
	}
	
	public void resetMissedBeacons() {
		missedBeacons = 0;
	}
}
