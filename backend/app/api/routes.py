from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from app.models.schemas import (
    TelemetryPayload, 
    FanControlCommand, 
    AutomationRuleSchema, 
    AlertSchema
)
from app.services.telemetry_service import telemetry_manager

router = APIRouter()

def get_current_time_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

# In-memory default automation rules
AUTOMATION_RULES = [
    AutomationRuleSchema(
        id="rule-1",
        name="High Humidity Rapid Exhaust",
        code="RULE-HUM-01",
        description="If relative humidity exceeds warning threshold for > 15s, automatically activate exhaust fan to purge moisture.",
        enabled=True,
        condition_type="humidity",
        threshold_value=65.0,
        duration_seconds=15,
        hysteresis=5.0,
        action_description="Request ventilation at HIGH until humidity drops below 60%.",
        trigger_count=14,
        status="active"
    ),
    AutomationRuleSchema(
        id="rule-2",
        name="Occupancy-Based Fresh Air Exchange",
        code="RULE-OCC-01",
        description="When occupancy is detected by PIR or mmWave radar, evaluate environmental conditions and initiate baseline ventilation.",
        enabled=True,
        condition_type="occupancy",
        threshold_value=1.0,
        duration_seconds=10,
        hysteresis=0.0,
        action_description="Switch fan to LOW mode (35%) to maintain continuous air renewal.",
        trigger_count=52,
        status="active"
    ),
    AutomationRuleSchema(
        id="rule-3",
        name="Unoccupied Smart Setback",
        code="RULE-UNOCC-01",
        description="When the room is confirmed unoccupied for 120s, evaluate if humidity purge is required before turning off fan.",
        enabled=True,
        condition_type="unoccupied",
        threshold_value=120.0,
        duration_seconds=120,
        hysteresis=0.0,
        action_description="Safely power OFF fan if humidity is below warning threshold.",
        trigger_count=38,
        status="active"
    )
]

ALERTS_STORE = [
    AlertSchema(
        id="alt-001",
        title="High Humidity Warning Threshold Exceeded",
        category="High Humidity",
        severity="warning",
        timestamp=get_current_time_iso(),
        description="Relative humidity reached 71.4%, surpassing the configured warning limit of 65.0%.",
        sensor="DHT22 / SHT31 Environmental Sensor",
        value="71.4%",
        recommended_action="Verify ventilation airflow rate and check if local water vapor source is active.",
        acknowledged=False,
        read=False
    )
]

@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "service": "AeroSense SCADA Backend",
        "timestamp": get_current_time_iso(),
        "hardware_connected": telemetry_manager.is_hardware_connected
    }

@router.get("/system/status")
def get_system_status():
    tel = telemetry_manager.latest_telemetry
    return {
        "device_id": tel.device_id if tel else "AEROSENSE_ESP32_01",
        "hardware_connected": telemetry_manager.is_hardware_connected,
        "operating_mode": "HARDWARE" if telemetry_manager.is_hardware_connected else "SIMULATION",
        "active_ws_clients": len(telemetry_manager.active_connections),
        "system_health": 98.4,
        "firmware": "v2.4.1-atomQUEST",
        "timestamp": get_current_time_iso()
    }

@router.get("/sensors/latest", response_model=TelemetryPayload)
def get_latest_sensors():
    if not telemetry_manager.latest_telemetry:
        return telemetry_manager.step_simulation()
    return telemetry_manager.latest_telemetry

@router.get("/sensors/history")
def get_sensor_history(timeframe: str = Query("24h")):
    tel = telemetry_manager.latest_telemetry or telemetry_manager.step_simulation()
    return {
        "timeframe": timeframe,
        "device_id": tel.device_id,
        "count": 60,
        "points": []
    }

@router.get("/energy/summary")
def get_energy_summary():
    tel = telemetry_manager.latest_telemetry or telemetry_manager.step_simulation()
    return {
        "current_amps": tel.power.current,
        "power_watts": tel.power.power,
        "daily_kwh": tel.power.daily_kwh,
        "is_simulated": tel.power.is_simulated,
        "timestamp": get_current_time_iso()
    }

@router.get("/occupancy/status")
def get_occupancy_status():
    tel = telemetry_manager.latest_telemetry or telemetry_manager.step_simulation()
    return tel.occupancy

@router.get("/fan/status")
def get_fan_status():
    tel = telemetry_manager.latest_telemetry or telemetry_manager.step_simulation()
    return tel.fan

@router.post("/fan/control")
async def post_fan_control(command: FanControlCommand):
    if telemetry_manager.latest_telemetry:
        telemetry_manager.latest_telemetry.fan.state = command.state
        telemetry_manager.latest_telemetry.fan.mode = command.mode or "MANUAL"
        telemetry_manager.latest_telemetry.fan.speed = command.speed or 0
        telemetry_manager.latest_telemetry.fan.command_status = "SUCCESS"
        telemetry_manager.latest_telemetry.fan.last_command_time = get_current_time_iso()

        # Broadcast change to all WebSockets
        await telemetry_manager.broadcast(telemetry_manager.latest_telemetry.model_dump_json())

    return {
        "status": "command_dispatched",
        "command": command,
        "timestamp": get_current_time_iso()
    }

@router.get("/automation/rules", response_model=List[AutomationRuleSchema])
def get_automation_rules():
    return AUTOMATION_RULES

@router.post("/automation/rules", response_model=AutomationRuleSchema)
def create_automation_rule(rule: AutomationRuleSchema):
    AUTOMATION_RULES.append(rule)
    return rule

@router.get("/alerts", response_model=List[AlertSchema])
def get_alerts():
    return ALERTS_STORE

@router.post("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str):
    for a in ALERTS_STORE:
        if a.id == alert_id:
            a.acknowledged = True
            a.read = True
            return {"status": "acknowledged", "alert_id": alert_id}
    raise HTTPException(status_code=404, detail="Alert not found")

@router.get("/devices")
def get_devices():
    tel = telemetry_manager.latest_telemetry or telemetry_manager.step_simulation()
    return {
        "primary_controller": {
            "device_id": tel.device_id,
            "connected": telemetry_manager.is_hardware_connected,
            "ip": tel.system.ip_address if tel.system else None,
            "rssi": tel.system.wifi_rssi if tel.system else None,
        },
        "sensors": ["SHT31", "LD2410", "PIR", "ACS712"]
    }

@router.post("/telemetry")
async def ingest_esp32_telemetry(payload: TelemetryPayload):
    telemetry_manager.ingest_hardware_telemetry(payload)
    await telemetry_manager.broadcast(payload.model_dump_json())
    return {"status": "ingested", "timestamp": get_current_time_iso()}
