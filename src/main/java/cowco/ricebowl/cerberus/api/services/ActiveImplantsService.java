package cowco.ricebowl.cerberus.api.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cowco.ricebowl.cerberus.api.representation.ActiveImplantDTO;
import cowco.ricebowl.cerberus.api.representation.BeaconDTO;
import cowco.ricebowl.cerberus.db.ActiveImplantEntity;
import cowco.ricebowl.cerberus.db.ActiveImplantsRepository;

@Service
public class ActiveImplantsService {
    @Autowired
    private ActiveImplantsRepository activeImplantsRepository;
    
    public boolean pushImplantDetailsToDb(BeaconDTO beacon) {
        boolean success = false;
        if(beacon.isValid()) {
            // TODO fill this out - create new if not existing, update if existing, return true/false for success
            ActiveImplantEntity implant = activeImplantsRepository.findImplantByImplantId(beacon.getImplantId());
            
            // TODO Later down the line, we'll want to take more of a "merging" approach
            // so that if, say, beacon 1 contains the implant's ipv4 but beacon 2 doesn't, then 
            // the DB will keep the existing ipv4 address (ie. empty fields in the beacon get ignored)
            if(implant != null) {
                implant.updateFromBeacon(beacon);
            } else {
                implant = new ActiveImplantEntity(beacon);
            }
            activeImplantsRepository.save(implant);
            success = true;
        }
        return success;
    }
    
    public List<ActiveImplantDTO> allImplants() {
        List<ActiveImplantDTO> implants = new ArrayList<>();
        List<ActiveImplantEntity> entities = activeImplantsRepository.findAll();
        entities.forEach(entity -> implants.add(new ActiveImplantDTO(entity)));
        return implants;
    }
}
