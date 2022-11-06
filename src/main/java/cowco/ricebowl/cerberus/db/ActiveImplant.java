package cowco.ricebowl.cerberus.db;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

// The database representation of an active implant
// This allows us to keep track of what we have and where
@Document("activeimplants")
public class ActiveImplant {
	@Id
	private final String id;
	
	private final String implantId;	// Different than the MongoDB ID, which may vary if the implant becomes temporarily inactive
	private final String ip;
	private final String os;
	
	public ActiveImplant(String id, String implantId, String ip, String os) {
		super();
		this.id = id;
		this.implantId = implantId;
		this.ip = ip;
		this.os = os;
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
}
