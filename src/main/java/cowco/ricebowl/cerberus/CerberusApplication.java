package cowco.ricebowl.cerberus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
public class CerberusApplication {
    public static void main(String[] args) {
        SpringApplication.run(CerberusApplication.class, args);
    }
}
