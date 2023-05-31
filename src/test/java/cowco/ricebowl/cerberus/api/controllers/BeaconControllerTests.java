package cowco.ricebowl.cerberus.api.controllers;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import cowco.ricebowl.cerberus.api.representation.BeaconDTO;
import cowco.ricebowl.cerberus.db.ActiveImplantEntity;
import cowco.ricebowl.cerberus.db.ActiveImplantsRepository;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc(addFilters = false)
@SpringBootTest
public class BeaconControllerTests {
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private ActiveImplantsRepository activeImplantsRepository;

    @Test
    public void testReturnsTasksList() throws Exception {
        BeaconDTO beacon = new BeaconDTO("Implant", "192.168.0.1", "Linux", 300000L);
        Mockito.when(activeImplantsRepository.save(any())).thenReturn(new ActiveImplantEntity(null, null, null, 0));
        mockMvc.perform(post("/api/beacon").content(beacon.toString()).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()).andExpect(content().json("{\"tasks\": [\"Task 1\"]}"));
    }

    @Test
    public void testReturns200ForEmptyOptionalFieldsIP() throws Exception {
        BeaconDTO beacon = new BeaconDTO("Implant", "", "Linux", 300000L);
        Mockito.when(activeImplantsRepository.save(any())).thenReturn(new ActiveImplantEntity(null, null, null, 0));
        mockMvc.perform(post("/api/beacon").content(beacon.toString()).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    public void testReturns200ForEmptyOptionalFieldsOS() throws Exception {
        BeaconDTO beacon = new BeaconDTO("Implant", "192.168.0.1", "", 300000L);
        Mockito.when(activeImplantsRepository.save(any())).thenReturn(new ActiveImplantEntity(null, null, null, 0));
        mockMvc.perform(post("/api/beacon").content(beacon.toString()).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    public void testReturns400ForMissingMandatoryFieldsIP() throws Exception {
        BeaconDTO beacon = new BeaconDTO("Implant", null, "Linux", 300000L);
        Mockito.when(activeImplantsRepository.save(any())).thenReturn(new ActiveImplantEntity(null, null, null, 0));
        mockMvc.perform(post("/api/beacon").content(beacon.toString()).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testReturns400ForMissingMandatoryOptionalFieldsOS() throws Exception {
        BeaconDTO beacon = new BeaconDTO("Implant", "192.168.0.1", null, 300000L);
        Mockito.when(activeImplantsRepository.save(any())).thenReturn(new ActiveImplantEntity(null, null, null, 0));
        mockMvc.perform(post("/api/beacon").content(beacon.toString()).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testReturns400ForMissingMandatoryFieldsID() throws Exception {
        BeaconDTO beacon = new BeaconDTO(null, "192.168.0.1", "Linux", 300000L);
        Mockito.when(activeImplantsRepository.save(any())).thenReturn(new ActiveImplantEntity(null, null, null, 0));
        mockMvc.perform(post("/api/beacon").content(beacon.toString()).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testReturns400ForMissingMandatoryFieldsInterval() throws Exception {
        BeaconDTO beacon = new BeaconDTO("Implant", "192.168.0.1", "Linux", null);
        Mockito.when(activeImplantsRepository.save(any())).thenReturn(new ActiveImplantEntity(null, null, null, 0));
        mockMvc.perform(post("/api/beacon").content(beacon.toString()).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testReturns400ForEmptyMandatoryFieldsID() throws Exception {
        BeaconDTO beacon = new BeaconDTO("", "192.168.0.1", "Linux", 300000L);
        Mockito.when(activeImplantsRepository.save(any())).thenReturn(new ActiveImplantEntity(null, null, null, 0));
        mockMvc.perform(post("/api/beacon").content(beacon.toString()).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testReturns400ForZeroInterval() throws Exception {
        BeaconDTO beacon = new BeaconDTO("Implant", "192.168.0.1", "Linux", 0L);
        Mockito.when(activeImplantsRepository.save(any())).thenReturn(new ActiveImplantEntity(null, null, null, 0));
        mockMvc.perform(post("/api/beacon").content(beacon.toString()).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }
}
