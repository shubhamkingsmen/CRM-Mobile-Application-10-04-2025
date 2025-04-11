import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Dimensions,
} from 'react-native';
import FileUpload from './Componnet/Documnet/FileUpload';
import FileExplorer from './Componnet/Documnet/FileExplorer';

const { width } = Dimensions.get('window');

const App = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.section}>
            <FileUpload />
            <FileExplorer />
          </View>
        }
       
        contentContainerStyle={styles.scrollContainer}
      />
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2f5f9',
  },
  scrollContainer: {
    padding: width * 0.05,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
});
