package com.api.daily.repository;

import com.api.daily.model.MisionHecha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MisionHechaRepository extends JpaRepository<MisionHecha, Long> {
    List<MisionHecha> findByIdUsuario(Long idUsuario);
    List<MisionHecha> findByIdMision(Long idMision);
    boolean existsByIdUsuarioAndIdMision(Long idUsuario, Long idMision);
}