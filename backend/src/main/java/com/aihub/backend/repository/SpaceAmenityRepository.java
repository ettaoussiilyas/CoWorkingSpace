package com.aihub.backend.repository;

import com.aihub.backend.entity.SpaceAmenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SpaceAmenityRepository extends JpaRepository<SpaceAmenity, Long> {
    List<SpaceAmenity> findBySpaceId(Long spaceId);
}
