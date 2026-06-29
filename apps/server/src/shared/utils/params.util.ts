// src/shared/utils/params.util.ts
/**
 * Safely extracts string from Express params (Express 5.x compatibility)
 * In Express 5.x, params can be string | string[]
 */
export const getParam = (param: string | string[] | undefined): string => {
  if (!param) return '';
  return Array.isArray(param) ? param[0] : param;
};
