

# Color Scheme Redesign: Violet & Teal with Sharp Precision

A complete overhaul of the PromptCrafting design system, replacing the current Architectural Blueprint theme with a fresh Violet & Teal palette while maintaining sharp corners and brutalist hard-offset shadows.

---

## Theme Concept

**"Digital Precision"** - A modern, creative theme that combines the precision of sharp corners and hard shadows with the fresh, premium feel of violet and teal. This creates a distinctive look that feels both technical and inviting.

### Color Palette

```text
LIGHT MODE
┌─────────────────────────────────────────────────────────────┐
│  Background    │  #FAFAFA (warm white)                      │
│  Foreground    │  #1A1A2E (deep navy-black)                 │
│  Primary       │  #7C3AED (vibrant violet)                  │
│  Accent        │  #14B8A6 (bright teal)                     │
│  Muted         │  #F1F0FB (soft lavender-gray)              │
│  Border        │  #1A1A2E (matches foreground)              │
└─────────────────────────────────────────────────────────────┘

DARK MODE
┌─────────────────────────────────────────────────────────────┐
│  Background    │  #0F0F1A (deep space)                      │
│  Foreground    │  #F8FAFC (crisp white)                     │
│  Primary       │  #A78BFA (soft violet)                     │
│  Accent        │  #2DD4BF (bright teal)                     │
│  Muted         │  #1E1E2E (elevated dark)                   │
│  Border        │  #F8FAFC (white borders)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Core Design System (src/index.css)

Update all CSS custom properties with the new Violet & Teal palette:

**Light Mode Variables:**
- `--background: 240 10% 98%` (warm white with slight violet undertone)
- `--foreground: 240 50% 14%` (deep navy-black)
- `--primary: 263 70% 58%` (vibrant violet)
- `--primary-foreground: 0 0% 100%`
- `--accent: 168 76% 40%` (bright teal)
- `--accent-foreground: 0 0% 100%`
- `--secondary: 263 30% 96%` (light violet-gray)
- `--muted: 240 20% 96%` (soft gray with violet undertone)
- `--muted-foreground: 240 10% 45%`
- `--border: 240 50% 14%` (matching foreground for hard contrast)
- `--radius: 0rem` (sharp corners preserved)

**Dark Mode Variables:**
- `--background: 240 50% 6%` (deep space)
- `--foreground: 210 40% 98%` (crisp white)
- `--primary: 263 70% 72%` (soft violet for dark mode)
- `--accent: 168 76% 50%` (brighter teal)
- `--border: 210 40% 98%` (white borders)

**Shadow System (Hard Offset):**
- `--shadow-sm: 2px 2px 0px 0px currentColor`
- `--shadow-md: 4px 4px 0px 0px currentColor`
- `--shadow-lg: 6px 6px 0px 0px currentColor`
- `--shadow-xl: 8px 8px 0px 0px currentColor`
- `--shadow-glow: 0 0 0 2px hsl(168 76% 40% / 0.3)` (teal glow)

**Hero Gradient:**
- Light: `linear-gradient(135deg, hsl(263 70% 58%) 0%, hsl(240 50% 25%) 100%)`
- Dark: `linear-gradient(135deg, hsl(240 50% 10%) 0%, hsl(263 40% 20%) 100%)`

### Phase 2: Tailwind Configuration (tailwind.config.ts)

Update the Tailwind theme to reference the new CSS variables and ensure:
- Border radius scale uses the sharp `0rem` base
- Box shadow utilities map to the new hard-offset shadows
- Color palette is properly connected

### Phase 3: Button Component (src/components/ui/button.tsx)

Update button variants to use the new palette:

- **default**: Violet background with white text
- **secondary**: Light violet-gray with violet text
- **accent**: Teal background with white text
- **hero**: Violet gradient with hard shadow
- **hero-outline**: White/transparent border on dark backgrounds
- **outline**: Dark border, violet hover state
- **ghost**: Violet text on hover

### Phase 4: Badge Component (src/components/ui/badge.tsx)

Update badge variants:
- **accent**: Teal-based styling
- **premium**: Violet gradient border/background
- **success**: Keep green-based
- **destructive**: Keep red-based

### Phase 5: Landing Page (src/pages/LandingPage.tsx)

Update the hero section and throughout:
- Hero background uses new violet gradient
- CTA buttons use violet (primary) and teal (accent) variants
- Grid overlay pattern updated to violet/teal tones
- Feature icons use teal accent color
- Testimonial cards use new border and shadow system

### Phase 6: Header & Navigation (src/components/layout/Header.tsx)

- Navigation hover states use violet accent
- CTA button uses teal accent variant
- Mobile menu styling updated

### Phase 7: App Sidebar (src/components/layout/AppSidebar.tsx)

- Active state uses violet primary color
- Hover states use subtle violet tint
- Icons use teal accent for visual interest

### Phase 8: Dashboard (src/pages/app/DashboardPage.tsx)

- Stats cards with new shadow system
- Progress bars use violet (primary) and teal (accent)
- Action cards use new border/hover states

### Phase 9: Card & Other Components

- **Card**: Updated with new border color and shadow
- **Input/Select/Dialog**: Ensure border colors match new system
- **Dropdown menus**: Solid backgrounds (not transparent) with proper z-index

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Complete CSS variable overhaul for light/dark modes |
| `tailwind.config.ts` | Border radius and shadow utility updates |
| `src/components/ui/button.tsx` | Button variant color updates |
| `src/components/ui/badge.tsx` | Badge variant color updates |
| `src/components/ui/card.tsx` | Shadow system updates |
| `src/pages/LandingPage.tsx` | Hero gradient and accent colors |
| `src/components/layout/Header.tsx` | Navigation styling |
| `src/components/layout/AppSidebar.tsx` | Sidebar active states |
| `src/pages/app/DashboardPage.tsx` | Dashboard component colors |
| `src/components/layout/Logo.tsx` | Logo accent color |
| `src/components/auth/AuthBranding.tsx` | Auth page styling |

### Accessibility Considerations

- Violet/teal combination meets WCAG AA contrast requirements
- All text colors maintain 4.5:1 contrast ratio minimum
- Focus states use visible ring with sufficient contrast
- Hard shadows provide additional visual depth cues

### Design Tokens Summary

```text
PRIMARY (Violet)          ACCENT (Teal)
├─ Light: hsl(263 70% 58%)   ├─ Light: hsl(168 76% 40%)
└─ Dark:  hsl(263 70% 72%)   └─ Dark:  hsl(168 76% 50%)

SHADOWS (Hard Offset)
├─ Light mode: #1A1A2E offset shadows
└─ Dark mode:  #F8FAFC offset shadows
```

