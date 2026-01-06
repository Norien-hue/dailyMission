package com.api.daily.repository;

import com.api.daily.model.Mision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MisionRepository extends JpaRepository<Mision, Long> {
    List<Mision> findByTituloMisionContainingIgnoreCase(String titulo);
}