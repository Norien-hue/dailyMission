import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import MainTabs from './components/MainTabs';
import * as api from './utils/api';

type AuthUser = {
  id: number;
  name: string;
  exp: number;
  foto: string | null;
}

type MissionHecha = {
  idKey: number;
  idUsuario: number;
  idMision: number;
  fecha: string;
  fotoMision: string | null;
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    checkLoggedIn();
  }, []);

  const calculateStreak = async (userId: number) => {
    try {
      const response = await api.getUserMissionsHistory(userId);
      const missions: MissionHecha[] = response.data;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let currentStreak = 0;
      let checkDate = new Date(today);
      
      while (true) {
        const dayStart = new Date(checkDate);
        const dayEnd = new Date(checkDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        const hasMissionThisDay = missions.some((m: MissionHecha) => {
          const missionDate = new Date(m.fecha);
          return missionDate >= dayStart && missionDate <= dayEnd;
        });
        
        if (hasMissionThisDay) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          if (checkDate.getTime() < today.getTime()) {
            break;
          }
          break;
        }
      }
      
      return currentStreak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  };

  const checkLoggedIn = async () => {
    try {
      const data = await AsyncStorage.getItem('user');
      if (data) {
        const userData: AuthUser = JSON.parse(data);
        setUser(userData);
        
        const userStreak = await calculateStreak(userData.id);
        setStreak(userStreak);
        
        setCurrentScreen('MainTabs');
      }
    } catch (error) {
      console.error('Error checking login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (name: string, passwd: string) => {
    return new Promise(async (resolve) => {
      try {
        const response = await api.loginUser(name);
        if (response.data) {
          if (response.data.passwd === passwd) {
            const userData: AuthUser = {
              id: response.data.idUsuario,
              name: response.data.name,
              exp: response.data.exp,
              foto: response.data.foto,
            };
            
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            
            const userStreak = await calculateStreak(userData.id);
            setStreak(userStreak);
            
            setCurrentScreen('MainTabs');
            resolve({ success: true, data: userData });
          } else {
            resolve({ success: false, error: 'Contraseña incorrecta' });
          }
        } else {
          resolve({ success: false, error: 'Usuario no encontrado' });
        }
      } catch (error) {
        resolve({ success: false, error: 'Error al iniciar sesión' });
      }
    });
  };

  const register = (userData: { name: string; passwd: string }) => {
    return new Promise(async (resolve) => {
      try {
        const response = await api.registerUser(userData);
        if (response.status === 201) {
          const newUser: AuthUser = {
            id: response.data.idUsuario,
            name: response.data.name,
            exp: response.data.exp,
            foto: response.data.foto,
          };
          
          await AsyncStorage.setItem('user', JSON.stringify(newUser));
          setUser(newUser);
          
          setStreak(0);
          
          setCurrentScreen('MainTabs');
          resolve({ success: true, data: newUser });
        } else {
          resolve({ success: false, error: 'Error en el registro' });
        }
      } catch (error) {
        resolve({ success: false, error: 'Error en el registro' });
      }
    });
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
    setStreak(0);
    setCurrentScreen('Login');
  };

  const updateStreak = (newStreak: number) => {
    setStreak(newStreak);
  };

  const updateUserData = async (newData: Partial<AuthUser>) => {
    if (user) {
      const updatedUser: AuthUser = { ...user, ...newData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const navigateTo = (screen: string) => {
    setCurrentScreen(screen);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#7adbd8' }}>Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {currentScreen === 'Login' && (
        <LoginScreen 
          login={login} 
          navigateTo={navigateTo}
        />
      )}
      {currentScreen === 'Register' && (
        <RegisterScreen 
          register={register} 
          navigateTo={navigateTo}
        />
      )}
      {currentScreen === 'MainTabs' && user && (
        <MainTabs
          user={user}
          streak={streak}
          updateStreak={updateStreak}
          logout={logout}
          updateUserData={updateUserData}
        />
      )}
    </SafeAreaView>
  );
}