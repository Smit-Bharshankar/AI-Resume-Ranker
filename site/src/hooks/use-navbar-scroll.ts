"use client";

import { useEffect, useRef, useState } from "react";

type UseNavbarScrollOptions = {
  heroId: string;
  hideThreshold?: number;
};

type UseNavbarScrollReturn = {
  hasPassedHero: boolean;
  isHidden: boolean;
};

export function useNavbarScroll({
  heroId,
  hideThreshold = 96,
}: UseNavbarScrollOptions): UseNavbarScrollReturn {
  const [hasPassedHero, setHasPassedHero] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const hasPassedHeroRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const heroEl = document.getElementById(heroId);

    if (!heroEl) {
      hasPassedHeroRef.current = true;
      const rafId = requestAnimationFrame(() => {
        setHasPassedHero(true);
      });
      return () => {
        cancelAnimationFrame(rafId);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const passed = !entry.isIntersecting;
        hasPassedHeroRef.current = passed;
        setHasPassedHero(passed);
        if (!passed) {
          setIsHidden(false);
        }
      },
      {
        threshold: 0.12,
      }
    );

    observer.observe(heroEl);

    return () => {
      observer.disconnect();
    };
  }, [heroId]);

  useEffect(() => {
    const onScroll = () => {
      if (tickingRef.current) {
        return;
      }

      tickingRef.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollYRef.current;

        if (!hasPassedHeroRef.current) {
          setIsHidden(false);
        } else if (currentY > hideThreshold) {
          if (delta > 2) {
            setIsHidden(true);
          } else if (delta < -2) {
            setIsHidden(false);
          }
        }

        lastScrollYRef.current = currentY;
        tickingRef.current = false;
      });
    };

    lastScrollYRef.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [hideThreshold]);

  return { hasPassedHero, isHidden };
}
