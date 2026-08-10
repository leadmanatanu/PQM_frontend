import type { TypographyVariantsOptions } from "@mui/material/styles";

export const typography = {
  fontFamily:
    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  body1: { fontSize: '0.8125rem', fontWeight: 400, lineHeight: 1.4 },
  body2: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.45 },
  button: { fontSize: '0.75rem', fontWeight: 500 },
  caption: { fontSize: '0.6875rem', fontWeight: 400, lineHeight: 1.4 },
  subtitle1: { fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.4 },
  subtitle2: { fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.4 },
  overline: {
    fontSize: '0.6875rem',
    fontWeight: 500,
    letterSpacing: '0.5px',
    lineHeight: 2.0,
    textTransform: 'uppercase',
  },
  h1: { fontSize: '2.5rem', fontWeight: 500, lineHeight: 1.2 },
  h2: { fontSize: '2.125rem', fontWeight: 500, lineHeight: 1.2 },
  h3: { fontSize: '1.75rem', fontWeight: 500, lineHeight: 1.2 },
  h4: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.2 },
  h5: { fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.2 },
  h6: { fontSize: '0.9375rem', fontWeight: 500, lineHeight: 1.2 },
} satisfies TypographyVariantsOptions;
