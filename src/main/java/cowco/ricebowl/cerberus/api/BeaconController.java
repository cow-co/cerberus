package cowco.ricebowl.cerberus.api;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import cowco.ricebowl.cerberus.api.representation.BeaconDTO;
import cowco.ricebowl.cerberus.api.representation.TasksListDTO;
import cowco.ricebowl.cerberus.db.ActiveImplant;
import cowco.ricebowl.cerberus.db.ActiveImplantsRepository;

@RestController
public class BeaconController {
	private final Logger LOGGER = LogManager.getLogger(getClass());
	
	@Autowired
	private ActiveImplantsRepository activeImplantsRepository;
	
	@PostMapping(path="/api/beacon", consumes="application/json", produces="application/json")
	public TasksListDTO beacon(@RequestBody BeaconDTO beaconDto) {
		LOGGER.debug("Received beacon " + beaconDto.toString());
		ActiveImplant existingImplant = activeImplantsRepository.findImplantByImplantId(beaconDto.getImplantId());
		if (existingImplant == null) {
			existingImplant = new ActiveImplant(beaconDto.getImplantId(), beaconDto.getIp(), beaconDto.getOs(), beaconDto.getOs(), beaconDto.getBeaconIntervalSeconds());
		} else {
			existingImplant.resetMissedBeacons();
		}
		activeImplantsRepository.save(existingImplant);
		
		TasksListDTO tasks = new TasksListDTO();
		tasks.appendTask("Task 1");	// TODO Populate with actual tasks
		return tasks;
	}
}
