import asyncio
import json
import random
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Literal
from fastapi import WebSocket
from app.models.schemas import TelemetryPayload, TemperatureReading, HumidityReading, OccupancyReading, PowerReading, FanStatus, SystemNodeStatus

def get_current_time_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

class TelemetryManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.latest_telemetry: Optional[TelemetryPayload] = None
        self.is_hardware_connected: bool = False
        self.last_hardware_timestamp: Optional[datetime] = None
        
        # Synthetic simulation baseline
        self.sim_temp = 27.5
        self.sim_hum = 64.0
        self.sim_occupied = True
        self.sim_fan_speed = 65
        self.sim_fan_state: Literal["OFF", "ON", "LOW", "MEDIUM", "HIGH", "AUTO"] = "AUTO"
        self.sim_fan_mode: Literal["AUTO", "MANUAL"] = "AUTO"
        self.uptime = 48000
        self.daily_kwh = 0.85

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Send initial snapshot immediately
        if self.latest_telemetry:
            await websocket.send_text(self.latest_telemetry.model_dump_json())

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

    def ingest_hardware_telemetry(self, payload: TelemetryPayload):
        self.is_hardware_connected = True
        self.last_hardware_timestamp = datetime.now(timezone.utc)
        self.latest_telemetry = payload

    def step_simulation(self) -> TelemetryPayload:
        self.uptime += 1
        # Gentle drift
        self.sim_hum += (random.random() - 0.49) * 0.2
        self.sim_temp += (random.random() - 0.49) * 0.1
        self.sim_hum = max(35.0, min(90.0, self.sim_hum))
        self.sim_temp = max(18.0, min(38.0, self.sim_temp))

        # Electrical simulation
        current = 0.03 + (self.sim_fan_speed / 100.0) * 0.35 if self.sim_fan_state != "OFF" else 0.02
        power = current * 230.0
        self.daily_kwh += (power / 1000.0) * (1.0 / 3600.0)

        now_iso = get_current_time_iso()

        payload = TelemetryPayload(
            device_id="AEROSENSE_ESP32_01",
            timestamp=now_iso,
            temperature=TemperatureReading(
                value=round(self.sim_temp, 1),
                unit="C",
                status="valid",
                min=23.0,
                max=32.0,
                trend="rising" if random.random() > 0.5 else "falling"
            ),
            humidity=HumidityReading(
                value=round(self.sim_hum, 1),
                unit="%",
                status="valid",
                trend="stable"
            ),
            occupancy=OccupancyReading(
                detected=self.sim_occupied,
                sensor_type="both",
                pir_detected=self.sim_occupied,
                mmwave_detected=self.sim_occupied,
                last_detection=now_iso,
                status="valid"
            ),
            power=PowerReading(
                current=round(current, 2),
                voltage=230.0,
                power=round(power, 1),
                energy=round(self.daily_kwh, 3),
                daily_kwh=round(self.daily_kwh, 3),
                status="valid",
                is_simulated=True
            ),
            fan=FanStatus(
                state=self.sim_fan_state,
                mode=self.sim_fan_mode,
                speed=self.sim_fan_speed,
                actuator_connected=True,
                command_status="SUCCESS",
                last_command_time=now_iso
            ),
            system=SystemNodeStatus(
                esp32_connected=self.is_hardware_connected,
                ip_address="192.168.1.142" if self.is_hardware_connected else None,
                wifi_rssi=-62 if self.is_hardware_connected else None,
                last_heartbeat=now_iso,
                firmware_version="v2.4.1-atomQUEST",
                uptime_seconds=self.uptime,
                health_score=98
            )
        )
        self.latest_telemetry = payload
        return payload

telemetry_manager = TelemetryManager()
