package com.api.daily.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "misiones_hechas")
public class MisionHecha {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_key")
    private Long idKey;
    
    private LocalDateTime fecha = LocalDateTime.now();
    private String fotoMision;
    private Long idUsuario;
    private Long idMision;
    
    // Constructores
    public MisionHecha() {}
    
    public MisionHecha(Long idUsuario, Long idMision) {
        this.idUsuario = idUsuario;
        this.idMision = idMision;
    }
    
    public MisionHecha(Long idUsuario, Long idMision, String fotoMision) {
        this.idUsuario = idUsuario;
        this.idMision = idMision;
        this.fotoMision = fotoMision;
    }
    
    // Getters y Setters
    public Long getIdKey() { return idKey; }
    public void setIdKey(Long idKey) { this.idKey = idKey; }
    
    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
    
    public String getFotoMision() { return fotoMision; }
    public void setFotoMision(String fotoMision) { this.fotoMision = fotoMision; }
    
    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }
    
    public Long getIdMision() { return idMision; }
    public void setIdMision(Long idMision) { this.idMision = idMision; }
}