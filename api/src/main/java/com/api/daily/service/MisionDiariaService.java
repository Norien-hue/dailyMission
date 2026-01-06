package com.api.daily.service;

import com.api.daily.model.Mision;
import com.api.daily.repository.MisionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class MisionDiariaService {
    
    @Autowired
    private MisionRepository misionRepository;
    
    /**
     * Obtiene las 3 misiones diarias basadas en la fecha actual como semilla
     * @return Lista de 3 misiones diarias
     */
    public List<Mision> getMisionesDiarias() {
        // Obtener todas las misiones excepto la ID 1
        List<Mision> todasLasMisiones = misionRepository.findAll()
                .stream()
                .filter(m -> m.getIdMision() != 1L)
                .collect(Collectors.toList());
        
        // Si hay 3 o menos misiones, devolver todas
        if (todasLasMisiones.size() <= 3) {
            return todasLasMisiones;
        }
        
        // Obtener la fecha actual como semilla
        LocalDate hoy = LocalDate.now();
        long semilla = hoy.getYear() * 10000L + hoy.getMonthValue() * 100L + hoy.getDayOfMonth();
        
        // Crear Random con la semilla del día
        Random random = new Random(semilla);
        
        // Seleccionar 3 misiones aleatorias pero consistentes para el día
        List<Mision> misionesDiarias = new ArrayList<>();
        List<Mision> misionesDisponibles = new ArrayList<>(todasLasMisiones);
        
        for (int i = 0; i < 3 && !misionesDisponibles.isEmpty(); i++) {
            int indiceAleatorio = random.nextInt(misionesDisponibles.size());
            misionesDiarias.add(misionesDisponibles.remove(indiceAleatorio));
        }
        
        return misionesDiarias;
    }
    
    /**
     * Verifica si una misión específica está en las misiones diarias de hoy
     * @param idMision ID de la misión a verificar
     * @return true si la misión es una misión diaria de hoy
     */
    public boolean esMisionDiaria(Long idMision) {
        List<Mision> misionesDiarias = getMisionesDiarias();
        return misionesDiarias.stream()
                .anyMatch(m -> m.getIdMision().equals(idMision));
    }
}