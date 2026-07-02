import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CartProvider } from "@/context/CartContext";
import { GuestProvider } from "@/context/GuestContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 30_000 } },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Kthehu" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="business/[id]" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="cart" options={{ headerShown: false, animation: "slide_from_bottom", presentation: "modal" }} />
      <Stack.Screen name="order/[id]" options={{ headerShown: false, animation: "slide_from_right" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GuestProvider>
            <CartProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </CartProvider>
          </GuestProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
