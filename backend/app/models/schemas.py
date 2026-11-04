from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime, timezone

def get_current_time_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

class TemperatureReading(BaseModel):
    value: float
    unit: str = "C"
    status: Literal["valid", "warning", "critical", "disconnected", "fault"] = "valid"
    min: Optional[float] = None
    max: Optional[float] = None
    trend: Optional[str] = "stable"

class HumidityReading(BaseModel):
    value: float
    unit: str = "%"
    status: Literal["valid", "warning", "critical", "disconnected", "fault"] = "valid"
    trend: Optional[str] = "stable"

class OccupancyReading(BaseModel):
    detected: bool
    sensor_type: Literal["PIR", "mmWave", "both", "not_configured"] = "both"
    pir_detected: Optional[bool] = False
    mmwave_detected: Optional[bool] = False
    last_detection: Optional[str] = None
    status: Literal["valid", "fault", "disconnected"] = "valid"

class PowerReading(BaseModel):
    current: float = 0.0
    voltage: Optional[float] = None
    power: Optional[float] = None
    energy: Optional[float] = None
    daily_kwh: Optional[float] = 0.0
    status: Literal["valid", "not_calibrated", "fault"] = "valid"
    is_simulated: bool = False

class FanStatus(BaseModel):
    state: Literal["OFF", "ON", "LOW", "MEDIUM", "HIGH", "AUTO"] = "AUTO"
    mode: Literal["AUTO", "MANUAL"] = "AUTO"
    speed: int = 0
    actuator_connected: bool = False
    command_status: str = "IDLE"
    last_command_time: Optional[str] = None
    emergency_stopped: bool = False

class SystemNodeStatus(BaseModel):
    esp32_connected: bool = False
    ip_address: Optional[str] = None
    wifi_rssi: Optional[int] = None
    last_heartbeat: Optional[str] = None
    firmware_version: str = "v2.4.1"
    uptime_seconds: int = 0
    health_score: int = 100

class TelemetryPayload(BaseModel):
    device_id: str = "AEROSENSE_ESP32_01"
    timestamp: str = Field(default_factory=get_current_time_iso)
    temperature: TemperatureReading
    humidity: HumidityReading
    occupancy: OccupancyReading
    power: PowerReading
    fan: FanStatus
    system: Optional[SystemNodeStatus] = None

class FanControlCommand(BaseModel):
    state: Literal["OFF", "ON", "LOW", "MEDIUM", "HIGH", "AUTO"]
    speed: Optional[int] = 0
    mode: Optional[Literal["AUTO", "MANUAL"]] = "MANUAL"

class AutomationRuleSchema(BaseModel):
    id: str
    name: str
    code: str
    description: str
    enabled: bool = True
    condition_type: str
    threshold_value: float
    duration_seconds: int
    hysteresis: float
    action_description: str
    trigger_count: int = 0
    status: str = "active"

class AlertSchema(BaseModel):
    id: str
    title: str
    category: str
    severity: Literal["critical", "warning", "info"]
    timestamp: str
    description: str
    sensor: str
    value: Optional[str] = None
    recommended_action: str
    acknowledged: bool = False
    read: bool = False
