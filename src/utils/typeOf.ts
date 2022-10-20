export default (x: any) => toString?.call?.(x)?.match?.(/\s([a-zA-Z]+)/)?.[1]?.toLowerCase() || 'undefined';
