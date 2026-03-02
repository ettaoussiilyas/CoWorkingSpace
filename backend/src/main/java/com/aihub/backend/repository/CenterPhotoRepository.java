package com.aihub.backend.repository;

import com.aihub.backend.entity.CenterPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CenterPhotoRepository extends JpaRepository<CenterPhoto, Long> {
    List<CenterPhoto> findByCenterIdOrderByDisplayOrderAsc(Long centerId);
}
