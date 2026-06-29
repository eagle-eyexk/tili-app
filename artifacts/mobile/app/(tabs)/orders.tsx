import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OrderCard } from "@/components/OrderCard";
import { useGuest } from "@/context/GuestContext";
import { useColors } from "@/hooks/useColors";
import { api } from "@/services/base44";

const logoSource = require("@/assets/images/logo.jpg");

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { guestId } = useGuest();

  const { data: orders = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["orders", guestId],
    queryFn: () => (guestId ? api.orders.list(guestId) : Promise.resolve([])),
    enabled: !!guestId,
    refetchInterval: 30_000,
  });

  const topPad = Platform.OS === "web" ? 0 : insets.top;
  const botPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const activeOrders = orders.filter((o) =>
    ["placed", "accepted", "ready", "assigned", "active"].includes(o.status)
  );
  const pastOrders = orders.filter((o) =>
    !["placed", "accepted", "ready", "assigned", "active"].includes(o.status)
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 14, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.logoRow}>
          <View style={[styles.logoWrap, { borderColor: colors.border }]}>
            <Image source={logoSource} style={styles.logo} contentFit="contain" />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Porositë Mia</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: botPad }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}>
              <Feather name="clock" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nuk keni porosi</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Porositë tuaja nga TiliGo do të shfaqen këtu
            </Text>
          </View>
        ) : (
          <>
            {activeOrders.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Aktive</Text>
                </View>
                {activeOrders.map((o) => (
                  <OrderCard key={o.id} order={o} />
                ))}
              </>
            )}
            {pastOrders.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
                    Të kaluara
                  </Text>
                </View>
                {pastOrders.map((o) => (
                  <OrderCard key={o.id} order={o} />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: 1, paddingHorizontal: 16, paddingBottom: 16 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoWrap: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, overflow: "hidden", padding: 2 },
  logo: { width: "100%", height: "100%" },
  title: { fontSize: 22, fontWeight: "800" },
  list: { padding: 16 },
  center: { alignItems: "center", justifyContent: "center", paddingTop: 80 },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 14 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptyDesc: { fontSize: 14, textAlign: "center", paddingHorizontal: 40, lineHeight: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12, marginTop: 4 },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
});
