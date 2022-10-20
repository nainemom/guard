const Color = require('color');

const contrast = (color, luminosityBorder /* 0 to 1 or boolean */, value) => {
  const colorObj = Color(color);
  const luminosity = colorObj.luminosity();
  let action;
  if (typeof luminosityBorder === 'boolean') {
    action = luminosityBorder ? 'darken' : 'lighten';
  } else if (luminosity > luminosityBorder) {
    action = 'darken';
  } else {
    action = 'lighten';
  }
  return colorObj[action](value);
}
const fgColor = (color, lightness) => {
  const colorObj = Color(color);
  let baseColor = '#000';
  if (colorObj.isDark()) {
    baseColor = '#fff';
  }
  return Color(baseColor).lightness(lightness * 100);
}

const hex = (colorObj) => colorObj.hex().toString();

const themeColors = {
  body: '#1e1e20',
  section: '#18181b',
  ghost: '#3f3f46',
  primary: '#4338ca',
  danger: '#fd4d4d',
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,html}",
  ],
  theme: {
    extend: {
      colors: Object.fromEntries(Object.entries(themeColors).map(([name, color]) => {
        return [name, {
          normal: color,
          lighter: hex(contrast(color, false, 0.4)),
          darker: hex(contrast(color, true, 0.3)),
          hover: hex(contrast(color, 0.8, 0.2)),
          active: hex(contrast(color, true, 0.1)),
          content: hex(fgColor(color, 1)),
          subtitle: hex(fgColor(color, 0.6)),
        }];
      })),
    },
  },
  plugins: [],
}