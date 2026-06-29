import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { api } from "@/services/base44";
import type { ParsedOrderItem } from "@/types";

const STEPS = [
  { key: "placed",   label: "Porositur",  icon: "clipboard", desc: "Porosia juaj u vendos" },
  { key: "accepted", label: "Pranuar",    icon: "check",      desc: "Biznesi pranoi porosinë" },
  { key: "ready",    label: "Gati",       icon: "package",    desc: "Porosia është gati" },
  { key: "assigned", label: "Caktuar",    icon: "user-check", desc: "Korrieri u caktua" },
  { key: "active",   label: "Në rrugë",   icon: "truck",      desc: "Korrieri është në rrugë" },
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: order, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["order", id],
    queryFn: () => api.orders.get(id!),
    enabled: !!id,
    refetchInterval: 15_000,
  });

  const { data: business } = useQuery({
    queryKey: ["business", order?.business_id],
    queryFn: () => api.businesses.get(order!.business_id),
    enabled: !!order?.business_id,
  });

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const botInset = Platform.OS === "web" ? 34 : insets.bottom;

  let items: ParsedOrderItem[] = [];
  try { if (order) items = JSON.parse(order.items); } catch {}

  const currentStepIdx = STEPS.findIndex((s) => s.key === order?.status);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: topInset + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Gjurmim i Porosisë</Text>
        <TouchableOpacity onPress={() => refetch()} disabled={isRefetching}>
          {isRefetching ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Feather name="refresh-cw" size={18} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !order ? (
        <View style={styles.center}>
          <Text style={{ color: colors.mutedForeground }}>Porosia nuk u gjet.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: botInset + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Status tracker */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Status i Porosisë</Text>
            {STEPS.map((step, idx) => {
              const done = idx <= currentStepIdx;
              const active = idx === currentStepIdx;
              return (
                <View key={step.key} style={styles.step}>
                  <View style={styles.stepLeft}>
                    <View style={[styles.stepIcon, { backgroundColor: done ? colors.primary : colors.muted }]}>
                      <Feather name={step.icon as never} size={14} color={done ? "#fff" : colors.mutedForeground} />
                    </View>
                    {idx < STEPS.length - 1 && (
                      <View style={[styles.stepLine, { backgroundColor: idx < currentStepIdx ? colors.primary : colors.border }]} />
                    )}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepLabel, { color: active ? colors.primary : done ? colors.foreground : colors.mutedForeground, fontWeight: active ? "700" : "500" }]}>
                      {step.label}
                    </Text>
                    <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>{step.desc}</Text>
                  </View>
                  {active && (
                    <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
                  )}
                </View>
              );
            })}
          </View>

          {/* Business info */}
          {business && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Dyqani</Text>
              <View style={styles.infoRow}>
                <Feather name="shopping-bag" size={15} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.foreground }]}>{business.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Feather name="map-pin" size={15} color={colors.mutedForeground} />
                <Text style={[styles.infoText, { color: colors.mutedForeground }]}>{business.address}</Text>
              </View>
            </View>
          )}

          {/* Delivery info */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Dorëzimi</Text>
            <View style={styles.infoRow}>
              <Feather name="user" size={15} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.foreground }]}>{order.customer_name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Feather name="phone" size={15} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.foreground }]}>{order.customer_phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Feather name="map-pin" size={15} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.foreground }]}>{order.delivery_address}</Text>
            </View>
          </View>

          {/* Items */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Produktet</Text>
            {items.map((item, idx) => (
              <View key={idx} style={[styles.itemRow, { borderTopColor: colors.border, borderTopWidth: idx > 0 ? 1 : 0 }]}>
                <View style={[styles.itemQty, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.itemQtyText, { color: colors.primary }]}>{item.quantity}x</Text>
                </View>
                <Text style={[styles.itemName, { color: colors.foreground, flex: 1 }]}>{item.name}</Text>
                <Text style={[styles.itemPrice, { color: colors.primary }]}>€{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Summary */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Rezymeja</Text>
            <SummaryRow label="Subtotali" value={`€${order.subtotal?.toFixed(2) ?? "—"}`} colors={colors} />
            <SummaryRow label="Dërgimi" value={`€${order.delivery_fee?.toFixed(2) ?? "—"}`} colors={colors} />
            {order.discount > 0 && (
              <SummaryRow label="Zbritja" value={`-€${order.discount.toFixed(2)}`} colors={colors} isGreen />
            )}
            <View style={[styles.totalLine, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.foreground }]}>Totali</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>€{order.total?.toFixed(2) ?? "—"}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.homeBtn, { borderColor: colors.primary }]}
            onPress={() => router.replace("/" as never)}
            activeOpacity={0.8}
          >
            <Feather name="home" size={16} color={colors.primary} />
            <Text style={[styles.homeBtnText, { color: colors.primary }]}>Kthehu në Kryefaqje</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

function SummaryRow({ label, value, colors, isGreen }: {
  label: string; value: string; colors: ReturnType<typeof useColors>; isGreen?: boolean;
}) {
  return (
    <View style={sr.row}>
      <Text style={[sr.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[sr.value, { color: isGreen ? colors.primary : colors.foreground }]}>{value}</Text>
    </View>
  );
}

const sr = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: "600" },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { width: 32 },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  scroll: { padding: 16, gap: 12 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16 },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 14 },
  step: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 0 },
  stepLeft: { alignItems: "center", width: 32 },
  stepIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  stepLine: { width: 2, flex: 1, minHeight: 20, marginTop: 4 },
  stepContent: { flex: 1, paddingBottom: 20, paddingTop: 6 },
  stepLabel: { fontSize: 14, marginBottom: 2 },
  stepDesc: { fontSize: 12 },
  activeDot: { width: 8, height: 8, borderRadius: 4, marginTop: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  infoText: { fontSize: 14, flex: 1 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  itemQty: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  itemQtyText: { fontSize: 12, fontWeight: "700" },
  itemName: { fontSize: 14 },
  itemPrice: { fontSize: 14, fontWeight: "700" },
  totalLine: { flexDirection: "row", justifyContent: "space-between", paddingTop: 12, marginTop: 4, borderTopWidth: 1 },
  totalLabel: { fontSize: 16, fontWeight: "700" },
  totalValue: { fontSize: 18, fontWeight: "800" },
  homeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  homeBtnText: { fontSize: 15, fontWeight: "700" },
});
