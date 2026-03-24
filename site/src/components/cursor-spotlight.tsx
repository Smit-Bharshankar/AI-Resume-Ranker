"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function CursorSpotlight() {
  const pathname = usePathname();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const hiddenRoutes = ["/privacy-policy", "/terms", "/contact", "/ai-transparency" ];
  const shouldHide = hiddenRoutes.includes(pathname);

  useEffect(() => {
    if (shouldHide) {
      return;
    }

    let frame = 0;

    const onMouseMove = (event: MouseEvent) => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
      frame = requestAnimationFrame(() => {
        setPosition({ x: event.clientX, y: event.clientY });
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, [shouldHide]);

  if (shouldHide) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-5 transition-opacity duration-300"
      style={{
        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, color-mix(in srgb, var(--brand-accent) 22%, transparent), transparent 40%)`,
      }}
    />
  );
}
