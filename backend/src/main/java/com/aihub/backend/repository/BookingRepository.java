package com.aihub.backend.repository;

import com.aihub.backend.entity.Booking;
import com.aihub.backend.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT COUNT(b) FROM Booking b " +
           "WHERE b.space.id = :spaceId " +
           "AND b.status NOT IN ('CANCELLED') " +
           "AND b.startDateTime < :end " +
           "AND b.endDateTime > :start")
    long countOverlappingBookings(
            @Param("spaceId") Long spaceId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT b FROM Booking b WHERE YEAR(b.startDateTime) = :year AND MONTH(b.startDateTime) = :month ORDER BY b.startDateTime ASC")
    List<Booking> findByYearAndMonth(@Param("year") int year, @Param("month") int month);
}
