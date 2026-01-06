import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as api from '../utils/api';
import { AuthUser } from '../tipos/types';

type AjustesScreenProps = {
  user: AuthUser;
  logout: () => void;
  updateUserData: (data: { id?: number; name?: string; exp?: number; foto?: string | null }) => void;
};

export default function AjustesScreen({ user, logout, updateUserData }: AjustesScreenProps) {
  const [name, setName] = useState(user.name);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const handleUpdateName = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }

    if (name === user.name) {
      Alert.alert('Info', 'El nombre no ha cambiado');
      return;
    }

    try {
      await api.updateUser(user.id, { name });
      updateUserData({ name });
      Alert.alert('Éxito', 'Nombre actualizado correctamente');
    } catch (error) {
      console.error('Error updating name:', error);
      Alert.alert('Error', 'No se pudo actualizar el nombre');
    }
  };

  const handleOpenCamera = async () => {
    if (!permission) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permiso denegado', 'Necesitas dar permisos de cámara');
        return;
      }
    } else if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permiso denegado', 'Necesitas dar permisos de cámara');
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

  const confirmPhotoUpdate = async () => {
    if (!photoUri) return;

    try {
      const base64Photo = photoUri;
      await api.updateUser(user.id, { foto: base64Photo });
      updateUserData({ foto: base64Photo });
      
      setShowCameraModal(false);
      setPhotoUri(null);
      Alert.alert('Éxito', 'Foto de perfil actualizada');
    } catch (error) {
      console.error('Error updating photo:', error);
      Alert.alert('Error', 'No se pudo actualizar la foto');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const response = await api.loginUser(user.name);
      if (response.data.passwd !== currentPassword) {
        Alert.alert('Error', 'La contraseña actual es incorrecta');
        return;
      }

      await api.updateUser(user.id, { passwd: newPassword });
      
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      
      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'No se pudo cambiar la contraseña');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert('Error', 'Ingresa tu contraseña');
      return;
    }

    try {
      const response = await api.loginUser(user.name);
      if (response.data.passwd !== deletePassword) {
        Alert.alert('Error', 'Contraseña incorrecta');
        return;
      }

      await api.deleteUser(user.id);
      
      setShowDeleteModal(false);
      Alert.alert('Cuenta eliminada', 'Tu cuenta ha sido eliminada', [
        { text: 'OK', onPress: logout }
      ]);
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'No se pudo eliminar la cuenta');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Configuración</Text>
        </View>

        <View style={styles.profileSection}>
          <Pressable 
            style={({ pressed }) => [
              styles.avatarContainer,
              pressed && styles.avatarPressed
            ]}
            onPress={handleOpenCamera}>
            {user.foto ? (
              <Image source={{ uri: user.foto }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <MaterialIcons name="person" size={60} color="#7adbd8" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <MaterialIcons name="camera-alt" size={20} color="#fff" />
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nombre de usuario</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nombre de usuario"
              placeholderTextColor="#999"
            />
            <Pressable
              style={({ pressed }) => [
                styles.updateButton,
                pressed && styles.updateButtonPressed
              ]}
              onPress={handleUpdateName}>
              <MaterialIcons name="check" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed
            ]}
            onPress={() => setShowPasswordModal(true)}>
            <MaterialIcons name="lock" size={24} color="#7adbd8" />
            <Text style={styles.actionButtonText}>Cambiar Contraseña</Text>
            <MaterialIcons name="chevron-right" size={24} color="#999" />
          </Pressable>
        </View>

        <View style={styles.dangerSection}>
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.dangerButtonPressed
            ]}
            onPress={logout}>
            <MaterialIcons name="logout" size={24} color="#dad479" />
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.dangerButtonPressed
            ]}
            onPress={() => setShowDeleteModal(true)}>
            <MaterialIcons name="delete" size={24} color="#daa37a" />
            <Text style={styles.deleteButtonText}>Eliminar Cuenta</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambiar Contraseña</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Contraseña actual"
              placeholderTextColor="#999"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Nueva contraseña"
              placeholderTextColor="#999"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Repetir nueva contraseña"
              placeholderTextColor="#999"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
            />
            
            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.modalCancelButton,
                  pressed && styles.modalButtonPressed
                ]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                }}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.modalConfirmButton,
                  pressed && styles.modalButtonPressed
                ]}
                onPress={handleChangePassword}>
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialIcons name="warning" size={48} color="#daa37a" />
            <Text style={styles.modalTitle}>Eliminar Cuenta</Text>
            <Text style={styles.modalWarning}>
              Esta acción no se puede deshacer. Todos tus datos serán eliminados permanentemente.
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Ingresa tu contraseña para confirmar"
              placeholderTextColor="#999"
              value={deletePassword}
              onChangeText={setDeletePassword}
              secureTextEntry
            />
            
            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.modalCancelButton,
                  pressed && styles.modalButtonPressed
                ]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                }}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.modalDeleteButton,
                  pressed && styles.modalButtonPressed
                ]}
                onPress={handleDeleteAccount}>
                <Text style={styles.modalConfirmText}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCameraModal}
        animationType="slide"
        onRequestClose={() => setShowCameraModal(false)}>
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
                  onPress={confirmPhotoUpdate}>
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
                  facing="front"
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
                  onPress={() => setShowCameraModal(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
                
                <Pressable
                  style={({ pressed }) => [
                    styles.captureButton,
                    pressed && styles.captureButtonPressed
                  ]}
                  onPress={takePicture}
                  disabled={!permission}>
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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  defaultAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#d4f5f4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#7adbd8',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  updateButton: {
    backgroundColor: '#7adbd8',
    borderRadius: 10,
    padding: 12,
    marginLeft: 10,
  },
  updateButtonPressed: {
    backgroundColor: '#5ec3c0',
    opacity: 0.8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  actionButtonPressed: {
    opacity: 0.6,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  dangerSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#c4b65d',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef5f0',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteButtonText: {
    color: '#daa37a',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  dangerButtonPressed: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 20,
  },
  modalWarning: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 10,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  modalButtonPressed: {
    opacity: 0.7,
  },
  modalCancelButton: {
    backgroundColor: '#f5f5f5',
  },
  modalConfirmButton: {
    backgroundColor: '#7adbd8',
  },
  modalDeleteButton: {
    backgroundColor: '#daa37a',
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
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