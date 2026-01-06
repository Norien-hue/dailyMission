package com.api.daily.controller;

import com.api.daily.model.Usuario;
import com.api.daily.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    
    @Autowired
    private UsuarioService usuarioService;
    
    @GetMapping
    public ResponseEntity<List<Usuario>> getAllUsuarios() {
        List<Usuario> usuarios = usuarioService.getAllUsuarios();
        return ResponseEntity.ok(usuarios);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable Long id) {
        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<Usuario> usuario = usuarioService.getUsuarioById(id);
        return usuario.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/buscar/{name}")
    public ResponseEntity<Usuario> getUsuarioByName(@PathVariable String name) {
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<Usuario> usuario = usuarioService.getUsuarioByName(name);
        return usuario.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Usuario> createUsuario(@RequestBody Usuario usuario) {
        if (usuario == null || usuario.getName() == null || 
            usuario.getName().trim().isEmpty() || usuario.getPasswd() == null ||
            usuario.getPasswd().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        if (usuarioService.existsByName(usuario.getName())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        
        Usuario nuevoUsuario = usuarioService.createUsuario(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> updateUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        if (id == null || id <= 0 || usuario == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<Usuario> usuarioActualizado = usuarioService.updateUsuario(id, usuario);
        return usuarioActualizado.map(ResponseEntity::ok)
                               .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable Long id) {
        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().build();
        }
        
        boolean eliminado = usuarioService.deleteUsuario(id);
        if (eliminado) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}