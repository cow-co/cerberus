package cowco.ricebowl.cerberus.api;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
	public ResponseEntity<TasksListDTO> beacon(@RequestBody BeaconDTO beaconDto) {
		LOGGER.debug("Received beacon " + beaconDto.toString());
		ResponseEntity<TasksListDTO> response = new ResponseEntity<TasksListDTO>(HttpStatus.BAD_REQUEST);
		
		if(beaconDto.isValid()) {
			ActiveImplant existingImplant = activeImplantsRepository.findImplantByImplantId(beaconDto.getImplantId());
			if (existingImplant == null) {
				existingImplant = new ActiveImplant(beaconDto.getImplantId(), beaconDto.getIp(), beaconDto.getOs(), beaconDto.getOs(), beaconDto.getBeaconIntervalSeconds());
			} else {
				existingImplant.resetMissedBeacons();
			}
			activeImplantsRepository.save(existingImplant);
			
			TasksListDTO tasks = new TasksListDTO();
			// TODO Design the database structure for the tasks - separate table presumably, but what's the schema?
			// TODO Overall, have a big ol design sesh to hash out the system as a whole; document in a `docs/` dir?
			tasks.appendTask("Task 1");	// TODO Populate with actual tasks
			response = ResponseEntity.ok(tasks);
		} else {
			LOGGER.warn("Received invalid beacon: " + beaconDto.toString());
		}
		
		return response;
	}
}
