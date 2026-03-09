package com.aihub.backend.controller;

import com.aihub.backend.dto.BookingRequest;
import com.aihub.backend.entity.Center;
import com.aihub.backend.entity.Space;
import com.aihub.backend.entity.SpaceType;
import com.aihub.backend.entity.User;
import com.aihub.backend.entity.Role;
import com.aihub.backend.repository.BookingRepository;
import com.aihub.backend.repository.CenterRepository;
import com.aihub.backend.repository.SpaceRepository;
import com.aihub.backend.repository.UserRepository;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class BookingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CenterRepository centerRepository;

    @Autowired
    private SpaceRepository spaceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private Space testSpace;

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAll();
        spaceRepository.deleteAll();
        centerRepository.deleteAll();
        userRepository.deleteAll();

        Center center = Center.builder()
                .name("Test Center")
                .city("Test City")
                .address("123 Test St")
                .description("desc")
                .openingHours("9-17")
                .isActive(true)
                .build();
        center = centerRepository.save(center);

        Space space = Space.builder()
                .name("Test Space")
                .type(SpaceType.OPEN_SPACE)
                .capacity(4)
                .pricePerHour(new BigDecimal("10"))
                .center(center)
                .description("A test space")
                .isActive(true)
                .build();
        testSpace = spaceRepository.save(space);

        User user = User.builder()
                .fullName("Test User")
                .email("user@test.com")
                .password(passwordEncoder.encode("password"))
                .role(Role.ROLE_USER)
                .build();
        testUser = userRepository.save(user);
    }

    @Test
    void createBooking_and_getMyBookings_shouldWork() throws Exception {
        BookingRequest request = BookingRequest.builder()
                .spaceId(testSpace.getId())
                .startDateTime(LocalDateTime.now().plusDays(1))
                .endDateTime(LocalDateTime.now().plusDays(1).plusHours(2))
                .build();

        // Create booking
        mockMvc.perform(post("/api/bookings")
                        .with(user(testUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.spaceName").value("Test Space"))
                .andExpect(jsonPath("$.totalPrice").exists());

        // Get my bookings
        mockMvc.perform(get("/api/bookings/my").with(user(testUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].spaceName").value("Test Space"));
    }
}

