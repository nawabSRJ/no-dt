import { GuardOptions, DetectionEvent, GuardState } from './types';
import { createViewportDetector, createDebuggerDetector, createConsoleDetector } from './detectors';

export class NoDT {
  private options: Required<Pick<GuardOptions, 
    'checkInterval' | 'viewportThreshold' | 'pauseThreshold' | 
    'blockContextMenu' | 'blockShortcuts' | 'showOverlay' | 'debug'
  >> & GuardOptions;
  
  private state: GuardState = {
    isOpen: false,
    detectionCount: 0
  };
  
  private detectors: Array<{name: string; detect: () => boolean}> = [];
  private intervalId: number | null = null;
  private overlayElement: HTMLElement | null = null;

  constructor(options: GuardOptions = {}) {
    this.options = {
      checkInterval: 1000,
      viewportThreshold: 160,
      pauseThreshold: 1500,
      blockContextMenu: true,
      blockShortcuts: true,
      showOverlay: true,
      debug: false,
      ...options
    };

    this.setupDetectors();
  }

  private setupDetectors() {
    this.detectors = [
      { name: 'viewport', detect: createViewportDetector(this.options.viewportThreshold) },
      { name: 'debugger', detect: createDebuggerDetector(this.options.pauseThreshold) },
      { name: 'console', detect: createConsoleDetector() }
    ];
  }

  public start(): void {
    if (typeof window === 'undefined') return;
    if (this.intervalId !== null) return;
    
    this.setupEventListeners();
    
    this.intervalId = window.setInterval(() => {
      this.checkDevTools();
    }, this.options.checkInterval);
    
    if (this.options.debug) {
      console.log('No-DT started');
    }
  }

  public stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.removeEventListeners();
    this.removeOverlay();
    
    if (this.options.debug) {
      console.log('No-DT stopped');
    }
  }

  private checkDevTools(): void {
    for (const detector of this.detectors) {
      try {
        if (detector.detect()) {
          this.handleDetection(detector.name);
          return;
        }
      } catch (error) {
        if (this.options.debug) {
          console.warn(`Detector ${detector.name} failed:`, error);
        }
      }
    }
    
    // If no detectors triggered and we were in open state, close it
    if (this.state.isOpen) {
      this.setState({ isOpen: false });
    }
  }

  private handleDetection(method: string): void {
    const event: DetectionEvent = {
      timestamp: new Date(),
      method
    };
    
    this.setState({
      isOpen: true,
      detectionCount: this.state.detectionCount + 1,
      lastDetection: event
    });
    
    this.options.onDetect?.(event);
  }

  private setState(newState: Partial<GuardState>): void {
    const wasOpen = this.state.isOpen;
    this.state = { ...this.state, ...newState };
    
    if (this.state.isOpen !== wasOpen) {
      this.options.onStatusChange?.(this.state.isOpen);
      
      if (this.state.isOpen) {
        this.applyRestrictions();
      } else {
        this.removeRestrictions();
      }
    }
  }

  private applyRestrictions(): void {
    if (this.options.showOverlay) {
      this.showOverlay();
    }
  }

  private removeRestrictions(): void {
    this.removeOverlay();
  }

  private showOverlay(): void {
    if (this.overlayElement || typeof document === 'undefined') return;
    
    this.overlayElement = document.createElement('div');
    this.overlayElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      font-family: Arial, sans-serif;
    `;
    
    this.overlayElement.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h2>Developer Tools Detected</h2>
        <p>For security reasons, developer tools are not allowed on this page.</p>
      </div>
    `;
    
    document.body.appendChild(this.overlayElement);
  }

  private removeOverlay(): void {
    if (this.overlayElement) {
      this.overlayElement.remove();
      this.overlayElement = null;
    }
  }

  private setupEventListeners(): void {
    if (typeof document === 'undefined') return;
    
    if (this.options.blockContextMenu) {
      document.addEventListener('contextmenu', this.blockContextMenu);
    }
    
    if (this.options.blockShortcuts) {
      document.addEventListener('keydown', this.blockShortcuts);
    }
  }

  private removeEventListeners(): void {
    if (typeof document === 'undefined') return;
    
    document.removeEventListener('contextmenu', this.blockContextMenu);
    document.removeEventListener('keydown', this.blockShortcuts);
  }

  private blockContextMenu = (event: Event): void => {
    event.preventDefault();
  };

  private blockShortcuts = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey;
    
    // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
    if (
      key === 'f12' ||
      (ctrl && event.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
      (ctrl && key === 'u')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  public getState(): GuardState {
    return { ...this.state };
  }

  public isDevToolsOpen(): boolean {
    return this.state.isOpen;
  }
}

// src/index.ts
export type { GuardOptions, DetectionEvent, GuardState } from './types';