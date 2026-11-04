# AeroSense-Exhaust
## Smart IoT-Based Automatic Exhaust Fan – Environmental & Humidity Control Dashboard
### Developed for the atomQUEST 2026 Competition – Round 2

![AeroSense-Exhaust SCADA Banner](https://img.shields.io/badge/AeroSense-SCADA_Industrial_v2.4.1-00f2fe?style=for-the-badge)
![atomQUEST 2026](https://img.shields.io/badge/atomQUEST-2026_Round_2-10b981?style=for-the-badge)
![License](https://img.shields.io/badge/Architecture-Production_IoT-blue?style=for-the-badge)

---

## 1. Project Overview

**AeroSense-Exhaust** is an intelligent, industrial-grade indoor environmental management and ventilation automation platform. Powered by an ESP32 microcontroller, the system monitors indoor temperature, relative humidity, human occupancy (using PIR motion and 24GHz FMCW mmWave radar fusion), and electrical energy consumption.

The system features:
1. **Simulation Mode**: A deterministic, physics-plausible industrial simulation engine allowing full interactive evaluation without physical hardware.
2. **Hardware Connected Mode**: Direct telemetry streaming from physical ESP32 nodes via WebSocket or MQTT with verifiable sensor telemetry.
3. **Six-Blade Actuator Simulation & Control**: Smooth animated visualization reflecting actual fan motor states (`OFF`, `LOW`, `MEDIUM`, `HIGH`, `AUTO`) with continuous speed modulation (0–100%) and hardware emergency stop interlocks.
4. **Heuristic Automation Engine**: Multi-variable rule engine with configurable thresholds, confirmation duration delays, and hysteresis dampening to prevent rapid mechanical switching.
5. **Electrical & Energy Analytics**: Real-time current sensing, power calculation, kWh energy integration, and configurable electricity tariffs.
6. **Executive Audit Reports**: Compliance reports with instant print-to-PDF formatting and CSV export capabilities.

---

## 2. Technology Stack

### Frontend:
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS with custom Dark Industrial Design System
- **Visualizations**: Recharts & custom interactive SVG gauges
- **Icons**: Lucide React
- **Animations**: Framer Motion & CSS hardware-accelerated transforms

### Backend:
- **Framework**: Python 3.10+ with FastAPI
- **Real-Time Streaming**: Native WebSockets (`/ws/live`)
- **IoT Broker Protocol**: MQTT (Paho-MQTT client for ESP32 bridge)
- **Validation**: Pydantic v2 schemas
- **Database**: SQLite (SQLAlchemy ORM, Postgres-compatible schema)

### Embedded Controller:
- **MCU**: ESP32 DevKit V1 (Xtensa Dual-Core 240MHz)
- **Sensors**: DHT22 / SHT31, PIR (HC-SR501), mmWave 24GHz Radar (LD2410), ACS712-05B
- **Actuators**: 25kHz PWM MOSFET Driver (IRF520) / Optocoupled Relay

---

## 3. Project File Structure

```
├── package.json                   # Frontend npm configuration & dependencies
├── vite.config.ts                 # Vite bundler configuration & aliases
├── tsconfig.json                  # TypeScript compiler options
├── tailwind.config.js             # Industrial dark color palette & styling
├── requirements.txt               # Backend Python requirements
├── .env.example                   # Environment variable template
│
├── src/
│   ├── components/
│   │   ├── layout/                # Sidebar, TopNavbar, ModeBanner, Toast
│   │   ├── dashboard/             # KpiCards, LiveTelemetryChart, FanQuickWidget, RecentAlertsStream
│   │   └── fan/                   # SixBladeFan (smooth rotating SVG visualization)
│   ├── pages/
│   │   ├── Overview.tsx           # Section 5: Control Center Overview
│   │   ├── LiveMonitoring.tsx     # Section 6: Live Environmental & Radar Presence
│   │   ├── FanControl.tsx         # Section 8: Smart Fan Actuator Control Center
│   │   ├── Automation.tsx         # Section 9: Heuristic Automation Rules Engine
│   │   ├── EnergyAnalytics.tsx    # Section 7 & 11: Power & Energy Analytics
│   │   ├── EnvironmentalAnalytics.tsx # Section 10: Environmental Historical Trends
│   │   ├── Alerts.tsx             # Section 12: Alerts & Notifications System
│   │   ├── DeviceManagement.tsx   # Section 13: ESP32 Topology & Sensor Inventory
│   │   ├── Reports.tsx            # Section 14: Engineering & Compliance Reports
│   │   └── Settings.tsx           # Section 15: System & Parameter Configuration
│   ├── context/
│   │   └── AppContext.tsx         # Central application state & live loop
│   ├── services/
│   │   ├── api.ts                 # REST API client
│   │   ├── websocket.ts           # WebSocket live stream client
│   │   └── simulation.ts          # Realistic simulation engine & data generators
│   ├── types/
│   │   └── index.ts               # Type definitions
│   ├── utils/
│   │   ├── cn.ts                  # ClassName helper
│   │   └── formatters.ts          # Temperature, power, currency, uptime formatters
│   ├── App.tsx                    # Main navigation shell
│   └── main.tsx                   # React root entry point
│
├── backend/
│   ├── run.py                     # Backend entry point runner
│   ├── requirements.txt           # Python dependencies
│   └── app/
│       ├── main.py                # FastAPI app & WebSocket endpoint
│       ├── core/config.py         # App configuration & settings
│       ├── models/
│       │   ├── schemas.py         # Pydantic data schemas
│       │   └── db_models.py       # SQLAlchemy SQLite models
│       ├── services/
│       │   └── telemetry_service.py # Telemetry manager & background simulation
│       ├── mqtt/
│       │   └── mqtt_handler.py    # MQTT bridge for ESP32
│       └── api/
│           └── routes.py          # REST endpoints
│
└── esp32_firmware/
    └── aerosense_esp32.ino        # Complete ESP32 Arduino C++ firmware
```

---

## 4. Quick Start & Execution Instructions

### Prerequisites:
- Node.js (v18+ or v22+)
- Python (v3.10+)

### Running the Frontend:
```bash
# In the project root:
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. The application starts immediately in **Simulation Mode**, fully functional even without backend services running!

### Running the FastAPI Backend (Optional):
```bash
# Navigate to the backend directory:
cd backend
pip install -r requirements.txt
python run.py
```
The REST API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs) and WebSocket at `ws://localhost:8000/ws/live`.

---

## 5. Demonstration Guide for atomQUEST 2026 Judges

### A. Testing Simulation Mode (Zero Setup Required)
1. Launch the frontend and verify the top banner displays: `SIMULATION MODE – DEMONSTRATION DATA`.
2. Observe the **Overview Dashboard**:
   - Temperature smoothly drifts around nominal room temperatures.
   - Humidity responds dynamically (rises when room is occupied; drops when fan engages).
   - Occupancy radar toggles between `OCCUPIED` and `VACANT` with timestamps updating.
   - Power and current readings reflect the active fan speed.
3. Visit **Fan Control**:
   - Select speed presets (`OFF`, `LOW`, `MEDIUM`, `HIGH`, `AUTO`).
   - Observe the **6-blade circular fan** spin smoothly at the exact commanded speed.
   - Hit **EMERGENCY STOP** to engage the simulated safety interlock.
4. Visit **Automation**:
   - Inspect the 5 default rules (High Humidity, Occupancy Detection, Unoccupied Setback, Sensor Fault Fallback, Overcurrent Trip).
   - Click **Configure** on any rule to adjust threshold, confirmation duration, or hysteresis deadband.
5. Visit **Reports**:
   - Click **Export CSV** to download a time-series spreadsheet.
   - Click **Print / Save PDF** to see the print layout.

### B. Testing Hardware Mode (Honesty Rule Verified)
1. Click **Switch to Hardware Mode** in the top banner or top navbar.
2. If no ESP32 is running, notice how the application honestly displays:
   `WAITING FOR ESP32 CONNECTION — Real hardware mode active. Listening for telemetry on WebSocket/MQTT broker. No fake data shown.`
3. When the ESP32 is powered on and publishing, the banner immediately shifts to green `HARDWARE CONNECTED`, receiving live hardware sensor telemetry.

---

## 6. Hardware Implementation & Pinout

| Sensor / Module | ESP32 Pin | Interface | Function |
|---|---|---|---|
| **DHT22 / SHT31** | GPIO 4 / GPIO 21, 22 | 1-Wire / I2C | Temperature & Humidity |
| **HC-SR501 PIR** | GPIO 14 | Digital Input | Macro Motion Detection |
| **LD2410 mmWave** | GPIO 16 (RX), 17 (TX) | UART (115200) | Subtle Breathing / Stationary Presence |
| **ACS712-05B** | GPIO 34 (ADC1_CH6) | Analog (0-3.3V) | AC Line Current Sensing |
| **Fan MOSFET Driver** | GPIO 18 | PWM (25 kHz) | Fan Speed Modulation (0–100%) |
| **Safety Relay** | GPIO 19 | Digital Output | Hard Power Cutoff / Interlock |

---

## 7. Compliance & Engineering Integrity
- **No Fabricated Data in Hardware Mode**: Hardware connection status is honest and verifiable.
- **Hysteresis Dampening**: Configurable deadband prevents chattering and premature fan motor wear.
- **Fail-Safe Fallback**: Configurable default fan behavior in the event of sensor disconnection.

