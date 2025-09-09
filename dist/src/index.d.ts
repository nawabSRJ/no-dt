import { GuardOptions, GuardState } from "./types";
export declare class NoDT {
    private options;
    private state;
    private detectors;
    private intervalId;
    private overlayElement;
    private isRefreshing;
    private debuggerInterval;
    private floodInterval;
    private cpuInterval;
    private originalConsole;
    constructor(options?: GuardOptions);
    private setupDetectors;
    private storeOriginalConsole;
    start(): void;
    isMonitoring(): boolean;
    getIntervalId(): number | null;
    stop(): void;
    private checkDevTools;
    private handleDetection;
    private initiatePageRefresh;
    private immediateRefresh;
    /**
     * Comprehensive DevTools disruption - Combined Robust Approach
     */
    private disruptDevToolsAdvanced;
    private setupDebuggerTraps;
    private floodConsoleAdvanced;
    private cpuLoadTechnique;
    private overrideConsole;
    private protectDOM;
    private cleanupDisruption;
    private clearSensitiveData;
    private updateOverlayWithRefreshWarning;
    private setState;
    private applyRestrictions;
    private removeRestrictions;
    private showOverlay;
    private removeOverlay;
    private setupEventListeners;
    private removeEventListeners;
    private blockContextMenu;
    private blockShortcuts;
    getState(): GuardState;
    isDevToolsOpen(): boolean;
}
export type { GuardOptions, DetectionEvent, GuardState } from "./types";
