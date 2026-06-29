import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { CartItem, Product } from "@/types";

interface Props {
  product: Product;
  quantity: number;
  onAdd: (item: Omit<CartItem, "quantity">) => void;
  onRemove: (id: string) => void;
}

export function ProductItem({ product, quantity, onAdd, onRemove }: Props) {
  const colors = useColors();

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAdd({ id: product.id, name: product.name, price: product.price, image: product.image });
  };

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRemove(product.id);
  };

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]}>{product.name}</Text>
        {product.description ? (
          <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
            {product.description}
          </Text>
        ) : null}
        <Text style={[styles.price, { color: colors.primary }]}>€{product.price.toFixed(2)}</Text>
      </View>

      <View style={styles.right}>
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={[styles.img, { borderColor: colors.border }]}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View style={[styles.imgPlaceholder, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="image" size={20} color={colors.mutedForeground} />
          </View>
        )}

        {quantity === 0 ? (
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={handleAdd}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={[styles.counter, { borderColor: colors.primary }]}>
            <TouchableOpacity onPress={handleRemove} style={styles.counterBtn}>
              <Feather name="minus" size={14} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.qty, { color: colors.primary }]}>{quantity}</Text>
            <TouchableOpacity onPress={handleAdd} style={styles.counterBtn}>
              <Feather name="plus" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  desc: { fontSize: 13, lineHeight: 18, marginBottom: 6 },
  price: { fontSize: 15, fontWeight: "700" },
  right: { alignItems: "center", gap: 10 },
  img: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
  },
  imgPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  counterBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  qty: { fontSize: 14, fontWeight: "700", minWidth: 20, textAlign: "center" },
});
