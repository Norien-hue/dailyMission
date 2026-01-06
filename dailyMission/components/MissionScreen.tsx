import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Alert, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as api from '../utils/api';

type Mission = {
  idMision: number;
  tituloMision: string;
  textoMision: string;
  experenciaMision: number;
}

type MissionHecha = {
  idKey: number;
  idUsuario: number;
  idMision: number;
  fecha: string;
  fotoMision: string | null;
}

type UserType = {
  id: number;
  exp: number;
}

type MissionScreenProps = {
  user: UserType;
  streak: number;
  updateStreak: (newStreak: number) => void;
  updateUserData: (newData: { exp: number }) => void;
}

export default function MissionScreen({ user, streak, updateStreak, updateUserData }: MissionScreenProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [completedMissions, setCompletedMissions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingMission, setCompletingMission] = useState<number | null>(null);
  
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    loadDailyMissions();
    loadCompletedMissions();
  }, []);

  const loadDailyMissions = async () => {
    try {
      const response = await api.getDailyMissions();
      setMissions(response.data || []);
    } catch (error) {
      console.error('Error loading daily missions:', error);
      Alert.alert('Error', 'No se pudieron cargar las misiones diarias');
    } finally {
      setLoading(false);
    }
  };

  const loadCompletedMissions = async () => {
    try {
      const response = await api.getUserMissionsHistory(user.id);
      const completedIds = response.data.map((m: MissionHecha) => m.idMision);
      setCompletedMissions(completedIds);
      
      const userResponse = await api.getUserById(user.id);
      if (userResponse.data) {
        updateUserData({
          exp: userResponse.data.exp,
        });
      }
    } catch (error) {
      console.error('Error loading completed missions:', error);
    }
  };

  const handleCompleteMissionPress = async (mission: Mission) => {
    setSelectedMission(mission);
    
    if (!permission) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permiso denegado', 'Necesitas dar permisos de cámara para completar misiones');
        return;
      }
    } else if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permiso denegado', 'Necesitas dar permisos de cámara para completar misiones');
        return;
      }
    }
    
    setShowCameraModal(true);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setPhotoUri(photo.uri);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'No se pudo tomar la foto');
      }
    }
  };

  const confirmMissionCompletion = async () => {
    if (!selectedMission || !photoUri) return;

    setCompletingMission(selectedMission.idMision);
    setShowCameraModal(false);

    try {
      const base64Photo = photoUri;
      
      await api.completeMission(user.id, selectedMission.idMision, base64Photo);
      
      const newExp = user.exp + selectedMission.experenciaMision;
      updateUserData({ exp: newExp });
      
      setCompletedMissions([...completedMissions, selectedMission.idMision]);
      
      await updateStreakCount();
      
      Alert.alert('¡Éxito!', `Misión completada. +${selectedMission.experenciaMision} EXP`);
      
      setPhotoUri(null);
      setSelectedMission(null);
    } catch (error) {
      console.error('Error completing mission:', error);
      Alert.alert('Error', 'No se pudo completar la misión');
    } finally {
      setCompletingMission(null);
    }
  };

  const updateStreakCount = async () => {
    try {
      const response = await api.getUserMissionsHistory(user.id);
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
          break;
        }
      }
      
      updateStreak(currentStreak);
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const closeCameraModal = () => {
    setShowCameraModal(false);
    setPhotoUri(null);
    setSelectedMission(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando misiones diarias...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Misiones Diarias</Text>
        </View>
        <View style={styles.streakContainer}>
          <MaterialIcons name="local-fire-department" size={24} color="#daa37a" />
          <Text style={styles.streakText}>{streak} días</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {missions.length > 0 ? (
          missions.map((mission: Mission) => {
            const isCompleted = completedMissions.includes(mission.idMision);
            const isCompleting = completingMission === mission.idMision;
            
            return (
              <View key={mission.idMision} style={[
                styles.missionCard,
                isCompleted && styles.missionCardCompleted
              ]}>
                <View style={styles.missionHeader}>
                  <MaterialIcons 
                    name={isCompleted ? "check-circle" : "assignment"} 
                    size={24} 
                    color={isCompleted ? "#7adbd8" : "#daa37a"} 
                  />
                  <Text style={styles.missionTitle}>{mission.tituloMision}</Text>
                </View>
                
                <Text style={styles.missionDescription}>{mission.textoMision}</Text>
                
                <View style={styles.missionFooter}>
                  <View style={styles.expBadge}>
                    <MaterialIcons name="star" size={16} color="#dad479" />
                    <Text style={styles.expText}>+{mission.experenciaMision} EXP</Text>
                  </View>
                  
                  {isCompleted ? (
                    <View style={styles.completedBadge}>
                      <MaterialIcons name="check" size={16} color="#fff" />
                      <Text style={styles.completedText}>Completada</Text>
                    </View>
                  ) : (
                    <Pressable
                      style={({ pressed }) => [
                        styles.completeButton,
                        (isCompleting || pressed) && styles.completeButtonPressed,
                        isCompleted && styles.completeButtonDisabled
                      ]}
                      onPress={() => handleCompleteMissionPress(mission)}
                      disabled={isCompleting || isCompleted}>
                      {isCompleting ? (
                        <Text style={styles.completeButtonText}>Completando...</Text>
                      ) : (
                        <>
                          <MaterialIcons name="camera-alt" size={20} color="#fff" />
                          <Text style={styles.completeButtonText}>Completar</Text>
                        </>
                      )}
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay misiones diarias disponibles</Text>
            <Text style={styles.emptySubtext}>Vuelve mañana para nuevas misiones</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showCameraModal}
        animationType="slide"
        onRequestClose={closeCameraModal}>
        <View style={styles.cameraModal}>
          {photoUri ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photoUri }} style={styles.photoImage} />
              <View style={styles.photoActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.photoButton,
                    styles.retakeButton,
                    pressed && styles.photoButtonPressed
                  ]}
                  onPress={() => setPhotoUri(null)}>
                  <MaterialIcons name="refresh" size={24} color="#fff" />
                  <Text style={styles.photoButtonText}>Repetir</Text>
                </Pressable>
                
                <Pressable
                  style={({ pressed }) => [
                    styles.photoButton,
                    styles.confirmButton,
                    pressed && styles.photoButtonPressed
                  ]}
                  onPress={confirmMissionCompletion}>
                  <MaterialIcons name="check" size={24} color="#fff" />
                  <Text style={styles.photoButtonText}>Confirmar</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              {permission && permission.granted ? (
                <CameraView
                  style={styles.camera}
                  ref={cameraRef}
                  facing="back"
                />
              ) : (
                <View style={styles.noPermission}>
                  <MaterialIcons name="camera" size={64} color="#999" />
                  <Text style={styles.noPermissionText}>
                    No tienes permisos de cámara
                  </Text>
                </View>
              )}
              
              <View style={styles.cameraControls}>
                <Pressable
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && styles.cancelButtonPressed
                  ]}
                  onPress={closeCameraModal}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
                
                <Pressable
                  style={({ pressed }) => [
                    styles.captureButton,
                    pressed && styles.captureButtonPressed
                  ]}
                  onPress={takePicture}
                  disabled={!permission || !permission.granted}>
                  <View style={styles.captureButtonInner} />
                </Pressable>
                
                <View style={styles.placeholder} />
              </View>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef5f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#daa37a',
  },
  scrollContent: {
    padding: 20,
  },
  missionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  missionCardCompleted: {
    backgroundColor: '#f0faf9',
    borderWidth: 1,
    borderColor: '#7adbd8',
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  missionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fefbf2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  expText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#c4b65d',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7adbd8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  completeButtonPressed: {
    backgroundColor: '#5ec3c0',
    opacity: 0.8,
  },
  completeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7adbd8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  completedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  cameraModal: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  noPermission: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  noPermissionText: {
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 30,
    backgroundColor: '#000',
  },
  cancelButton: {
    padding: 15,
  },
  cancelButtonPressed: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: '#7adbd8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonPressed: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7adbd8',
  },
  placeholder: {
    width: 60,
  },
  photoPreview: {
    flex: 1,
    backgroundColor: '#000',
  },
  photoImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 30,
    backgroundColor: '#000',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  photoButtonPressed: {
    opacity: 0.7,
  },
  retakeButton: {
    backgroundColor: '#daa37a',
  },
  confirmButton: {
    backgroundColor: '#7adbd8',
  },
  photoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});