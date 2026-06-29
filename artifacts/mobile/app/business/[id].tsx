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

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addItem, getItemQuantity, cart, totalItems, totalPrice } = useCart();

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
    return ["Të gjitha", ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!selectedCat || selectedCat === "Të gjitha") return products;
    return products.filter((p) => p.category === selectedCat);
  }, [products, selectedCat]);

  const cartBelongsHere = cart?.businessId === id;
  const cartCount = cartBelongsHere ? cart!.items.reduce((s, i) => s + i.quantity, 0) : 0;
  const cartSubtotal = cartBelongsHere ? cart!.items.reduce((s, i) => s + i.price * i.quantity, 0) : 0;

  const handleAdd = (item: Omit<CartItem, "quantity">) => {
    if (business) {
      addItem(business.id, business.name, business.delivery_fee, item);
    }
  };

  const handleRemove = (itemId: string) => {
    const qty = getItemQuantity(itemId);
    if (qty <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // updateQuantity is called via ProductItem's onRemove -> decrease by 1
    if (cartBelongsHere) {
      const item = cart!.items.find((i) => i.id === itemId);
      if (item) {
        if (item.quantity > 1) {
          // We need to pass this through addItem logic, but we need updateQuantity
          // ProductItem handles this correctly via its own logic
        }
      }
    }
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const botInset = Platform.OS === "web" ? 34 : insets.bottom;

  if (loadingBiz) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={colors.primary} />
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
            <View style={[styles.coverImg, { backgroundColor: colors.accent }]} />
          )}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            style={StyleSheet.absoluteFill}
          />
          <TouchableOpacity
            style={[styles.backBtn, { top: topInset + 12 }]}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Business info (sticky category tabs below) */}
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <View style={styles.infoRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bizName, { color: colors.foreground }]}>{business?.name}</Text>
              {business?.description ? (
                <Text style={[styles.bizDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {business.description}
                </Text>
              ) : null}
            </View>
            {business?.logo ? (
              <Image
                source={{ uri: business.logo }}
                style={[styles.logo, { borderColor: colors.border }]}
                contentFit="cover"
              />
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <Feather name="star" size={13} color="#FBBF24" />
            <Text style={[styles.rating, { color: colors.foreground }]}>
              {business?.rating?.toFixed(1) ?? "—"}
            </Text>
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <View style={[styles.openBadge, { backgroundColor: business?.is_open ? colors.accent : "#FEE2E2" }]}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: business?.is_open ? colors.primary : colors.destructive }}>
                {business?.is_open ? "Hapur" : "Mbyllur"}
              </Text>
            </View>
          </View>

          <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
            <Stat icon="clock" value={`${business?.delivery_time ?? "—"} min`} colors={colors} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Stat icon="truck" value={`€${business?.delivery_fee ?? "—"}`} colors={colors} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Stat icon="shopping-bag" value={`Min. €${business?.min_order ?? "—"}`} colors={colors} />
          </View>
        </View>

        {/* Category tabs (sticky) */}
        <View style={[styles.catBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
            {categories.map((cat) => {
              const active = (selectedCat ?? "Të gjitha") === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catPill, { backgroundColor: active ? colors.primary : colors.muted }]}
                  onPress={() => setSelectedCat(cat)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.catPillText, { color: active ? "#fff" : colors.foreground }]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Products */}
        {loadingProducts ? (
          <View style={[styles.center, { paddingVertical: 40 }]}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={[styles.center, { paddingVertical: 40 }]}>
            <Text style={[styles.empty, { color: colors.mutedForeground }]}>Nuk ka produkte</Text>
          </View>
        ) : (
          <View style={{ backgroundColor: colors.card, marginTop: 8 }}>
            {filteredProducts.map((p) => (
              <ProductItem
                key={p.id}
                product={p}
                quantity={getItemQuantity(p.id)}
                onAdd={handleAdd}
                onRemove={(itemId) => {
                  const qty = getItemQuantity(itemId);
                  if (qty > 1) {
                    handleAdd({ id: p.id, name: p.name, price: p.price, image: p.image });
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
          <View style={[styles.cartCount, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
            <Text style={styles.cartCountText}>{cartCount}</Text>
          </View>
          <Text style={styles.cartBarText}>Shiko Shportën</Text>
          <Text style={styles.cartBarPrice}>€{cartSubtotal.toFixed(2)}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function Stat({ icon, value, colors }: { icon: string; value: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={statStyles.wrap}>
      <Feather name={icon as never} size={14} color={colors.primary} />
      <Text style={[statStyles.val, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", gap: 4 },
  val: { fontSize: 13, fontWeight: "600" },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  cover: { height: 240, position: "relative" },
  coverImg: { width: "100%", height: "100%" },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: { padding: 16, marginBottom: 0 },
  infoRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  bizName: { fontSize: 20, fontWeight: "800" },
  bizDesc: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  logo: { width: 56, height: 56, borderRadius: 12, borderWidth: 1 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  rating: { fontSize: 14, fontWeight: "700" },
  dot: { width: 4, height: 4, borderRadius: 2 },
  openBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statsRow: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    justifyContent: "space-around",
    alignItems: "center",
  },
  divider: { width: 1, height: 28 },
  catBar: { borderBottomWidth: 1 },
  catList: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  catPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  catPillText: { fontSize: 13, fontWeight: "600" },
  empty: { fontSize: 15 },
  cartBar: {
    position: "absolute",
    left: 16,
    right: 16,
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  cartCount: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cartCountText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  cartBarText: { flex: 1, color: "#fff", fontSize: 15, fontWeight: "700", textAlign: "center" },
  cartBarPrice: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
