import React, { useState } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import MissionScreen from './MissionScreen';
import PerfilScreen from './PerfilScreen';
import AjustesScreen from './AjustesScreen';

export default function MainTabs({ user, streak, updateStreak, logout, updateUserData }) {
  const [activeTab, setActiveTab] = useState('Missions');

  const renderScreen = () => {
    switch (activeTab) {
      case 'Missions':
        return (
          <MissionScreen 
            user={user} 
            streak={streak} 
            updateStreak={updateStreak}
            updateUserData={updateUserData}
          />
        );
      case 'Profile':
        return <PerfilScreen user={user} />;
      case 'Settings':
        return <AjustesScreen user={user} logout={logout} updateUserData={updateUserData} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      
      <View style={styles.tabBar}>
        <Pressable
          style={({ pressed }) => [
            styles.tab,
            activeTab === 'Missions' && styles.activeTab,
            pressed && styles.tabPressed
          ]}
          onPress={() => setActiveTab('Missions')}>
          <MaterialIcons
            name="assignment"
            size={24}
            color={activeTab === 'Missions' ? '#7adbd8' : '#999'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'Missions' && styles.activeTabText
          ]}>
            Misiones
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.tab,
            activeTab === 'Profile' && styles.activeTab,
            pressed && styles.tabPressed
          ]}
          onPress={() => setActiveTab('Profile')}>
          <MaterialIcons
            name="person"
            size={24}
            color={activeTab === 'Profile' ? '#7adbd8' : '#999'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'Profile' && styles.activeTabText
          ]}>
            Perfil
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.tab,
            activeTab === 'Settings' && styles.activeTab,
            pressed && styles.tabPressed
          ]}
          onPress={() => setActiveTab('Settings')}>
          <MaterialIcons
            name="settings"
            size={24}
            color={activeTab === 'Settings' ? '#7adbd8' : '#999'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'Settings' && styles.activeTabText
          ]}>
            Ajustes
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#7adbd8',
  },
  tabPressed: {
    backgroundColor: '#f5f5f5',
  },
  tabText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  activeTabText: {
    color: '#7adbd8',
    fontWeight: 'bold',
  },
});