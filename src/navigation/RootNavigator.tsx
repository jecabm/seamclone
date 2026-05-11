import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, View } from "react-native";

import { RootStackParamList } from "../types";
import { authService } from "../services/firebase";

// Screens
import { LoginScreen } from "../screens/LoginScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { LibraryScreen } from "../screens/LibraryScreen";
import { NewScanScreen } from "../screens/NewScanScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { ProjectDetailScreen } from "../screens/ProjectDetailScreen";
import { ScanningInterfaceScreen } from "../screens/ScanningInterfaceScreen";
import { RectificationScreen } from "../screens/RectificationScreen";
import { PatternPiecesScreen } from "../screens/PatternPiecesScreen";
import { ExportSettingsScreen } from "../screens/ExportSettingsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const LibraryStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Library" component={LibraryScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen
        name="ScanningInterface"
        component={ScanningInterfaceScreen}
      />
      <Stack.Screen name="Rectification" component={RectificationScreen} />
      <Stack.Screen name="PatternPieces" component={PatternPiecesScreen} />
      <Stack.Screen name="ExportSettings" component={ExportSettingsScreen} />
    </Stack.Navigator>
  );
};

const MainAppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "folder-outline";

          if (route.name === "Library") {
            iconName = focused ? "folder" : "folder-outline";
          } else if (route.name === "NewScan") {
            iconName = focused ? "camera" : "camera-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#0066CC",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#eee",
          backgroundColor: "#fff",
          paddingBottom: 6,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen
        name="Library"
        component={LibraryStack}
        options={{
          tabBarLabel: "Library",
        }}
      />
      <Tab.Screen
        name="NewScan"
        component={NewScanScreen}
        options={{
          tabBarLabel: "New Scan",
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Settings",
        }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: "#fff" },
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          </>
        ) : (
          <Stack.Screen name="MainApp" component={MainAppTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
