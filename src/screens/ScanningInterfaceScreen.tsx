import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { Ionicons } from "@expo/vector-icons";

type ScanningInterfaceProps = NativeStackScreenProps<
  RootStackParamList,
  "ScanningInterface"
>;

export const ScanningInterfaceScreen: React.FC<ScanningInterfaceProps> = ({
  route,
  navigation,
}) => {
  const { projectId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Camera Interface</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraPlaceholder}>
        <Ionicons
          name="camera-outline"
          size={80}
          color="rgba(255,255,255,0.3)"
        />
        <Text style={styles.placeholderText}>
          Phase 3: Scanning Interface{"\n"}Camera view with bounding box{"\n"}
          and reference object detection
        </Text>
      </View>

      <View style={styles.boundingBox}>
        <Text style={styles.boundingBoxText}>Bounding Box</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.instructionBox}>
          <Ionicons name="information-circle-outline" size={20} color="#fff" />
          <Text style={styles.instructionText}>
            Place a standard card next to the garment for scale
          </Text>
        </View>

        <TouchableOpacity
          style={styles.captureButton}
          onPress={() =>
            navigation.navigate("Rectification", { projectId, scanId: "demo" })
          }
        >
          <Ionicons name="camera" size={32} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionIcon}>
          <Ionicons name="flash-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 12,
    marginVertical: 40,
    borderRadius: 8,
  },
  placeholderText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
  },
  boundingBox: {
    position: "absolute",
    top: "50%",
    left: "10%",
    width: "80%",
    height: "50%",
    borderWidth: 2,
    borderColor: "#00FFFF",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  boundingBoxText: {
    color: "#00FFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  instructionBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  instructionText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionIcon: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
  },
});
