import typeOf from '@/utils/typeOf';

export const cx = (...args: any): string => args.reduce((result: [string], current: any) => {
  const type = typeOf(current);
  if (type === 'array') {
    result.push(...cx(current));
  } else if (type === 'object') {
    Object.keys(current).forEach((key) => {
      const value = current[key];
      if (value) {
        result.push(key);
      }
    });
  } else if (type === 'function') {
    result.push(current);
  } else if (type === 'string') {
    result.push(current);
  }
  return result;
}, []).join(' ');