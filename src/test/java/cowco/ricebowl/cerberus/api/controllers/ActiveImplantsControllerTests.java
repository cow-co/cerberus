package cowco.ricebowl.cerberus.api.controllers;

import java.util.Arrays;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import cowco.ricebowl.cerberus.db.ActiveImplantEntity;
import cowco.ricebowl.cerberus.db.ActiveImplantsRepository;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc(addFilters = false)
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

    @Test
    public void testReturnsOneEntry() throws Exception {
        ActiveImplantEntity implant = new ActiveImplantEntity("Implant", "192.168.0.1", "Linux", 300000L);
        Mockito.when(activeImplantsRepository.findAll()).thenReturn(Arrays.asList(implant));
        mockMvc.perform(get("/api/active-implants")).andExpect(status().isOk())
                .andExpect(content().json(
                        "[{\"implantId\":\"Implant\",\"ip\":\"192.168.0.1\",\"os\":\"Linux\",\"beaconIntervalSeconds\":300000}]"));
    }
}
