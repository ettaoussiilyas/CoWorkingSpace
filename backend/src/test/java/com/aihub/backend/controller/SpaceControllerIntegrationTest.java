package com.aihub.backend.controller;

import com.aihub.backend.dto.SpaceRequest;
import com.aihub.backend.entity.User;
import com.aihub.backend.entity.Role;
import com.aihub.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.aihub.backend.entity.Center;
import com.aihub.backend.entity.SpaceType;
import com.aihub.backend.repository.CenterRepository;
import com.aihub.backend.repository.SpaceRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SpaceControllerIntegrationTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private SpaceRepository spaceRepository;

	@Autowired
	private CenterRepository centerRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	private User adminUser;

	@BeforeEach
	void setUp() {
		spaceRepository.deleteAll();
		centerRepository.deleteAll();
		// Don't delete all users — seed admin already exists.
		// Only delete non-seed users to avoid unique constraint on admin@test.com
		userRepository.findAll().stream()
				.filter(u -> !u.getEmail().equals("admin@test.com"))
				.forEach(userRepository::delete);
	}

	@Test
	void createSpace_and_getByCenter_shouldWork() throws Exception {
		Center center = Center.builder()
				.name("My Center")
				.city("City")
				.address("Addr")
				.description("desc")
				.openingHours("9-17")
				.isActive(true)
				.build();
		center = centerRepository.save(center);

		SpaceRequest request = SpaceRequest.builder()
				.name("New Space")
				.type(SpaceType.OPEN_SPACE)
				.description("Nice new space")
				.capacity(6)
				.pricePerHour(new BigDecimal("20"))
				.centerId(center.getId())
				.build();

		// Reuse the seeded admin user instead of creating a duplicate
		adminUser = userRepository.findByEmail("admin@test.com")
				.orElseGet(() -> userRepository.save(User.builder()
						.fullName("Admin")
						.email("admin@test.com")
						.password(passwordEncoder.encode("adminpwd"))
						.role(Role.ROLE_ADMIN)
						.build()));

		// Create space (authenticated as admin)
		mockMvc.perform(post("/api/spaces")
						.with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(adminUser))
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("New Space"))
				.andExpect(jsonPath("$.centerId").value(center.getId()));

		// Get by center (authenticated as admin)
		mockMvc.perform(get("/api/spaces/center/" + center.getId())
						.with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(adminUser)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].name").value("New Space"));
	}
}


