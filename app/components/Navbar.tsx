"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

const NAV_LINKS = ["HOME", "ABOUT US", "SERVICES"];

const BIRD_PATH =
  "M16.7278 0C17.0321 0.281551 18.4201 2.73838 18.7572 3.29532L22.8328 10.0706C23.4555 11.1052 25.1331 13.7272 25.5943 14.8704C25.6478 15.0026 25.6136 17.6474 25.613 17.9558L25.6068 23.2072C25.6042 24.119 25.559 25.5597 25.6665 26.4333C25.7247 26.9069 26.7915 28.4034 27.1379 28.9498L31.9225 36.5364C32.2663 37.0799 33.812 39.4373 34 39.9182C33.8535 41.3138 33.57 42.7591 33.3497 44.149L32.0985 51.8791C32.0149 52.3853 31.7049 54.766 31.5838 55.0476C31.1029 54.9394 29.6497 53.8896 29.1755 53.5718L26.1007 51.5281C23.1096 49.5548 20.131 47.5624 17.1657 45.5503C17.0804 45.4933 16.7999 45.307 16.7366 45.3432C16.0071 45.762 14.7535 46.6813 14.1224 47.1218L7.20175 51.8889C6.57018 52.3258 2.90236 54.9679 2.46634 54.9979C2.27095 54.6599 2.19543 53.4263 2.12635 52.9832L0.928606 45.4053C0.649127 43.5987 0.185006 41.2004 2.40621e-06 39.4285C0.476794 38.4056 1.53986 36.6979 2.15595 35.6419C3.31963 33.6572 4.4697 31.6642 5.6061 29.664C6.10814 28.7991 6.94278 27.6034 7.29165 26.7417C7.42445 26.4136 7.42866 26.0664 7.43121 25.7178C7.43998 24.5093 7.31487 15.0673 7.48205 14.7177C7.49146 14.698 7.50231 14.679 7.51181 14.6593C8.18405 13.2751 9.25143 11.8317 10.0842 10.5175L14.3576 3.76379C15.1367 2.53453 16.0012 1.24858 16.7278 0Z";

export default function Navbar() {
  const navRef       = useRef<HTMLElement>(null);
  const overlayRef   = useRef<HTMLDivElement>(null);
  const menuLinksRef = useRef<HTMLDivElement>(null);
  // Hamburger line refs for morph animation
  const bar1 = useRef<HTMLSpanElement>(null);
  const bar2 = useRef<HTMLSpanElement>(null);
  const bar3 = useRef<HTMLSpanElement>(null);

  const [open, setOpen] = useState(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    gsap.set(navRef.current, { opacity: 0, y: -28 });
    // scaleY: 0 from top — GPU-composited, no clipPath jank
    gsap.set(overlayRef.current, { scaleY: 0, transformOrigin: "top center", display: "flex" });
  }, []);

  // Page-load reveal
  useEffect(() => {
    const reveal = () => {
      gsap.to(navRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "expo.out",
        delay: 0.05,
      });
    };
    document.addEventListener("bird:reveal", reveal, { once: true });
    return () => document.removeEventListener("bird:reveal", reveal);
  }, []);

  // Menu open/close — single reversible GSAP timeline
  useEffect(() => {
    const overlay = overlayRef.current;
    const links   = menuLinksRef.current;
    if (!overlay || !links) return;

    tlRef.current?.kill();
    const tl = gsap.timeline();
    tlRef.current = tl;

    if (open) {
      document.body.style.overflow = "hidden";

      tl
        // Overlay sweeps down — long, silky power4 deceleration
        .to(overlay, { scaleY: 1, duration: 1.1, ease: "power4.out" }, 0)
        // Middle bar dissolves
        .to(bar2.current, { scaleX: 0, opacity: 0, duration: 0.28, ease: "power2.out" }, 0)
        // Top + bottom bars rotate into X
        .to(bar1.current, { y: 6.8, rotation: 45,  duration: 0.6, ease: "power4.out" }, 0.06)
        .to(bar3.current, { y: -6.8, rotation: -45, duration: 0.6, ease: "power4.out" }, 0.06)
        // Links drift up one by one
        .fromTo(
          links.children,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.75, ease: "power3.out", stagger: 0.1 },
          0.3
        );
    } else {
      // Links fade and drift up first
      tl
        .to(links.children, { opacity: 0, y: -16, duration: 0.35, ease: "power2.in", stagger: 0.05 }, 0)
        // Overlay folds back up — slightly delayed so links clear first
        .to(overlay, { scaleY: 0, duration: 0.85, ease: "power4.inOut" }, 0.12)
        // Bars unwind back to hamburger
        .to(bar1.current, { y: 0, rotation: 0, duration: 0.55, ease: "power3.out" }, 0.1)
        .to(bar3.current, { y: 0, rotation: 0, duration: 0.55, ease: "power3.out" }, 0.1)
        .to(bar2.current, { scaleX: 1, opacity: 1, duration: 0.35, ease: "power3.out" }, 0.35)
        .add(() => { document.body.style.overflow = ""; });
    }
  }, [open]);

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* ── Navbar ── */}
      <nav
        ref={navRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: "1rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* Pill: full-width + space-between on mobile, auto-width + gap on desktop */}
        <div
          className="w-full justify-between md:w-auto md:justify-start md:gap-6"
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#ffffff",
            borderRadius: "9999px",
            border: "1px solid #e5e7eb",
            padding: ".25rem .25rem .25rem 1.25rem",
          }}
        >
          {/* Logo */}
          <svg width="18" height="29" viewBox="0 0 34 56" fill="none" aria-hidden="true">
            <path d={BIRD_PATH} fill="#1E1E1E" />
          </svg>

          {/* Desktop nav links — centered */}
          <span className="hidden md:flex" style={{ gap: "2rem" }}>
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  color: "#1E1E1E",
                  textDecoration: "none",
                  letterSpacing: "0.02em",
                  fontFamily: "var(--font-pathway-extreme)",
                }}
              >
                {link}
              </a>
            ))}
          </span>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <a
              href="#"
              style={{
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "#1E1E1E",
                textDecoration: "none",
                letterSpacing: "0.02em",
                fontFamily: "var(--font-pathway-extreme)",
                backgroundColor: "#EEE7FF",
                borderRadius: "9999px",
                padding: "0.4rem 1rem",
                whiteSpace: "nowrap",
              }}
            >
              CONTACT US
            </a>

            {/* Hamburger — mobile only, right of Contact */}
            <button
              className="md:hidden flex flex-col items-center justify-center"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 6px",
                gap: "5px",
                width: 36,
                height: 36,
              }}
            >
              <span ref={bar1} style={{ display: "block", width: 22, height: 1.8, backgroundColor: "#1E1E1E", borderRadius: 2, transformOrigin: "center" }} />
              <span ref={bar2} style={{ display: "block", width: 22, height: 1.8, backgroundColor: "#1E1E1E", borderRadius: 2, transformOrigin: "center" }} />
              <span ref={bar3} style={{ display: "block", width: 22, height: 1.8, backgroundColor: "#1E1E1E", borderRadius: 2, transformOrigin: "center" }} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Full-screen overlay ── */}
      <div
        ref={overlayRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #EAE1FF 0%, #ffffff 100%)",
          transformOrigin: "top center",
          willChange: "transform",
        }}
      >
        <div
          ref={menuLinksRef}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              onClick={() => setOpen(false)}
              style={{
                fontSize: "clamp(2.2rem, 9vw, 3.5rem)",
                fontWeight: 700,
                color: "#1E1E1E",
                textDecoration: "none",
                letterSpacing: "-0.03em",
                fontFamily: "var(--font-pathway-extreme)",
                opacity: 0,
              }}
            >
              {link}
            </a>
          ))}
          <a
            href="#"
            onClick={() => setOpen(false)}
            style={{
              marginTop: "1rem",
              fontSize: "0.95rem",
              fontWeight: 500,
              color: "#1E1E1E",
              textDecoration: "none",
              letterSpacing: "0.02em",
              fontFamily: "var(--font-pathway-extreme)",
              backgroundColor: "#EEE7FF",
              borderRadius: "9999px",
              padding: "0.6rem 1.8rem",
              opacity: 0,
            }}
          >
            CONTACT US
          </a>
        </div>
      </div>
    </>
  );
}
