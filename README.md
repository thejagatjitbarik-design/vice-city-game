# VICE OUTLAWS - 3D Open World Web & Mobile Game

An attractive, 3D open-world arcade game built for high-performance in Web Browsers and ready for Google Play Store export.

---

## 🎮 How to Play Right Now

### Option 1: Direct Browser Launch
Simply open `index.html` in your web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local Dev Server
```bash
npx serve .
# or
python -m http.server 8080
```
Open `http://localhost:8080` in your browser or phone on the same Wi-Fi network.

---

## 🕹️ Controls

### PC / Desktop
* **W / Up Arrow:** Accelerate / Drive Forward
* **S / Down Arrow:** Brake / Reverse
* **A / Left Arrow:** Steer Left
* **D / Right Arrow:** Steer Right
* **SPACEBAR:** Handbrake / Power Drift
* **C:** Switch Camera Mode (Close Chase 3rd Person / High Cinematic / Classic Top-Down GTA)
* **H:** Honk Horn
* **R:** Reset Car Orientation

### Mobile / Touch Devices
* **On-screen Steering Buttons:** ◀ (Left) and ▶ (Right)
* **On-screen Pedals:** DRIVE (Gas), REVERSE / STOP, and DRIFT buttons.
* **Auto-responsive:** Touch controls automatically activate on mobile and tablets.

---

## 🌟 Game Features Included

1. **GTA Neon Synthwave Aesthetic:**
   * 12x12 procedural city grid with illuminated skyscrapers, billboards, streetlights, and palm trees.
   * Real-time 3D lighting, headlights projecting beams, glowing neon taillights, and customizable underglow neon.
2. **Dynamic Physics & Drifting:**
   * Power-drifting with tire skidmarks on the asphalt and puffing tire smoke.
   * Speedometer, gear display, and stunt multiplier rewards ("SICK DRIFT! +$250").
3. **Police Chase & Wanted System (0 to 5 Stars):**
   * Crashing or causing chaos attracts police attention.
   * Police squad cars with flashing red & blue strobe lights pursue your vehicle.
   * Evade police line of sight to start the "Cool Down" countdown and clear your wanted stars for cash bonuses!
4. **GTA-Style Mini-Map (Radar):**
   * Real-time rotating radar displaying player position, street grids, and flashing police squad cars.
5. **Zero-Asset Web Audio Synthesizer:**
   * 100% offline procedural audio: dynamic engine revving pitch, tire screeching, metal impact crunch, siren wails, and an 80s Synthwave Radio FM soundtrack.
6. **Customization Garage & Rewarded Ad Business Demo:**
   * Click the **"VICE OUTLAWS"** logo to open the Garage.
   * Customize car body paint and neon underglow.
   * Test the **"Watch Ad: Free +$5,000"** rewarded monetization flow.

---

## 📱 How to Export to Google Play Store (.apk / .aab)

This game is built with zero external framework lock-in. To package it for the Play Store using **Capacitor**:

1. In this folder, initialize npm and Capacitor:
   ```bash
   npm init -y
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init "Vice Outlaws" "com.outlaws.vicecity" --web-dir .
   ```

2. Add Android platform:
   ```bash
   npx cap add android
   npx cap copy android
   ```

3. Open in Android Studio and build your signed `.aab`:
   ```bash
   npx cap open android
   ```
   In Android Studio: Click **Build > Generate Signed Bundle / APK** -> Upload directly to the **Google Play Console**.
