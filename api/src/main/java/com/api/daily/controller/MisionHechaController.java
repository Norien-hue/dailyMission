package com.api.daily.controller;

import com.api.daily.model.Mision;
import com.api.daily.model.MisionHecha;
import com.api.daily.service.MisionHechaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/misiones-hechas")
public class MisionHechaController {
    
    @Autowired
    private MisionHechaService misionHechaService;
    
    @GetMapping
    public ResponseEntity<List<MisionHecha>> getAllMisionesHechas() {
        List<MisionHecha> misionesHechas = misionHechaService.getAllMisionesHechas();
        return ResponseEntity.ok(misionesHechas);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<MisionHecha> getMisionHechaById(@PathVariable Long id) {
        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<MisionHecha> misionHecha = misionHechaService.getMisionHechaById(id);
        return misionHecha.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<MisionHecha>> getMisionesHechasByUsuario(@PathVariable Long idUsuario) {
        if (idUsuario == null || idUsuario <= 0) {
            return ResponseEntity.badRequest().build();
        }
        
        List<MisionHecha> misionesHechas = misionHechaService.getMisionesHechasByUsuario(idUsuario);
        return ResponseEntity.ok(misionesHechas);
    }
    
    @GetMapping("/mision/{idMision}")
    public ResponseEntity<List<MisionHecha>> getMisionesHechasByMision(@PathVariable Long idMision) {
        if (idMision == null || idMision <= 0) {
            return ResponseEntity.badRequest().build();
        }
        
        List<MisionHecha> misionesHechas = misionHechaService.getMisionesHechasByMision(idMision);
        return ResponseEntity.ok(misionesHechas);
    }
    
    @PostMapping("/completar")
    public ResponseEntity<MisionHecha> completarMision(
            @RequestParam Long idUsuario,
            @RequestParam Long idMision,
            @RequestParam(required = false) String fotoMision) {
        
        if (idUsuario == null || idUsuario <= 0 || idMision == null || idMision <= 0) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<MisionHecha> misionHecha = misionHechaService.completarMision(
            idUsuario, idMision, fotoMision);
        
        if (misionHecha.isPresent()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(misionHecha.get());
        }
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMisionHecha(@PathVariable Long id) {
        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().build();
        }
        
        boolean eliminada = misionHechaService.deleteMisionHecha(id);
        if (eliminada) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/usuario/{idUsuario}/detalles")
    public ResponseEntity<List<Mision>> getMisionesCompletadasConDetalles(@PathVariable Long idUsuario) {
    if (idUsuario == null || idUsuario <= 0) {
        return ResponseEntity.badRequest().build();
    }
    
    List<Mision> misiones = misionHechaService.getMisionesCompletadasByUsuario(idUsuario);
    return ResponseEntity.ok(misiones);
    }
}