import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";

const CATEGORIES = [
  { id: null, label: "Të gjitha" },
  { id: "Pica", label: "Pica" },
  { id: "Burgera", label: "Burgera" },
  { id: "Sushi", label: "Sushi" },
  { id: "Supermarket", label: "Supermarket" },
  { id: "Farmaci", label: "Farmaci" },
  { id: "Kafe", label: "Kafe" },
  { id: "Ushqim", label: "Ushqim" },
  { id: "Restorante", label: "Restorante" },
];

interface Props {
  selected: string | null;
  onSelect: (cat: string | null) => void;
}

export function CategoryFilter({ selected, onSelect }: Props) {
  const colors = useColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((cat) => {
        const active = selected === cat.id;
        return (
          <TouchableOpacity
            key={String(cat.id)}
            style={[
              styles.pill,
              {
                backgroundColor: active ? colors.primary : colors.card,
                borderColor: active ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onSelect(cat.id)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.label,
                { color: active ? colors.primaryForeground : colors.foreground },
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 12, gap: 8, flexDirection: "row" },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: { fontSize: 13, fontWeight: "600" },
});
