# Feature Image Design Guidelines  
*Applies to hero/feature images displayed at the top of every chat page*

---

## 1 · Purpose of the Feature Image
A good feature image …
1. Immediately tells the user **which Biblical character** they are about to talk to.  
2. Establishes the overall **tone** (reverent, welcoming, historically–inspired).  
3. Reinforces the **FaithTalkAI brand** (navy + gold colour scheme).  

Keep these three goals in mind for every illustration or photo-mosaic you create.

---

## 2 · Canvas Size & Technical Specs
| Parameter | Recommendation | Notes |
|-----------|----------------|-------|
| Natural size | **1600 × 900 px** | 16 : 9 ratio; scales cleanly to 1280 × 720 & 1920 × 1080. |
| File size   | **≤ 400 KB**  | Hard cap at 600 KB. Optimise aggressively (see Performance). |
| DPI         | 72 ppi        | Higher DPI offers no benefit on the web. |
| Format      | **WebP** (`.webp`) | Falls back to **JPEG** for legacy browsers. |
| Colour profile | sRGB | Guarantees consistency across devices. |

> ℹ️  The responsive layout uses **object-fit: cover**. Anything outside the safe zone may be cropped on ultra-wide or very narrow screens.

### Safe-Zone Template
```
|---------------- Feature image 1600 × 900 ----------------|
|   240px   |                  1120px                  |240|
|                                                       |
|                PRIMARY SAFE ZONE (Center 70%)         |
|                                                       |
|--------------------------------------------------------|
```
Ensure the character’s **face, nameplate, or focal element** is inside the 1120 × 560 px center region.

---

## 3 · Composition Tips
1. **Character-centric**: The featured person should occupy ~40 – 60 % of width. Leave negative space for UI overlays.  
2. **Eye Level**: Eyes positioned one-third from the top feel most natural on phones & desktops.  
3. **Rule of Thirds**: Place key elements on intersection lines to improve balance.  
4. **Depth & Light**: Use a gentle vignette or depth-of-field blur on backgrounds so CTA buttons stand out.  
5. **Avoid Text** inside the image. Use the title component to keep copy accessible and editable.

### Do
✓ Subtle historic textures or manuscripts behind the figure  
✓ Soft edge gradients that blend with FaithTalkAI navy background

### Don’t
✗ Ultra-saturated modern stock photos  
✗ Busy patterns that clash with yellow CTA buttons

---

## 4 · Colour Palette
Primary brand colours:
| Purpose            | Hex | Tailwind class |
|--------------------|-----|----------------|
| Navy Background    | `#0A0A2A` | `bg-[#0a0a2a]` |
| Accent Gold        | `#FACC15` | `text-yellow-400 / bg-yellow-400` |
| Deep Blue Text     | `#2A3F5F` | `text-blue-900` |
| Off-white          | `#F7F9FF` | `bg-blue-50`    |

Use these as **accent hues** or subtle overlays (10–30 % opacity) so the image integrates with the UI.

---

## 5 · Accessibility Considerations
1. **Contrast**: Overlay gradients must maintain a minimum 4.5 : 1 contrast for title text (`text-white`) placed on top.  
2. **Colour-blind Safety**: Avoid conveying information with colour alone; rely on position & iconography.  
3. **Alt Text**: Provide a concise, descriptive alt attribute:  
   `alt="Illustration of Moses holding the Ten Commandments tablets"`  
4. **Motion Sensitivity**: If exporting as video/GIF, no more than 3 FPS subtle parallax; otherwise supply a static fallback.

---

## 6 · Performance Best Practices
| Technique | Why | Tooling |
|-----------|-----|---------|
| **WebP** export | 25-35 % smaller than JPEG/PNG | Photoshop > Save-for-Web, Squoosh.app |
| **Compression** target 80–85 quality | Balances clarity & weight | ImageOptim, MozJPEG |
| **Lazy-Loading** via `loading="lazy"` attribute | Defers off-screen assets | Handled in React component |
| **CDN Caching** (Supabase Storage / Cloudflare) | Global delivery & versioning | Include cache-busting hash in URL |

> 🚀  A 200 KB WebP loads in under 150 ms on 4G; aim for that target.

---

## 7 · Workflow Checklist
- [ ] Start from the **1600 × 900** template with safe-zone guides.  
- [ ] Place the character’s **face & torso** within the center 70 %.  
- [ ] Apply brand colour overlay at **10 % opacity** if tones clash.  
- [ ] Export **WebP ≤ 400 KB** (JPEG fallback ≤ 500 KB).  
- [ ] Add descriptive **alt text** in the CMS / code.  
- [ ] Test on **mobile (360 × 640)** and **desktop (1920 × 1080)** for cropping.  
- [ ] Verify text overlay contrast in the Storybook “ChatHeader” story.  

---

## 8 · Resources
• FaithTalkAI Figma kit – `/Brand/Imagery & Patterns`  
• Unsplash “Biblical” curated collection: <https://unsplash.com/collections/faithtalk-bible>  
• “Bible Art” AI prompt sheet (Midjourney v6) – see internal Notion doc  
• Color contrast checker: <https://webaim.org/resources/contrastchecker/>

---

*Updated July 2025 — Maintained by the FaithTalkAI Design Team.*
