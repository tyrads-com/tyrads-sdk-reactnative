import { Button, StyleSheet, View } from 'react-native';
import Tyrads from '@tyrads.com/tyrads-sdk';
export default function App() {
  const handleButtonClick = () => {
    console.log('Button Clicked');
    Tyrads.init('', '');
    Tyrads.loginUser('');
    Tyrads.showOffers({ launchMode: 3 });
  };
  return (
    <View style={styles.container}>
      <Button title="Show Offers" onPress={handleButtonClick} />
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
