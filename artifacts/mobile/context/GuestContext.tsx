import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const KEYS = {
  guestId: "tiligo_guest_id",
  name: "tiligo_guest_name",
  phone: "tiligo_guest_phone",
  address: "tiligo_guest_address",
};

interface GuestContextType {
  guestId: string;
  guestName: string;
  guestPhone: string;
  savedAddress: string;
  setGuestName: (v: string) => void;
  setGuestPhone: (v: string) => void;
  setSavedAddress: (v: string) => void;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

function makeGuestId() {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const [guestId, setGuestId] = useState("");
  const [guestName, setGuestNameState] = useState("");
  const [guestPhone, setGuestPhoneState] = useState("");
  const [savedAddress, setSavedAddressState] = useState("");

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(KEYS.guestId),
      AsyncStorage.getItem(KEYS.name),
      AsyncStorage.getItem(KEYS.phone),
      AsyncStorage.getItem(KEYS.address),
    ]).then(([id, name, phone, addr]) => {
      if (!id) {
        const newId = makeGuestId();
        AsyncStorage.setItem(KEYS.guestId, newId);
        setGuestId(newId);
      } else {
        setGuestId(id);
      }
      if (name) setGuestNameState(name);
      if (phone) setGuestPhoneState(phone);
      if (addr) setSavedAddressState(addr);
    });
  }, []);

  const setGuestName = (v: string) => { setGuestNameState(v); AsyncStorage.setItem(KEYS.name, v); };
  const setGuestPhone = (v: string) => { setGuestPhoneState(v); AsyncStorage.setItem(KEYS.phone, v); };
  const setSavedAddress = (v: string) => { setSavedAddressState(v); AsyncStorage.setItem(KEYS.address, v); };

  return (
    <GuestContext.Provider value={{ guestId, guestName, guestPhone, savedAddress, setGuestName, setGuestPhone, setSavedAddress }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  const ctx = useContext(GuestContext);
  if (!ctx) throw new Error("useGuest must be within GuestProvider");
  return ctx;
}
