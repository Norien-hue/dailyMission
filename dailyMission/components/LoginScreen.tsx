import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen({ navigateTo, login }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!name.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    setIsLoading(true);
    login(name, password).then((result) => {
      setIsLoading(false);
      if (result.success) {
        Alert.alert('Éxito', 'Inicio de sesión exitoso');
      } else {
        Alert.alert('Error', result.error);
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Daily Missions</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nombre de usuario"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Pressable
              style={({ pressed }) => [
                styles.button,
                (isLoading || pressed) && styles.buttonPressed
              ]}
              onPress={handleLogin}
              disabled={isLoading}>
              <Text style={styles.buttonText}>
                {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.registerLink,
                pressed && styles.linkPressed
              ]}
              onPress={() => navigateTo('Register')}>
              <Text style={styles.registerText}>
                ¿No tienes cuenta? Regístrate aquí
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
    backgroundColor: '#d4f5f4',
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
    fontSize: 36,
    fontWeight: 'bold',
    color: '#7adbd8',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
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
    backgroundColor: '#7adbd8',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonPressed: {
    backgroundColor: '#5ec3c0',
    opacity: 0.8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
    padding: 5,
  },
  linkPressed: {
    opacity: 0.6,
  },
  registerText: {
    color: '#7adbd8',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});