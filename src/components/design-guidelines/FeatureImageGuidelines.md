# Feature Image Design Guidelines
Designing compelling feature images for each chat page elevates the user experience and reinforces the biblical atmosphere of FaithTalkAI.  Use this guide as a play-book for creators, designers, and illustrators.

---

## 1. Size & Format

| Context                           | Pixel Dimensions (W × H) | Aspect Ratio | File Type | Max File Size |
|----------------------------------|--------------------------|--------------|-----------|---------------|
| High-resolution (retina / hero)  | **1600 × 900 px**        | 16 : 9       | JPG / PNG | ≤ 400 KB      |
| Standard desktop banner          | 1200 × 675 px            | 16 : 9       | JPG / PNG | ≤ 300 KB      |
| Mobile fallback / low bandwidth  |  800 × 450 px            | 16 : 9       | JPG       | ≤ 150 KB      |

*Keep the same 16:9 aspect ratio across all breakpoints; the app auto-scales and crops from center-top.*

---

## 2. Safe Zones & Cropping
1. **Primary subject** (character portrait or symbolic element) should live within the central **60 %** horizontally and **70 %** vertically.  
2. Place key text or high-detail areas above the lower **20 %** to avoid the gradient overlay used for title readability.
3. Leave a **24 px** bleed on all sides; this protects against minor responsive crops.

---

## 3. Composition Tips

| Principle | Why it Matters | How to Apply |
|-----------|----------------|--------------|
| Rule of Thirds | Guides the viewer’s eye and keeps subject feeling “epic” rather than static. | Align the character’s eyes or focal symbol at an intersection point. |
| Directional Gaze | Encourages conversation. | Have the character face slightly toward the chat window (to the right on LTR screens). |
| Depth Layers | Adds visual interest and hierarchy. | Foreground character silhouette, mid-ground contextual props, subtle blurred background landscape. |
| Narrative Hints | Foreshadows the chat tone. | Moses with parted sea spray; Esther with palace columns; Paul holding a travel map. |

---

## 4. Style Guidelines

1. **Historically respectful yet modern**  
   • Avoid cartoon clichés unless intentionally teaching children.  
   • Use painterly textures, light film-grain, or soft gradients that feel timeless.

2. **Lighting**  
   • Warm key-light (gold  #FACC15) from top-left evokes divine presence.  
   • Cool fill-light (deep slate #1E293B) balances shadows.

3. **Detail Level**  
   • Strive for mid-level realism; too photo-real can feel uncanny, too flat loses reverence.  
   • Emphasize fabrics, scrolls, or tools that identify the era.

4. **Typography Overlay**  
   • Avoid putting custom text in the image; the app overlays titles.  
   • If unavoidable, reserve bottom-right corner and use Cinzel Bold, ≤ 48 pt.

---

## 5. Color Palette

| Purpose               | Palette Token | Hex        | Usage                                                    |
|-----------------------|--------------|-----------|----------------------------------------------------------|
| Divine highlight      | `faith-gold` | **#FACC15** | Halos, sun-rays, accent strokes                          |
| Night-sky base        | `faith-navy` | **#0A0A2A** | Background gradients & shadows                           |
| Scroll parchment      | `faith-sand` | **#F8F3E8** | Ancient documents, subtle background texture             |
| Royal accent          | `faith-indigo` | **#4338CA** | Kingly garments, holy temples                            |
| Martyr crimson        | `faith-crimson` | **#991B1B** | Subtle hints for sacrifice-themed characters             |

Stick to 2–3 dominant colors per image; let gold be the unifying accent across all characters.

---

## 6. Image Tone per Testament

| Testament | Recommended Mood | Sample Lighting | Common Props |
|-----------|------------------|-----------------|--------------|
| Old       | “Epic origins”   | High-contrast sunsets, dusty warm haze | Stone tablets, shepherd staffs, ancient tents |
| New       | “Gospel hope”    | Soft daylight, gentle rim-light        | Olive branches, fishing nets, scrolls, city skylines |

---

## 7. Accessibility & Performance

* Provide alt text following pattern:  
  `"[Character] feature image – [brief scene description]"`.
* Compress with **TinyPNG** or **Squoosh**; aim for 70-80 % quality.
* Test legibility at 320 px width to ensure subject remains recognizable.

---

## 8. Examples

1. **Moses – “Crossing the Red Sea”**  
   • Portrait in left-third, staff raised; churning turquoise waters form a V-shape toward horizon; warm golden rim-light on robe edges.

2. **Esther – “Courage in the Court”**  
   • Three-quarter pose facing camera, translucent royal veil catching faith-gold highlights; blurred palace corridor in background.

3. **Paul – “Journeys by Scroll and Sea”**  
   • Map-filled desk at foreground, Paul writing; distant harbor through archway; sunbeam spotlight on parchment.

Save these reference JPEGs in `/public/examples/feature-images/`.

---

## 9. Quick Checklist (print-ready)

- [ ] 16 : 9 ratio (1600×900 px master)
- [ ] Central safe-zone respected
- [ ] Character eyes/gaze toward chat
- [ ] FaithTalkAI gold accent present
- [ ] File ≤ 400 KB, JPG/PNG, compressed
- [ ] Alt text written

---

Craft each image as an invitation: a window into the story before the conversation even begins.  Let light, color, and composition prepare the user for meaningful dialogue with the biblical character.
