export type MarkdownStylePreset = 'default' | 'github' | 'compact' | 'serif-doc';

export interface MarkdownStylePresetConfig {
  readonly label: string;
  readonly vars: Readonly<Record<string, string>>;
}

/**
 * Rendered-output style presets — deliberately scoped to the rendered
 * `.markdown-body` output only, via CSS custom properties. DUDE is
 * dark-mode-only app-wide, so this is not a light/dark toggle; it changes
 * typography/spacing/accent for the rendered preview, nothing else.
 */
export const MARKDOWN_STYLE_PRESETS: Record<MarkdownStylePreset, MarkdownStylePresetConfig> = {
  default: {
    label: 'Default',
    vars: {
      'md-font': 'inherit',
      'md-heading-weight': '600',
      'md-spacing': '0.5em',
      'md-accent': 'var(--color-accent)',
    },
  },
  github: {
    label: 'GitHub-like',
    vars: {
      'md-font': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
      'md-heading-weight': '600',
      'md-spacing': '0.75em',
      'md-accent': '#58a6ff',
    },
  },
  compact: {
    label: 'Compact',
    vars: {
      'md-font': 'inherit',
      'md-heading-weight': '600',
      'md-spacing': '0.25em',
      'md-accent': 'var(--color-accent)',
    },
  },
  'serif-doc': {
    label: 'Serif document',
    vars: {
      'md-font': "Georgia, 'Times New Roman', Times, serif",
      'md-heading-weight': '700',
      'md-spacing': '0.7em',
      'md-accent': 'var(--color-accent)',
    },
  },
};

/** Builds an inline `style` object for binding the preset's CSS custom properties onto a container element. */
export function markdownPresetStyleVars(preset: MarkdownStylePreset): Record<string, string> {
  const vars = MARKDOWN_STYLE_PRESETS[preset].vars;
  const styleVars: Record<string, string> = {};
  for (const [key, value] of Object.entries(vars)) styleVars[`--${key}`] = value;
  return styleVars;
}
