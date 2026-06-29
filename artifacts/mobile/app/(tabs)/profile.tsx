import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
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

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { guestName, guestPhone, savedAddress, setGuestName, setGuestPhone, setSavedAddress } = useGuest();
  const [name, setName] = useState(guestName);
  const [phone, setPhone] = useState(guestPhone);
  const [address, setAddress] = useState(savedAddress);
  const [saved, setSaved] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 + 84 : 84;

  const handleSave = () => {
    setGuestName(name);
    setGuestPhone(phone);
    setSavedAddress(address);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    Alert.alert("Ruajtur", "Informacioni u ruajt me sukses.");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Profili Im</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={[styles.avatarSection, { backgroundColor: colors.card }]}>
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <Feather name="user" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.avatarName, { color: colors.foreground }]}>
            {guestName || "Mysafir"}
          </Text>
          <Text style={[styles.avatarSub, { color: colors.mutedForeground }]}>Llogari mysafiri</Text>
        </View>

        {/* Form */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Informacioni Personal</Text>

          <Field label="Emri i plotë" icon="user" value={name} onChange={setName} placeholder="Emri juaj" colors={colors} />
          <Field label="Numri i telefonit" icon="phone" value={phone} onChange={setPhone} placeholder="04X XXX XXX" keyboardType="phone-pad" colors={colors} />
          <Field label="Adresa e dërgimit" icon="map-pin" value={address} onChange={setAddress} placeholder="Rruga, Qyteti" colors={colors} />

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: saved ? colors.accent : colors.primary }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Feather name={saved ? "check" : "save"} size={18} color={saved ? colors.primary : "#fff"} />
            <Text style={[styles.saveBtnText, { color: saved ? colors.primary : "#fff" }]}>
              {saved ? "Ruajtur!" : "Ruaj Informacionin"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* App info */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Rreth TiliGo</Text>
          <InfoRow icon="truck" label="Dërgesa e shpejtë në Kosovë" colors={colors} />
          <InfoRow icon="shield" label="Pagesa me para në dorë" colors={colors} />
          <InfoRow icon="star" label="Biznese të verifikuara" colors={colors} />
          <InfoRow icon="headphones" label="Mbështetje 7/7" colors={colors} />
        </View>

        <View style={styles.logo}>
          <Text style={[styles.logoText, { color: colors.primary }]}>TiliGo</Text>
          <Text style={[styles.logoSub, { color: colors.mutedForeground }]}>Shpejt, me Dashuri</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Field({ label, icon, value, onChange, placeholder, keyboardType, colors }: {
  label: string; icon: string; value: string; onChange: (v: string) => void;
  placeholder: string; keyboardType?: never; colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={[fieldStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[fieldStyles.row, { borderColor: colors.border, backgroundColor: colors.muted }]}>
        <Feather name={icon as never} size={16} color={colors.mutedForeground} />
        <TextInput
          style={[fieldStyles.input, { color: colors.foreground }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );
}

function InfoRow({ icon, label, colors }: { icon: string; label: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={infoStyles.row}>
      <View style={[infoStyles.iconWrap, { backgroundColor: colors.accent }]}>
        <Feather name={icon as never} size={15} color={colors.primary} />
      </View>
      <Text style={[infoStyles.label, { color: colors.foreground }]}>{label}</Text>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
  input: { flex: 1, fontSize: 14 },
});

const infoStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 14, flex: 1 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: 1, paddingHorizontal: 16, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: "800" },
  scroll: { padding: 16, gap: 16 },
  avatarSection: { alignItems: "center", borderRadius: 16, padding: 24, marginBottom: 0 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarName: { fontSize: 20, fontWeight: "700" },
  avatarSub: { fontSize: 13, marginTop: 4 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 16 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 12, marginTop: 4 },
  saveBtnText: { fontSize: 15, fontWeight: "700" },
  logo: { alignItems: "center", paddingVertical: 8 },
  logoText: { fontSize: 22, fontWeight: "800" },
  logoSub: { fontSize: 12, marginTop: 2 },
});
