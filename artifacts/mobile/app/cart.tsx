import { Feather } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const { cart, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const { guestId, guestName, guestPhone, savedAddress, setGuestName, setGuestPhone, setSavedAddress } = useGuest();

  const [name, setName] = useState(guestName);
  const [phone, setPhone] = useState(guestPhone);
  const [address, setAddress] = useState(savedAddress);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");

  const { data: business } = useQuery({
    queryKey: ["business", cart?.businessId],
    queryFn: () => api.businesses.get(cart!.businessId),
    enabled: !!cart?.businessId,
  });

  const deliveryFee = cart?.deliveryFee ?? 0;
  const subtotal = totalPrice;
  const total = subtotal + deliveryFee;

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: () => {
      if (!cart || cart.items.length === 0) throw new Error("Cart empty");
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
        items: JSON.stringify(cart.items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity }))),
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

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const botInset = Platform.OS === "web" ? 34 : insets.bottom;

  if (!cart || cart.items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.emptyHeader, { paddingTop: topInset + 12, borderBottomColor: colors.border, backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="x" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Shporta</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.emptyBody}>
          <Feather name="shopping-bag" size={52} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Shporta është bosh</Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>Shto produkte nga dyqanet</Text>
          <TouchableOpacity style={[styles.browseBtn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
            <Text style={styles.browseBtnText}>Shfleto Dyqanet</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 12, borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Shporta</Text>
        <TouchableOpacity onPress={() => { clearCart(); }} style={styles.clearBtn}>
          <Text style={[styles.clearText, { color: colors.destructive }]}>Pastro</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botInset + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Business name */}
        {business && (
          <View style={[styles.bizRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="map-pin" size={16} color={colors.primary} />
            <Text style={[styles.bizName, { color: colors.foreground }]}>{business.name}</Text>
          </View>
        )}

        {/* Cart items */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Produktet</Text>
          {cart.items.map((item) => (
            <View key={item.id} style={[styles.cartItem, { borderTopColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemName, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={[styles.itemPrice, { color: colors.primary }]}>€{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
              <View style={[styles.qtyRow, { borderColor: colors.border }]}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Feather name={item.quantity === 1 ? "trash-2" : "minus"} size={14} color={item.quantity === 1 ? colors.destructive : colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.qtyNum, { color: colors.foreground }]}>{item.quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Feather name="plus" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery form */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Detajet e Dërgimit</Text>
          <FormInput icon="map-pin" placeholder="Adresa e plotë e dërgimit *" value={address} onChangeText={setAddress} colors={colors} />
          <FormInput icon="user" placeholder="Emri i plotë *" value={name} onChangeText={setName} colors={colors} />
          <FormInput icon="phone" placeholder="Numri i telefonit *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" colors={colors} />
          <FormInput icon="message-square" placeholder="Shënime (opsionale)" value={notes} onChangeText={setNotes} multiline colors={colors} />
        </View>

        {/* Payment */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Mënyra e Pagesës</Text>
          <View style={styles.paymentRow}>
            {(["cash", "card"] as const).map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.paymentOpt,
                  { borderColor: paymentMethod === method ? colors.primary : colors.border, backgroundColor: paymentMethod === method ? colors.accent : colors.muted },
                ]}
                onPress={() => setPaymentMethod(method)}
                activeOpacity={0.75}
              >
                <Feather name={method === "cash" ? "dollar-sign" : "credit-card"} size={18} color={paymentMethod === method ? colors.primary : colors.mutedForeground} />
                <Text style={[styles.paymentLabel, { color: paymentMethod === method ? colors.primary : colors.foreground }]}>
                  {method === "cash" ? "Para në dorë" : "Kartë"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Rezymeja</Text>
          <SummaryRow label="Subtotali" value={`€${subtotal.toFixed(2)}`} colors={colors} />
          <SummaryRow label="Tarifa e dërgimit" value={`€${deliveryFee.toFixed(2)}`} colors={colors} />
          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.foreground }]}>Totali</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>€{total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place order button */}
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
              <Text style={[styles.orderBtnText, { color: canOrder ? "#fff" : colors.mutedForeground }]}>
                Porosit Tani · €{total.toFixed(2)}
              </Text>
              <Feather name="arrow-right" size={18} color={canOrder ? "#fff" : colors.mutedForeground} />
            </>
          )}
        </TouchableOpacity>
        {!canOrder && (
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>Plotëso adresën, emrin dhe numrin</Text>
        )}
      </View>
    </View>
  );
}

function FormInput({ icon, placeholder, value, onChangeText, keyboardType, multiline, colors }: {
  icon: string; placeholder: string; value: string; onChangeText: (v: string) => void;
  keyboardType?: never; multiline?: boolean; colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[fi.wrap, { borderColor: colors.border, backgroundColor: colors.muted }]}>
      <Feather name={icon as never} size={15} color={colors.mutedForeground} style={{ marginTop: multiline ? 2 : 0 }} />
      <TextInput
        style={[fi.input, { color: colors.foreground, minHeight: multiline ? 60 : undefined }]}
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

function SummaryRow({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={sr.row}>
      <Text style={[sr.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[sr.value, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const fi = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10, borderWidth: 1, marginBottom: 10 },
  input: { flex: 1, fontSize: 14 },
});

const sr = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: "600" },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  emptyHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { width: 32, alignItems: "flex-start" },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  clearBtn: {},
  clearText: { fontSize: 14, fontWeight: "600" },
  scroll: { padding: 16, gap: 12 },
  bizRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderRadius: 14, borderWidth: 1 },
  bizName: { fontSize: 15, fontWeight: "600" },
  section: { borderRadius: 14, borderWidth: 1, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 14 },
  cartItem: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, paddingVertical: 12, gap: 12 },
  itemName: { fontSize: 14, fontWeight: "600", marginBottom: 3 },
  itemPrice: { fontSize: 13, fontWeight: "700" },
  qtyRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 20, overflow: "hidden" },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 7 },
  qtyNum: { fontSize: 14, fontWeight: "700", minWidth: 22, textAlign: "center" },
  paymentRow: { flexDirection: "row", gap: 12 },
  paymentOpt: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5 },
  paymentLabel: { fontSize: 14, fontWeight: "600" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 12, marginTop: 4, borderTopWidth: 1 },
  totalLabel: { fontSize: 16, fontWeight: "700" },
  totalValue: { fontSize: 18, fontWeight: "800" },
  footer: { padding: 16, borderTopWidth: 1 },
  orderBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 14 },
  orderBtnText: { fontSize: 16, fontWeight: "700" },
  hint: { textAlign: "center", fontSize: 12, marginTop: 8 },
  emptyBody: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptyDesc: { fontSize: 14 },
  browseBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  browseBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
