import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router as api_router
from app.services.telemetry_service import telemetry_manager
from app.mqtt.mqtt_handler import mqtt_handler
from app.models.db_models import init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AeroSense.Main")

# Background simulation loop if no physical hardware is connected
async def background_simulation_loop():
    logger.info("AeroSense background simulation loop started.")
    while True:
        try:
            # If no hardware is actively transmitting, tick simulation
            if not telemetry_manager.is_hardware_connected:
                payload = telemetry_manager.step_simulation()
                await telemetry_manager.broadcast(payload.model_dump_json())
            await asyncio.sleep(1.0)
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error in background simulation loop: {e}")
            await asyncio.sleep(2.0)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    mqtt_handler.start()
    sim_task = asyncio.create_task(background_simulation_loop())
    yield
    # Shutdown
    sim_task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    description="Intelligent SCADA & IoT Backend for AeroSense-Exhaust (atomQUEST 2026)"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST endpoints
app.include_router(api_router, prefix=settings.API_V1_STR)

# Real-time WebSocket Endpoint
@app.websocket("/ws/live")
async def websocket_live_endpoint(websocket: WebSocket):
    await telemetry_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                import json
                msg = json.loads(data)
                action = msg.get("action")
                if action == "fan_control":
                    state = msg.get("state", "ON")
                    speed = msg.get("speed", 50)
                    mode = msg.get("mode", "MANUAL")
                    if telemetry_manager.latest_telemetry:
                        telemetry_manager.latest_telemetry.fan.state = state
                        telemetry_manager.latest_telemetry.fan.speed = speed
                        telemetry_manager.latest_telemetry.fan.mode = mode
                        await telemetry_manager.broadcast(telemetry_manager.latest_telemetry.model_dump_json())
                elif action == "emergency_stop":
                    if telemetry_manager.latest_telemetry:
                        telemetry_manager.latest_telemetry.fan.state = "OFF"
                        telemetry_manager.latest_telemetry.fan.speed = 0
                        telemetry_manager.latest_telemetry.fan.emergency_stopped = True
                        await telemetry_manager.broadcast(telemetry_manager.latest_telemetry.model_dump_json())
            except Exception as e:
                logger.error(f"Error processing client websocket message: {e}")
    except WebSocketDisconnect:
        telemetry_manager.disconnect(websocket)

