import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

const Layout = ({ children }) => {
  return (
    <ImageBackground
      source={require('../../assets/images/backgroundimg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default Layout;