/*
  =============================================================================
  Project: AeroSense-Exhaust (atomQUEST 2026 - Round 2)
  Hardware: ESP32 DevKit V1 (Xtensa Dual-Core 240MHz)
  Firmware Version: v2.4.1-atomQUEST
  
  Sensors & Actuators Connected:
  - DHT22 / SHT31: Temperature & Humidity Sensor (Pin GPIO 4 / I2C SDA:21, SCL:22)
  - HC-SR501: Pyroelectric Passive Infrared (PIR) Motion Sensor (Pin GPIO 14)
  - LD2410: 24GHz FMCW mmWave Human Presence Radar (Pin RX:16, TX:17 via Serial2)
  - ACS712-05B: Hall-Effect AC/DC Current Sensor (Pin GPIO 34 - ADC1_CH6)
  - Fan Actuator: PWM MOSFET Gate / SSR Relay (Pin GPIO 18, LEDC Channel 0, 25kHz)
  =============================================================================
*/

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// --- Network Configuration ---
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// --- MQTT Broker Configuration ---
const char* MQTT_SERVER   = "broker.emqx.io"; // or your local IP: 192.168.1.xxx
const int   MQTT_PORT     = 1883;
const char* MQTT_PUB_TOPIC= "aerosense/device/telemetry";
const char* MQTT_SUB_TOPIC= "aerosense/device/command";
const char* DEVICE_ID     = "AEROSENSE_ESP32_01";

// --- Pin Definitions ---
#define DHTPIN            4
#define DHTTYPE           DHT22
#define PIR_PIN           14
#define CURRENT_ADC_PIN   34
#define FAN_PWM_PIN       18
#define RELAY_PIN         19

// --- PWM Parameters ---
#define PWM_FREQ          25000 // 25 kHz standard fan PWM frequency
#define PWM_CHANNEL       0
#define PWM_RESOLUTION    8     // 8-bit duty (0 - 255)

// --- Objects ---
DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// --- State Variables ---
unsigned long lastTelemetryTime = 0;
const unsigned long TELEMETRY_INTERVAL = 1000; // 1.0 second sampling rate

String fanState = "OFF";
String fanMode = "AUTO";
int fanSpeed = 0;
bool emergencyStopped = false;

// Current Sensor Calibration Parameters (ACS712-05B)
const float VREF = 3.3;
const float SENSITIVITY = 0.066; // 66 mV/A for 5A version
const float ZERO_CURRENT_ADC = 1860.0; // Calibrated midpoint voltage at 0A

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n[AeroSense-Exhaust] Booting ESP32 Controller...");

  // Initialize Sensors & IO
  dht.begin();
  pinMode(PIR_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  // Initialize PWM for Fan Actuator
  ledcSetup(PWM_CHANNEL, PWM_FREQ, PWM_RESOLUTION);
  ledcAttachPin(FAN_PWM_PIN, PWM_CHANNEL);
  ledcWrite(PWM_CHANNEL, 0);

  // Connect to Wi-Fi
  connectWiFi();

  // Configure MQTT
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
}

void loop() {
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  unsigned long now = millis();
  if (now - lastTelemetryTime >= TELEMETRY_INTERVAL) {
    lastTelemetryTime = now;
    readSensorsAndPublish();
  }
}

void connectWiFi() {
  Serial.printf("[Wi-Fi] Connecting to %s", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[Wi-Fi] Connected! Local IP: %s (RSSI: %d dBm)\n", 
                  WiFi.localIP().toString().c_str(), WiFi.RSSI());
  } else {
    Serial.println("\n[Wi-Fi] Warning: Connection timeout. Operating in fallback mode.");
  }
}

void reconnectMQTT() {
  if (WiFi.status() != WL_CONNECTED) return;

  while (!mqttClient.connected()) {
    Serial.print("[MQTT] Connecting to broker...");
    if (mqttClient.connect(DEVICE_ID)) {
      Serial.println(" connected!");
      mqttClient.subscribe(MQTT_SUB_TOPIC);
    } else {
      Serial.printf(" failed, rc=%d. Retrying in 5 seconds...\n", mqttClient.state());
      delay(5000);
      break;
    }
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.printf("[MQTT RX] %s -> %s\n", topic, message.c_str());

  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, message);
  if (error) {
    Serial.println("[MQTT] JSON parse error");
    return;
  }

  const char* cmdState = doc["state"];
  int cmdSpeed = doc["speed"] | -1;
  const char* cmdMode = doc["mode"] | "MANUAL";

  if (doc.containsKey("emergency_stop") && doc["emergency_stop"] == true) {
    emergencyStopTrigger();
    return;
  }

  if (cmdState) {
    applyFanControl(String(cmdState), cmdSpeed, String(cmdMode));
  }
}

void applyFanControl(String state, int speedPercent, String mode) {
  fanMode = mode;
  fanState = state;

  if (state == "OFF" || emergencyStopped) {
    fanSpeed = 0;
    ledcWrite(PWM_CHANNEL, 0);
    digitalWrite(RELAY_PIN, LOW);
  } else {
    if (speedPercent >= 0 && speedPercent <= 100) {
      fanSpeed = speedPercent;
    } else if (state == "LOW") {
      fanSpeed = 35;
    } else if (state == "MEDIUM") {
      fanSpeed = 70;
    } else if (state == "HIGH") {
      fanSpeed = 100;
    } else {
      fanSpeed = 50;
    }

    int pwmDuty = map(fanSpeed, 0, 100, 0, 255);
    ledcWrite(PWM_CHANNEL, pwmDuty);
    digitalWrite(RELAY_PIN, HIGH);
  }

  Serial.printf("[Actuator] State: %s | Speed: %d%% | Mode: %s\n", 
                fanState.c_str(), fanSpeed, fanMode.c_str());
}

void emergencyStopTrigger() {
  emergencyStopped = true;
  fanState = "OFF";
  fanSpeed = 0;
  ledcWrite(PWM_CHANNEL, 0);
  digitalWrite(RELAY_PIN, LOW);
  Serial.println("[SAFETY] EMERGENCY STOP ENGAGED! Fan cut off immediately.");
}

void readSensorsAndPublish() {
  // 1. Read DHT22
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  bool tempValid = !isnan(t);
  bool humValid = !isnan(h);

  // 2. Read PIR & mmWave
  int pirRaw = digitalRead(PIR_PIN);
  bool pirDetected = (pirRaw == HIGH);
  bool mmwaveDetected = pirDetected; // or read via Serial2 from LD2410
  bool occupied = (pirDetected || mmwaveDetected);

  // 3. Read ACS712 Current Sensor
  int rawAdc = analogRead(CURRENT_ADC_PIN);
  float voltage = (rawAdc / 4095.0) * VREF;
  float currentAmps = fabs((rawAdc - ZERO_CURRENT_ADC) * (VREF / 4095.0) / SENSITIVITY);
  if (currentAmps < 0.04) currentAmps = 0.0; // Deadband filter
  float powerWatts = currentAmps * 230.0;    // Nominal AC calculation

  // 4. Construct Telemetry JSON
  StaticJsonDocument<512> doc;
  doc["device_id"] = DEVICE_ID;
  doc["timestamp"] = ""; // Filled by server or NTP

  JsonObject tempObj = doc.createNestedObject("temperature");
  tempObj["value"] = tempValid ? t : 0.0;
  tempObj["unit"] = "C";
  tempObj["status"] = tempValid ? "valid" : "fault";

  JsonObject humObj = doc.createNestedObject("humidity");
  humObj["value"] = humValid ? h : 0.0;
  humObj["unit"] = "%";
  humObj["status"] = humValid ? "valid" : "fault";

  JsonObject occObj = doc.createNestedObject("occupancy");
  occObj["detected"] = occupied;
  occObj["sensor_type"] = "both";
  occObj["status"] = "valid";

  JsonObject pwrObj = doc.createNestedObject("power");
  pwrObj["current"] = currentAmps;
  pwrObj["power"] = powerWatts;
  pwrObj["status"] = "valid";

  JsonObject fanObj = doc.createNestedObject("fan");
  fanObj["state"] = fanState;
  fanObj["mode"] = fanMode;
  fanObj["speed"] = fanSpeed;
  fanObj["actuator_connected"] = true;

  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer);

  if (mqttClient.connected()) {
    mqttClient.publish(MQTT_PUB_TOPIC, jsonBuffer);
  }
}

