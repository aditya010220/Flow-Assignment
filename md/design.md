# FlowLens — Design System

## 1. Design direction

The interface uses only two brand colors:

- Black: `#000000`
- White: `#FFFFFF`

Do not introduce colored accent palettes. Use opacity, borders, spacing, typography and monochrome icon treatments to establish hierarchy.

For readable secondary text, use black with opacity or neutral grayscale derived from black and white. These are tonal variations, not additional brand colors.

## 2. Color tokens

```css
:root {
  --color-black: #000000;
  --color-white: #FFFFFF;
  --color-text: #000000;
  --color-background: #FFFFFF;
  --color-border: rgba(0, 0, 0, 0.16);
  --color-muted: rgba(0, 0, 0, 0.62);
  --color-subtle: rgba(0, 0, 0, 0.04);
  --color-inverse-text: #FFFFFF;
  --color-inverse-background: #000000;
}
```

Use black backgrounds with white text for primary actions. Use white backgrounds, black text and thin black/gray borders for secondary surfaces.

## 3. Typography

Recommended:
- Font: `Inter` or a system sans-serif stack.
- Page title: 28–36px, semibold/bold.
- Section title: 18–24px, semibold.
- Body: 14–16px, regular.
- Metadata: 12–13px.
- Use consistent line height and avoid excessive font weights.

## 4. Components

### Buttons
- Primary: black background, white text.
- Secondary: white background, black border and black text.
- Disabled: reduced opacity and non-interactive cursor state.
- Focus: visible high-contrast outline.

### Inputs
- White background, black text, subtle black border.
- Clearly visible label and helper/error text.
- Do not rely on placeholder text as the only label.

### Cards
- White background.
- 1px subtle border.
- Small-to-medium radius.
- Minimal or no shadow.

### Tables and reports
- Strong black headings.
- Thin horizontal separators.
- Numeric scores aligned consistently.
- Findings should distinguish observed evidence, interpretation and recommendation.

### Status
Use monochrome labels and text:
- `queued`
- `running`
- `completed`
- `failed`

Do not use green, red, blue or yellow status fills. Use text, icons and border styles. Ensure status remains understandable without color.

## 5. Icon system

Use Google Material Symbols or Material Icons consistently. Prefer Material Symbols Rounded or Outlined for a coherent interface.

Suggested icons:
- Dashboard: `dashboard`
- New scan: `add_circle`
- URL: `link`
- Running scan: `hourglass_top`
- Completed: `check_circle`
- Failed: `error`
- History: `history`
- Screenshot/evidence: `image`
- Flow: `account_tree`
- Report: `description`
- Settings: `settings`
- External link: `open_in_new`
- Refresh: `refresh`

Use one icon family and one style throughout the application. Do not mix Material Icons, Lucide and emoji in the same interface. If using the Google Material Symbols web font, load it once in the root layout and use accessible labels for icon-only buttons.

Example:

```tsx
<span className="material-symbols-outlined" aria-hidden="true">
  dashboard
</span>
```

## 6. Layout and responsive behavior

- Desktop: persistent sidebar or compact top navigation; main content uses a readable max width.
- Tablet: reduce sidebar width or collapse it.
- Mobile: single-column layout, accessible navigation and full-width forms.
- Avoid horizontal scrolling for primary report content.
- Evidence images should preserve aspect ratio and offer an enlarged view.

## 7. Accessibility

- Meet WCAG contrast expectations.
- Provide keyboard focus states.
- Use semantic headings and buttons.
- Add accessible names to icon-only controls.
- Associate labels with form inputs.
- Communicate errors in text, not color alone.
- Respect reduced-motion preferences.

## 8. Core screens

1. Dashboard: summary, recent scans and primary “New scan” action.
2. New scan: URL input, supported options and validation.
3. Scan progress: current state, stage and useful failure details.
4. Results: overall summary, seven category sections, findings and evidence.
5. Flow viewer: ordered pages/actions and linked evidence.
6. History: searchable/filterable list of previous scans.

The exact category labels and report sections must follow the assignment rubric.
