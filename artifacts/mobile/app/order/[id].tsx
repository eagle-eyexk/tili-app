import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
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

const logoSource = require("@/assets/images/logo.jpg");

const STEPS = [
  { key: "placed",   label: "Porositur",  icon: "clipboard",  desc: "Porosia juaj u vendos me sukses", color: "#3B82F6" },
  { key: "accepted", label: "Pranuar",    icon: "check",       desc: "Biznesi ka pranuar porosinë",    color: "#F59E0B" },
  { key: "ready",    label: "Gati",       icon: "package",     desc: "Porosia është gati për korrjerin", color: "#EAB308" },
  { key: "assigned", label: "Caktuar",    icon: "user-check",  desc: "Korriteri u caktua për dërgimin", color: "#8B5CF6" },
  { key: "active",   label: "Në rrugë",   icon: "truck",       desc: "Korriteri është në rrugë drejt jush", color: "#22C55E" },
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

  const topInset = Platform.OS === "web" ? 0 : insets.top;
  const botInset = Platform.OS === "web" ? 34 : insets.bottom;

  let items: ParsedOrderItem[] = [];
  try { if (order) items = JSON.parse(order.items); } catch {}

  const currentStepIdx = STEPS.findIndex((s) => s.key === order?.status);
  const currentStep = STEPS[currentStepIdx];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header gradient */}
      <LinearGradient
        colors={currentStep ? [currentStep.color, currentStep.color + "CC"] : ["#22C55E", "#16A34A"]}
        style={[styles.headerGrad, { paddingTop: topInset + 14 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.headerLogoWrap}>
              <Image source={logoSource} style={styles.headerLogo} contentFit="contain" />
            </View>
            <Text style={styles.headerTitle}>Gjurmim i Porosisë</Text>
          </View>
          <TouchableOpacity onPress={() => refetch()} disabled={isRefetching} style={styles.refreshBtn}>
            {isRefetching ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="refresh-cw" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Current status hero */}
        {!isLoading && order && currentStep && (
          <View style={styles.statusHero}>
            <View style={[styles.statusIconBig, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Feather name={currentStep.icon as never} size={36} color="#fff" />
            </View>
            <Text style={styles.statusLabel}>{currentStep.label}</Text>
            <Text style={styles.statusDesc}>{currentStep.desc}</Text>
          </View>
        )}
      </LinearGradient>

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
          {/* Progress tracker */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Hapat e Dërgimit</Text>
            {STEPS.map((step, idx) => {
              const done = idx <= currentStepIdx;
              const active = idx === currentStepIdx;
              return (
                <View key={step.key} style={styles.step}>
                  <View style={styles.stepLeft}>
                    <View style={[styles.stepIcon, {
                      backgroundColor: done ? step.color : colors.muted,
                      borderWidth: active ? 2.5 : 0,
                      borderColor: active ? step.color + "44" : "transparent",
                    }]}>
                      <Feather name={step.icon as never} size={14} color={done ? "#fff" : colors.mutedForeground} />
                    </View>
                    {idx < STEPS.length - 1 && (
                      <View style={[styles.stepLine, { backgroundColor: idx < currentStepIdx ? step.color : colors.border }]} />
                    )}
                  </View>
                  <View style={[styles.stepContent, idx < STEPS.length - 1 ? { paddingBottom: 20 } : {}]}>
                    <Text style={[styles.stepLabel, {
                      color: active ? step.color : done ? colors.foreground : colors.mutedForeground,
                      fontWeight: active ? "800" : done ? "600" : "400",
                    }]}>
                      {step.label}
                    </Text>
                    <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>{step.desc}</Text>
                  </View>
                  {active && (
                    <View style={[styles.activePulse, { backgroundColor: step.color }]} />
                  )}
                </View>
              );
            })}
          </View>

          {/* Business */}
          {business && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Dyqani</Text>
              <View style={styles.bizRow}>
                {business.logo && (
                  <Image source={{ uri: business.logo }} style={styles.bizLogo} contentFit="cover" />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bizName, { color: colors.foreground }]}>{business.name}</Text>
                  {business.address && (
                    <Text style={[styles.bizAddr, { color: colors.mutedForeground }]}>{business.address}</Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Delivery info */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Informacioni i Dërgimit</Text>
            <InfoRow icon="user" value={order.customer_name} colors={colors} />
            <InfoRow icon="phone" value={order.customer_phone} colors={colors} />
            <InfoRow icon="map-pin" value={order.delivery_address} colors={colors} />
            {order.notes ? <InfoRow icon="message-circle" value={order.notes} colors={colors} /> : null}
          </View>

          {/* Items */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Produktet</Text>
            {items.map((item, idx) => (
              <View key={idx} style={[styles.itemRow, { borderTopColor: colors.border, borderTopWidth: idx > 0 ? 1 : 0 }]}>
                <View style={[styles.qtyBadge, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.qtyText, { color: colors.primaryDark }]}>{item.quantity}×</Text>
                </View>
                <Text style={[styles.itemName, { color: colors.foreground, flex: 1 }]}>{item.name}</Text>
                <Text style={[styles.itemPrice, { color: colors.primary }]}>€{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Summary */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Rezymeja Financiare</Text>
            <SumRow label="Subtotali" value={`€${order.subtotal?.toFixed(2) ?? "—"}`} colors={colors} />
            <SumRow label="Tarifa e dërgimit" value={`€${order.delivery_fee?.toFixed(2) ?? "—"}`} colors={colors} />
            {order.discount > 0 && (
              <SumRow label="Zbritja" value={`−€${order.discount.toFixed(2)}`} colors={colors} isGreen />
            )}
            <SumRow label="Mënyra e pagesës" value={order.payment_method === "cash" ? "Para në dorë" : "Kartë"} colors={colors} />
            <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.foreground }]}>Totali</Text>
              <Text style={[styles.totalVal, { color: colors.primary }]}>€{order.total?.toFixed(2) ?? "—"}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.homeBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace("/" as never)}
            activeOpacity={0.85}
          >
            <Feather name="home" size={16} color="#fff" />
            <Text style={styles.homeBtnText}>Kthehu në Kryefaqje</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

function InfoRow({ icon, value, colors }: { icon: string; value: string; colors: ReturnType<typeof import("@/hooks/useColors").useColors> }) {
  return (
    <View style={[ir.row]}>
      <View style={[ir.iconWrap, { backgroundColor: colors.accent }]}>
        <Feather name={icon as never} size={14} color={colors.primary} />
      </View>
      <Text style={[ir.text, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

function SumRow({ label, value, colors, isGreen }: { label: string; value: string; colors: ReturnType<typeof import("@/hooks/useColors").useColors>; isGreen?: boolean }) {
  return (
    <View style={sr.row}>
      <Text style={[sr.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[sr.val, { color: isGreen ? colors.primary : colors.foreground }]}>{value}</Text>
    </View>
  );
}

const ir = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  iconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 1 },
  text: { flex: 1, fontSize: 14, paddingTop: 6 },
});

const sr = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { fontSize: 14 },
  val: { fontSize: 14, fontWeight: "600" },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerGrad: { paddingHorizontal: 16, paddingBottom: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerLogoWrap: { width: 28, height: 28, borderRadius: 7, backgroundColor: "#fff", overflow: "hidden", padding: 2 },
  headerLogo: { width: "100%", height: "100%" },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  refreshBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  statusHero: { alignItems: "center", gap: 8 },
  statusIconBig: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  statusLabel: { color: "#fff", fontSize: 22, fontWeight: "800" },
  statusDesc: { color: "rgba(255,255,255,0.85)", fontSize: 13, textAlign: "center" },
  scroll: { padding: 16, gap: 12 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16 },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 14 },
  step: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  stepLeft: { alignItems: "center", width: 34 },
  stepIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  stepLine: { width: 2, flex: 1, minHeight: 16, marginTop: 4 },
  stepContent: { flex: 1, paddingTop: 7 },
  stepLabel: { fontSize: 14, marginBottom: 2 },
  stepDesc: { fontSize: 12 },
  activePulse: { width: 8, height: 8, borderRadius: 4, marginTop: 13 },
  bizRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  bizLogo: { width: 48, height: 48, borderRadius: 12 },
  bizName: { fontSize: 15, fontWeight: "700" },
  bizAddr: { fontSize: 12, marginTop: 2 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  qtyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  qtyText: { fontSize: 12, fontWeight: "800" },
  itemName: { fontSize: 14 },
  itemPrice: { fontSize: 14, fontWeight: "700" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 12, marginTop: 4, borderTopWidth: 1 },
  totalLabel: { fontSize: 16, fontWeight: "700" },
  totalVal: { fontSize: 18, fontWeight: "800" },
  homeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 16 },
  homeBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
