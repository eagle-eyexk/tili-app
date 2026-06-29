import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { Order, ParsedOrderItem } from "@/types";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  placed:   { label: "Porositur",  color: "#2563EB", bg: "#DBEAFE", icon: "clock" },
  accepted: { label: "Pranuar",   color: "#D97706", bg: "#FEF3C7", icon: "check" },
  ready:    { label: "Gati",      color: "#CA8A04", bg: "#FEF9C3", icon: "package" },
  assigned: { label: "Caktuar",   color: "#7C3AED", bg: "#EDE9FE", icon: "user" },
  active:   { label: "Në rrugë",  color: "#0D9488", bg: "#CCFBF1", icon: "truck" },
  delivered:{ label: "Dorëzuar",  color: "#15803D", bg: "#DCFCE7", icon: "check-circle" },
};

interface Props {
  order: Order;
  businessName?: string;
}

export function OrderCard({ order, businessName }: Props) {
  const colors = useColors();
  const router = useRouter();
  const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: colors.mutedForeground, bg: colors.muted, icon: "circle" };

  let parsedItems: ParsedOrderItem[] = [];
  try { parsedItems = JSON.parse(order.items); } catch {}

  const date = new Date(order.created_date);
  const dateStr = date.toLocaleDateString("sq-AL", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.85}
      onPress={() => router.push(`/order/${order.id}` as never)}
    >
      <View style={styles.top}>
        <View style={styles.titleRow}>
          <Text style={[styles.biz, { color: colors.foreground }]} numberOfLines={1}>
            {businessName ?? "Porosia"}
          </Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>{dateStr}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Feather name={cfg.icon as never} size={11} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      <Text style={[styles.items, { color: colors.mutedForeground }]} numberOfLines={2}>
        {parsedItems.map((i) => `${i.quantity}x ${i.name}`).join(" · ")}
      </Text>

      <View style={[styles.bottom, { borderTopColor: colors.border }]}>
        <Text style={[styles.total, { color: colors.foreground }]}>
          Totali: <Text style={{ color: colors.primary, fontWeight: "700" }}>€{order.total?.toFixed(2)}</Text>
        </Text>
        <View style={styles.arrow}>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  titleRow: { flex: 1, marginRight: 8 },
  biz: { fontSize: 15, fontWeight: "700" },
  date: { fontSize: 12, marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 12, fontWeight: "700" },
  items: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  bottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTopWidth: 1 },
  total: { fontSize: 14 },
  arrow: {},
});
