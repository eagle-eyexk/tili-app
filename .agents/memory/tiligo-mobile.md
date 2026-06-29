---
name: TiliGo Mobile App
description: Expo/React Native food delivery app for Kosovo, connected to base44 API, Albanian language, iOS-ready
---

## Base44 API
- URL: `https://base44.app/api/apps/6a381c14e4aa9004665edfee/entities/{EntityName}`
- Headers: `api_key: 56713a3d771f461d8934586b587d1ebd`, `X-App-Id: 6a381c14e4aa9004665edfee`
- Working entities: Business, Product, Order, Address, Coupon, Review, CourierProfile, User
- Defined in `artifacts/mobile/services/base44.ts`

## Logo
- Real TiliGo logo: `artifacts/mobile/assets/images/logo.jpg` (1024×1024 JPEG)
- Import with `require("@/assets/images/logo.jpg")` everywhere
- `app.json` icon also set to this logo

## Key architecture decisions
- `GuestContext`: generates `guest_{timestamp}_{random}` ID, stored in AsyncStorage as `tiligo_guest_id`
- `CartContext`: persisted in AsyncStorage as `tiligo_cart_v1`, one business per cart
- Order `items` field: stored as JSON string — must JSON.parse() on read, JSON.stringify() on write
- Tab layout: uses `expo-blur` + `expo-router Tabs`, NO native-only imports (caused blank screens)

## iOS Publication Config (app.json)
- bundleIdentifier: `com.tiligo.delivery`
- buildNumber: "1", deploymentTarget: "16.0"
- Albanian infoPlist privacy strings
- ITSAppUsesNonExemptEncryption: false

## Brand colors
- Primary green: #22C55E, dark: #16A34A
- Blue accent: #38BDF8
- Light mode only (`userInterfaceStyle: "light"`)

## Category pills (website-matching)
🏠 Të gjitha | 🍕 Pica | 🍔 Burgera | 🍣 Sushi | 🛒 Supermarket | 💊 Farmaci | ☕ Kafe | 🍽️ Ushqim | 🏪 Restorante

## Order statuses
placed → accepted → ready → assigned → active (each has distinct color in tracking screen)

**Why:** base44 API uses these exact string values; UI color-codes each step in the tracking screen.
