# Bible Character Chat – Design System

## 1. Design Philosophy & Theme
• **Biblical Elegance** – pair classical serif headings with modern glass-morphism panels to evoke sacred scrolls viewed through a futuristic lens.  
• **Celestial Depth** – deep blue–violet gradients and soft glowing blobs suggest a night sky, guiding users toward reflection.  
• **Clarity First** – content is always legible against dark backdrops; accent color (⛩ yellow-400) highlights calls-to-action.  
• **Utility-Driven** – Tailwind utility classes enable rapid iteration while enforcing a shared palette and spacing scale.

---

## 2. Color Palette (Tailwind codes)

| Purpose | Hex | Tailwind |
| ------- | ---- | -------- |
| Primary background | `#0a0a2a → #1a1a4a → #2a2a6a` | gradient: `from-blue-900 via-blue-800 to-blue-700` |
| Glass overlay | white @ 5-20 % | `bg-white/05 - /20` |
| Accent / CTA | `#facc15` | `yellow-400` |
| Accent dark hover | `#fbbf24` | `yellow-300`/`yellow-500` transitions |
| Character bubble (assistant) | `#2d3748` | `bg-[#2d3748]` |
| User bubble | `#4a5568` | `bg-[#4a5568]` |
| Success / confirm | `#34d399` | `green-400` |
| Danger / error | `#ef4444` | `red-600` / `red-900/50` |

_All alphas use Tailwind’s `/xx` opacity suffix._

---

## 3. Typography

| Element | Font family | Tailwind class |
| ------- | ----------- | -------------- |
| Display / Section headings | **Cinzel**, serif | `font-[Cinzel]` `text-yellow-300` |
| Body & UI text | System-UI stack | default Tailwind `font-sans` |
| Mono snippets (JSON, code) | `ui-monospace` | `font-mono text-xs` |

Scale (mobile → desktop):
```
display  text-4xl md:text-5xl
h2       text-2xl md:text-3xl
h3       text-xl
body     text-base
caption  text-sm
```

---

## 4. Common UI Components & Styling

| Component | Key classes / patterns |
| ----------| ---------------------- |
| Header bar | `sticky top-0 z-50 bg-blue-900 border-b-2 border-yellow-400/70 shadow-lg` |
| Nav links | `text-white hover:text-yellow-300 font-medium px-2 py-1` |
| CTA button | `rounded-full bg-yellow-400 text-blue-900 font-bold px-4 py-1.5 shadow-md hover:bg-yellow-300` |
| Glass panel | `bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl` |
| Chat container | flex column, 88 vh height, panel shadow; toggles `panel-open` when insights visible |
| Chat bubble (assistant) | `rounded-2xl bg-[#2d3748] text-blue-100 rounded-bl-none` |
| Chat bubble (user) | `rounded-2xl bg-[#4a5568] text-white rounded-br-none` |
| CSV upload input | Tailwind file input variant ➜ `file:bg-primary-50 file:text-primary-700` |
| Insights panel | width `350px`, gradient bg, collapsible sections (`CollapsibleSection` component) |

Spacing: multiples of **4 px** via Tailwind `p-1 … p-8` etc.  
Corner radius: `rounded-lg` (8 px) for inputs/buttons, `rounded-2xl` (24 px) for major containers.

---

## 5. Responsive Strategy
1. **Mobile-first** – components stack vertically; chat insights panel slides over content at `<640px`.  
2. **Breakpoints** – default Tailwind sm 640, md 768, lg 1024, xl 1280.  
3. **Fluid width** – `.container mx-auto px-4` wrappers with max-width on large screens.  
4. **Height management** – chat uses `vh` rather than fixed px to fill viewport on tablets.

---

## 6. Animation & Transition Guidelines
| Use-case | Class / Technique | Notes |
| -------- | ---------------- | ----- |
| Background blobs | `animate-float`, `animate-float-delayed`, `animate-float-slow` | custom keyframes in `index.html` |
| Ray-pulse gradient | `animate-ray-pulse` radial fade loop |
| Header CTA bounce | `animate-bounce` on **UPGRADE** |
| Insights panel | Framer-Motion variants (`x`, `opacity`) 300 ms ease-out |
| Typing dots | custom inline `animate-pulse` w/ staggered delay |
| Hover states | Tailwind `hover:bg-*`, `hover:text-*`,  `transition-all duration-200` |
All animations aim for **≤400 ms** and respect `prefers-reduced-motion`.

---

## 7. Accessibility Considerations
1. **Color Contrast** – accent yellow (#facc15) against blue-900 meets WCAG AA for large text; verify custom text on glass surfaces.  
2. **Keyboard Nav** – all interactive elements use semantic tags (`<button>`, `<a>`) and `focus:ring-*` utilities.  
3. **ARIA Labels** – icons/buttons include `aria-label` where content is icon-only (e.g., close “×”, insights toggle).  
4. **Reduced Motion** – Tailwind respects `prefers-reduced-motion`; critical animations disabled via `@media (prefers-reduced-motion: reduce)`.  
5. **Screen Readers** – chat bubbles announce role/author via `aria-label` (future work: live-region for streaming text).  
6. **Form Inputs** – labels are visible; error states include text feedback plus color.  
7. **Responsive Touch Targets** – minimum 44 × 44 px for buttons on mobile.

---

### Using This Document
Follow these guidelines whenever creating new pages or components to ensure a cohesive, accessible, and visually compelling experience across Bible Character Chat.
