import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import FileUpload from './Componnet/Documnet/FileUpload'; // adjust path if different

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>App</Text>
      <FileUpload />
    </View>
  );
};

export default App;

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
});
