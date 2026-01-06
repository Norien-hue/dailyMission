package com.api.daily.model;

import jakarta.persistence.*;

@Entity
@Table(name = "misiones")
public class Mision {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mision")
    private Long idMision;
    
    @Column(name = "experencia_mision")
    private Integer experenciaMision = 0;
    
    @Column(name = "texto_mision", columnDefinition = "TEXT")
    private String textoMision;
    
    @Column(name = "titulo_mision")
    private String tituloMision;
    
    // Constructores
    public Mision() {}
    
    public Mision(String tituloMision, String textoMision, Integer experenciaMision) {
        this.tituloMision = tituloMision;
        this.textoMision = textoMision;
        this.experenciaMision = experenciaMision;
    }
    
    // Getters y Setters
    public Long getIdMision() { return idMision; }
    public void setIdMision(Long idMision) { this.idMision = idMision; }
    
    public Integer getExperenciaMision() { 
        return experenciaMision != null ? experenciaMision : 0; 
    }
    
    public void setExperenciaMision(Integer experenciaMision) { 
        this.experenciaMision = experenciaMision != null ? experenciaMision : 0; 
    }
    
    public String getTextoMision() { return textoMision; }
    public void setTextoMision(String textoMision) { this.textoMision = textoMision; }
    
    public String getTituloMision() { return tituloMision; }
    public void setTituloMision(String tituloMision) { this.tituloMision = tituloMision; }
}