package cowco.ricebowl.cerberus.api.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import cowco.ricebowl.cerberus.api.representation.ActiveImplantDTO;
import cowco.ricebowl.cerberus.api.services.ActiveImplantsService;

@RestController
public class ActiveImplantsController {
    @Autowired
    private ActiveImplantsService activeImplantsService;

    // TODO This needs authz of course
    @GetMapping("/api/active-implants")
    public ResponseEntity<List<ActiveImplantDTO>> getActiveImplants() {
        return ResponseEntity.ok(activeImplantsService.allImplants());
    }
}
