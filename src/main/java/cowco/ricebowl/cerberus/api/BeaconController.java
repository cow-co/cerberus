package cowco.ricebowl.cerberus.api;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import cowco.ricebowl.cerberus.api.representation.BeaconDTO;

@RestController
public class BeaconController {
	private final Logger LOGGER = LogManager.getLogger(getClass());
	
	@PostMapping("/api/beacon")
	public void beacon(BeaconDTO beaconDto) {
		LOGGER.debug("Received beacon " + beaconDto.toString());
	}
}
