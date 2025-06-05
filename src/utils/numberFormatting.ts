/**
 * Number Formatting Utilities
 * Provides real-time number formatting with comma insertion for better readability
 */

/**
 * Format a number with commas for display while preserving decimal places
 */
export function formatNumberWithCommas(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return '';
  }

  return numValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Remove commas and other formatting from a string to get clean number
 */
export function parseFormattedNumber(value: string): number {
  const cleanValue = value.replace(/[,$\s]/g, '');
  return parseFloat(cleanValue) || 0;
}

/**
 * Real-time input formatting handler for number inputs
 * Adds commas as user types for numbers >= 1000
 */
export function handleNumberInput(
  event: Event,
  callback: (value: number) => void,
  options: {
    minValue?: number;
    maxValue?: number;
    allowDecimals?: boolean;
  } = {}
): void {
  const input = event.target as HTMLInputElement;
  const rawValue = input.value;

  // Allow partial input during typing (empty, "0.", etc.)
  if (rawValue === '' || rawValue === '0' || rawValue.endsWith('.')) {
    return;
  }

  const numericValue = parseFormattedNumber(rawValue);

  // Validate against constraints
  if (options.minValue !== undefined && numericValue < options.minValue) {
    return;
  }
  if (options.maxValue !== undefined && numericValue > options.maxValue) {
    return;
  }

  // Call the callback with clean numeric value
  if (!isNaN(numericValue) && numericValue >= 0) {
    callback(numericValue);

    // Format the input field with commas for better readability
    setTimeout(() => {
      if (numericValue >= 1000) {
        const formattedValue = formatNumberWithCommas(numericValue);
        if (input.value !== formattedValue) {
          input.value = formattedValue;
        }
      }
    }, 0);
  }
}

/**
 * Handle input blur to ensure final formatting and validation
 */
export function handleNumberBlur(
  event: Event,
  callback: (value: number) => void,
  options: {
    minValue?: number;
    defaultValue?: number;
    allowDecimals?: boolean;
  } = {}
): void {
  const input = event.target as HTMLInputElement;
  const rawValue = input.value;

  if (rawValue === '' || rawValue === '0' || rawValue === '0.') {
    // Reset to minimum or default if empty or invalid
    const fallbackValue = options.defaultValue ?? options.minValue ?? 0;
    callback(fallbackValue);
    input.value = formatNumberWithCommas(fallbackValue);
    return;
  }

  const numericValue = parseFormattedNumber(rawValue);

  if (!isNaN(numericValue) && numericValue >= 0) {
    // Apply min/max constraints
    let finalValue = numericValue;
    if (options.minValue !== undefined && finalValue < options.minValue) {
      finalValue = options.minValue;
    }

    callback(finalValue);
    input.value = formatNumberWithCommas(finalValue);
  } else {
    // Reset to minimum or default if invalid
    const fallbackValue = options.defaultValue ?? options.minValue ?? 0;
    callback(fallbackValue);
    input.value = formatNumberWithCommas(fallbackValue);
  }
}

/**
 * Format input value for initial display
 */
export function formatInitialValue(value: number): string {
  if (value >= 1000) {
    return formatNumberWithCommas(value);
  }
  return value.toString();
}
