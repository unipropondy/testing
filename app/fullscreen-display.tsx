import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { API_ENDPOINTS } from '@/constants/api';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/hooks/auth-context';

const { width } = Dimensions.get('window');

interface Order {
  OrderId: string;
  OrderNumber: string;
  Tableno: string;
  OrderDateTime: string;
  StatusLabel: 'PREPARING' | 'READY';
}

export default function FullscreenDisplay() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CDS_TODAY, {
        headers: { 'x-db-name': 'UCS' }
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

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Top Banner */}
      <View style={styles.topBanner}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/display')} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.bannerText}>CUSTOMER DISPLAY SYSTEM</Text>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
          <View style={styles.clockContainer}>
            <Text style={styles.clockText}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <TouchableOpacity onPress={() => signOut()} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
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
            numColumns={width > 800 ? 2 : 1}
            key={width > 800 ? 'h' : 'v'}
            contentContainerStyle={styles.listContent}
          />
        </View>

        {/* Ready Column */}
        <View style={styles.column}>
          <View style={[styles.columnHeader, styles.readyHeader]}>
            <Text style={styles.columnTitle}>READY TO PICKUP</Text>
          </View>
          <FlatList
            data={readyOrders}
            keyExtractor={(item) => item.OrderId}
            renderItem={OrderItem}
            numColumns={width > 800 ? 2 : 1}
            key={width > 800 ? 'h2' : 'v2'}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Please collect your order when it appears in the READY column</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBanner: {
    height: 80,
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 10,
  },
  bannerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
  },
  clockContainer: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  clockText: {
    color: '#00ff00',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#222',
  },
  columnHeader: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preparingHeader: {
    backgroundColor: '#d35400',
  },
  readyHeader: {
    backgroundColor: '#27ae60',
  },
  columnTitle: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  listContent: {
    padding: 20,
  },
  orderCard: {
    flex: 1,
    margin: 10,
    padding: 25,
    backgroundColor: '#111',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  preparingCard: {
    borderColor: '#d35400',
  },
  readyCard: {
    borderColor: '#27ae60',
    backgroundColor: '#0a2a0a',
  },
  orderNumber: {
    color: '#fff',
    fontSize: 72,
    fontWeight: '900',
  },
  tableNo: {
    color: '#aaa',
    fontSize: 24,
    marginTop: 10,
  },
  footer: {
    height: 60,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#888',
    fontSize: 18,
    fontStyle: 'italic',
  },
  logoutButton: {
    backgroundColor: '#d63031',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
