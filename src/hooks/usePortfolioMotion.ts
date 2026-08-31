import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function usePortfolioMotion() {
  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const opening = document.querySelector<HTMLElement>('.opening');
    if (reduced) {
      if (opening) opening.style.display = 'none';
      return;
    }

    document.documentElement.classList.add('motion-ready');
    const context = gsap.context(() => {
      document.body.style.overflow = 'hidden';
      const openingTl = gsap.timeline({
        defaults: { ease: 'power4.inOut' },
        onComplete: () => {
          document.body.style.overflow = '';
          opening?.remove();
          ScrollTrigger.refresh();
        },
      });

      openingTl
        .fromTo('.openingMark', { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, ease: 'power4.out' })
        .to('.openingMark', { yPercent: -80, opacity: 0, duration: .75 }, '+=.25')
        .to('.openingPanel--top', { scaleY: 0, transformOrigin: 'top', duration: 1.25 }, '-=.25')
        .to('.openingPanel--bottom', { scaleY: 0, transformOrigin: 'bottom', duration: 1.25 }, '<.1')
        .fromTo('.heroVideo', { scale: 1.08 }, { scale: 1, duration: 2.2, ease: 'power3.out' }, '-=1.15')
        .fromTo('.hero header', { y: -38, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, '-=1.55')
        .fromTo('.heroTitle h1 [data-char]', { yPercent: 130, scaleY: .55, opacity: 0 }, {
          yPercent: 0, scaleY: 1, opacity: 1, duration: 1.25, stagger: .035, ease: 'power4.out',
        }, '-=1.25')
        .fromTo('.heroTitle p,.heroBottom', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: .12, ease: 'power3.out' }, '-=.75');

      const sections = gsap.utils.toArray<HTMLElement>('.about,.works,.thinking,.contact');
      sections.forEach((section, index) => {
        const word = section.querySelector('.sectionWord');
        const titleChars = section.querySelectorAll<HTMLElement>('h2 [data-char]');
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: section, start: 'top 78%', once: true },
        });
        if (word) timeline.fromTo(word,
          { xPercent: index % 2 ? 28 : -28, opacity: 0, skewX: -8 },
          { xPercent: 0, opacity: 1, skewX: 0, duration: 1.55, ease: 'power4.out' }
        );
        if (titleChars.length) timeline.fromTo(titleChars,
          { yPercent: 125, scaleY: .62, opacity: 0 },
          { yPercent: 0, scaleY: 1, opacity: 1, duration: 1.15, stagger: .018, ease: 'power4.out' },
          word ? '-=.95' : 0
        );
      });

      gsap.utils.toArray<HTMLElement>('.seriesBlock').forEach(block => {
        const titleChars = block.querySelectorAll<HTMLElement>('.seriesIntro h3 [data-char]');
        const cards = block.querySelectorAll<HTMLElement>('.work');
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: block, start: 'top 80%', once: true },
        });
        timeline
          .fromTo(titleChars, { x: -80, opacity: 0, scaleX: .72 }, {
            x: 0, opacity: 1, scaleX: 1, duration: 1.1, stagger: .025, ease: 'power4.out',
          })
          .fromTo(cards, { y: 100, opacity: 0, clipPath: 'inset(18% 0 0 0)' }, {
            y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', duration: 1.25, stagger: .13, ease: 'power3.out',
          }, '-=.55');
      });

      gsap.utils.toArray<HTMLElement>('.work:nth-child(3n+1) img,.work:nth-child(3n+1)>video').forEach(media => {
        gsap.fromTo(media, { yPercent: -3, scale: 1.07 }, {
          yPercent: 3, scale: 1.03, ease: 'none',
          scrollTrigger: { trigger: media.closest('.work'), start: 'top bottom', end: 'bottom top', scrub: 1.2 },
        });
      });
    });

    return () => {
      context.revert();
      document.body.style.overflow = '';
      document.documentElement.classList.remove('motion-ready');
    };
  }, []);
}
