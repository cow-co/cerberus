package cowco.ricebowl.cerberus.api.representation;

// Representation of the beacon object which is sent from an implant
public class BeaconDTO {
	private final String implantId;
	private final String ip;
	private final String os;
	private final long beaconIntervalSeconds;
	
	public BeaconDTO(String implantId, String ip, String os, long beaconIntervalSeconds) {
		this.implantId = implantId;
		this.ip = ip;
		this.os = os;
		this.beaconIntervalSeconds = beaconIntervalSeconds;
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
	
	@Override
	public String toString() {
		return String.format("{implantId: %s, ip: %s, os: %s, beaconIntervalSeconds: %d}", implantId, ip, os, beaconIntervalSeconds);
	}
}
