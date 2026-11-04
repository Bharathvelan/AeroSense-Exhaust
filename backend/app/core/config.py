import os

class Settings:
    PROJECT_NAME: str = "AeroSense-Exhaust SCADA Backend"
    VERSION: str = "2.4.1"
    API_V1_STR: str = "/api/v1"
    
    # SQLite local DB for fast setup, easily switchable to Postgres
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./aerosense.db")
    
    # MQTT Broker Configuration
    MQTT_BROKER_HOST: str = os.getenv("MQTT_BROKER_HOST", "broker.emqx.io")
    MQTT_BROKER_PORT: int = int(os.getenv("MQTT_BROKER_PORT", "1883"))
    MQTT_TOPIC_TELEMETRY: str = os.getenv("MQTT_TOPIC_TELEMETRY", "aerosense/device/telemetry")
    MQTT_TOPIC_COMMAND: str = os.getenv("MQTT_TOPIC_COMMAND", "aerosense/device/command")
    
    # Simulation
    ENABLE_BACKEND_SIMULATION: bool = True

settings = Settings()
