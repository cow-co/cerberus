package cowco.ricebowl.cerberus.api.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class ApiSecurity {
    // TODO Will need to actually make auth checks
    @Bean
    public SecurityFilterChain webAuthZ(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests((authorize) -> authorize.anyRequest().permitAll()).csrf((csrf) -> csrf.disable());
        return http.build();
    }
}
