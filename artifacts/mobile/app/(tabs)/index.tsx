import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BusinessCard } from "@/components/BusinessCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";
import { api } from "@/services/base44";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { totalItems } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: businesses = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["businesses", selectedCategory],
    queryFn: () => api.businesses.list(selectedCategory ?? undefined),
  });

  const filtered = searchQuery.trim()
    ? businesses.filter((b) =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : businesses;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 + 84 : 84;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.brand, { color: colors.primary }]}>TiliGo</Text>
            <Text style={[styles.tagline, { color: colors.mutedForeground }]}>Dërgesa më e shpejtë</Text>
          </View>
          <TouchableOpacity
            style={[styles.cartBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/cart" as never)}
            activeOpacity={0.85}
          >
            <Feather name="shopping-bag" size={20} color="#fff" />
            {totalItems > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: "#fff" }]}>
                <Text style={[styles.cartBadgeText, { color: colors.primary }]}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Kërko restorante, produkte..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
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
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="search" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nuk u gjetën dyqane</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              {searchQuery ? "Provo me fjalë tjera" : "Nuk ka dyqane aktive në këtë kategori"}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Dyqane{" "}
                <Text style={{ color: colors.primary }}>
                  {selectedCategory ? `· ${selectedCategory}` : "të Hapura"}
                </Text>
              </Text>
              <Text style={[styles.count, { color: colors.mutedForeground }]}>({filtered.length})</Text>
            </View>
            {filtered.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  brand: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  tagline: { fontSize: 12, marginTop: 1 },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: { fontSize: 10, fontWeight: "800" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  list: { padding: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  count: { fontSize: 14, fontWeight: "500" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyDesc: { fontSize: 14, textAlign: "center" },
});
