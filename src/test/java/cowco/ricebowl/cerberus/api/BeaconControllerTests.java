package cowco.ricebowl.cerberus.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import cowco.ricebowl.cerberus.api.representation.BeaconDTO;
import cowco.ricebowl.cerberus.db.ActiveImplantsRepository;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@SpringBootTest
public class BeaconControllerTests {
	@Autowired
	private MockMvc mockMvc;
	
	@MockBean
	private ActiveImplantsRepository activeImplantsRepository;
	
	@Test
	public void testReturnsTasksList() throws Exception {
		BeaconDTO beacon = new BeaconDTO("Implant", "192.168.0.1", "Linux", 300000L);
		System.out.println(beacon.toString());
		mockMvc.perform(post("/api/beacon").content(beacon.toString()).contentType(MediaType.APPLICATION_JSON)).andExpect(status().isOk()).andExpect(content().json("{\"tasks\": [\"Task 1\"]}"));
	}
	
	// TODO Invalid beacon (missing fields) test
	// TODO Missing beacon content (calling the endpoint without a request body)
	// TODO Beacon with existing entry for implant
	// TODO Beacon with no existing entry for implant (test that implant is added to the DB)
}
