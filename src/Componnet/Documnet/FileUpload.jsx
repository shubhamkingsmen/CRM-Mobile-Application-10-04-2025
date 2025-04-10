import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from '@react-native-documents/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState('');
  const [folderName, setFolderName] = useState('');
  const [createBy, setCreateBy] = useState('65f18abc1234567890def456');
  const [loading, setLoading] = useState(false);

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      setFile(res[0]);
      setFilename(res[0].name);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled picker');
      } else {
        console.log('Error picking file:', err);
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !folderName || !createBy) {
      Alert.alert('Missing fields', 'Please select file, folder name, and creator ID.');
      return;
    }

    const formData = new FormData();
    formData.append('files', {
      uri: file.uri,
      type: file.type || 'application/octet-stream',
      name: file.name,
    });
    formData.append('filename', filename);
    formData.append('folderName', folderName);
    formData.append('createBy', createBy);

    try {
      setLoading(true);
      const response = await axios.post('https://yourdomain.com/api/document/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer YOUR_TOKEN_HERE',
        },
      });

      Alert.alert('Success', response.data.message);
      setFile(null);
      setFilename('');
      setFolderName('');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload failed', 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload a File</Text>

      <TouchableOpacity style={styles.uploadBox} onPress={pickFile}>
        <Icon name="cloud-upload-outline" size={40} color="#aaa" />
        <Text style={styles.uploadText}>
          {file ? file.name : 'Tap to select a file'}
        </Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Filename"
        style={styles.input}
        value={filename}
        onChangeText={setFilename}
      />
      <TextInput
        placeholder="Folder Name"
        style={styles.input}
        value={folderName}
        onChangeText={setFolderName}
      />
      <TextInput
        placeholder="Creator ID"
        style={styles.input}
        value={createBy}
        onChangeText={setCreateBy}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleUpload}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Icon name="send" size={20} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>Upload File</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default FileUpload;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#bbb',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  uploadText: {
    marginTop: 10,
    color: '#777',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
