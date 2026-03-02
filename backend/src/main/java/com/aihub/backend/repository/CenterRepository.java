package com.aihub.backend.repository;

import com.aihub.backend.entity.Center;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CenterRepository extends JpaRepository<Center, Long> {
    List<Center> findByCityIgnoreCase(String city);
    List<Center> findByIsActiveTrue();
}
