package cowco.ricebowl.cerberus.api.representation;

// Representation of the beacon object which is sent from an implant
public class BeaconDTO {
	private String implantId;
	private String ip;
	private String os;
	
	public BeaconDTO(String implantId, String ip, String os) {
		this.implantId = implantId;
		this.ip = ip;
		this.os = os;
	}
	
	public String getImplantId() {
		return this.implantId;
	}
	
	public String getIp() {
		return this.ip;
	}
	
	public String getOs() {
		return this.os;
	}
	
	@Override
	public String toString() {
		return String.format("{implantId: %s, ip: %s, os: %s}", implantId, ip, os);
	}
}
