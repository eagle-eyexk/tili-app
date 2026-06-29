import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
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
      style={[styles.card, {
        backgroundColor: colors.card,
        shadowColor: "#000",
        shadowOpacity: 0.09,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }]}
      activeOpacity={0.9}
      onPress={() => router.push(`/business/${business.id}` as never)}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: business.cover_image || business.logo }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.badgeRow}>
          <View style={[styles.catBadge, { backgroundColor: "rgba(0,0,0,0.55)" }]}>
            <Text style={styles.catBadgeText}>{business.category}</Text>
          </View>
          <View style={[styles.openBadge, { backgroundColor: business.is_open ? "#16A34A" : "#DC2626" }]}>
            <View style={[styles.dot, { backgroundColor: business.is_open ? "#86EFAC" : "#FCA5A5" }]} />
            <Text style={styles.openText}>{business.is_open ? "Hapur" : "Mbyllur"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {business.name}
          </Text>
          <View style={styles.ratingRow}>
            <Feather name="star" size={12} color="#FBBF24" />
            <Text style={[styles.rating, { color: colors.foreground }]}>
              {business.rating?.toFixed(1) ?? "—"}
            </Text>
          </View>
        </View>

        {business.description ? (
          <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={1}>
            {business.description}
          </Text>
        ) : null}

        <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
          <View style={styles.stat}>
            <Feather name="clock" size={12} color={colors.mutedForeground} />
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>
              {business.delivery_time} min
            </Text>
          </View>
          <View style={[styles.bullet, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Feather name="truck" size={12} color={colors.mutedForeground} />
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>
              Dërgesa €{business.delivery_fee?.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.bullet, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>
              Min €{business.min_order}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  imageWrapper: { height: 180, position: "relative" },
  image: { width: "100%", height: "100%" },
  badgeRow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  catBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  catBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  openBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  openText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  body: { padding: 14 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
  name: { fontSize: 16, fontWeight: "700", flex: 1, marginRight: 8 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  rating: { fontSize: 13, fontWeight: "700" },
  desc: { fontSize: 13, marginBottom: 10 },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
    gap: 8,
  },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 12, fontWeight: "500" },
  bullet: { width: 3, height: 3, borderRadius: 2 },
});
