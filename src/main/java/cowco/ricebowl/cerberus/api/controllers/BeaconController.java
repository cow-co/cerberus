package cowco.ricebowl.cerberus.api.controllers;

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
import cowco.ricebowl.cerberus.api.services.ImplantsService;

@RestController
public class BeaconController {
    private final Logger LOGGER = LogManager.getLogger(getClass());

    @Autowired
    private ImplantsService activeImplantService;

    @PostMapping(path = "/api/beacon", consumes = "application/json", produces = "application/json")
    public ResponseEntity<TasksListDTO> beacon(@RequestBody BeaconDTO beaconDto) {
        LOGGER.debug("Received beacon " + beaconDto.toString());
        ResponseEntity<TasksListDTO> response = new ResponseEntity<TasksListDTO>(HttpStatus.BAD_REQUEST);

        boolean added = activeImplantService.pushImplantDetailsToDb(beaconDto);
        // TODO retrieve tasks for implant from TasksService
        if (added) {
            TasksListDTO tasks = new TasksListDTO();
            tasks.appendTask("Task 1");
            response = ResponseEntity.ok(tasks);
        }

        return response;
    }
}
