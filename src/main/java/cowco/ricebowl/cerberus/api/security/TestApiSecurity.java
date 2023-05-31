package cowco.ricebowl.cerberus.api.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@Profile("test")
public class TestApiSecurity {

    // TODO Will need to implement an actual authorizer for non-test scenarios.
    @Bean
    public SecurityFilterChain webAuthZ(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests((authorize) -> authorize.anyRequest().permitAll());
        return http.build();
    }
}
