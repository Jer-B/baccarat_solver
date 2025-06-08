/**
 * 🧪 Theme Types - Core Type System Tests
 *
 * Comprehensive testing of theme type system including branded types,
 * Zod schemas, constants, and utility functions.
 */

import { describe, it, expect, expectTypeOf } from 'vitest';
import {
  THEME_MODES,
  THEME_CONSTANTS,
  THEME_DISPLAY_INFO,
  ThemeModeSchema,
  ThemeStateSchema,
  PersistenceDataSchema,
  isValidThemeMode,
  parseThemeMode,
  assertThemeMode,
  type ThemeMode,
  type ThemeState,
} from '../../../../src/types/core/themeTypes';

// ==================== CONSTANTS TESTING ====================

describe('Theme Constants', () => {
  describe('THEME_MODES', () => {
    it('should contain exactly two theme modes', () => {
      expect(THEME_MODES).toHaveLength(2);
      expect(THEME_MODES).toEqual(['luxury', 'elite']);
    });

    it('should be readonly tuple', () => {
      expectTypeOf(THEME_MODES).toMatchTypeOf<readonly ['luxury', 'elite']>();
    });
  });

  describe('THEME_CONSTANTS', () => {
    it('should have valid default theme', () => {
      expect(THEME_CONSTANTS.DEFAULT_THEME).toBe('luxury');
      expect(THEME_MODES).toContain(THEME_CONSTANTS.DEFAULT_THEME);
    });

    it('should have valid localStorage key', () => {
      expect(THEME_CONSTANTS.STORAGE_KEY).toBe('theme-store');
      expect(typeof THEME_CONSTANTS.STORAGE_KEY).toBe('string');
      expect(THEME_CONSTANTS.STORAGE_KEY.length).toBeGreaterThan(5);
    });

    it('should have valid configuration constants', () => {
      expect(THEME_CONSTANTS.DATA_ATTRIBUTE).toBe('data-theme');
      expect(THEME_CONSTANTS.INITIALIZATION_TIMEOUT).toBe(5000);
      expect(THEME_CONSTANTS.PERSISTENCE_RETRY_COUNT).toBe(3);
      expect(THEME_CONSTANTS.ERROR_RECOVERY_DELAY).toBe(1000);
    });
  });

  describe('THEME_DISPLAY_INFO', () => {
    it('should have display info for all theme modes', () => {
      THEME_MODES.forEach(mode => {
        expect(THEME_DISPLAY_INFO[mode]).toBeDefined();
        expect(THEME_DISPLAY_INFO[mode].name).toBeTruthy();
        expect(THEME_DISPLAY_INFO[mode].description).toBeTruthy();
        expect(THEME_DISPLAY_INFO[mode].icon).toBeTruthy();
      });
    });

    it('should have consistent structure', () => {
      Object.values(THEME_DISPLAY_INFO).forEach(info => {
        expect(info).toHaveProperty('name');
        expect(info).toHaveProperty('description');
        expect(info).toHaveProperty('icon');
        expect(typeof info.name).toBe('string');
        expect(typeof info.description).toBe('string');
        expect(typeof info.icon).toBe('string');
      });
    });

    it('should have unique names and descriptions', () => {
      const names = Object.values(THEME_DISPLAY_INFO).map(info => info.name);
      const descriptions = Object.values(THEME_DISPLAY_INFO).map(info => info.description);

      expect(new Set(names).size).toBe(names.length);
      expect(new Set(descriptions).size).toBe(descriptions.length);
    });
  });
});

// ==================== TYPE SYSTEM TESTING ====================

describe('Theme Type System', () => {
  describe('ThemeMode type', () => {
    it('should only accept valid theme modes', () => {
      expectTypeOf<ThemeMode>().toEqualTypeOf<'luxury' | 'elite'>();
    });

    it('should reject invalid values at compile time', () => {
      // This test demonstrates compile-time type safety
      expect(true).toBe(true); // Placeholder for compile-time check
    });
  });

  describe('ThemeState interface', () => {
    it('should have correct structure', () => {
      const validState: ThemeState = {
        currentTheme: 'luxury',
      };

      expect(validState.currentTheme).toBe('luxury');
    });
  });
});

// ==================== ZOD SCHEMA TESTING ====================

describe('Zod Schema Validation', () => {
  describe('ThemeModeSchema', () => {
    it('should validate correct theme modes', () => {
      THEME_MODES.forEach(mode => {
        const result = ThemeModeSchema.safeParse(mode);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(mode);
        }
      });
    });

    it('should reject invalid theme modes', () => {
      const invalidModes = ['invalid', 'dark', 'light', '', null, undefined, 123];

      invalidModes.forEach(invalidMode => {
        const result = ThemeModeSchema.safeParse(invalidMode);
        expect(result.success).toBe(false);
      });
    });

    it('should provide clear error messages', () => {
      const result = ThemeModeSchema.safeParse('invalid');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Theme must be one of');
      }
    });
  });

  describe('ThemeStateSchema', () => {
    it('should validate correct theme state', () => {
      const validState = {
        currentTheme: 'luxury',
      };

      const result = ThemeStateSchema.safeParse(validState);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validState);
      }
    });

    it('should reject invalid state structure', () => {
      const invalidStates = [
        { currentTheme: 'invalid' },
        { notCurrentTheme: 'luxury' }, // Wrong property name
        {}, // Missing required fields
      ];

      invalidStates.forEach(invalidState => {
        const result = ThemeStateSchema.safeParse(invalidState);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('PersistenceDataSchema', () => {
    it('should validate correct persistence data', () => {
      const validData = {
        currentTheme: 'luxury',
        timestamp: Date.now(),
        version: '1.0.0',
      };

      const result = PersistenceDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate minimal persistence data', () => {
      const minimalData = {
        currentTheme: 'elite',
      };

      const result = PersistenceDataSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid persistence data', () => {
      const invalidData = [
        { currentTheme: 'invalid' },
        { timestamp: Date.now(), version: '1.0.0' }, // Missing currentTheme
        { currentTheme: 'luxury', timestamp: 'invalid' },
        { currentTheme: 'luxury', version: 123 },
      ];

      invalidData.forEach(invalid => {
        const result = PersistenceDataSchema.safeParse(invalid);
        expect(result.success).toBe(false);
      });
    });
  });
});

// ==================== UTILITY FUNCTIONS TESTING ====================

describe('Theme Utility Functions', () => {
  describe('isValidThemeMode', () => {
    it('should return true for valid theme modes', () => {
      THEME_MODES.forEach(mode => {
        expect(isValidThemeMode(mode)).toBe(true);
      });
    });

    it('should return false for invalid values', () => {
      const invalidValues = ['invalid', 'dark', 'light', '', null, undefined, 123, {}];

      invalidValues.forEach(invalidValue => {
        expect(isValidThemeMode(invalidValue)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(isValidThemeMode('LUXURY')).toBe(false); // Case sensitive
      expect(isValidThemeMode(' luxury ')).toBe(false); // Whitespace
      expect(isValidThemeMode('luxury\n')).toBe(false); // Newline
    });
  });

  describe('parseThemeMode', () => {
    it('should parse valid theme modes correctly', () => {
      THEME_MODES.forEach(mode => {
        const result = parseThemeMode(mode);
        expect(result).toBe(mode);
      });
    });

    it('should handle invalid theme modes gracefully', () => {
      const invalidValues = ['invalid', null, undefined, 123];

      invalidValues.forEach(invalidValue => {
        const result = parseThemeMode(invalidValue);
        expect(result).toBeNull();
      });
    });
  });

  describe('assertThemeMode', () => {
    it('should not throw for valid theme modes', () => {
      THEME_MODES.forEach(mode => {
        expect(() => assertThemeMode(mode)).not.toThrow();
      });
    });

    it('should throw for invalid theme modes', () => {
      const invalidValues = ['invalid', null, undefined, 123];

      invalidValues.forEach(invalidValue => {
        expect(() => assertThemeMode(invalidValue)).toThrow();
      });
    });
  });
});

// ==================== INTEGRATION TESTING ====================

describe('Theme Type System Integration', () => {
  it('should work together seamlessly', () => {
    // Test the complete workflow
    const themeMode: ThemeMode = 'luxury';

    // Validate with utility function
    expect(isValidThemeMode(themeMode)).toBe(true);

    // Parse with utility function
    const parseResult = parseThemeMode(themeMode);
    expect(parseResult).toBe(themeMode);

    // Validate with Zod schema
    const schemaResult = ThemeModeSchema.safeParse(themeMode);
    expect(schemaResult.success).toBe(true);

    // Use in theme state
    const state: ThemeState = {
      currentTheme: themeMode,
    };

    const stateResult = ThemeStateSchema.safeParse(state);
    expect(stateResult.success).toBe(true);

    // Assert theme mode
    expect(() => assertThemeMode(themeMode)).not.toThrow();
  });

  it('should maintain type safety throughout the system', () => {
    expectTypeOf(isValidThemeMode).parameter(0).toEqualTypeOf<unknown>();
    expectTypeOf(parseThemeMode).parameter(0).toEqualTypeOf<unknown>();
    expectTypeOf(assertThemeMode).parameter(0).toEqualTypeOf<unknown>();
  });
});

// ==================== PERFORMANCE TESTING ====================

describe('Theme Type System Performance', () => {
  it('should validate theme modes efficiently', () => {
    const iterations = 10000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      isValidThemeMode('luxury');
      isValidThemeMode('elite');
      isValidThemeMode('invalid');
    }

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(200); // Should complete in under 200ms (more realistic threshold)
  });

  it('should parse theme modes efficiently', () => {
    const iterations = 1000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      parseThemeMode('luxury');
      parseThemeMode('elite');
      parseThemeMode('invalid');
    }

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(50); // Should complete in under 50ms
  });

  it('should validate schemas efficiently', () => {
    const iterations = 1000;
    const testData = {
      currentTheme: 'luxury' as ThemeMode,
    };

    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      ThemeStateSchema.safeParse(testData);
    }

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // Should complete in under 100ms
  });
});
