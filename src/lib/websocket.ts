import { CrossDeviceSyncMessage, VideoProgress } from '../types';

/**
 * WebSocket Service for Cross-Device Video Synchronization
 * Handles real-time communication between devices for video progress sync
 */
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageQueue: CrossDeviceSyncMessage[] = [];
  private isConnected = false;
  private userId: string | null = null;
  private deviceId: string | null = null;
  private sessionId: string | null = null;
  private messageHandlers: Map<string, (message: CrossDeviceSyncMessage) => void> = new Map();
  private initialized = false;

  constructor() {
    // Don't initialize immediately - wait for browser environment
  }

  /**
   * Initialize the service (should be called in browser environment)
   */
  private initialize(): void {
    if (this.initialized) return;

    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      this.generateDeviceId();
      this.generateSessionId();
      this.initialized = true;
    } else {
      console.warn('WebSocketService: Not in browser environment, skipping initialization');
    }
  }

  /**
   * Generate a unique device identifier
   */
  private generateDeviceId(): void {
    if (!this.deviceId && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const storedDeviceId = localStorage.getItem('deviceId');
      if (storedDeviceId) {
        this.deviceId = storedDeviceId;
      } else {
        this.deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('deviceId', this.deviceId);
      }
    }
  }

  /**
   * Generate a unique session identifier
   */
  private generateSessionId(): void {
    if (!this.sessionId) {
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  /**
   * Connect to WebSocket server
   */
  public connect(userId: string, serverUrl: string = 'ws://localhost:3002'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Initialize if not already done
        this.initialize();

        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
          reject(new Error('WebSocket connection not available in server environment'));
          return;
        }

        this.userId = userId;
        this.ws = new WebSocket(`${serverUrl}/ws/video-sync`);

        this.ws.onopen = () => {
          console.log('🔗 WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;

          // Send device connection message
          this.sendMessage({
            type: 'device_connected',
            userId: this.userId!,
            deviceId: this.deviceId!,
            sessionId: this.sessionId!,
            payload: {
              timestamp: new Date().toISOString()
            }
          });

          // Process queued messages
          this.processMessageQueue();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: CrossDeviceSyncMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect to WebSocket server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      this.reconnectAttempts++;

      if (this.userId) {
        this.connect(this.userId).catch(() => {
          // Exponential backoff
          this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
        });
      }
    }, this.reconnectDelay);
  }

  /**
   * Send a message to the WebSocket server
   */
  public sendMessage(message: CrossDeviceSyncMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // Queue message for later if not connected
      this.messageQueue.push(message);
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      this.messageQueue.push(message);
    }
  }

  /**
   * Process queued messages
   */
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: CrossDeviceSyncMessage): void {
    // Don't process messages from the same device
    if (message.deviceId === this.deviceId) {
      return;
    }

    // Call registered handlers
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }

    // Log message for debugging
    console.log('📨 Received WebSocket message:', message);
  }

  /**
   * Register a message handler
   */
  public onMessage(type: string, handler: (message: CrossDeviceSyncMessage) => void): void {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Remove a message handler
   */
  public offMessage(type: string): void {
    this.messageHandlers.delete(type);
  }

  /**
   * Send video progress update
   */
  public sendProgressUpdate(progress: VideoProgress): void {
    // Initialize if not already done
    this.initialize();

    this.sendMessage({
      type: 'progress_update',
      userId: this.userId!,
      deviceId: this.deviceId!,
      sessionId: this.sessionId!,
      payload: {
        courseId: progress.courseId,
        lessonId: progress.lessonId,
        currentTime: progress.currentTime,
        isPlaying: progress.isPlaying,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Send play state update
   */
  public sendPlayStateUpdate(courseId: string, lessonId: string, isPlaying: boolean): void {
    // Initialize if not already done
    this.initialize();

    this.sendMessage({
      type: 'play_state',
      userId: this.userId!,
      deviceId: this.deviceId!,
      sessionId: this.sessionId!,
      payload: {
        courseId,
        lessonId,
        isPlaying,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Send resume point update
   */
  public sendResumePoint(courseId: string, lessonId: string, resumeTime: number): void {
    // Initialize if not already done
    this.initialize();

    this.sendMessage({
      type: 'resume_point',
      userId: this.userId!,
      deviceId: this.deviceId!,
      sessionId: this.sessionId!,
      payload: {
        courseId,
        lessonId,
        resumeTime,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    // Initialize if not already done
    this.initialize();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      // Send disconnect message
      this.sendMessage({
        type: 'device_disconnected',
        userId: this.userId!,
        deviceId: this.deviceId!,
        sessionId: this.sessionId!,
        payload: {
          timestamp: new Date().toISOString()
        }
      });

      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get device ID
   */
  public getDeviceId(): string | null {
    // Initialize if not already done
    this.initialize();
    return this.deviceId;
  }

  /**
   * Get session ID
   */
  public getSessionId(): string | null {
    // Initialize if not already done
    this.initialize();
    return this.sessionId;
  }
}

// Lazy-loaded singleton pattern
let websocketServiceInstance: WebSocketService | null = null;

const getWebSocketService = (): WebSocketService => {
  if (!websocketServiceInstance) {
    websocketServiceInstance = new WebSocketService();
  }
  return websocketServiceInstance;
};

export default getWebSocketService;