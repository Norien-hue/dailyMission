package com.api.daily.service;

import com.api.daily.model.Usuario;
import com.api.daily.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }
    
    public Optional<Usuario> getUsuarioById(Long id) {
        return usuarioRepository.findById(id);
    }
    
    public Optional<Usuario> getUsuarioByName(String name) {
        return usuarioRepository.findByName(name);
    }
    
    public Usuario createUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
    
    public Optional<Usuario> updateUsuario(Long id, Usuario usuarioDetails) {
        return usuarioRepository.findById(id).map(usuario -> {
            if (usuarioDetails.getName() != null) {
                usuario.setName(usuarioDetails.getName());
            }
            if (usuarioDetails.getPasswd() != null) {
                usuario.setPasswd(usuarioDetails.getPasswd());
            }
            if (usuarioDetails.getExp() != null) {
                usuario.setExp(usuarioDetails.getExp());
            }
            if (usuarioDetails.getFoto() != null) {
                usuario.setFoto(usuarioDetails.getFoto());
            }
            return usuarioRepository.save(usuario);
        });
    }
    
    public boolean deleteUsuario(Long id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    public Optional<Usuario> addExpToUsuario(Long id, Integer exp) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.addExp(exp);
            return usuarioRepository.save(usuario);
        });
    }
    
    public boolean existsByName(String name) {
        return usuarioRepository.existsByName(name);
    }
}