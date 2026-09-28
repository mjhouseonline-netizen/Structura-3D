import { UnitType } from '../types/model';

// Internal system is always in millimeters (mm)
export const MM_PER_CM = 10;
export const MM_PER_M = 1000;
export const MM_PER_INCH = 25.4;
export const MM_PER_FOOT = 304.8;

/**
 * Converts internal mm value to display unit
 */
export function fromInternalMm(valMm: number, unit: UnitType): number {
  switch (unit) {
    case 'cm':
      return valMm / MM_PER_CM;
    case 'm':
      return valMm / MM_PER_M;
    case 'in':
      return valMm / MM_PER_INCH;
    case 'ft':
      return valMm / MM_PER_FOOT;
    case 'mm':
    default:
      return valMm;
  }
}

/**
 * Converts value from given unit to internal mm
 */
export function toInternalMm(val: number, unit: UnitType): number {
  switch (unit) {
    case 'cm':
      return val * MM_PER_CM;
    case 'm':
      return val * MM_PER_M;
    case 'in':
      return val * MM_PER_INCH;
    case 'ft':
      return val * MM_PER_FOOT;
    case 'mm':
    default:
      return val;
  }
}

/**
 * Formats a measurement in mm into clean human-readable text
 */
export function formatMeasurement(valMm: number, unit: UnitType, showUnitSuffix = true): string {
  if (isNaN(valMm)) return '0';
  const val = fromInternalMm(valMm, unit);

  if (unit === 'ft') {
    // Format feet & inches e.g. 7' 10"
    const totalInches = valMm / MM_PER_INCH;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round((totalInches % 12) * 10) / 10;
    return `${feet}' ${inches}"`;
  }

  let formatted = '';
  if (unit === 'm') {
    formatted = val.toFixed(2);
  } else if (unit === 'cm') {
    formatted = val.toFixed(1);
  } else if (unit === 'in') {
    formatted = val.toFixed(1);
  } else {
    // mm
    formatted = Math.round(val).toString();
  }

  return showUnitSuffix ? `${formatted} ${unit}` : formatted;
}

/**
 * Parses user input string like "2400", "2.4m", "50cm", "8'", "8ft", "96in"
 * or coordinates/dimensions like "3000, 2400" or "3m x 4m"
 */
export function parseDimensionInput(input: string, activeUnit: UnitType): number | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  // Check explicit unit suffix
  if (trimmed.endsWith('mm')) {
    const num = parseFloat(trimmed.replace('mm', ''));
    return isNaN(num) ? null : num;
  }
  if (trimmed.endsWith('cm')) {
    const num = parseFloat(trimmed.replace('cm', ''));
    return isNaN(num) ? null : num * MM_PER_CM;
  }
  if (trimmed.endsWith('m')) {
    const num = parseFloat(trimmed.replace('m', ''));
    return isNaN(num) ? null : num * MM_PER_M;
  }
  if (trimmed.endsWith('in') || trimmed.endsWith('"')) {
    const num = parseFloat(trimmed.replace(/in|"|''/g, ''));
    return isNaN(num) ? null : num * MM_PER_INCH;
  }
  if (trimmed.endsWith('ft') || trimmed.endsWith('\'')) {
    const num = parseFloat(trimmed.replace(/ft|'/g, ''));
    return isNaN(num) ? null : num * MM_PER_FOOT;
  }

  // Pure number uses the activeUnit
  const num = parseFloat(trimmed);
  if (isNaN(num)) return null;
  return toInternalMm(num, activeUnit);
}

/**
 * Parses dual dimensions like "3000, 2000" or "3m x 2m" or "10ft, 8ft"
 */
export function parseDualDimensions(
  input: string,
  activeUnit: UnitType
): [number, number] | null {
  const trimmed = input.trim();
  const parts = trimmed.split(/[,xX;]/).map((s) => s.trim());
  if (parts.length >= 2) {
    const dim1 = parseDimensionInput(parts[0], activeUnit);
    const dim2 = parseDimensionInput(parts[1], activeUnit);
    if (dim1 !== null && dim2 !== null) {
      return [dim1, dim2];
    }
  }
  return null;
}
