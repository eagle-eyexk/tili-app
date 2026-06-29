import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

import { useColors } from "@/hooks/useColors";

export const CATEGORIES = [
  { id: null, label: "Të gjitha", emoji: "🏠" },
  { id: "Pica", label: "Pica", emoji: "🍕" },
  { id: "Burgera", label: "Burgera", emoji: "🍔" },
  { id: "Sushi", label: "Sushi", emoji: "🍣" },
  { id: "Supermarket", label: "Supermarket", emoji: "🛒" },
  { id: "Farmaci", label: "Farmaci", emoji: "💊" },
  { id: "Kafe", label: "Kafe", emoji: "☕" },
  { id: "Ushqim", label: "Ushqim", emoji: "🍽️" },
  { id: "Restorante", label: "Restorante", emoji: "🏪" },
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
                shadowColor: active ? colors.primary : "#000",
                shadowOpacity: active ? 0.3 : 0.06,
                shadowRadius: active ? 6 : 3,
                shadowOffset: { width: 0, height: active ? 2 : 1 },
                elevation: active ? 4 : 1,
              },
            ]}
            onPress={() => onSelect(cat.id)}
            activeOpacity={0.75}
          >
            <Text style={styles.emoji}>{cat.emoji}</Text>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 50,
    borderWidth: 1,
  },
  emoji: { fontSize: 14 },
  label: { fontSize: 13, fontWeight: "600" },
});
