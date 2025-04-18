import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

// Axios Interceptors for debug logs
axios.interceptors.request.use(config => {
  console.log('🚀 Request:', config.url, config.method, config.data || '');
  return config;
});

axios.interceptors.response.use(
  response => {
    console.log('✅ Response:', response.config.url, response.status, response.data);
    return response;
  },
  error => {
    console.error('❌ Error:', error?.response?.config?.url, error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

const LinkModal = ({ isOpen, onClose, documentId, setLinkDocument }) => {
  const [linkWith, setLinkWith] = useState('');
  const [linkContact, setLinkContact] = useState('');
  const [linkLead, setLinkLead] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const user = { role: 'superAdmin', _id: '64d33173fd7ff3fa0924a109' }; // Example user

  useEffect(() => {
    if (linkWith) fetchData();
  }, [linkWith]);

  const fetchData = async () => {
    try {
      setData([]);
      setNoData(false);

      const url = linkWith === 'Contact'
        ? (user.role === 'superAdmin' ? 'api/contact/' : `api/contact/?createBy=${user._id}`)
        : (user.role === 'superAdmin' ? 'api/lead/' : `api/lead/?createBy=${user._id}`);

      const fullUrl = `http://10.0.2.2:5001/${url}`;
      const res = await axios.get(fullUrl);

      const items = res.data;
      console.log('📦 Raw items:', items);

      if (items && items.length > 0) {
        const formatted = items.map(item => ({
          label: linkWith === 'Contact' ? item.ContactName : item.leadName,
          value: item._id,
        }));
        console.log('📦 Formatted data:', formatted);
        setData(formatted);
      } else {
        setNoData(true);
      }
    } catch (err) {
      console.error('Fetch Error:', err?.response?.data || err.message);
      Alert.alert('Error', 'Failed to fetch data.');
    }
  };

  const handleLink = async () => {
    if ((linkWith === 'Contact' && !linkContact) || (linkWith === 'lead' && !linkLead)) {
      Alert.alert("Validation", "Please select a valid option.");
      return;
    }
  
    try {
      setLoading(true);
  
      const payload = linkWith === 'Contact'
        ? { linkContact }
        : { linkLead };
  
      const url = `http://10.0.2.2:5001/api/document/link-document/${documentId}`;
  
      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response.status === 200) {
        Alert.alert("Success", "Document linked successfully ✅");
        setLinkDocument(prev => !prev);
        onClose();
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to link document');
      }
    } catch (error) {
      console.error('Linking error:', error?.response?.data || error.message);
      Alert.alert("Error", "Something went wrong while linking.");
    } finally {
      setLoading(false);
    }
  };
  
  

  const resetState = () => {
    setLinkWith('');
    setLinkContact('');
    setLinkLead('');
    setData([]);
    setNoData(false);
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.header}>Link With Document</Text>

          <View style={styles.radioContainer}>
            <TouchableOpacity onPress={() => { resetState(); setLinkWith('Contact'); }}>
              <Text style={linkWith === 'Contact' ? styles.radioSelected : styles.radio}>Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { resetState(); setLinkWith('lead'); }}>
              <Text style={linkWith === 'lead' ? styles.radioSelected : styles.radio}>Lead</Text>
            </TouchableOpacity>
          </View>

          {linkWith && (
            <View style={styles.pickerWrapper}>
              <Text style={styles.label}>Select {linkWith}</Text>
              <Picker
                selectedValue={linkWith === 'Contact' ? linkContact : linkLead}
                onValueChange={(itemValue) =>
                  linkWith === 'Contact' ? setLinkContact(itemValue) : setLinkLead(itemValue)
                }
              >
                <Picker.Item label={`Select ${linkWith}`} value="" />
                {data.length > 0 ? (
                  data.map(item => (
                    <Picker.Item key={item.value} label={item.label} value={item.value} />
                  ))
                ) : (
                  <Picker.Item label={`No ${linkWith}s available`} value="" />
                )}
              </Picker>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.linkButton} onPress={handleLink} disabled={loading || noData}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Link</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => { onClose(); resetState(); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  radio: {
    padding: 10,
    color: '#555',
  },
  radioSelected: {
    padding: 10,
    color: '#fff',
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  pickerWrapper: {
    marginVertical: 10,
  },
  label: {
    marginBottom: 5,
    fontWeight: '500',
  },
  noDataText: {
    color: '#ff0000',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  linkButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default LinkModal;
