import { TelemetryData } from '../types';

export type WSStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export class LiveWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private onMessageCallback: ((data: TelemetryData) => void) | null = null;
  private onStatusChangeCallback: ((status: WSStatus) => void) | null = null;
  private reconnectInterval = 5000;
  private isIntentionalClose = false;

  constructor(url: string = 'ws://localhost:8000/ws/live') {
    this.url = url;
  }

  public connect(
    onMessage: (data: TelemetryData) => void,
    onStatusChange: (status: WSStatus) => void
  ) {
    this.onMessageCallback = onMessage;
    this.onStatusChangeCallback = onStatusChange;
    this.isIntentionalClose = false;
    this.initSocket();
  }

  private initSocket() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // ignore
      }
    }

    this.onStatusChangeCallback?.('connecting');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.onStatusChangeCallback?.('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.telemetry) {
            this.onMessageCallback?.(data.telemetry);
          } else if (data && data.temperature) {
            this.onMessageCallback?.(data);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message', err);
        }
      };

      this.ws.onerror = () => {
        this.onStatusChangeCallback?.('error');
      };

      this.ws.onclose = () => {
        this.onStatusChangeCallback?.('disconnected');
        if (!this.isIntentionalClose) {
          setTimeout(() => {
            if (!this.isIntentionalClose) {
              this.initSocket();
            }
          }, this.reconnectInterval);
        }
      };
    } catch (e) {
      this.onStatusChangeCallback?.('disconnected');
    }
  }

  public send(payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  public disconnect() {
    this.isIntentionalClose = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.onStatusChangeCallback?.('disconnected');
  }
}

