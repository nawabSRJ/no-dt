import { GuardOptions, GuardState } from './types';
export declare class NoDT {
    private options;
    private state;
    private detectors;
    private intervalId;
    private overlayElement;
    constructor(options?: GuardOptions);
    private setupDetectors;
    start(): void;
    stop(): void;
    private checkDevTools;
    private handleDetection;
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
export type { GuardOptions, DetectionEvent, GuardState } from './types';
