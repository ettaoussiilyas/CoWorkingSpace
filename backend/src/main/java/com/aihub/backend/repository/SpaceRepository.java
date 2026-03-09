package com.aihub.backend.repository;

import com.aihub.backend.entity.Space;
import com.aihub.backend.entity.SpaceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SpaceRepository extends JpaRepository<Space, Long> {
    List<Space> findByCenterId(Long centerId);
    List<Space> findByType(SpaceType type);
    List<Space> findByIsActiveTrue();
}
