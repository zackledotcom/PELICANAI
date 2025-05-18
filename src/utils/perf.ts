/**
 * Debounces a function to limit how often it can be called
 * 
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T, 
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttles a function to limit how often it can be called
 * 
 * @param fn - The function to throttle
 * @param limit - The minimum time between calls in milliseconds
 * @returns A throttled version of the function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T, 
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return function(...args: Parameters<T>): void {
    const now = Date.now();
    
    if (now - lastCall >= limit) {
      fn(...args);
      lastCall = now;
    }
  };
}

/**
 * Preloads fonts to prevent layout shifts
 * 
 * @param fontFamilies - Array of font family names to preload
 */
export function preloadFonts(fontFamilies: string[]): void {
  if (typeof document === 'undefined') return;
  
  fontFamilies.forEach(font => {
    // Create a span with the font
    const span = document.createElement('span');
    span.style.fontFamily = font;
    span.style.fontSize = '0';
    span.style.visibility = 'hidden';
    span.textContent = 'Preloading font';
    
    // Append to body temporarily
    document.body.appendChild(span);
    
    // Remove after a short delay
    setTimeout(() => {
      document.body.removeChild(span);
    }, 100);
  });
}

/**
 * Measures the execution time of a function
 * 
 * @param fn - The function to measure
 * @param label - Optional label for the console output
 * @returns The result of the function
 */
export function measurePerformance<T>(fn: () => T, label = 'Function'): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`${label} execution time: ${(end - start).toFixed(2)}ms`);
  
  return result;
}