import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BusinessCard } from "@/components/BusinessCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";
import { api } from "@/services/base44";

const logoSource = require("@/assets/images/logo.jpg");

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
        b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.description ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : businesses;

  const topPad = Platform.OS === "web" ? 0 : insets.top;
  const botPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: botPad }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        stickyHeaderIndices={[1]}
      >
        {/* HERO SECTION */}
        <LinearGradient
          colors={["#15803D", "#22C55E", "#4ADE80"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: topPad + 20 }]}
        >
          {/* Top row: logo + cart */}
          <View style={styles.heroTop}>
            <View style={styles.logoRow}>
              <View style={styles.logoWrapper}>
                <Image source={logoSource} style={styles.logoImg} contentFit="contain" />
              </View>
              <View>
                <Text style={styles.brandName}>TiliGo</Text>
                <Text style={styles.brandSub}>Dërgesa në Kosovë 🇽🇰</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.cartBtn}
              onPress={() => router.push("/cart" as never)}
              activeOpacity={0.85}
            >
              <Feather name="shopping-bag" size={20} color={colors.primary} />
              {totalItems > 0 && (
                <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.cartBadgeText}>{totalItems > 9 ? "9+" : totalItems}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Headline */}
          <View style={styles.heroCenter}>
            <Text style={styles.heroHeadline}>
              TiliGo —{" "}
              <Text style={{ color: "#F0FDF4" }}>Shpejt</Text>
              {", me Dashuri"}
            </Text>
            <Text style={styles.heroSub}>Dërgesa më e shpejtë në Kosovë 🇽🇰</Text>
          </View>

          {/* Search bar inside hero */}
          <View style={[styles.searchBar, { backgroundColor: "#fff" }]}>
            <Feather name="search" size={17} color="#94A3B8" />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder="Kërko restorante, produkte..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* STICKY CATEGORY ROW */}
        <View style={[styles.catSection, { backgroundColor: colors.background }]}>
          <View style={[styles.catHeader, { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 }]}>
            <Text style={[styles.catTitle, { color: colors.primary }]}>Kategoritë</Text>
            <Text style={[styles.catTitle, { color: colors.foreground }]}> Popullore</Text>
          </View>
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </View>

        {/* BUSINESS LISTINGS */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
                Duke ngarkuar dyqanet...
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="search" size={44} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {searchQuery ? "Nuk u gjetën dyqane" : "Nuk ka dyqane aktive"}
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
                {searchQuery ? "Provo me fjalë tjera" : "Provo me kategori tjetër"}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  {"Dyqane "}
                  <Text style={{ color: colors.primary }}>
                    {selectedCategory ? `· ${selectedCategory}` : "të Hapura"}
                  </Text>
                </Text>
                <View style={[styles.countBadge, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.countText, { color: colors.primaryDark }]}>
                    {filtered.length}
                  </Text>
                </View>
              </View>
              {filtered.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 16,
  },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
    padding: 2,
  },
  logoImg: { width: "100%", height: "100%" },
  brandName: { color: "#fff", fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  brandSub: { color: "rgba(255,255,255,0.85)", fontSize: 11, marginTop: 1 },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: "#fff",
  },
  cartBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  heroCenter: { alignItems: "center", gap: 6 },
  heroHeadline: { color: "#fff", fontSize: 22, fontWeight: "800", textAlign: "center", letterSpacing: -0.3 },
  heroSub: { color: "rgba(255,255,255,0.9)", fontSize: 14, textAlign: "center" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 15 },
  catSection: {},
  catHeader: { flexDirection: "row" },
  catTitle: { fontSize: 16, fontWeight: "700" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    marginTop: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  countBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  countText: { fontSize: 13, fontWeight: "700" },
  center: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 12 },
  loadingText: { fontSize: 14 },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyDesc: { fontSize: 14, textAlign: "center" },
});
