package com.api.daily.controller;

import com.api.daily.model.Mision;
import com.api.daily.service.MisionDiariaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/misiones-diarias")
public class MisionDiariaController {
    
    @Autowired
    private MisionDiariaService misionDiariaService;
    
    /**
     * Obtiene las 3 misiones diarias del día actual
     * Todos los usuarios ven las mismas misiones para el mismo día
     * @return Lista de 3 misiones diarias
     */
    @GetMapping
    public ResponseEntity<List<Mision>> getMisionesDiarias() {
        List<Mision> misionesDiarias = misionDiariaService.getMisionesDiarias();
        return ResponseEntity.ok(misionesDiarias);
    }
    
    /**
     * Verifica si una misión específica es una misión diaria de hoy
     * @param idMision ID de la misión a verificar
     * @return true si es misión diaria, false en caso contrario
     */
    @GetMapping("/verificar/{idMision}")
    public ResponseEntity<Boolean> verificarMisionDiaria(@PathVariable Long idMision) {
        if (idMision == null || idMision <= 0) {
            return ResponseEntity.badRequest().build();
        }
        
        boolean esDiaria = misionDiariaService.esMisionDiaria(idMision);
        return ResponseEntity.ok(esDiaria);
    }
}