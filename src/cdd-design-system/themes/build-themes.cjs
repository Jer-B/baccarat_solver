#!/usr/bin/env node

// Theme CSS Build Script - Hybrid Excellence
// Generates CSS files from TypeScript theme definitions

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import themes (requires compilation first)
const buildTypeScript = () => {
  console.log('🔨 Compiling TypeScript themes...');

  try {
    // Compile the TypeScript files to JavaScript temporarily
    execSync(
      'npx tsc --target ES2020 --module ESNext --moduleResolution bundler --allowSyntheticDefaultImports --skipLibCheck definitions/luxury.ts definitions/elite.ts --outDir temp',
      {
        cwd: __dirname,
        stdio: 'inherit',
      }
    );
  } catch (error) {
    console.error('❌ TypeScript compilation failed:', error.message);
    process.exit(1);
  }
};

const generateCSS = () => {
  console.log('🎨 Generating theme CSS files...');

  // Import the compiled themes
  const { luxuryTheme } = require('./temp/luxury.js');
  const { eliteTheme } = require('./temp/elite.js');

  const themes = { luxury: luxuryTheme, elite: eliteTheme };

  const generateThemeProperties = theme => {
    return {
      '--theme-header-bg': theme.header.background,
      '--theme-header-border': theme.header.border,
      '--theme-header-shadow': theme.header.shadow,
      '--theme-text-shadow': theme.header.textShadow,
      '--theme-text-glow': theme.header.textGlow,
      '--theme-track-bg': theme.toggle.trackBackground,
      '--theme-track-border': theme.toggle.trackBorder,
      '--theme-track-border-hover': theme.toggle.trackBorderHover,
      '--theme-track-shadow': theme.toggle.trackShadow,
      '--theme-track-shadow-hover': theme.toggle.trackShadowHover,
      '--theme-slider-bg': theme.toggle.sliderBackground,
      '--theme-slider-shadow': theme.toggle.sliderShadow,
      '--theme-slider-text-color': theme.toggle.sliderTextColor,
      '--theme-primary': theme.colors.primary,
      '--theme-primary-hover': theme.colors.primaryHover,
      '--theme-text-primary': theme.colors.textPrimary,
      '--theme-text-secondary': theme.colors.textSecondary,
      '--theme-tab-menu-bg': theme.tabMenu.background,
      '--theme-tab-menu-border': theme.tabMenu.border,
      '--theme-tab-inactive-color': theme.tabMenu.inactive.color,
      '--theme-tab-inactive-bg': theme.tabMenu.inactive.background,
      '--theme-tab-inactive-hover-color': theme.tabMenu.inactive.hoverColor,
      '--theme-tab-inactive-hover-bg': theme.tabMenu.inactive.hoverBackground,
      '--theme-tab-inactive-hover-shadow': theme.tabMenu.inactive.hoverShadow,
      '--theme-tab-active-color': theme.tabMenu.active.color,
      '--theme-tab-active-bg': theme.tabMenu.active.background,
      '--theme-tab-active-border': theme.tabMenu.active.border,
      '--theme-tab-active-text-shadow': theme.tabMenu.active.textShadow || 'none',
      '--theme-tab-active-text-glow': theme.tabMenu.active.textGlow || 'none',
      '--theme-tab-active-shadow': theme.tabMenu.active.shadow,
      '--theme-switch-bg': theme.switchButton.background,
      '--theme-switch-color': theme.switchButton.color,
      '--theme-switch-border': theme.switchButton.border,
      '--theme-switch-text-shadow': theme.switchButton.textShadow,
      '--theme-switch-shadow': theme.switchButton.shadow,
      '--theme-switch-hover-bg': theme.switchButton.hoverBackground,
      '--theme-switch-hover-color': theme.switchButton.hoverColor,
      '--theme-switch-hover-border': theme.switchButton.hoverBorder,
      '--theme-switch-hover-shadow': theme.switchButton.hoverShadow,
    };
  };

  const generateThemeCSS = themeName => {
    const theme = themes[themeName];
    const props = generateThemeProperties(theme);

    return `/* ⚠️  AUTO-GENERATED CSS - DO NOT EDIT MANUALLY! ⚠️ 
 * Generated from: src/cdd-design-system/themes/definitions/${themeName}.ts
 * To modify theme colors, edit the TypeScript file and run: yarn build:themes
 * Last generated: ${new Date().toISOString()}
 */

[data-theme='${themeName}'] {
${Object.entries(props)
  .map(([key, value]) => `  ${key}: ${value};`)
  .join('\n')}
}
`;
  };

  // Ensure generated directory exists
  const generatedDir = path.join(__dirname, 'generated');
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  // Generate CSS for each theme
  Object.keys(themes).forEach(themeName => {
    const css = generateThemeCSS(themeName);
    const filePath = path.join(generatedDir, `${themeName}.css`);

    fs.writeFileSync(filePath, css, 'utf8');
    console.log(`✅ Generated: generated/${themeName}.css`);
  });

  console.log('🎯 Theme CSS generation complete!');
};

const cleanup = () => {
  // Clean up temporary files
  const tempDir = path.join(__dirname, 'temp');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

// Main execution
try {
  buildTypeScript();
  generateCSS();
  cleanup();
  console.log('🚀 Build complete! Use the generated CSS files.');
} catch (error) {
  console.error('❌ Build failed:', error);
  cleanup();
  process.exit(1);
}
