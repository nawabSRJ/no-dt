export interface DetectionEvent {
  timestamp: Date;
  method: string;
}

export interface GuardOptions {
  // Detection options
  checkInterval?: number;
  viewportThreshold?: number;
  pauseThreshold?: number;
  // Add these new options
  refreshOnDetect?: boolean;    // Enable auto page refresh
  refreshDelay?: number;        // Delay before refresh in milliseconds
  // Blocking options
  blockContextMenu?: boolean;
  blockShortcuts?: boolean;
  showOverlay?: boolean;
  
  // Callbacks
  onDetect?: (event: DetectionEvent) => void;
  onStatusChange?: (isOpen: boolean) => void;
  
  // Debug
  debug?: boolean;
}

export interface GuardState {
  isOpen: boolean;
  detectionCount: number;
  lastDetection?: DetectionEvent;
}