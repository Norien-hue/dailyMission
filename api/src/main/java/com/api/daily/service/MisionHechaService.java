package com.api.daily.service;

import com.api.daily.model.Mision;
import com.api.daily.model.MisionHecha;
import com.api.daily.model.Usuario;
import com.api.daily.repository.MisionHechaRepository;
import com.api.daily.repository.MisionRepository;
import com.api.daily.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MisionHechaService {
    
    @Autowired
    private MisionHechaRepository misionHechaRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private MisionRepository misionRepository;
    
    @Autowired
    private UsuarioService usuarioService;
    
    public List<MisionHecha> getAllMisionesHechas() {
        return misionHechaRepository.findAll();
    }
    
    public Optional<MisionHecha> getMisionHechaById(Long id) {
        return misionHechaRepository.findById(id);
    }
    
    public List<MisionHecha> getMisionesHechasByUsuario(Long idUsuario) {
        return misionHechaRepository.findByIdUsuario(idUsuario);
    }
    
    public List<MisionHecha> getMisionesHechasByMision(Long idMision) {
        return misionHechaRepository.findByIdMision(idMision);
    }
    
    public Optional<MisionHecha> completarMision(Long idUsuario, Long idMision, String fotoMision) {
        // Verificar que el usuario y la misión existen
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(idUsuario);
        Optional<Mision> misionOpt = misionRepository.findById(idMision);
        
        if (usuarioOpt.isEmpty() || misionOpt.isEmpty()) {
            return Optional.empty();
        }
        
        // Verificar que no haya completado ya esta misión
        if (misionHechaRepository.existsByIdUsuarioAndIdMision(idUsuario, idMision)) {
            return Optional.empty();
        }
        
        // Crear la misión hecha
        MisionHecha misionHecha = new MisionHecha(idUsuario, idMision);
        misionHecha.setFotoMision(fotoMision);
        
        // Añadir experiencia al usuario
        usuarioService.addExpToUsuario(idUsuario, misionOpt.get().getExperenciaMision());
        
        return Optional.of(misionHechaRepository.save(misionHecha));
    }

    public List<Mision> getMisionesCompletadasByUsuario(Long idUsuario) {
    List<MisionHecha> misionesHechas = misionHechaRepository.findByIdUsuario(idUsuario);
    return misionesHechas.stream()
            .map(MisionHecha::getIdMision)
            .map(misionRepository::findById)
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toList());
    }
    
    public boolean deleteMisionHecha(Long id) {
        if (misionHechaRepository.existsById(id)) {
            misionHechaRepository.deleteById(id);
            return true;
        }
        return false;
    }
}