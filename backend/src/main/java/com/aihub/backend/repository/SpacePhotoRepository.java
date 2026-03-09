package com.aihub.backend.repository;

import com.aihub.backend.entity.SpacePhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SpacePhotoRepository extends JpaRepository<SpacePhoto, Long> {
    List<SpacePhoto> findBySpaceIdOrderByDisplayOrderAsc(Long spaceId);
}
