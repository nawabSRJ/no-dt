export interface DetectionEvent {
    timestamp: Date;
    method: string;
}
export interface GuardOptions {
    checkInterval?: number;
    viewportThreshold?: number;
    pauseThreshold?: number;
    refreshOnDetect?: boolean;
    refreshDelay?: number;
    blockContextMenu?: boolean;
    blockShortcuts?: boolean;
    showOverlay?: boolean;
    onDetect?: (event: DetectionEvent) => void;
    onStatusChange?: (isOpen: boolean) => void;
    debug?: boolean;
}
export interface GuardState {
    isOpen: boolean;
    detectionCount: number;
    lastDetection?: DetectionEvent;
}
