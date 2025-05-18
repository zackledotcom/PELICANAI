/**
 * Utility function to conditionally join CSS class names together
 * 
 * @param classes - Object with class names as keys and boolean conditions as values
 * @returns String of space-separated class names where conditions are true
 * 
 * @example
 * // Returns "btn btn-primary active"
 * cn('btn', { 'btn-primary': true, 'active': true, 'disabled': false })
 */
export function cn(...args: any[]): string {
  const classes: string[] = [];
  
  args.forEach(arg => {
    if (!arg) return;
    
    const argType = typeof arg;
    
    if (argType === 'string' || argType === 'number') {
      classes.push(arg.toString());
    } else if (Array.isArray(arg) && arg.length) {
      const inner = cn(...arg);
      if (inner) {
        classes.push(inner);
      }
    } else if (argType === 'object') {
      Object.keys(arg).forEach(key => {
        if (arg[key]) {
          classes.push(key);
        }
      });
    }
  });
  
  return classes.join(' ');
}