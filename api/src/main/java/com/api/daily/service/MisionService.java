package com.api.daily.service;

import com.api.daily.model.Mision;
import com.api.daily.repository.MisionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MisionService {
    
    @Autowired
    private MisionRepository misionRepository;
    
    public List<Mision> getAllMisiones() {
        return misionRepository.findAll();
    }
    
    public Optional<Mision> getMisionById(Long id) {
        return misionRepository.findById(id);
    }
    
    public List<Mision> searchMisionesByTitulo(String titulo) {
        if (titulo == null || titulo.trim().isEmpty()) {
            return getAllMisiones();
        }
        return misionRepository.findByTituloMisionContainingIgnoreCase(titulo);
    }
    
    public Mision createMision(Mision mision) {
        return misionRepository.save(mision);
    }
    
    public Optional<Mision> updateMision(Long id, Mision misionDetails) {
        return misionRepository.findById(id).map(mision -> {
            if (misionDetails.getTituloMision() != null) {
                mision.setTituloMision(misionDetails.getTituloMision());
            }
            if (misionDetails.getTextoMision() != null) {
                mision.setTextoMision(misionDetails.getTextoMision());
            }
            if (misionDetails.getExperenciaMision() != null) {
                mision.setExperenciaMision(misionDetails.getExperenciaMision());
            }
            return misionRepository.save(mision);
        });
    }
    
    public boolean deleteMision(Long id) {
        if (misionRepository.existsById(id)) {
            misionRepository.deleteById(id);
            return true;
        }
        return false;
    }
}