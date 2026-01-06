import axios from 'axios';
import { Usuario, Mision, MisionHecha } from '../tipos/types';

const API_URL = 'http://10.0.2.2:8080/api/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Usuarios
export const loginUser = (name: string) => {
  return api.get<Usuario>(`/usuarios/buscar/${name}`);
};

export const registerUser = (userData: { name: string; passwd: string }) => {
  return api.post<Usuario>('/usuarios', userData);
};

export const getUserById = (id: number) => {
  return api.get<Usuario>(`/usuarios/${id}`);
};

export const updateUser = (id: number, userData: { name?: string; passwd?: string; exp?: number; foto?: string | null }) => {
  return api.put<Usuario>(`/usuarios/${id}`, userData);
};

export const deleteUser = (id: number) => {
  return api.delete(`/usuarios/${id}`);
};

// Misiones
export const getAllMissions = () => {
  return api.get<Mision[]>('/misiones');
};

export const getMissionById = (id: number) => {
  return api.get<Mision>(`/misiones/${id}`);
};

export const searchMissions = (title: string) => {
  return api.get<Mision[]>(`/misiones/buscar?titulo=${title}`);
};

// Misiones Diarias
export const getDailyMissions = () => {
  return api.get<Mision[]>('/misiones-diarias');
};

export const verifyDailyMission = (idMision: number) => {
  return api.get<boolean>(`/misiones-diarias/verificar/${idMision}`);
};

// Misiones Hechas
export const completeMission = (idUsuario: number, idMision: number, fotoMision: string | null = null) => {
  return api.post<MisionHecha>(`/misiones-hechas/completar?idUsuario=${idUsuario}&idMision=${idMision}&fotoMision=${fotoMision || ''}`);
};

export const getUserCompletedMissions = (idUsuario: number) => {
  return api.get<Mision[]>(`/misiones-hechas/usuario/${idUsuario}/detalles`);
};

export const getUserMissionsHistory = (idUsuario: number) => {
  return api.get<MisionHecha[]>(`/misiones-hechas/usuario/${idUsuario}`);
};

export const deleteCompletedMission = (id: number) => {
  return api.delete(`/misiones-hechas/${id}`);
};