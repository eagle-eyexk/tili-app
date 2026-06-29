import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
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

import { useGuest } from "@/context/GuestContext";
import { useColors } from "@/hooks/useColors";

const logoSource = require("@/assets/images/logo.jpg");

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { guestName, guestPhone, savedAddress, setGuestName, setGuestPhone, setSavedAddress } = useGuest();
  const [name, setName] = useState(guestName);
  const [phone, setPhone] = useState(guestPhone);
  const [address, setAddress] = useState(savedAddress);
  const [saved, setSaved] = useState(false);

  const topPad = Platform.OS === "web" ? 0 : insets.top;
  const botPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const handleSave = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Kujdes", "Plotëso emrin dhe numrin e telefonit.");
      return;
    }
    setGuestName(name);
    setGuestPhone(phone);
    setSavedAddress(address);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: botPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header gradient */}
        <LinearGradient
          colors={["#15803D", "#22C55E"]}
          style={[styles.headerGrad, { paddingTop: topPad + 20 }]}
        >
          <View style={styles.headerTop}>
            <View style={styles.logoRow}>
              <View style={styles.logoWrap}>
                <Image source={logoSource} style={styles.logoImg} contentFit="contain" />
              </View>
              <Text style={styles.appName}>TiliGo</Text>
            </View>
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.5)" }]}>
              <Feather name="user" size={42} color="#fff" />
            </View>
            <Text style={styles.avatarName}>{guestName || "Mysafir"}</Text>
            <View style={[styles.guestBadge]}>
              <Text style={styles.guestBadgeText}>Llogari Mysafiri</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Personal info card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Feather name="user" size={16} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Informacioni Personal</Text>
            </View>

            <FormField
              label="Emri i plotë"
              icon="user"
              value={name}
              onChange={setName}
              placeholder="Shkruaj emrin tënd..."
              colors={colors}
            />
            <FormField
              label="Numri i telefonit"
              icon="phone"
              value={phone}
              onChange={setPhone}
              placeholder="04X XXX XXX"
              keyboardType="phone-pad"
              colors={colors}
            />
            <FormField
              label="Adresa e preferuar"
              icon="map-pin"
              value={address}
              onChange={setAddress}
              placeholder="Rruga, Numri, Qyteti..."
              colors={colors}
            />

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: saved ? colors.accent : colors.primary }]}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Feather name={saved ? "check" : "save"} size={17} color={saved ? colors.primary : "#fff"} />
              <Text style={[styles.saveBtnText, { color: saved ? colors.primary : "#fff" }]}>
                {saved ? "U ruajt me sukses! ✓" : "Ruaj Informacionin"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* About TiliGo */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Feather name="info" size={16} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Rreth TiliGo</Text>
            </View>

            {[
              { icon: "truck", text: "Dërgesa e shpejtë në Kosovë" },
              { icon: "shield", text: "Biznese të verifikuara dhe të besuara" },
              { icon: "dollar-sign", text: "Pagesa me para në dorë ose kartë" },
              { icon: "star", text: "Produktet më të freskëta" },
              { icon: "headphones", text: "Mbështetje 7 ditë në javë" },
              { icon: "map-pin", text: "Kryesisht aktiv në Kosovë" },
            ].map((item) => (
              <View key={item.text} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.infoIcon, { backgroundColor: colors.accent }]}>
                  <Feather name={item.icon as never} size={15} color={colors.primary} />
                </View>
                <Text style={[styles.infoText, { color: colors.foreground }]}>{item.text}</Text>
                <Feather name="chevron-right" size={14} color={colors.border} />
              </View>
            ))}
          </View>

          {/* App branding footer */}
          <View style={styles.footer}>
            <View style={styles.footerLogo}>
              <View style={[styles.footerLogoWrap, { borderColor: colors.border }]}>
                <Image source={logoSource} style={styles.footerLogoImg} contentFit="contain" />
              </View>
              <Text style={[styles.footerBrand, { color: colors.primary }]}>TiliGo</Text>
            </View>
            <Text style={[styles.footerSlogan, { color: colors.mutedForeground }]}>
              Shpejt, me Dashuri 🇽🇰
            </Text>
            <Text style={[styles.footerVersion, { color: colors.mutedForeground }]}>Versioni 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function FormField({
  label, icon, value, onChange, placeholder, keyboardType, colors,
}: {
  label: string; icon: string; value: string; onChange: (v: string) => void;
  placeholder: string; keyboardType?: never; colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={ff.wrap}>
      <Text style={[ff.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[ff.row, { borderColor: colors.border, backgroundColor: colors.muted }]}>
        <Feather name={icon as never} size={16} color={colors.mutedForeground} />
        <TextInput
          style={[ff.input, { color: colors.foreground }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          keyboardType={keyboardType}
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

const ff = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.3 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 12, borderWidth: 1 },
  input: { flex: 1, fontSize: 15 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGrad: { paddingHorizontal: 20, paddingBottom: 30 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#fff", overflow: "hidden", padding: 2 },
  logoImg: { width: "100%", height: "100%" },
  appName: { color: "#fff", fontSize: 18, fontWeight: "800" },
  avatarSection: { alignItems: "center", gap: 8 },
  avatar: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center", borderWidth: 2, marginBottom: 4 },
  avatarName: { color: "#fff", fontSize: 22, fontWeight: "700" },
  guestBadge: { backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  guestBadgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  content: { padding: 16, gap: 16 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: "700" },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 12, marginTop: 4 },
  saveBtnText: { fontSize: 15, fontWeight: "700" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  infoIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  infoText: { flex: 1, fontSize: 14, fontWeight: "500" },
  footer: { alignItems: "center", paddingVertical: 16, gap: 8 },
  footerLogo: { flexDirection: "row", alignItems: "center", gap: 8 },
  footerLogoWrap: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, overflow: "hidden", padding: 3 },
  footerLogoImg: { width: "100%", height: "100%" },
  footerBrand: { fontSize: 22, fontWeight: "800" },
  footerSlogan: { fontSize: 14 },
  footerVersion: { fontSize: 12 },
});
