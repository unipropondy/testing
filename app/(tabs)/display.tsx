import { IconSymbol } from '@/components/ui/icon-symbol';
import { API_ENDPOINTS } from '@/constants/api';
import { useAuth } from '@/hooks/auth-context';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface Order {
  OrderId: string;
  OrderNumber: string;
  Tableno: string;
  OrderDateTime: string;
  StatusLabel: 'PREPARING' | 'READY';
}

export default function CustomerDisplayScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CDS_TODAY, {
        headers: {
          'x-db-name': 'UCS',
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const preparingOrders = orders.filter((o) => o.StatusLabel === 'PREPARING');
  const readyOrders = orders.filter((o) => o.StatusLabel === 'READY');

  const OrderItem = ({ item }: { item: Order }) => (
    <View style={[styles.orderCard, item.StatusLabel === 'READY' ? styles.readyCard : styles.preparingCard]}>
      <Text style={styles.orderNumber}>{item.OrderNumber}</Text>
      {item.Tableno && <Text style={styles.tableNo}>Table: {item.Tableno}</Text>}
    </View>
  );

  if (loading && orders.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Order Status</Text>
          {user && <Text style={styles.welcomeText}>Welcome, {user.fullName}</Text>}
        </View>
        <TouchableOpacity
          style={styles.fullscreenButton}
          onPress={() => router.push('/fullscreen-display')}
        >
          <IconSymbol name="arrow.up.left.and.arrow.down.right" size={24} color="#fff" />
          <Text style={styles.fullscreenButtonText}>Fullscreen</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Preparing Column */}
        <View style={styles.column}>
          <View style={[styles.columnHeader, styles.preparingHeader]}>
            <Text style={styles.columnTitle}>PREPARING</Text>
          </View>
          <FlatList
            data={preparingOrders}
            keyExtractor={(item) => item.OrderId}
            renderItem={OrderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={styles.divider} />

        {/* Ready Column */}
        <View style={styles.column}>
          <View style={[styles.columnHeader, styles.readyHeader]}>
            <Text style={styles.columnTitle}>READY</Text>
          </View>
          <FlatList
            data={readyOrders}
            keyExtractor={(item) => item.OrderId}
            renderItem={OrderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  welcomeText: {
    color: '#aaa',
    fontSize: 14,
  },
  fullscreenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  fullscreenButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
  divider: {
    width: 2,
    backgroundColor: '#eee',
  },
  columnHeader: {
    padding: 15,
    alignItems: 'center',
  },
  preparingHeader: {
    backgroundColor: '#f1c40f',
  },
  readyHeader: {
    backgroundColor: '#2ecc71',
  },
  columnTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContent: {
    padding: 15,
  },
  orderCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  preparingCard: {
    backgroundColor: '#fff',
    borderLeftWidth: 8,
    borderLeftColor: '#f1c40f',
  },
  readyCard: {
    backgroundColor: '#fff',
    borderLeftWidth: 8,
    borderLeftColor: '#2ecc71',
  },
  orderNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#333',
  },
  tableNo: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
    fontWeight: '600',
  },
});
