import { useEffect, useRef } from 'react';

type Props = { label: string; className?: string; radius?: number };
type PointerHandler = (event: PointerEvent) => void;
const pointerHandlers = new Set<PointerHandler>();
let pointerBound = false;
const dispatchPointer = (event: PointerEvent) => pointerHandlers.forEach(handler => handler(event));
const subscribePointer = (handler: PointerHandler) => {
  pointerHandlers.add(handler);
  if (!pointerBound) {
    window.addEventListener('pointermove', dispatchPointer, { passive: true });
    pointerBound = true;
  }
  return () => {
    pointerHandlers.delete(handler);
    if (!pointerHandlers.size && pointerBound) {
      window.removeEventListener('pointermove', dispatchPointer);
      pointerBound = false;
    }
  };
};

export default function VariableProximity({ label, className = '', radius = 210 }: Props) {
  const root = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const chars = Array.from(el.querySelectorAll<HTMLElement>('[data-char]'));
    let frame = 0;
    let visible = false;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: '180px' });
    observer.observe(el);
    const update = (event: PointerEvent) => {
      if (!visible) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        chars.forEach(char => {
          const rect = char.getBoundingClientRect();
          const distance = Math.hypot(event.clientX - (rect.left + rect.width / 2), event.clientY - (rect.top + rect.height / 2));
          const proximity = Math.max(0, 1 - distance / radius);
          if (proximity <= 0) { char.style.fontWeight = ''; char.style.transform = ''; }
          else {
            char.style.fontWeight = String(Math.round(700 + proximity * 200));
            char.style.transform = `translateY(${-proximity * 3}px) scale(${1 + proximity * 0.045})`;
          }
        });
      });
    };
    const unsubscribe = subscribePointer(update);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); unsubscribe(); };
  }, [radius]);
  return <span ref={root} className={`variableProximity ${className}`} aria-label={label}>
    {label.split('').map((char, index) => char === '\n' ? <br key={index} /> : <span data-char aria-hidden="true" key={index}>{char === ' ' ? '\u00a0' : char}</span>)}
  </span>;
}
