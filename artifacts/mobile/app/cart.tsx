import { Feather } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "@/context/CartContext";
import { useGuest } from "@/context/GuestContext";
import { useColors } from "@/hooks/useColors";
import { api } from "@/services/base44";

const logoSource = require("@/assets/images/logo.jpg");

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const { cart, updateQuantity, clearCart, totalPrice } = useCart();
  const { guestId, guestName, guestPhone, savedAddress, setGuestName, setGuestPhone, setSavedAddress } = useGuest();

  const [name, setName] = useState(guestName);
  const [phone, setPhone] = useState(guestPhone);
  const [address, setAddress] = useState(savedAddress);
  const [notes, setNotes] = useState("");
  const [coupon, setCoupon] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");

  const { data: business } = useQuery({
    queryKey: ["business", cart?.businessId],
    queryFn: () => api.businesses.get(cart!.businessId),
    enabled: !!cart?.businessId,
  });

  const deliveryFee = cart?.deliveryFee ?? 0;
  const subtotal = totalPrice;
  const total = subtotal + deliveryFee;

  const topInset = Platform.OS === "web" ? 0 : insets.top;
  const botInset = Platform.OS === "web" ? 34 : insets.bottom;

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: () => {
      if (!cart || cart.items.length === 0) throw new Error("Shporta bosh");
      setGuestName(name);
      setGuestPhone(phone);
      setSavedAddress(address);
      return api.orders.create({
        business_id: cart.businessId,
        customer_id: guestId,
        customer_name: name,
        customer_phone: phone,
        delivery_address: address,
        notes,
        payment_method: paymentMethod,
        items: JSON.stringify(
          cart.items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity }))
        ),
        subtotal,
        delivery_fee: deliveryFee,
        discount: 0,
        total,
        status: "placed",
      });
    },
    onSuccess: (order) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      clearCart();
      qc.invalidateQueries({ queryKey: ["orders"] });
      router.replace(`/order/${order.id}` as never);
    },
    onError: (err) => {
      Alert.alert("Gabim", `Porosia dështoi: ${(err as Error).message}`);
    },
  });

  const canOrder = name.trim() && phone.trim() && address.trim() && cart && cart.items.length > 0;

  if (!cart || cart.items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.header, { paddingTop: topInset + 14, borderBottomColor: colors.border, backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Feather name="x" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.headerLogo}>
            <View style={[styles.headerLogoWrap, { borderColor: colors.border }]}>
              <Image source={logoSource} style={styles.headerLogoImg} contentFit="contain" />
            </View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Shporta</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.emptyBody}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}>
            <Feather name="shopping-bag" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Shporta është bosh</Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
            Shto produkte nga dyqanet e TiliGo
          </Text>
          <TouchableOpacity
            style={[styles.browseBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Feather name="home" size={16} color="#fff" />
            <Text style={styles.browseBtnText}>Shfleto Dyqanet</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: topInset + 14, borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerLogo}>
          <View style={[styles.headerLogoWrap, { borderColor: colors.border }]}>
            <Image source={logoSource} style={styles.headerLogoImg} contentFit="contain" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Shporta</Text>
        </View>
        <TouchableOpacity onPress={clearCart}>
          <Text style={[styles.clearText, { color: colors.destructive }]}>Pastro</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botInset + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Business info */}
        {business && (
          <View style={[styles.bizCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {business.logo && (
              <Image source={{ uri: business.logo }} style={styles.bizLogo} contentFit="cover" />
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.bizName, { color: colors.foreground }]}>{business.name}</Text>
              <Text style={[styles.bizAddr, { color: colors.mutedForeground }]}>
                <Feather name="map-pin" size={12} /> {business.address ?? business.category}
              </Text>
            </View>
          </View>
        )}

        {/* Items */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Produktet</Text>
          {cart.items.map((item, idx) => (
            <View key={item.id} style={[styles.cartItem, { borderTopColor: colors.border, borderTopWidth: idx === 0 ? 1 : 1 }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemName, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={[styles.itemUnit, { color: colors.mutedForeground }]}>€{item.price.toFixed(2)} x {item.quantity}</Text>
              </View>
              <Text style={[styles.itemTotal, { color: colors.primary }]}>
                €{(item.price * item.quantity).toFixed(2)}
              </Text>
              <View style={[styles.qtyRow, { borderColor: colors.border }]}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                  <Feather name={item.quantity === 1 ? "trash-2" : "minus"} size={14} color={item.quantity === 1 ? colors.destructive : colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.qtyNum, { color: colors.foreground }]}>{item.quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Feather name="plus" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery details */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Detajet e Dërgimit</Text>
          <CartInput icon="map-pin" placeholder="Adresa e plotë e dërgimit *" value={address} onChangeText={setAddress} colors={colors} />
          <CartInput icon="user" placeholder="Emri i plotë *" value={name} onChangeText={setName} colors={colors} />
          <CartInput icon="phone" placeholder="Numri i telefonit *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" colors={colors} />
          <CartInput icon="message-circle" placeholder="Shënime për korrierin (opsionale)" value={notes} onChangeText={setNotes} multiline colors={colors} />
        </View>

        {/* Coupon */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Kodi i Kuponit</Text>
          <View style={[styles.couponRow, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <Feather name="tag" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.couponInput, { color: colors.foreground }]}
              placeholder="Fut kodin e kuponit..."
              placeholderTextColor={colors.mutedForeground}
              value={coupon}
              onChangeText={setCoupon}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={[styles.couponApply, { backgroundColor: coupon.trim() ? colors.primary : colors.muted }]}>
              <Text style={[styles.couponApplyText, { color: coupon.trim() ? "#fff" : colors.mutedForeground }]}>
                Apliko
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Mënyra e Pagesës</Text>
          <View style={styles.payRow}>
            {(["cash", "card"] as const).map((m) => {
              const active = paymentMethod === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.payOpt, {
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? colors.accent : colors.muted,
                  }]}
                  onPress={() => setPaymentMethod(m)}
                  activeOpacity={0.75}
                >
                  <Feather name={m === "cash" ? "dollar-sign" : "credit-card"} size={18} color={active ? colors.primary : colors.mutedForeground} />
                  <Text style={[styles.payLabel, { color: active ? colors.primaryDark : colors.foreground }]}>
                    {m === "cash" ? "Para në dorë" : "Kartë"}
                  </Text>
                  {active && <Feather name="check-circle" size={14} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Summary */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Rezymeja e Porosisë</Text>
          <SumRow label="Subtotali" value={`€${subtotal.toFixed(2)}`} colors={colors} />
          <SumRow label="Tarifa e dërgimit" value={`€${deliveryFee.toFixed(2)}`} colors={colors} />
          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.foreground }]}>Totali</Text>
            <Text style={[styles.totalVal, { color: colors.primary }]}>€{total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { paddingBottom: botInset + 16, backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.orderBtn, { backgroundColor: canOrder ? colors.primary : colors.muted }]}
          onPress={() => canOrder && placeOrder()}
          disabled={!canOrder || isPending}
          activeOpacity={0.85}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="send" size={18} color={canOrder ? "#fff" : colors.mutedForeground} />
              <Text style={[styles.orderBtnText, { color: canOrder ? "#fff" : colors.mutedForeground }]}>
                Porosit Tani · €{total.toFixed(2)}
              </Text>
            </>
          )}
        </TouchableOpacity>
        {!canOrder && (
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Plotëso adresën, emrin dhe numrin e telefonit
          </Text>
        )}
      </View>
    </View>
  );
}

function CartInput({ icon, placeholder, value, onChangeText, keyboardType, multiline, colors }: {
  icon: string; placeholder: string; value: string; onChangeText: (v: string) => void;
  keyboardType?: never; multiline?: boolean; colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={[ci.wrap, { borderColor: colors.border, backgroundColor: colors.muted }]}>
      <Feather name={icon as never} size={15} color={colors.mutedForeground} style={{ marginTop: multiline ? 2 : 0 }} />
      <TextInput
        style={[ci.input, { color: colors.foreground, minHeight: multiline ? 64 : undefined }]}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

function SumRow({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof import("@/hooks/useColors").useColors> }) {
  return (
    <View style={sr.row}>
      <Text style={[sr.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[sr.val, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const ci = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  input: { flex: 1, fontSize: 15 },
});

const sr = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { fontSize: 14 },
  val: { fontSize: 14, fontWeight: "600" },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  closeBtn: { width: 32 },
  headerLogo: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerLogoWrap: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, overflow: "hidden", padding: 2 },
  headerLogoImg: { width: "100%", height: "100%" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  clearText: { fontSize: 14, fontWeight: "600" },
  scroll: { padding: 16, gap: 12 },
  bizCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  bizLogo: { width: 48, height: 48, borderRadius: 12 },
  bizName: { fontSize: 15, fontWeight: "700" },
  bizAddr: { fontSize: 12, marginTop: 2 },
  section: { borderRadius: 14, borderWidth: 1, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 14 },
  cartItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderTopWidth: 1 },
  itemName: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  itemUnit: { fontSize: 12 },
  itemTotal: { fontSize: 14, fontWeight: "700" },
  qtyRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 20, overflow: "hidden" },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 7 },
  qtyNum: { fontSize: 14, fontWeight: "700", minWidth: 22, textAlign: "center" },
  couponRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  couponInput: { flex: 1, fontSize: 15, paddingVertical: 10 },
  couponApply: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  couponApplyText: { fontSize: 13, fontWeight: "700" },
  payRow: { flexDirection: "row", gap: 12 },
  payOpt: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5 },
  payLabel: { fontSize: 14, fontWeight: "600" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 12, marginTop: 4, borderTopWidth: 1 },
  totalLabel: { fontSize: 16, fontWeight: "700" },
  totalVal: { fontSize: 18, fontWeight: "800" },
  footer: { padding: 16, borderTopWidth: 1 },
  orderBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 16 },
  orderBtnText: { fontSize: 16, fontWeight: "700" },
  hint: { textAlign: "center", fontSize: 12, marginTop: 8 },
  emptyBody: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  emptyIcon: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptyDesc: { fontSize: 14, textAlign: "center", paddingHorizontal: 40 },
  browseBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 4 },
  browseBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
