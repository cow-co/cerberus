package cowco.ricebowl.cerberus.api.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import cowco.ricebowl.cerberus.api.representation.ImplantDTO;
import cowco.ricebowl.cerberus.api.services.ImplantsService;

@RestController
public class ImplantsController {
    @Autowired
    private ImplantsService implantsService;

    // TODO This needs authz of course
    @GetMapping("/api/implants")
    public ResponseEntity<List<ImplantDTO>> getImplants() {
        return ResponseEntity.ok(implantsService.allImplants());
    }
}
