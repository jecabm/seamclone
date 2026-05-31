import { lazy, Suspense } from 'react';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { ActivityIndicator, Platform, View } from 'react-native';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';

import { DevClientRequiredScreen } from './src/components/DevClientRequiredScreen';

const RootNavigator = lazy(async () => {
  const module = await import('./src/navigation/RootNavigator');

  return { default: module.RootNavigator };
});

export default function App() {
  const isExpoGoOnNative =
    Platform.OS !== 'web' && Constants.appOwnership === 'expo';

  if (isExpoGoOnNative) {
    return <DevClientRequiredScreen />;
  }

  return (
    <>
      <Suspense
        fallback={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
            <ActivityIndicator size="large" color="#0066CC" />
          </View>
        }
      >
        <RootNavigator />
      </Suspense>
      <StatusBar style="auto" />
    </>
  );
}
