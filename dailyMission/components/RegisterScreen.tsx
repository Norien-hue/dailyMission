import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen({ navigateTo, register }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = () => {
    if (!name.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor, completa todos los campos obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    register({
      name,
      passwd: password,
    }).then((result) => {
      setIsLoading(false);
      if (result.success) {
        Alert.alert('Éxito', 'Registro exitoso');
      } else {
        Alert.alert('Error', result.error);
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Regístrate para empezar</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nombre de usuario *"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Contraseña *"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña *"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <Pressable
              style={({ pressed }) => [
                styles.button,
                (isLoading || pressed) && styles.buttonPressed
              ]}
              onPress={handleRegister}
              disabled={isLoading}>
              <Text style={styles.buttonText}>
                {isLoading ? 'Creando cuenta...' : 'Registrarse'}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.loginLink,
                pressed && styles.linkPressed
              ]}
              onPress={() => navigateTo('Login')}>
              <Text style={styles.loginText}>
                ¿Ya tienes cuenta? Inicia sesión
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf3e8',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 30,
    margin: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#daa37a',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#daa37a',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonPressed: {
    backgroundColor: '#c88b62',
    opacity: 0.8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
    padding: 5,
  },
  linkPressed: {
    opacity: 0.6,
  },
  loginText: {
    color: '#daa37a',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});