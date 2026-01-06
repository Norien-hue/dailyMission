package com.api.daily.controller;

import com.api.daily.model.Mision;
import com.api.daily.service.MisionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/misiones")
public class MisionController {
    
    @Autowired
    private MisionService misionService;
    
    @GetMapping
    public ResponseEntity<List<Mision>> getAllMisiones() {
        List<Mision> misiones = misionService.getAllMisiones();
        return ResponseEntity.ok(misiones);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Mision> getMisionById(@PathVariable Long id) {
        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<Mision> mision = misionService.getMisionById(id);
        return mision.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/buscar")
    public ResponseEntity<List<Mision>> searchMisiones(@RequestParam String titulo) {
        if (titulo == null || titulo.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        List<Mision> misiones = misionService.searchMisionesByTitulo(titulo);
        return ResponseEntity.ok(misiones);
    }
    
    @PostMapping
    public ResponseEntity<Mision> createMision(@RequestBody Mision mision) {
        if (mision == null || mision.getTituloMision() == null || 
            mision.getTituloMision().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        Mision nuevaMision = misionService.createMision(mision);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaMision);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Mision> updateMision(@PathVariable Long id, @RequestBody Mision mision) {
        if (id == null || id <= 0 || mision == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<Mision> misionActualizada = misionService.updateMision(id, mision);
        return misionActualizada.map(ResponseEntity::ok)
                              .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMision(@PathVariable Long id) {
        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().build();
        }
        
        boolean eliminada = misionService.deleteMision(id);
        if (eliminada) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}