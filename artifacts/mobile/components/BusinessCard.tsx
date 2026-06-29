import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { Business } from "@/types";

interface Props {
  business: Business;
}

export function BusinessCard({ business }: Props) {
  const colors = useColors();
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.85}
      onPress={() => router.push(`/business/${business.id}` as never)}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: business.cover_image || business.logo }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.55)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>{business.category}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: business.is_open ? "#16A34A" : "#DC2626" }]}>
            <Text style={styles.badgeText}>{business.is_open ? "Hapur" : "Mbyllur"}</Text>
          </View>
        </View>
        <View style={styles.ratingBadge}>
          <Feather name="star" size={11} color="#FBBF24" />
          <Text style={styles.ratingText}>{business.rating?.toFixed(1) ?? "—"}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {business.name}
        </Text>
        {business.description ? (
          <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={1}>
            {business.description}
          </Text>
        ) : null}

        <View style={[styles.stats, { borderTopColor: colors.border }]}>
          <StatChip icon="clock" label={`${business.delivery_time} min`} colors={colors} />
          <StatChip icon="truck" label={`€${business.delivery_fee} dërgim`} colors={colors} />
          <StatChip icon="shopping-bag" label={`Min. €${business.min_order}`} colors={colors} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function StatChip({ icon, label, colors }: { icon: string; label: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={statStyles.row}>
      <Feather name={icon as never} size={12} color={colors.mutedForeground} />
      <Text style={[statStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  label: { fontSize: 12, fontWeight: "500" },
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  imageWrapper: { height: 170, position: "relative" },
  image: { width: "100%", height: "100%" },
  badges: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  ratingBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  info: { padding: 14 },
  name: { fontSize: 16, fontWeight: "700" },
  desc: { fontSize: 13, marginTop: 2 },
  stats: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    flexWrap: "wrap",
  },
});
