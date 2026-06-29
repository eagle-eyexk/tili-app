import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
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

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { guestId } = useGuest();

  const { data: orders = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["orders", guestId],
    queryFn: () => (guestId ? api.orders.list(guestId) : Promise.resolve([])),
    enabled: !!guestId,
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 + 84 : 84;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Porositë Mia</Text>
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
            <Feather name="clock" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nuk keni porosi</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Porositë tuaja do të shfaqen këtu
            </Text>
          </View>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "800" },
  list: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyDesc: { fontSize: 14, textAlign: "center", paddingHorizontal: 40 },
});
