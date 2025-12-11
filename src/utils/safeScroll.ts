// Cross‑browser safe scroll helpers for mobile Safari/Chrome
// Avoids overscroll jumps when the on‑screen keyboard opens/closes.

export function scrollToBottom(el: HTMLElement | null) {
  if (!el) return;
  try {
    // Prefer requestAnimationFrame to wait for layout after DOM updates
    requestAnimationFrame(() => {
      try {
        // Avoid smooth behavior; it conflicts with iOS keyboard resizing
        el.scrollIntoView({ block: 'end', inline: 'nearest', behavior: 'auto' });
      } catch {
        // Fallback: manual scroll if it's a container end marker
        try {
          const parent = el.parentElement as HTMLElement | null;
          if (parent) parent.scrollTop = parent.scrollHeight;
        } catch {}
      }
    });
  } catch {}
}

export function blurActiveInput() {
  try {
    const active = document.activeElement as HTMLElement | null;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || (active as any).blur)) {
      (active as any).blur?.();
    }
  } catch {}
}
