package cowco.ricebowl.cerberus.db;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

// Provides an interface to the database, for 
// managing the list of active implants
public interface ImplantsRepository extends MongoRepository<ImplantEntity, String> {
    @Query("{implantId: '?0'}")
    ImplantEntity findImplantByImplantId(String implantId);

    public long count();
}
