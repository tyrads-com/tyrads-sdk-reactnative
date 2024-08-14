import { Button, StyleSheet, View } from 'react-native';
import Tyrads from '@tyrads.com/tyrads-sdk';
export default function App() {
  const handleButtonClick = () => {
    console.log('Button Clicked');
    Tyrads.init('', '');
    Tyrads.loginUser('');
    Tyrads.showOffers();
  };
  return (
    <View style={styles.container}>
      <Button title="Calculate" onPress={handleButtonClick} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
