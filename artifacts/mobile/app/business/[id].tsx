import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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

import { ProductItem } from "@/components/ProductItem";
import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";
import { api } from "@/services/base44";
import type { CartItem } from "@/types";

const logoSource = require("@/assets/images/logo.jpg");

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addItem, getItemQuantity, cart } = useCart();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const { data: business, isLoading: loadingBiz } = useQuery({
    queryKey: ["business", id],
    queryFn: () => api.businesses.get(id!),
    enabled: !!id,
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products", id],
    queryFn: () => api.products.byBusiness(id!),
    enabled: !!id,
  });

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[];
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!selectedCat) return products;
    return products.filter((p) => p.category === selectedCat);
  }, [products, selectedCat]);

  const cartBelongsHere = cart?.businessId === id;
  const cartCount = cartBelongsHere ? cart!.items.reduce((s, i) => s + i.quantity, 0) : 0;
  const cartSubtotal = cartBelongsHere ? cart!.items.reduce((s, i) => s + i.price * i.quantity, 0) : 0;

  const handleAdd = (item: Omit<CartItem, "quantity">) => {
    if (business) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      addItem(business.id, business.name, business.delivery_fee, item);
    }
  };

  const topInset = Platform.OS === "web" ? 0 : insets.top;
  const botInset = Platform.OS === "web" ? 34 : insets.bottom;

  if (loadingBiz) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Image source={logoSource} style={styles.loadingLogo} contentFit="contain" />
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: cartCount > 0 ? botInset + 90 : botInset + 20 }}
        stickyHeaderIndices={[1]}
      >
        {/* Cover image */}
        <View style={styles.cover}>
          {business?.cover_image || business?.logo ? (
            <Image
              source={{ uri: business.cover_image || business.logo }}
              style={styles.coverImg}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <LinearGradient colors={["#15803D", "#22C55E"]} style={styles.coverImg} />
          )}
          <LinearGradient
            colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.0)"]}
            style={StyleSheet.absoluteFill}
          />
          <TouchableOpacity
            style={[styles.backBtn, { top: topInset + 14 }]}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Business info card */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.infoRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bizName, { color: colors.foreground }]}>{business?.name}</Text>
              {business?.description ? (
                <Text style={[styles.bizDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {business.description}
                </Text>
              ) : null}
              <View style={styles.metaRow}>
                <Feather name="star" size={13} color="#FBBF24" />
                <Text style={[styles.rating, { color: colors.foreground }]}>
                  {business?.rating?.toFixed(1) ?? "—"}
                </Text>
                <Text style={[styles.dot, { color: colors.border }]}>•</Text>
                <View style={[styles.openBadge, {
                  backgroundColor: business?.is_open ? colors.accent : "#FEE2E2"
                }]}>
                  <View style={[styles.openDot, {
                    backgroundColor: business?.is_open ? colors.primary : colors.destructive
                  }]} />
                  <Text style={[styles.openText, {
                    color: business?.is_open ? colors.primaryDark : colors.destructive
                  }]}>
                    {business?.is_open ? "Hapur" : "Mbyllur"}
                  </Text>
                </View>
              </View>
            </View>
            {business?.logo ? (
              <View style={[styles.logoCard, { borderColor: colors.border }]}>
                <Image
                  source={{ uri: business.logo }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              </View>
            ) : (
              <View style={[styles.logoCard, { borderColor: colors.border, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }]}>
                <Image source={logoSource} style={{ width: 36, height: 36 }} contentFit="contain" />
              </View>
            )}
          </View>

          <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
            <StatItem icon="clock" value={`${business?.delivery_time ?? "—"} min`} label="Dorëzim" colors={colors} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <StatItem icon="truck" value={`€${business?.delivery_fee?.toFixed(2) ?? "—"}`} label="Dërgim" colors={colors} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <StatItem icon="shopping-bag" value={`€${business?.min_order ?? "—"}`} label="Min. Porosi" colors={colors} />
          </View>
        </View>

        {/* Category tabs (sticky) */}
        <View style={[styles.catBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
            <TouchableOpacity
              style={[styles.catPill, { backgroundColor: !selectedCat ? colors.primary : colors.muted }]}
              onPress={() => setSelectedCat(null)}
            >
              <Text style={[styles.catText, { color: !selectedCat ? "#fff" : colors.foreground }]}>Të gjitha</Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catPill, { backgroundColor: selectedCat === cat ? colors.primary : colors.muted }]}
                onPress={() => setSelectedCat(cat)}
              >
                <Text style={[styles.catText, { color: selectedCat === cat ? "#fff" : colors.foreground }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products */}
        {loadingProducts ? (
          <View style={[styles.center, { paddingVertical: 40 }]}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={[styles.center, { paddingVertical: 40 }]}>
            <Feather name="package" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Nuk ka produkte</Text>
          </View>
        ) : (
          <View style={[styles.productList, { backgroundColor: colors.card }]}>
            {filteredProducts.map((p) => (
              <ProductItem
                key={p.id}
                product={p}
                quantity={getItemQuantity(p.id)}
                onAdd={handleAdd}
                onRemove={(itemId) => {
                  const qty = getItemQuantity(itemId);
                  if (qty > 1) {
                    addItem(business!.id, business!.name, business!.delivery_fee, {
                      id: p.id, name: p.name, price: p.price, image: p.image
                    });
                  }
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <TouchableOpacity
          style={[styles.cartBar, { backgroundColor: colors.primary, bottom: botInset + 16 }]}
          onPress={() => router.push("/cart" as never)}
          activeOpacity={0.9}
        >
          <View style={[styles.cartCountBubble, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
            <Text style={styles.cartCountText}>{cartCount}</Text>
          </View>
          <Text style={styles.cartBarLabel}>Shiko Shportën</Text>
          <Text style={styles.cartBarPrice}>€{cartSubtotal.toFixed(2)}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function StatItem({ icon, value, label, colors }: {
  icon: string; value: string; label: string; colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={si.wrap}>
      <Feather name={icon as never} size={15} color={colors.primary} />
      <Text style={[si.val, { color: colors.foreground }]}>{value}</Text>
      <Text style={[si.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const si = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", gap: 2 },
  val: { fontSize: 14, fontWeight: "700" },
  label: { fontSize: 11 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingLogo: { width: 80, height: 80 },
  cover: { height: 250, position: "relative" },
  coverImg: { width: "100%", height: "100%" },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: { padding: 16, borderBottomWidth: 1 },
  infoRow: { flexDirection: "row", gap: 12, alignItems: "flex-start", marginBottom: 12 },
  bizName: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  bizDesc: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  rating: { fontSize: 14, fontWeight: "700" },
  dot: { fontSize: 14 },
  openBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  openDot: { width: 6, height: 6, borderRadius: 3 },
  openText: { fontSize: 12, fontWeight: "700" },
  logoCard: { width: 60, height: 60, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  statsRow: { flexDirection: "row", alignItems: "center", paddingTop: 12, borderTopWidth: 1 },
  divider: { width: 1, height: 32, marginHorizontal: 4 },
  catBar: { borderBottomWidth: 1 },
  catList: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  catPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  catText: { fontSize: 13, fontWeight: "600" },
  productList: { marginTop: 8 },
  emptyText: { fontSize: 14, marginTop: 8 },
  cartBar: {
    position: "absolute",
    left: 16,
    right: 16,
    height: 58,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: "#22C55E",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  cartCountBubble: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  cartCountText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  cartBarLabel: { flex: 1, color: "#fff", fontSize: 15, fontWeight: "700", textAlign: "center" },
  cartBarPrice: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
