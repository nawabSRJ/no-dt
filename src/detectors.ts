export const createViewportDetector = (threshold = 160) => {
  return () => {
    if (typeof window === 'undefined') return false;
    
    const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
    const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
    
    return widthDiff > threshold || heightDiff > threshold;
  };
};

export const createDebuggerDetector = (threshold = 1500) => {
  let lastCheck = Date.now();
  
  return () => {
    const now = Date.now();
    const diff = now - lastCheck;
    lastCheck = now;
    
    return diff > threshold;
  };
};

export const createConsoleDetector = () => {
  return () => {
    if (typeof window === 'undefined') return false;
    
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