import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as api from '../utils/api';

type Usuario = {
  idUsuario: number;
  name: string;
  exp: number;
  foto: string | null;
}

type MisionHecha = {
  idKey: number;
  idUsuario: number;
  idMision: number;
  fecha: string;
  fotoMision: string | null;
}

type Mision = {
  idMision: number;
  tituloMision: string;
  experenciaMision: number;
}

type UserType = {
  id: number;
  name: string;
}

type PerfilScreenProps = {
  user: UserType;
}

type CombinedMission = MisionHecha & {
  tituloMision?: string;
  experenciaMision?: number;
};

export default function PerfilScreen({ user }: PerfilScreenProps) {
  const [userData, setUserData] = useState<Usuario | null>(null);
  const [completedMissions, setCompletedMissions] = useState<CombinedMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(function() {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      if (user?.id) {
        const userResponse = await api.getUserById(user.id);
        const userDataFromApi: Usuario = {
          idUsuario: userResponse.data.idUsuario,
          name: userResponse.data.name,
          exp: userResponse.data.exp,
          foto: userResponse.data.foto
        };
        setUserData(userDataFromApi);
        
        const historyResponse = await api.getUserMissionsHistory(user.id);
        const missionsHistory: MisionHecha[] = historyResponse.data;
        
        const detailsResponse = await api.getUserCompletedMissions(user.id);
        const missionsDetails: Mision[] = detailsResponse.data;
        
        const combinedData: CombinedMission[] = missionsHistory.map(function(mh) {
          const detail = missionsDetails.find(function(md) {
            return md.idMision === mh.idMision;
          });
          return {
            ...mh,
            tituloMision: detail?.tituloMision,
            experenciaMision: detail?.experenciaMision,
          };
        });
        
        combinedData.sort(function(a, b) {
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        });
        
        setCompletedMissions(combinedData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    loadUserData();
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function renderMissionItem({ item }: { item: CombinedMission }) {
    return (
      <View style={styles.missionCard}>
        {item.fotoMision && (
          <Image 
            source={{ uri: item.fotoMision }} 
            style={styles.missionPhoto}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.missionContent}>
          <View style={styles.missionHeader}>
            <MaterialIcons name="check-circle" size={20} color="#7adbd8" />
            <Text style={styles.missionTitle} numberOfLines={1}>
              {item.tituloMision || 'Misión'}
            </Text>
          </View>
          
          <View style={styles.missionFooter}>
            <View style={styles.expBadge}>
              <MaterialIcons name="star" size={16} color="#dad479" />
              <Text style={styles.missionExpText}>+{item.experenciaMision || 0} EXP</Text>
            </View>
            
            <View style={styles.dateBadge}>
              <MaterialIcons name="schedule" size={14} color="#999" />
              <Text style={styles.dateText}>{formatDate(item.fecha)}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  function renderHeader() {
    const currentExp = userData?.exp || 0;
    const currentLevel = Math.floor(currentExp / 100);
    const expProgress = currentExp % 100;

    return (
      <>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {userData?.foto ? (
              <Image source={{ uri: userData.foto }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <MaterialIcons name="person" size={60} color="#fff" />
              </View>
            )}
          </View>

          <Text style={styles.userName}>{userData?.name || user?.name || 'Usuario'}</Text>
          <Text style={styles.userLevel}>
            Nivel {currentLevel}
          </Text>

          <View style={styles.expContainer}>
            <View style={styles.expBar}>
              <View
                style={[
                  styles.expProgress,
                  { width: `${expProgress}%` },
                ]}
              />
            </View>
            <Text style={styles.headerExpText}>
              {currentExp} EXP
            </Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialIcons name="check-circle" size={30} color="#7adbd8" />
              <Text style={styles.statNumber}>{completedMissions.length}</Text>
              <Text style={styles.statLabel}>Misiones Completadas</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="show-chart" size={30} color="#daa37a" />
              <Text style={styles.statNumber}>{currentExp}</Text>
              <Text style={styles.statLabel}>Experiencia Total</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="star" size={30} color="#dad479" />
              <Text style={styles.statNumber}>
                {currentLevel}
              </Text>
              <Text style={styles.statLabel}>Nivel Actual</Text>
            </View>
          </View>
        </View>

        <View style={styles.missionsHeader}>
          <Text style={styles.sectionTitle}>Historial de Misiones</Text>
          {completedMissions.length > 0 && (
            <Text style={styles.missionCount}>
              {completedMissions.length} completadas
            </Text>
          )}
        </View>
      </>
    );
  }

  function renderEmptyList() {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="inbox" size={64} color="#ccc" />
        <Text style={styles.emptyText}>
          Aún no has completado misiones
        </Text>
        <Text style={styles.emptySubtext}>
          ¡Completa tu primera misión para empezar!
        </Text>
      </View>
    );
  }

  function renderFooter() {
    return <View style={{ height: 20 }} />;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={completedMissions}
        renderItem={renderMissionItem}
        keyExtractor={function(item) { return item.idKey.toString(); }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
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
  listContent: {
    paddingBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#7adbd8',
  },
  defaultAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#7adbd8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userLevel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  expContainer: {
    width: '100%',
    alignItems: 'center',
  },
  expBar: {
    width: '80%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  expProgress: {
    height: '100%',
    backgroundColor: '#7adbd8',
    borderRadius: 5,
  },
  headerExpText: {
    fontSize: 14,
    color: '#666',
  },
  statsSection: {
    backgroundColor: 'white',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  missionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 15,
  },
  missionCount: {
    fontSize: 14,
    color: '#999',
  },
  missionCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  missionPhoto: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  missionContent: {
    padding: 15,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  missionExpText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#c4b65d',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});