package cowco.ricebowl.cerberus.api.services;

import java.util.ArrayList;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;

import cowco.ricebowl.cerberus.api.representation.ImplantDTO;
import cowco.ricebowl.cerberus.api.representation.BeaconDTO;
import cowco.ricebowl.cerberus.db.ImplantEntity;
import cowco.ricebowl.cerberus.db.ImplantsRepository;

@Service
public class ImplantsService {
    private static final Logger LOGGER = LogManager.getLogger(ImplantsService.class);

    @Autowired
    private ImplantsRepository activeImplantsRepository;

    public boolean pushImplantDetailsToDb(BeaconDTO beacon) {
        LOGGER.info("Pushing implant deets to DB");
        boolean success = false;
        try {
            if (beacon.isValid()) {
                // true/false for success
                ImplantEntity implant = activeImplantsRepository.findImplantByImplantId(beacon.getImplantId());

                // TODO Later down the line, we'll want to take more of a "merging" approach
                // so that if, say, beacon 1 contains the implant's ipv4 but beacon 2 doesn't,
                // then the DB will keep the existing ipv4 address (ie. empty fields in the
                // beacon get ignored)
                if (implant != null) {
                    implant.updateFromBeacon(beacon);
                } else {
                    implant = new ImplantEntity(beacon);
                }
                ImplantEntity saved = activeImplantsRepository.save(implant);
                if (saved == null) {
                    throw new NullPointerException(
                            "Repository returned null entity on save! This can happen if the database connection does not exist.");
                }
                success = true;
                LOGGER.info(saved.getId());
            }
        } catch (IllegalArgumentException | OptimisticLockingFailureException | NullPointerException ex) {
            LOGGER.error(ex.getMessage());
        }

        return success;
    }

    public List<ImplantDTO> allImplants(boolean includeInactive) {
        List<ImplantDTO> implants = new ArrayList<>();
        List<ImplantEntity> entities = activeImplantsRepository.findAll();
        entities.forEach(entity -> {
            if (entity.isActive() || includeInactive) {
                implants.add(new ImplantDTO(entity));
            }
        });
        return implants;
    }
}
