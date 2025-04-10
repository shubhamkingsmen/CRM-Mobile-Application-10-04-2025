import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from '@react-native-documents/picker';
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
      console.log('Error picking file:', err);
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
      console.log(formData)
      const response = await axios.post('https://yourdomain.com/api/document/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer YOUR_TOKEN_HERE',
        },
      });

      console.log(response.data);
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
      <Text style={styles.title}>File Upload</Text>

      <Button title="Choose File" onPress={pickFile} />
      {file && <Text style={styles.fileInfo}>Selected: {file.name}</Text>}

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

      <Button
        title={loading ? 'Uploading...' : 'Upload File'}
        onPress={handleUpload}
        disabled={loading}
      />
    </View>
  );
};

export default FileUpload;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 8,
    borderRadius: 8,
  },
  fileInfo: {
    marginVertical: 10,
    fontSize: 16,
  },
});
