import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import axios, { AxiosError } from 'axios';
import { format, subDays, isSameDay, parseISO } from 'date-fns';

type MisionHecha {
  idKey: number;
  fecha: string; 
  fotoMision?: string;
  idUsuario: number;
  idMision: number;
}

// Configuración de Axios (ajusta la URL base según tu API)
axios.defaults.baseURL = 'http://localhost:8080/api';

const StreakTracker = ({ userId }: { userId: number }) => {
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStreak = (missions: MisionHecha[]): number => {
    if (!missions || missions.length === 0) return 0;
    
    // 1. Extraer y ordenar fechas
    const dates = missions
      .map(mission => parseISO(mission.fecha))
      .sort((a, b) => b.getTime() - a.getTime()); // Orden descendente (más reciente primero)
    
    // 2. Obtener días únicos (sin horas)
    const uniqueDays = [...new Set(
      dates.map(date => format(date, 'yyyy-MM-dd'))
    )].map(day => parseISO(day));
    
    // 3. Calcular racha
    let currentStreak = 0;
    let currentDate = new Date();
    
    // Normalizar la fecha actual (sin horas)
    currentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    
    // Verificar desde hoy hacia atrás
    for (let i = 0; i < uniqueDays.length; i++) {
      // Verificar si hay una misión en el día actual - i
      let found = false;
      
      for (let j = 0; j < uniqueDays.length; j++) {
        if (isSameDay(uniqueDays[j], subDays(currentDate, i))) {
          found = true;
          break;
        }
      }
      
      if (found) {
        currentStreak++;
      } else {
        break; // Se rompe la cadena
      }
    }
    
    return currentStreak;
  };

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true);
        
        // 1. Obtener todas las misiones hechas del usuario
        const response = await axios.get<MisionHecha[]>(`/misiones-hechas/usuario/${userId}`);
        
        // 2. Calcular la racha
        const streakDays = calculateStreak(response.data);
        
        setStreak(streakDays);
        setError(null);
      } catch (err: unknown) {
        console.error('Error al obtener misiones:', err);
        
        // Manejo seguro del error
        if (err instanceof Error) {
          setError(`Error al calcular la racha: ${err.message}`);
        } else if (axios.isAxiosError(err)) {
          setError(`Error de API: ${err.response?.status} - ${err.response?.data?.message || err.message}`);
        } else {
          setError('Error desconocido al calcular la racha');
        }
        
        setStreak(0);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchMissions();
    }
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando racha...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.streakNumber}>{streak}</Text>
      <Text style={styles.streakText}>
        {streak === 1 ? 'día de racha' : 'días de racha'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  streakText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  error: {
    color: '#FF0000',
    fontSize: 16,
  },
});

export default StreakTracker;