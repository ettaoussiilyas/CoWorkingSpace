package com.aihub.backend.controller;

import com.aihub.backend.dto.ReviewRequest;
import com.aihub.backend.entity.*;
import com.aihub.backend.entity.SpaceType;
import com.aihub.backend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ReviewControllerIntegrationTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private CenterRepository centerRepository;

	@Autowired
	private SpaceRepository spaceRepository;

	@Autowired
	private BookingRepository bookingRepository;

	@Autowired
	private ReviewRepository reviewRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	private User testUser;
	private Booking testBooking;
	private Space testSpace;

	@BeforeEach
	void setUp() {
		reviewRepository.deleteAll();
		bookingRepository.deleteAll();
		spaceRepository.deleteAll();
		centerRepository.deleteAll();
		userRepository.deleteAll();

		Center center = Center.builder()
				.name("Center")
				.city("City")
				.address("Addr")
				.description("desc")
				.openingHours("9-17")
				.isActive(true)
				.build();
		center = centerRepository.save(center);

		Space space = Space.builder()
				.name("Space")
				.type(SpaceType.OPEN_SPACE)
				.capacity(2)
				.pricePerHour(new BigDecimal("15"))
				.center(center)
				.description("A review test space")
				.isActive(true)
				.build();
		testSpace = spaceRepository.save(space);

		User user = User.builder()
				.fullName("Reviewer")
				.email("rev@test.com")
				.password(passwordEncoder.encode("pwd"))
				.role(Role.ROLE_USER)
				.build();
		testUser = userRepository.save(user);

		Booking booking = Booking.builder()
				.user(testUser)
				.space(testSpace)
				.startDateTime(LocalDateTime.now().minusDays(2))
				.endDateTime(LocalDateTime.now().minusDays(2).plusHours(2))
				.totalPrice(new BigDecimal("30"))
				.status(BookingStatus.COMPLETED)
				.build();
		testBooking = bookingRepository.save(booking);
	}

	@Test
	void createReview_and_getReviewsBySpace_shouldWork() throws Exception {
		ReviewRequest request = ReviewRequest.builder()
				.bookingId(testBooking.getId())
				.rating(4)
				.comment("Nice place")
				.build();

		// Create review
		mockMvc.perform(post("/api/reviews")
						.with(user(testUser))
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").exists())
				.andExpect(jsonPath("$.rating").value(4));

		// Get reviews by space
		mockMvc.perform(get("/api/reviews/space/" + testSpace.getId()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].comment").value("Nice place"));
	}
}


