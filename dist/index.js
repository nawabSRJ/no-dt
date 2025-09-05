'use strict';

const createViewportDetector = (threshold = 160) => {
    return () => {
        if (typeof window === 'undefined')
            return false;
        const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
        const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
        return widthDiff > threshold || heightDiff > threshold;
    };
};
const createDebuggerDetector = (threshold = 1500) => {
    let lastCheck = Date.now();
    return () => {
        const now = Date.now();
        const diff = now - lastCheck;
        lastCheck = now;
        return diff > threshold;
    };
};
const createConsoleDetector = () => {
    return () => {
        if (typeof window === 'undefined')
            return false;
        let detected = false;
        const element = document.createElement('div');
        Object.defineProperty(element, 'id', {
            get: () => {
                detected = true;
                return 'devtools-probe';
            }
        });
        console.log(element);
        console.clear(); // Clean up after ourselves
        return detected;
    };
};

class NoDT {
    constructor(options = {}) {
        this.state = {
            isOpen: false,
            detectionCount: 0
        };
        this.detectors = [];
        this.intervalId = null;
        this.overlayElement = null;
        this.blockContextMenu = (event) => {
            event.preventDefault();
        };
        this.blockShortcuts = (event) => {
            const key = event.key.toLowerCase();
            const ctrl = event.ctrlKey || event.metaKey;
            // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
            if (key === 'f12' ||
                (ctrl && event.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
                (ctrl && key === 'u')) {
                event.preventDefault();
                event.stopPropagation();
            }
        };
        this.options = Object.assign({ checkInterval: 1000, viewportThreshold: 160, pauseThreshold: 1500, blockContextMenu: true, blockShortcuts: true, showOverlay: true, debug: false }, options);
        this.setupDetectors();
    }
    setupDetectors() {
        this.detectors = [
            { name: 'viewport', detect: createViewportDetector(this.options.viewportThreshold) },
            { name: 'debugger', detect: createDebuggerDetector(this.options.pauseThreshold) },
            { name: 'console', detect: createConsoleDetector() }
        ];
    }
    start() {
        if (typeof window === 'undefined')
            return;
        if (this.intervalId !== null)
            return;
        this.setupEventListeners();
        this.intervalId = window.setInterval(() => {
            this.checkDevTools();
        }, this.options.checkInterval);
        if (this.options.debug) {
            console.log('No-DT started');
        }
    }
    stop() {
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
    checkDevTools() {
        for (const detector of this.detectors) {
            try {
                if (detector.detect()) {
                    this.handleDetection(detector.name);
                    return;
                }
            }
            catch (error) {
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
    handleDetection(method) {
        var _a, _b;
        const event = {
            timestamp: new Date(),
            method
        };
        this.setState({
            isOpen: true,
            detectionCount: this.state.detectionCount + 1,
            lastDetection: event
        });
        (_b = (_a = this.options).onDetect) === null || _b === void 0 ? void 0 : _b.call(_a, event);
    }
    setState(newState) {
        var _a, _b;
        const wasOpen = this.state.isOpen;
        this.state = Object.assign(Object.assign({}, this.state), newState);
        if (this.state.isOpen !== wasOpen) {
            (_b = (_a = this.options).onStatusChange) === null || _b === void 0 ? void 0 : _b.call(_a, this.state.isOpen);
            if (this.state.isOpen) {
                this.applyRestrictions();
            }
            else {
                this.removeRestrictions();
            }
        }
    }
    applyRestrictions() {
        if (this.options.showOverlay) {
            this.showOverlay();
        }
    }
    removeRestrictions() {
        this.removeOverlay();
    }
    showOverlay() {
        if (this.overlayElement || typeof document === 'undefined')
            return;
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
    removeOverlay() {
        if (this.overlayElement) {
            this.overlayElement.remove();
            this.overlayElement = null;
        }
    }
    setupEventListeners() {
        if (typeof document === 'undefined')
            return;
        if (this.options.blockContextMenu) {
            document.addEventListener('contextmenu', this.blockContextMenu);
        }
        if (this.options.blockShortcuts) {
            document.addEventListener('keydown', this.blockShortcuts);
        }
    }
    removeEventListeners() {
        if (typeof document === 'undefined')
            return;
        document.removeEventListener('contextmenu', this.blockContextMenu);
        document.removeEventListener('keydown', this.blockShortcuts);
    }
    getState() {
        return Object.assign({}, this.state);
    }
    isDevToolsOpen() {
        return this.state.isOpen;
    }
}

exports.NoDT = NoDT;
