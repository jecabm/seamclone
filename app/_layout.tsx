import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { RootNavigator } from '@/src/navigation/RootNavigator';

export default function RootLayout() {
  return (
    <>
      <RootNavigator />
      <StatusBar style="auto" />
    </>
  );
}
