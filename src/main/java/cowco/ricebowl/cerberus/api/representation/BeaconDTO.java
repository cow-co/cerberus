package cowco.ricebowl.cerberus.api.representation;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.validation.Validator;
import org.springframework.validation.annotation.Validated;

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
	private final Long beaconIntervalSeconds;	// TODO Implement configuration for the shortest allowable beacon time?
	
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
	
	// TODO Instead, put validation annotations on the fields?
	public boolean isValid() {
		boolean isIdValid = (implantId != null) && (!implantId.isEmpty());
		boolean isIpValid = (ip != null);	// We're ok with the IP being empty, since maybe we don't have that information
		boolean isOsValid = (os != null);	// As above
		boolean isIntervalValid = (beaconIntervalSeconds > 30);	// XXX Hardcoded to 30s for now - config it later (see TODO item above)
		return isIdValid && isIpValid && isOsValid && isIntervalValid;
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
