import React, { type ReactNode } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';

interface CustomCardProps {
  children: ReactNode;
  style?: ViewStyle;
}

const CustomCard: React.FC<CustomCardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingTop: 6,
    paddingBottom: 5,
    shadowColor: '#000',
    alignSelf: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.24,
    shadowRadius: 3.5,
    elevation: 4,
  },
});

export default CustomCard;