import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFetchBlob from 'rn-fetch-blob';
import Modal from 'react-native-modal';
import LinkModel from './LinkModel';

const FileExplorer = () => {
  const [data, setData] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [documentLinked, setDocumentLinked] = useState(false); 

  const openLinkModalHandler = () => setIsLinkModalOpen(true); 
  const closeLinkModalHandler = () => setIsLinkModalOpen(false);
  const closeModalHandler = () => setIsModalVisible(false);

  useEffect(() => {
    requestStoragePermission();
    fetchData();
  }, []);

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to download files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Denied',
            'Download might not work without storage permission.',
          );
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch('http://10.0.2.2:5001/api/document');
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Fetch Error:', error);
      Alert.alert('Error', 'Failed to load files.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = folderId => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId],
    );
  };

  const openModal = file => {
    setSelectedFile(file);
    setIsModalVisible(true);
  };

  const openFile = async url => {
    const adjustedUrl =
      Platform.OS === 'android' && url.includes('127.0.0.1')
        ? url.replace('127.0.0.1', '10.0.2.2')
        : url;

    try {
      const supported = await Linking.canOpenURL(adjustedUrl);
      if (supported) {
        await Linking.openURL(adjustedUrl);
      } else {
        Alert.alert('Unsupported', 'Cannot open this file type.');
      }
    } catch (err) {
      console.error('Error opening file:', err);
      Alert.alert('Error', 'Something went wrong while opening the file.');
    }
  };

  const downloadFile = async url => {
    try {
      const {config, fs} = RNFetchBlob;
      const date = new Date();
      const fileExt = url.split('.').pop();
      const fileName = `file_${Math.floor(
        date.getTime() + date.getSeconds() / 2,
      )}.${fileExt}`;
      const adjustedUrl =
        Platform.OS === 'android' && url.includes('127.0.0.1')
          ? url.replace('127.0.0.1', '10.0.2.2')
          : url;

      const pathToDir = fs.dirs.DownloadDir;

      const options = {
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: `${pathToDir}/${fileName}`,
          description: 'Downloading file...',
        },
      };

      config(options)
        .fetch('GET', adjustedUrl)
        .then(res => {
          Alert.alert('Download Complete', `File saved to:\n${res.path()}`);
        })
        .catch(err => {
          console.error('Download error:', err);
          Alert.alert('Error', 'Failed to download file.');
        });
    } catch (err) {
      console.error('Download exception:', err);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  const deleteFile = async fileId => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this file?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `http://10.0.2.2:5001/api/document/delete/${fileId}`,
                {method: 'DELETE'},
              );

              const text = await response.text();
              const data = text ? JSON.parse(text) : null;

              if (response.ok) {
                Alert.alert('Success', data?.message || 'Deleted');
                fetchData();
              } else {
                Alert.alert('Error', data?.message || 'Failed to delete file');
              }
            } catch (err) {
              console.error('Delete error:', err);
              Alert.alert('Error', 'Error deleting file.');
            }
          },
        },
      ],
    );
  };

  const renderFile = file => (
    <View key={file._id} style={styles.fileItem}>
      <TouchableOpacity
        style={{flexDirection: 'row', alignItems: 'center', flex: 1}}
        onPress={() => openFile(file.img)}>
        <Icon name="file-outline" size={20} color="#555" />
        <Text style={styles.fileName}>{file.fileName}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => openModal(file)}>
        <Icon name="dots-vertical" size={22} color="#888" />
      </TouchableOpacity>
    </View>
  );

  const renderFolder = ({item}) => {
    const isExpanded = expandedFolders.includes(item._id);
    return (
      <View style={styles.folderContainer}>
        <TouchableOpacity
          onPress={() => toggleFolder(item._id)}
          style={styles.folderHeader}>
          <Icon
            name={isExpanded ? 'folder-open-outline' : 'folder-outline'}
            size={22}
            color="#333"
            style={{marginRight: 8}}
          />
          <Text style={styles.folderName}>{item.folderName}</Text>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.fileList}>{item.files.map(renderFile)}</View>
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
        keyExtractor={item => item._id}
        renderItem={renderFolder}
        contentContainerStyle={styles.container}
      />

      <LinkModel
        isOpen={isLinkModalOpen} 
        onClose={closeLinkModalHandler} 
        documentId={selectedFile?._id}  
        setLinkDocument={setDocumentLinked} 
      />

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeModalHandler}
        onBackButtonPress={closeModalHandler}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropOpacity={0.4}>
        <View style={styles.popupMenu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setIsLinkModalOpen(true); 
              closeModalHandler();  
            }}>
            <Icon name="link-variant" size={18} color="#4F46E5" />
            <Text style={[styles.menuText, { color: '#4F46E5' }]}>View Link</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              downloadFile(selectedFile?.img);
              closeModalHandler();
            }}>
            <Icon name="download" size={18} color="#333" />
            <Text style={styles.menuText}>Download</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              deleteFile(selectedFile?._id);
              closeModalHandler();
            }}>
            <Icon name="delete-outline" size={18} color="#DC2626" />
            <Text style={[styles.menuText, {color: '#DC2626'}]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  folderContainer: {
    marginBottom: 16,
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  folderName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  fileList: {
    paddingLeft: 16,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  fileName: {
    fontSize: 16,
    marginLeft: 8,
  },
  popupMenu: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
  },
});

export default FileExplorer;
