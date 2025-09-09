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
        // console.clear(); // Clean up after ourselves
        return detected;
    };
};

class NoDT {
    constructor(options = {}) {
        this.state = {
            isOpen: false,
            detectionCount: 0,
        };
        this.detectors = [];
        this.intervalId = null;
        this.overlayElement = null;
        this.isRefreshing = false;
        // New properties for robust disruption
        this.debuggerInterval = null;
        this.floodInterval = null;
        this.cpuInterval = null;
        this.originalConsole = {};
        this.blockContextMenu = (event) => {
            event.preventDefault();
        };
        this.blockShortcuts = (event) => {
            const key = event.key.toLowerCase();
            const ctrl = event.ctrlKey || event.metaKey;
            if (key === "f12" ||
                (ctrl && event.shiftKey && (key === "i" || key === "j" || key === "c")) ||
                (ctrl && key === "u")) {
                event.preventDefault();
                event.stopPropagation();
            }
        };
        this.options = Object.assign({ checkInterval: 1000, viewportThreshold: 160, pauseThreshold: 1500, blockContextMenu: true, blockShortcuts: true, showOverlay: true, debug: false, refreshOnDetect: false, refreshDelay: 2000 }, options);
        this.setupDetectors();
        this.storeOriginalConsole();
    }
    setupDetectors() {
        this.detectors = [
            {
                name: "viewport",
                detect: createViewportDetector(this.options.viewportThreshold),
            },
            {
                name: "debugger",
                detect: createDebuggerDetector(this.options.pauseThreshold),
            },
            { name: "console", detect: createConsoleDetector() },
        ];
    }
    storeOriginalConsole() {
        // Store original console methods for potential restoration
        this.originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info,
            debug: console.debug,
        };
    }
    start() {
        if (typeof window === "undefined")
            return;
        if (this.intervalId !== null) {
            if (this.options.debug) {
                console.log("No-DT already started");
            }
            return;
        }
        this.setupEventListeners();
        this.intervalId = window.setInterval(() => {
            if (this.options.debug) {
                console.log("Running periodic DevTools check...");
            }
            this.checkDevTools();
        }, this.options.checkInterval);
        this.checkDevTools();
        if (this.options.debug) {
            console.log("No-DT started with interval:", this.options.checkInterval);
        }
    }
    isMonitoring() {
        return this.intervalId !== null;
    }
    getIntervalId() {
        return this.intervalId;
    }
    stop() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.removeEventListeners();
        this.removeOverlay();
        this.cleanupDisruption(); // Clean up all disruption techniques
        if (this.options.debug) {
            console.log("No-DT stopped");
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
        if (this.state.isOpen) {
            this.setState({ isOpen: false });
        }
    }
    handleDetection(method) {
        var _a, _b;
        const wasOpen = this.state.isOpen;
        const event = {
            timestamp: new Date(),
            method,
        };
        this.setState({
            isOpen: true,
            detectionCount: this.state.detectionCount + 1,
            lastDetection: event,
        });
        (_b = (_a = this.options).onDetect) === null || _b === void 0 ? void 0 : _b.call(_a, event);
        if (!wasOpen && this.options.refreshOnDetect && !this.isRefreshing) {
            // 30% chance of immediate refresh to prevent bypass
            const useImmediate = Math.random() > 0.7;
            if (useImmediate) {
                this.immediateRefresh();
            }
            else {
                this.initiatePageRefresh();
            }
        }
    }
    initiatePageRefresh() {
        this.isRefreshing = true;
        if (this.options.debug) {
            console.warn("🛑 Security: DevTools detected - page will refresh in", this.options.refreshDelay, "ms");
        }
        this.updateOverlayWithRefreshWarning();
        this.disruptDevToolsAdvanced(); // Use advanced disruption
        setTimeout(() => {
            if (typeof window !== "undefined") {
                this.clearSensitiveData();
                window.location.reload();
            }
        }, this.options.refreshDelay);
    }
    immediateRefresh() {
        try {
            sessionStorage.removeItem('devtoolsOpen');
            localStorage.removeItem('devtoolsOpen');
            window.location.reload();
        }
        catch (error) {
            window.location.reload();
        }
    }
    /**
     * Comprehensive DevTools disruption - Combined Robust Approach
     */
    disruptDevToolsAdvanced() {
        try {
            this.setupDebuggerTraps();
            this.floodConsoleAdvanced();
            this.cpuLoadTechnique();
            this.overrideConsole();
            this.protectDOM();
        }
        catch (error) {
            // Silently fail
        }
    }
    setupDebuggerTraps() {
        if (this.debuggerInterval)
            return;
        const debuggerPatterns = [
            () => { Function('de' + 'bu' + 'gger')(); },
            () => { (function () { debugger; })(); },
            () => { setTimeout('debugger', 50); },
        ];
        let patternIndex = 0;
        this.debuggerInterval = setInterval(() => {
            if (patternIndex >= debuggerPatterns.length)
                patternIndex = 0;
            try {
                debuggerPatterns[patternIndex++]();
            }
            catch (e) {
                // Ignore errors
            }
        }, 100);
    }
    floodConsoleAdvanced() {
        if (this.floodInterval)
            return;
        const messages = [
            'Security violation detected - DevTools not allowed',
            '🛑 Developer Tools detection active',
            'Page refresh imminent - close DevTools',
            'Console access monitored for security',
            'This application does not permit DevTools usage'
        ];
        this.floodInterval = setInterval(() => {
            try {
                for (let i = 0; i < 20; i++) {
                    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
                    const randomPrefix = Math.random().toString(36).substring(2, 5);
                    console.log(`${randomPrefix}: ${randomMsg}`);
                }
            }
            catch (e) {
                // Console might be unavailable
            }
        }, 200);
    }
    cpuLoadTechnique() {
        if (this.cpuInterval)
            return;
        this.cpuInterval = setInterval(() => {
            let result = 0;
            for (let i = 0; i < 1000000; i++) {
                result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
            }
            if (result > 1000000 && this.options.debug) {
                console.log('CPU security monitoring active');
            }
        }, 100);
    }
    overrideConsole() {
        try {
            console.log = function () { };
            console.error = function () { };
            console.warn = function () { };
            console.info = function () { };
            console.debug = function () { };
        }
        catch (error) {
            // Silently fail
        }
    }
    protectDOM() {
        try {
            // Add random data attributes to make DOM inspection messy
            const addRandomAttributes = () => {
                const allElements = document.querySelectorAll('*');
                allElements.forEach((el, index) => {
                    if (index % 10 === 0) { // Only modify every 10th element
                        el.setAttribute('data-security-' + Math.random().toString(36).substring(2), 'protected');
                    }
                });
            };
            addRandomAttributes();
            setInterval(addRandomAttributes, 5000);
        }
        catch (error) {
            // Silently fail
        }
    }
    cleanupDisruption() {
        if (this.debuggerInterval) {
            clearInterval(this.debuggerInterval);
            this.debuggerInterval = null;
        }
        if (this.floodInterval) {
            clearInterval(this.floodInterval);
            this.floodInterval = null;
        }
        if (this.cpuInterval) {
            clearInterval(this.cpuInterval);
            this.cpuInterval = null;
        }
        // Restore original console methods
        try {
            if (this.originalConsole.log)
                console.log = this.originalConsole.log;
            if (this.originalConsole.error)
                console.error = this.originalConsole.error;
            if (this.originalConsole.warn)
                console.warn = this.originalConsole.warn;
            if (this.originalConsole.info)
                console.info = this.originalConsole.info;
            if (this.originalConsole.debug)
                console.debug = this.originalConsole.debug;
        }
        catch (error) {
            // Silently fail
        }
    }
    clearSensitiveData() {
        try {
            sessionStorage.clear();
        }
        catch (error) {
            if (this.options.debug) {
                console.warn("Failed to clear some storage:", error);
            }
        }
    }
    updateOverlayWithRefreshWarning() {
        if (!this.overlayElement || typeof document === "undefined")
            return;
        const seconds = this.options.refreshDelay / 1000;
        this.overlayElement.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <h2>⚠️ Security Alert: Developer Tools Detected</h2>
      <p>Advanced security measures activated.</p>
      <p style="font-size: 24px; font-weight: bold; color: #ff4444;">
        Page will refresh in ${seconds} seconds...
      </p>
      <div style="margin-top: 30px; padding: 15px; background: rgba(255,0,0,0.1); border: 2px solid red; border-radius: 8px;">
        <h3>⚠️ Please close Developer Tools</h3>
        <p>Multiple security layers are now active to prevent inspection.</p>
        <p>Press F12 or close DevTools to avoid continuous interruption.</p>
      </div>
    </div>
  `;
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
                this.isRefreshing = false;
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
        this.cleanupDisruption();
    }
    showOverlay() {
        if (this.overlayElement || typeof document === "undefined")
            return;
        this.overlayElement = document.createElement("div");
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
        if (typeof document === "undefined")
            return;
        if (this.options.blockContextMenu) {
            document.addEventListener("contextmenu", this.blockContextMenu);
        }
        if (this.options.blockShortcuts) {
            document.addEventListener("keydown", this.blockShortcuts);
        }
    }
    removeEventListeners() {
        if (typeof document === "undefined")
            return;
        document.removeEventListener("contextmenu", this.blockContextMenu);
        document.removeEventListener("keydown", this.blockShortcuts);
    }
    getState() {
        return Object.assign({}, this.state);
    }
    isDevToolsOpen() {
        return this.state.isOpen;
    }
}

export { NoDT };
