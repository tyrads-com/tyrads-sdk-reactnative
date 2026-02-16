import React from 'react';
import { Modal, Pressable, View, StyleSheet } from 'react-native';

interface CardAlertProps {
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export const CardAlert: React.FC<CardAlertProps> = ({
  visible,
  onClose,
  children,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.fullscreen}>
        <Pressable style={styles.overlay} onPress={onClose} />

        <View style={styles.card}>
          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  card: {
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
});
