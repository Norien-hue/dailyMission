package com.api.daily.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuario")
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;
    
    private String passwd;
    private String name;
    private Integer exp = 0;
    private String foto;
    
    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro = LocalDateTime.now();
    
    // Constructores
    public Usuario() {}
    
    public Usuario(String name, String passwd) {
        this.name = name;
        this.passwd = passwd;
    }
    
    // Getters y Setters
    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }
    
    public String getPasswd() { return passwd; }
    public void setPasswd(String passwd) { this.passwd = passwd; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public Integer getExp() { return exp != null ? exp : 0; }
    public void setExp(Integer exp) { this.exp = exp != null ? exp : 0; }
    
    public String getFoto() { return foto; }
    public void setFoto(String foto) { this.foto = foto; }
    
    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }
    
    // Método para añadir experiencia
    public void addExp(Integer exp) {
        if (exp != null && exp > 0) {
            this.exp += exp;
        }
    }
}