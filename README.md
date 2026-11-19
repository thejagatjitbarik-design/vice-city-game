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

## 🎯 Story Chapters & Missions

* **Chapter 1: The First Score**
  * Drive to the Ocean Bank vault alley, secure the stolen diamonds, and evade police pursuit to reach the Palm Motel Safehouse.
* **Chapter 2: Speed Bomb Thriller**
  * Rival syndicate rigged your chassis with a speed bomb! Keep speed above 45 MPH or the timer detonates! Race across the city to defuse it at the Marina.
* **Chapter 3: Thunderstorm Betrayal (Boss Fight)**
  * A Cartel Traitor is escaping in a customized Gold Supercar during a thunderstorm!
  * **How to defeat him:** Follow the 3D GPS navigation arrow directly to the gold supercar (marked with a 3D spinning target reticle). Ram his vehicle at high speed 3 times until his health bar reaches 0%. Once his car is wrecked, drive into the dropped golden briefcase to recover the syndicate encrypted drive!
* **Chapter 4: The Apex Military Escape**
  * 5-star military lockdown! Hunt down 3 contraband weapon crates scattered across Vice City, dodge relentless SWAT roadblocks, and escape to the harbor boat!

---

## 👑 Admin Command Console & Passcode Security

The Admin Command Console is protected with a secure passcode gate to prevent unauthorized players or guests from cheating.

* **Passcode:** `admin777`
* **Features:**
  * Live Telemetry (Speed, GPS coordinates, Wanted stars, Active police units)
  * God Mode (Instant 100% Health & Armor)
  * Instant +$50,000 Cash Injection
  * Clear Wanted Stars or trigger 5-Star Army Pursuit
  * Instant Chapter Warp (Skip to Chapters 1, 2, 3, or 4)
  * Registered Accounts Database Viewer & Data Management

---

## 📨 Real Email OTP Setup (100% FREE - No Buying Required)

You do **NOT** need to pay any money or buy subscriptions! Google provides free App Passwords with 500 emails/day.

### 2-Minute Setup with Free Gmail:
1. Open your Google Account: [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Ensure **2-Step Verification** is turned **ON**.
3. In the search bar at the top, type **"App passwords"** and click on it.
4. Name your app **"Vice Outlaws"** and click **Create**.
5. Google will display a 16-character code (e.g., `abcd efgh ijkl mnop`).
6. Open `.env` in this project folder and enter:
   ```env
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=abcd efgh ijkl mnop
   ```
7. Run `npm start` (or `node server.js`). Every OTP will now arrive directly in real Gmail inboxes!

*(Note: If you run without setting `.env`, the system automatically prints the OTP to the server console and web status message so you are never locked out).*

---

## 📦 What Files Need to Be Uploaded to GitHub

Here is the exact list of files to commit and upload to your GitHub repository:

### ✅ Files to Upload:
* `index.html` — The main game page & HUD interface
* `style.css` — Synthwave neon visual styling, HUD, and responsive mobile layouts
* `game.js` — Three.js 3D game engine, physics, story levels, radar, and audio
* `server.js` — Express backend API server for real email OTP dispatch and user auth
* `package.json` — Node.js project configuration and dependencies
* `package-lock.json` — Locked dependency versions
* `manifest.json` — Mobile PWA app installation manifest
* `.env.example` — Template showing how to configure free Gmail SMTP
* `.gitignore` — Specifies files to keep out of Git
* `README.md` — Full documentation, controls, and play instructions

### ❌ Files NOT to Upload (Automatically Ignored):
* `node_modules/` (Re-installed automatically via `npm install`)
* `.env` (Contains your private Gmail credentials — NEVER share publicly!)

### 🚀 Git Commands to Push to GitHub:
```bash
git add .
git commit -m "Vice Outlaws v1.2: Add Chapter 3 boss ramming, Admin passcode gate, and Gmail OTP auth"
git remote add origin https://github.com/YOUR_USERNAME/vice-city-game.git
git branch -M main
git push -u origin main
```

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
