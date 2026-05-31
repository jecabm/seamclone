import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Slider,
  Switch,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { Ionicons } from "@expo/vector-icons";

type RectificationScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Rectification"
>;

export const RectificationScreen: React.FC<RectificationScreenProps> = ({
  route,
  navigation,
}) => {
  const { projectId } = route.params;
  const [edgeRefinement, setEdgeRefinement] = useState(50);
  const [seamAllowance, setSeamAllowance] = useState(15);
  const [addSeamAllowance, setAddSeamAllowance] = useState(false);

  const handleConfirm = () => {
    navigation.navigate("PatternPieces", { projectId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>2D Rectification</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.previewSection}>
          <View style={styles.previewBox}>
            <Ionicons name="image-outline" size={80} color="#ccc" />
            <Text style={styles.previewText}>Flattened Image Preview</Text>
            <Text style={styles.previewSubtext}>
              Perspective correction applied
            </Text>
          </View>
        </View>

        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>EDGE REFINEMENT</Text>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>
              Sensitivity: {Math.round(edgeRefinement)}%
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={edgeRefinement}
              onValueChange={setEdgeRefinement}
              minimumTrackTintColor="#0066CC"
              maximumTrackTintColor="#ddd"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>LOW SENSITIVITY</Text>
              <Text style={styles.sliderLabelText}>HIGH PRECISION</Text>
            </View>
          </View>

          <View style={styles.edgePreview}>
            <Ionicons name="grid-outline" size={60} color="#ccc" />
            <Text style={styles.edgePreviewText}>Edge Detection Preview</Text>
          </View>
        </View>

        <View style={styles.controlsSection}>
          <View style={styles.toggleContainer}>
            <View>
              <Text style={styles.toggleTitle}>Add Seam Allowance</Text>
              <Text style={styles.toggleSubtitle}>Global offset: 1.5cm</Text>
            </View>
            <Switch
              value={addSeamAllowance}
              onValueChange={setAddSeamAllowance}
              trackColor={{ false: "#ccc", true: "#81C784" }}
              thumbColor={addSeamAllowance ? "#4CAF50" : "#fff"}
            />
          </View>

          {addSeamAllowance && (
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>
                Seam Allowance: {seamAllowance}mm
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={5}
                maximumValue={50}
                value={seamAllowance}
                onValueChange={setSeamAllowance}
                minimumTrackTintColor="#0066CC"
                maximumTrackTintColor="#ddd"
              />
            </View>
          )}
        </View>

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#0066CC"
          />
          <Text style={styles.infoText}>
            Adjust these settings to ensure accurate pattern extraction. Preview
            updates in real-time.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.buttonSecondary}>
          <Ionicons name="arrow-back-outline" size={20} color="#0066CC" />
          <Text style={styles.buttonSecondaryText}>Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleConfirm}>
          <Ionicons name="checkmark-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  previewSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  previewBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  previewText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 12,
  },
  previewSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  controlsSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  slider: {
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  sliderLabelText: {
    fontSize: 11,
    color: "#999",
    fontWeight: "500",
  },
  edgePreview: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    paddingVertical: 32,
    alignItems: "center",
    marginTop: 16,
  },
  edgePreviewText: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: "#999",
  },
  infoBox: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 12,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#0066CC",
    marginLeft: 8,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  button: {
    flex: 1,
    backgroundColor: "#0066CC",
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  buttonSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#0066CC",
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonSecondaryText: {
    color: "#0066CC",
    fontWeight: "600",
    fontSize: 14,
  },
});
