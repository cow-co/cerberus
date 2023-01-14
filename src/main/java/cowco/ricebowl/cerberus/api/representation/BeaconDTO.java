package cowco.ricebowl.cerberus.api.representation;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.SerializationFeature;

// Representation of the beacon object which is sent from an implant
public class BeaconDTO {
	private static final Logger LOGGER = LogManager.getLogger(BeaconDTO.class);
	
	private final String implantId;
	private final String ip;
	private final String os;
	private final Long beaconIntervalSeconds;
	
	public BeaconDTO() {
		this.implantId = "PLACEHOLDER";
		this.ip = "0.0.0.0";
		this.os = "UNKNOWN";
		this.beaconIntervalSeconds = 86400L;
	}
	
	public BeaconDTO(String implantId, String ip, String os, Long beaconIntervalSeconds) {
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
	
	public Long getBeaconIntervalSeconds() {
		return beaconIntervalSeconds;
	}
	
	@Override
	public String toString() {
		try {
			ObjectMapper mapper = new ObjectMapper();
			mapper.configure(SerializationFeature.WRAP_ROOT_VALUE, false);
			ObjectWriter writer = mapper.writer().withDefaultPrettyPrinter();
			return writer.writeValueAsString(this);
		} catch (JsonProcessingException e) {
			LOGGER.error(e.getMessage());
			return "";
		}
	}
}
