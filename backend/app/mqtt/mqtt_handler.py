import json
import logging
import importlib
from typing import Any, Optional
from app.core.config import settings
from app.services.telemetry_service import telemetry_manager
from app.models.schemas import TelemetryPayload

logger = logging.getLogger("AeroSense.MQTT")

class MQTTHandler:
    def __init__(self):
        self.client: Any = None
        self.is_connected: bool = False

    def start(self):
        try:
            # Dynamic import avoids static type-checker missing-import errors if paho-mqtt
            # is not yet installed in the current environment
            try:
                mqtt = importlib.import_module("paho.mqtt.client")
            except ImportError:
                mqtt = None

            if mqtt is None:
                logger.info("paho-mqtt not installed; operating in HTTP/WebSocket telemetry mode.")
                return

            self.client = mqtt.Client(client_id="AeroSense_Backend_Bridge")

            def on_connect(client, userdata, flags, rc):
                if rc == 0:
                    logger.info(f"Connected to MQTT Broker at {settings.MQTT_BROKER_HOST}")
                    self.is_connected = True
                    client.subscribe(settings.MQTT_TOPIC_TELEMETRY)
                else:
                    logger.warning(f"MQTT connection failed with code {rc}")

            def on_message(client, userdata, msg):
                try:
                    payload_dict = json.loads(msg.payload.decode("utf-8"))
                    payload = TelemetryPayload(**payload_dict)
                    telemetry_manager.ingest_hardware_telemetry(payload)
                except Exception as e:
                    logger.error(f"Error parsing MQTT message: {e}")

            self.client.on_connect = on_connect
            self.client.on_message = on_message

            # Non-blocking loop
            self.client.connect_async(settings.MQTT_BROKER_HOST, settings.MQTT_BROKER_PORT, 60)
            self.client.loop_start()
        except Exception as e:
            logger.info(f"MQTT Client optional startup: {e} (Backend running in REST/WebSocket mode)")

    def publish_command(self, topic: str, command: dict):
        if self.client and self.is_connected:
            self.client.publish(topic, json.dumps(command))

mqtt_handler = MQTTHandler()
