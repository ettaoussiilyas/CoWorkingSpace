package com.aihub.backend.repository;

import com.aihub.backend.entity.AvailabilityBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AvailabilityBlockRepository extends JpaRepository<AvailabilityBlock, Long> {
    @Query("SELECT b FROM AvailabilityBlock b WHERE b.space.id = :spaceId " +
           "AND ((b.startDateTime < :end AND b.endDateTime > :start))")
    List<AvailabilityBlock> findOverlappingBlocks(@Param("spaceId") Long spaceId, 
                                                 @Param("start") LocalDateTime start, 
                                                 @Param("end") LocalDateTime end);
}
