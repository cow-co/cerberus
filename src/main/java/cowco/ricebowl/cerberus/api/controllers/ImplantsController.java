package cowco.ricebowl.cerberus.api.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import cowco.ricebowl.cerberus.api.representation.ImplantDTO;
import cowco.ricebowl.cerberus.api.services.ImplantsService;

@CrossOrigin(origins = { "http://localhost:3000", "http://192.168.0.1:3000", "https://localhost:3000",
        "https://192.168.0.1:3000" }, maxAge = 3600)
@RestController
public class ImplantsController {
    @Autowired
    private ImplantsService implantsService;

    // TODO This needs authz of course
    @GetMapping(value = { "/api/implants", "/api/implants?includeInactive={includeInactive}" })
    public ResponseEntity<List<ImplantDTO>> getImplants(@PathVariable(required = false) boolean includeInactive) {
        return ResponseEntity.ok(implantsService.allImplants(includeInactive));
    }
}
