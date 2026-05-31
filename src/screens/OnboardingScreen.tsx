import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { Ionicons } from "@expo/vector-icons";

type OnboardingScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Onboarding"
>;

const slides = [
  {
    id: 1,
    title: "Welcome to SeamClone",
    description: "High-precision technical scanning for garment manufacturing.",
    icon: "shirt-outline" as const,
  },
  {
    id: 2,
    title: "Scale Reference",
    description:
      "Place a standard card (credit card, ruler, or any known-size object) next to the garment for scale. This allows our engine to map pixels to millimeters with 99.9% accuracy.",
    icon: "credit-outline" as const,
    details: [
      "Position the reference object clearly in frame",
      "Ensure uniform lighting",
      "Keep the garment flat and unwrinkled",
    ],
  },
  {
    id: 3,
    title: "Capture & Rectify",
    description:
      "Our AI handles perspective correction and edge detection. Adjust refinement settings to get perfect pattern pieces.",
    icon: "camera-outline" as const,
  },
  {
    id: 4,
    title: "Export & Print",
    description:
      "Export pattern pieces as tiled PDFs for A4, Letter, or A0 printing. Print and measure to validate accuracy.",
    icon: "document-outline" as const,
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  navigation,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.replace("MainApp");
    }
  };

  const handleSkip = () => {
    navigation.replace("MainApp");
  };

  const slide = slides[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>
        <Text style={styles.slideCounter}>
          {currentSlide + 1} / {slides.length}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={slide.icon} size={80} color="#0066CC" />
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>

        {slide.details && (
          <View style={styles.detailsContainer}>
            {slide.details.map((detail, index) => (
              <View key={index} style={styles.detailItem}>
                <Text style={styles.detailBullet}>•</Text>
                <Text style={styles.detailText}>{detail}</Text>
              </View>
            ))}
          </View>
        )}

        {currentSlide === 1 && (
          <View style={styles.referenceBox}>
            <Text style={styles.referenceTitle}>Reference Object Examples</Text>
            <View style={styles.referenceExample}>
              <Text style={styles.referenceName}>Credit Card</Text>
              <Text style={styles.referenceSize}>85.6mm × 53.98mm</Text>
            </View>
            <View style={styles.referenceExample}>
              <Text style={styles.referenceName}>A4 Paper Edge</Text>
              <Text style={styles.referenceSize}>210mm (width)</Text>
            </View>
            <View style={styles.referenceExample}>
              <Text style={styles.referenceName}>Ruler</Text>
              <Text style={styles.referenceSize}>Any standard size</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.progressBar}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentSlide && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color="#fff"
            style={{ marginLeft: 8 }}
          />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  skipButton: {
    fontSize: 16,
    color: "#0066CC",
    fontWeight: "600",
  },
  slideCounter: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  detailsContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  detailBullet: {
    fontSize: 18,
    color: "#0066CC",
    marginRight: 8,
    fontWeight: "bold",
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  referenceBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
  },
  referenceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  referenceExample: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  referenceName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  referenceSize: {
    fontSize: 12,
    color: "#666",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  progressBar: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: "#0066CC",
    width: 24,
  },
  button: {
    backgroundColor: "#0066CC",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
