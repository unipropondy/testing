import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/auth-context';
import { API_ENDPOINTS } from '@/constants/api';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDbSettings, setShowDbSettings] = useState(false);

  // Database Settings
  const [dbUser, setDbUser] = useState('ups');
  const [dbPass, setDbPass] = useState('ups');
  const [dbServer, setDbServer] = useState('myerpcloud.dyndns.org');
  const [dbPort, setDbPort] = useState('9199');
  const [dbName, setDbName] = useState('UCS');

  const { signIn } = useAuth();
  const router = useRouter();

  // Load saved settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('db_settings');
        if (saved) {
          const config = JSON.parse(saved);
          if (config.dbUser) setDbUser(config.dbUser);
          if (config.dbPass) setDbPass(config.dbPass);
          if (config.dbServer) setDbServer(config.dbServer);
          if (config.dbPort) setDbPort(config.dbPort);
          if (config.dbName) setDbName(config.dbName);
        }
      }
    } catch (e) {
      console.error('Failed to load DB settings', e);
    }
  };

  const saveSettings = () => {
    try {
      if (typeof localStorage !== 'undefined') {
        const config = { dbUser, dbPass, dbServer, dbPort, dbName };
        localStorage.setItem('db_settings', JSON.stringify(config));
      }
    } catch (e) {}
  };

  const handleSaveToServer = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.SAVE_CONFIG, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dbUser, dbPass, dbServer, dbPort, dbName }),
      });
      const data = await response.json();
      if (data.success) {
        showAlert('Success', 'Backend .env file updated successfully!');
      } else {
        showAlert('Error', 'Failed to update server file.');
      }
    } catch (error: any) {
      showAlert('Error', `Backend error: ${error.message}`);
    }
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    saveSettings(); // Save before login
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      showAlert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-db-user': dbUser,
          'x-db-pass': dbPass,
          'x-db-server': dbServer,
          'x-db-port': dbPort,
          'x-db-name': dbName,
        },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword }),
      });

      const data = await response.json();

      if (data.success) {
        await signIn(data.user);
        router.replace('/fullscreen-display');
      } else {
        showAlert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error: any) {
      showAlert('Error', `Could not connect to server: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.loginCard}>
          <View style={styles.header}>
            <Text style={styles.title}>CDS Login</Text>
            <Text style={styles.subtitle}>Enter credentials and DB settings</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* DB Settings Toggle */}
          <TouchableOpacity 
            style={styles.settingsToggle} 
            onPress={() => setShowDbSettings(!showDbSettings)}
          >
            <IconSymbol name="gearshape.fill" size={16} color="#007AFF" />
            <Text style={styles.settingsToggleText}>
              {showDbSettings ? 'Hide Database Settings' : 'Show Database Settings'}
            </Text>
          </TouchableOpacity>

          {showDbSettings && (
            <View style={styles.dbSettingsBox}>
              <View style={styles.inputContainer}>
                <Text style={styles.subLabel}>DB Server</Text>
                <TextInput style={styles.smallInput} value={dbServer} onChangeText={setDbServer} />
              </View>
              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 2 }]}>
                  <Text style={styles.subLabel}>DB Name</Text>
                  <TextInput style={styles.smallInput} value={dbName} onChangeText={setDbName} />
                </View>
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.subLabel}>Port</Text>
                  <TextInput style={styles.smallInput} value={dbPort} onChangeText={setDbPort} keyboardType="numeric" />
                </View>
              </View>
              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Text style={styles.subLabel}>DB User</Text>
                  <TextInput style={styles.smallInput} value={dbUser} onChangeText={setDbUser} />
                </View>
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.subLabel}>DB Pass</Text>
                  <TextInput style={styles.smallInput} value={dbPass} onChangeText={setDbPass} secureTextEntry />
                </View>
              </View>

              <TouchableOpacity 
                style={styles.saveServerButton} 
                onPress={handleSaveToServer}
              >
                <IconSymbol name="checkmark.seal.fill" size={14} color="#fff" />
                <Text style={styles.saveServerButtonText}>Save as Server Default (.env)</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginCard: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 450,
    padding: 30,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    marginBottom: 25,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  smallInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
  },
  settingsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginBottom: 10,
    gap: 8,
  },
  settingsToggleText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dbSettingsBox: {
    backgroundColor: '#f0f7ff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#d0e5ff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveServerButton: {
    backgroundColor: '#34c759',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    gap: 8,
  },
  saveServerButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
