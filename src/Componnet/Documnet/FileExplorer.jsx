import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FileExplorer = () => {
  const [data, setData] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('http://10.0.2.2:5001/api/document');
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error fetching file data:', error);
      Alert.alert('Error', 'Failed to load files.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  };

  const openFile = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unsupported', 'Cannot open this file type.');
      }
    } catch (err) {
      console.error('Error opening file:', err);
      Alert.alert('Error', 'Something went wrong while opening the file.');
    }
  };

  const downloadFile = (url) => {
    Alert.alert('Download started', `URL: ${url}`);
    // TODO: Use rn-fetch-blob or similar to actually download the file
  };

  const deleteFile = (fileId) => {
    Alert.alert('Delete file', `Would delete file with ID: ${fileId}`);
    // TODO: Implement delete API call
  };

  const renderFile = (file) => (
    <View key={file._id} style={styles.fileItem}>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
        onPress={() => openFile(file.img)}
      >
        <Icon name="file-outline" size={20} color="#555" />
        <Text style={styles.fileName}>{file.fileName}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setSelectedFile(file)}>
        <Icon name="dots-vertical" size={22} color="#888" />
      </TouchableOpacity>
    </View>
  );

  const renderFolder = ({ item }) => {
    const isExpanded = expandedFolders.includes(item._id);
    return (
      <View style={styles.folderContainer}>
        <TouchableOpacity
          onPress={() => toggleFolder(item._id)}
          style={styles.folderHeader}
        >
          <Icon
            name={isExpanded ? 'folder-open-outline' : 'folder-outline'}
            size={22}
            color="#333"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.folderName}>{item.folderName}</Text>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.fileList}>
            {item.files.map(renderFile)}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#666" />
        <Text>Loading files...</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={renderFolder}
        contentContainerStyle={styles.container}
      />

      {/* Modal for File Options */}
      <Modal
        transparent
        animationType="fade"
        visible={!!selectedFile}
        onRequestClose={() => setSelectedFile(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setSelectedFile(null)}
          activeOpacity={1}
        >
          <View style={styles.popupMenu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                openFile(selectedFile.img);
                setSelectedFile(null);
              }}
            >
              <Icon name="link-variant" size={18} color="#4F46E5" />
              <Text style={[styles.menuText, { color: '#4F46E5' }]}>Link</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                downloadFile(selectedFile.img);
                setSelectedFile(null);
              }}
            >
              <Icon name="download" size={18} color="#333" />
              <Text style={styles.menuText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                deleteFile(selectedFile._id);
                setSelectedFile(null);
              }}
            >
              <Icon name="delete-outline" size={18} color="#DC2626" />
              <Text style={[styles.menuText, { color: '#DC2626' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  folderContainer: {
    marginBottom: 12,
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  fileList: {
    marginTop: 6,
    paddingLeft: 30,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  fileName: {
    marginLeft: 10,
    fontSize: 14,
    color: '#444',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupMenu: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    width: 180,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  menuText: {
    fontSize: 15,
    marginLeft: 10,
  },
});

export default FileExplorer;
