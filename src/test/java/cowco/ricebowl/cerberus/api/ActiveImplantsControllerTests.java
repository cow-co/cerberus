package cowco.ricebowl.cerberus.api;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import cowco.ricebowl.cerberus.db.ActiveImplantsRepository;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@SpringBootTest
public class ActiveImplantsControllerTests {
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private ActiveImplantsRepository activeImplantsRepository;

    @Test
    public void testReturnsEmptyList() throws Exception {
        mockMvc.perform(get("/api/active-implants")).andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }
}
