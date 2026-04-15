"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import pathDownwards from "@/public/home/hero/path-downwards.png";
import { ShaderBackground } from "@/app/components/ShaderBackground";

gsap.registerPlugin(ScrollTrigger);

const PLATFORM_SECTIONS = [
  {
    key: "Capital",
    title: "Capital",
    desc: "Providing smart, well-timed capital that fuels momentum without friction and aligns with real growth opportunities. Every dollar is designed to accelerate execution and unlock scale, not slow it down.",
  },
  {
    key: "Studios",
    title: "Studios",
    desc: "Building world-class product studios that ship iconic digital experiences. We embed deeply with founders to move at the speed of great ideas.",
  },
  {
    key: "Labs",
    title: "Labs",
    desc: "Exploring emerging technologies before they become obvious. Our labs give founders the runway to experiment, iterate, and discover what's next.",
  },
  {
    key: "Academy",
    title: "Academy",
    desc: "Developing the next generation of founders and operators. The Bird Academy accelerates learning and compresses years of growth into months.",
  },
  {
    key: "Collective",
    title: "Collective",
    desc: "A network of builders, operators, and investors who share resources, deal flow, and knowledge. The Collective compounds every founder in it.",
  },
];

export default function Home() {
  const logoRef = useRef<SVGSVGElement>(null);
  const line1 = useRef<HTMLSpanElement>(null);
  const line2 = useRef<HTMLSpanElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroWrapRef = useRef<HTMLDivElement>(null);
  const blackOverlayRef = useRef<HTMLDivElement>(null);
  const platformPillRef = useRef<HTMLDivElement>(null);
  const pillInnerRef = useRef<HTMLDivElement>(null);
  const secondSectionRef = useRef<HTMLDivElement>(null);
  const pathDownRef = useRef<HTMLDivElement>(null);
  const platformContentRef = useRef<HTMLDivElement>(null);
  const navRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  // targetTime is written by ScrollTrigger onUpdate; lerp'd by the RAF loop
  const targetTime = useRef(0);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Lenis smooth scroll — drives GSAP ticker so ScrollTrigger stays in sync
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCb = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickerCb);
    };
  }, []);


  useLayoutEffect(() => {
    gsap.set(logoRef.current, { opacity: 0, y: 28 });
    gsap.set(line1.current, { y: "105%" });
    gsap.set(line2.current, { y: "105%" });
    gsap.set(subtextRef.current, { opacity: 0, y: 22 });
    gsap.set(videoWrapRef.current, { opacity: 0 });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.pause();

    const reveal = () => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl
        .to(logoRef.current, { opacity: 1, y: 0, duration: 0.85 }, 0)
        .to(line1.current, { y: "0%", duration: 1.0 }, 0.04)
        .to(line2.current, { y: "0%", duration: 1.0 }, 0.18)
        .to(subtextRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0.38)
        .to(videoWrapRef.current, { opacity: 1, duration: 0.95, ease: "power4.out" }, 0.28);
    };

    document.addEventListener("bird:reveal", reveal, { once: true });
    return () => document.removeEventListener("bird:reveal", reveal);
  }, []);

  // Animate path-downwards image up to -100vh and fade in the pill as second section scrolls into view
  useEffect(() => {
    const section = secondSectionRef.current;
    const pill = platformPillRef.current;
    const pathDown = pathDownRef.current;
    if (!section || !pill || !pathDown) return;

    // 600vh wrapper: 60vh = 10% of 600vh
    const stConfig = {
      trigger: section,
      start: "top 50%",
      end: "10% top",
      scrub: true,
      invalidateOnRefresh: true,
    };

    const pathAnim = gsap.fromTo(
      pathDown,
      { y: 0 },
      { y: () => -window.innerHeight, ease: "none", scrollTrigger: stConfig }
    );

    const pillAnim = gsap.fromTo(
      pill,
      { opacity: 0 },
      { opacity: 1, ease: "none", scrollTrigger: stConfig }
    );

    return () => {
      pathAnim.scrollTrigger?.kill();
      pillAnim.scrollTrigger?.kill();
    };
  }, []);

  // Scale + fade out the pill; fade in platform content over the same range
  useEffect(() => {
    const section = secondSectionRef.current;
    const pillInner = pillInnerRef.current;
    const platformContent = platformContentRef.current;
    if (!section || !pillInner || !platformContent) return;

    const st = {
      trigger: section,
      start: "7% top",  // 42vh — starts a bit earlier
      end: "20% top",   // 120vh — faster completion
      scrub: true,
    };

    const scaleAnim = gsap.fromTo(
      pillInner,
      { scale: 1, opacity: 1, filter: "blur(0px)" },
      { scale: 25, opacity: 0, filter: "blur(40px)", ease: "power2.in", scrollTrigger: st }
    );

    // Platform content stays hidden through entire pill zoom, then snaps in
    // at the same moment the section-switching trigger fires (33.33% top)
    const contentAnim = gsap.fromTo(
      platformContent,
      { opacity: 0 },
      {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "20% top",
          end: "21.5% top",
          scrub: true,
        },
      }
    );

    return () => {
      scaleAnim.scrollTrigger?.kill();
      contentAnim.scrollTrigger?.kill();
    };
  }, []);

  // Platform sections content transition on scroll
  useEffect(() => {
    const wrap = secondSectionRef.current;
    if (!wrap) return;

    const N = PLATFORM_SECTIONS.length;
    const FADE = 0.22; // wider crossfade zone for overlap
    const SLIDE = 22;  // px — vertical travel distance

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: "20% top", // 120vh into the 600vh wrapper — right after pill ends
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const raw = self.progress * N; // 0 → N

        contentRefs.current.forEach((el, i) => {
          if (!el) return;

          const dist = raw - i; // negative = before, 0–1 = active, >1 = after

          let opacity = 0;
          let yOffset = 0;
          let scale = 0.96;

          if (dist >= 0 && dist <= 1) {
            if (dist < FADE) {
              // Entering — rise from below + fade in + scale up
              const t = dist / FADE;
              opacity = t;
              yOffset = SLIDE * (1 - t);
              scale = 0.96 + 0.04 * t;
            } else if (dist > 1 - FADE) {
              // Exiting — drift upward + fade out + scale down
              const t = (dist - (1 - FADE)) / FADE;
              opacity = 1 - t;
              yOffset = -SLIDE * t;
              scale = 1 - 0.04 * t;
            } else {
              // Fully visible
              opacity = 1;
              yOffset = 0;
              scale = 1;
            }
          } else if (dist < 0) {
            yOffset = SLIDE;  // below viewport, ready to enter
          } else {
            yOffset = -SLIDE; // above viewport, already exited
          }

          el.style.opacity = String(Math.max(0, opacity));
          el.style.transform = `translateY(calc(-50% + ${yOffset}px)) scale(${scale})`;
          el.style.pointerEvents = opacity > 0 ? "auto" : "none";
        });

        // Nav colour — highlight whichever section is most visible
        const activeIndex = Math.min(Math.max(Math.round(raw - 0.5), 0), N - 1);
        navRefs.current.forEach((el, i) => {
          if (!el) return;
          el.style.color = i === activeIndex ? "#6B5CE7" : "rgba(255,255,255,0.45)";
        });
      },
    });

    return () => trigger.kill();
  }, []);

  // ScrollTrigger scrub + RAF lerp for video seeking.
  // We don't use ScrollTrigger's pin because the sticky CSS already handles it.
  useEffect(() => {
    const video = videoRef.current;
    const wrap = heroWrapRef.current;
    if (!video || !wrap) return;

    // iOS Safari ignores preload="auto" and won't load video data without a
    // play() call or explicit load(). Kick off loading immediately, then on
    // mobile Safari briefly play+pause to unlock seekability.
    video.load();

    const unlockAndStart = () => {
      const isIOS =
        /iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

      if (isIOS) {
        // play() briefly to unblock seeking, then pause at frame 0
        const p = video.play();
        if (p !== undefined) {
          p.then(() => {
            video.pause();
            video.currentTime = 0;
          }).catch(() => {});
        }
      } else {
        video.pause();
      }

      startScrub();
    };

    let currentTime = 0;
    let rafId: number;
    let triggerInstance: ReturnType<typeof ScrollTrigger.create> | null = null;

    const startScrub = () => {
      // RAF lerp loop: decouples seeks from scroll events, bridges decode latency
      const tick = () => {
        currentTime += (targetTime.current - currentTime) * 0.1;
        if (Math.abs(currentTime - video.currentTime) > 0.01) {
          video.currentTime = currentTime;
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);

      // ScrollTrigger tracks the outer 300vh wrapper.
      triggerInstance = ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          // Video time: map full scroll range to full video duration
          if (video.duration && isFinite(video.duration)) {
            targetTime.current = self.progress * video.duration;
          }

          const isDesktop = window.innerWidth >= 768;

          // Desktop only: slide video up from 50vh → 0 at 60%+ scroll
          if (isDesktop && videoWrapRef.current) {
            if (self.progress >= 0.6) {
              const moveProgress = (self.progress - 0.6) / 0.4;
              videoWrapRef.current.style.translate = `0 ${50 * (1 - moveProgress)}vh`;
            } else {
              videoWrapRef.current.style.translate = "";
            }
          }

          // Fade hero to black once video starts moving up (progress ≥ 0.6)
          if (blackOverlayRef.current) {
            const fadeProgress = self.progress >= 0.6 ? (self.progress - 0.6) / 0.4 : 0;
            blackOverlayRef.current.style.opacity = String(fadeProgress);
          }
        },
      });
    };

    // Wait for metadata so duration is available before scrubbing begins
    if (video.readyState >= 1) {
      unlockAndStart();
    } else {
      video.addEventListener("loadedmetadata", unlockAndStart, { once: true });
    }

    return () => {
      cancelAnimationFrame(rafId);
      triggerInstance?.kill();
      video.removeEventListener("loadedmetadata", unlockAndStart);
    };
  }, []);

  return (
    <main>
      <div ref={heroWrapRef} style={{ height: "300vh" }}>
        <section
          style={{
            background: "#ffffff",
            fontFamily: "var(--font-sf-pro)",
            height: "100vh",
            position: "sticky",
            top: 0,
            overflow: "hidden",
          }}
          className="flex flex-col items-center justify-top pt-24 pb-8 md:py-30"
        >
          {/* Animated WebGL shader — replaces static arc + gradient */}
          <ShaderBackground />

          <div className="flex flex-col items-center text-center px-4 md:px-0" style={{ position: "relative", zIndex: 1 }}>
            {/* Logo */}
            <svg
              ref={logoRef}
              width="34"
              height="56"
              viewBox="0 0 34 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-4"
              aria-hidden="true"
            >
              <path
                d="M16.7278 0C17.0321 0.281551 18.4201 2.73838 18.7572 3.29532L22.8328 10.0706C23.4555 11.1052 25.1331 13.7272 25.5943 14.8704C25.6478 15.0026 25.6136 17.6474 25.613 17.9558L25.6068 23.2072C25.6042 24.119 25.559 25.5597 25.6665 26.4333C25.7247 26.9069 26.7915 28.4034 27.1379 28.9498L31.9225 36.5364C32.2663 37.0799 33.812 39.4373 34 39.9182C33.8535 41.3138 33.57 42.7591 33.3497 44.149L32.0985 51.8791C32.0149 52.3853 31.7049 54.766 31.5838 55.0476C31.1029 54.9394 29.6497 53.8896 29.1755 53.5718L26.1007 51.5281C23.1096 49.5548 20.131 47.5624 17.1657 45.5503C17.0804 45.4933 16.7999 45.307 16.7366 45.3432C16.0071 45.762 14.7535 46.6813 14.1224 47.1218L7.20175 51.8889C6.57018 52.3258 2.90236 54.9679 2.46634 54.9979C2.27095 54.6599 2.19543 53.4263 2.12635 52.9832L0.928606 45.4053C0.649127 43.5987 0.185006 41.2004 2.40621e-06 39.4285C0.476794 38.4056 1.53986 36.6979 2.15595 35.6419C3.31963 33.6572 4.4697 31.6642 5.6061 29.664C6.10814 28.7991 6.94278 27.6034 7.29165 26.7417C7.42445 26.4136 7.42866 26.0664 7.43121 25.7178C7.43998 24.5093 7.31487 15.0673 7.48205 14.7177C7.49146 14.698 7.50231 14.679 7.51181 14.6593C8.18405 13.2751 9.25143 11.8317 10.0842 10.5175L14.3576 3.76379C15.1367 2.53453 16.0012 1.24858 16.7278 0Z"
                fill="#1E1E1E"
              />
            </svg>

            {/* H1 */}
            <h1
              style={{
                fontSize: "clamp(2.4rem, 5vw + 1.4rem, 6rem)",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: ".9",
                color: "#1E1E1E",
                fontFamily: "var(--font-sf-pro)",
              }}
              className="max-w-4xl w-full"
            >
              <span style={{ display: "block", overflow: "hidden" }}>
                <span ref={line1} style={{ display: "block" }}>
                  We Back and Scale
                </span>
              </span>
              <span style={{ display: "block", overflow: "hidden" }}>
                <span ref={line2} style={{ display: "block" }}>
                  Iconic Products
                </span>
              </span>
            </h1>

            {/* Subtext */}
            <p
              ref={subtextRef}
              style={{ fontFamily: "var(--font-sf-pro)", color: "#000" }}
              className="mt-3 text-lg md:text-2xl lg:text-3xl font-normal tracking-tight"
            >
              Backing Founders and Studios
            </p>
          </div>

          {/* Scroll-driven black overlay — fades in as video moves up */}
          <div
            ref={blackOverlayRef}
            style={{
              position: "absolute",
              inset: 0,
              background: "#000000",
              opacity: 0,
              pointerEvents: "none",
              zIndex: 10,
            }}
          />

          {/* Scroll-scrubbed video */}
          <div style={{ position: "absolute", bottom: 0, width: "100%", mixBlendMode: "darken" }}>
            <div
              ref={videoWrapRef}
              className="max-md:scale-[3] md:translate-y-[50vh]"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                zIndex: 1,
              }}
            >
              <video
                ref={videoRef}
                src="/home/hero/output-10.mp4"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                  objectPosition: "bottom",
                }}
                muted
                playsInline
                preload="auto"
                webkit-playsinline="true"
              />
            </div>
          </div>
        </section>
      </div>

      {/* ── Second + platform section (combined 900vh wrapper) ── */}
      <div ref={secondSectionRef} style={{ height: "600vh" }}>
        <section
          style={{
            background: "#000000",
            height: "100vh",
            position: "sticky",
            top: 0,
          }}
        >
          {/* path-downwards sits at the top of the black section */}
          <div
            ref={pathDownRef}
            style={{
              position: "relative",
              zIndex: 1,
              height: "100vh",
              pointerEvents: "none",
            }}
          >
            <Image
              src={pathDownwards}
              alt=""
              sizes="100vw"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              priority
            />
            {/* Black-to-transparent gradient over the top of the image */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "40%",
                background: "linear-gradient(to bottom, #000000 0%, transparent 100%)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Centered pill label */}
          <div
            ref={platformPillRef}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            <div
              ref={pillInnerRef}
              style={{
                background: "linear-gradient(#000, #000) padding-box, linear-gradient(to bottom, #616BFF, #8639D3) border-box",
                border: "1.5px solid transparent",
                borderRadius: "24px",
                padding: "28px 56px",
                color: "#ffffff",
                fontSize: "1rem",
                fontFamily: "var(--font-sf-pro)",
                letterSpacing: "-0.01em",
                fontWeight: 400,
              }}
            >
              The Bird platform
            </div>
          </div>

          {/* Platform content — opacity 0 until pill fully fades, then scrubs to 1 */}
          <div
            ref={platformContentRef}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 5,
              pointerEvents: "none",
              opacity: 0,
            }}
          >
            {/* Left nav — desktop only */}
            {!isMobile && (
              <div
                style={{
                  position: "absolute",
                  left: "5vw",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                {PLATFORM_SECTIONS.map((s, i) => (
                  <div
                    key={s.key}
                    ref={(el) => { navRefs.current[i] = el; }}
                    style={{
                      color: i === 0 ? "#6B5CE7" : "rgba(255,255,255,0.45)",
                      fontFamily: "var(--font-sf-pro)",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      letterSpacing: "0.12em",
                      marginBottom: "14px",
                      userSelect: "none",
                    }}
                  >
                    {s.key}
                  </div>
                ))}
              </div>
            )}

            {/* Content */}
            <div
              style={{
                position: "absolute",
                left: isMobile ? "6vw" : "20vw",
                right: isMobile ? "6vw" : "8vw",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              {PLATFORM_SECTIONS.map((s, i) => (
                <div
                  key={s.key}
                  ref={(el) => { contentRefs.current[i] = el; }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    opacity: i === 0 ? 1 : 0,
                    transform: `translateY(calc(-50% + ${i === 0 ? 0 : 22}px)) scale(${i === 0 ? 1 : 0.96})`,
                    willChange: "transform, opacity",
                  }}
                >
                  {isMobile && (
                    <p
                      style={{
                        margin: 0,
                        marginBottom: "0.75rem",
                        color: "#6B5CE7",
                        fontFamily: "var(--font-sf-pro)",
                        fontSize: "0.7rem",
                        fontWeight: 500,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}
                    >
                      {s.key}
                    </p>
                  )}
                  <h2
                    style={{
                      margin: 0,
                      marginBottom: "1.25rem",
                      color: "#ffffff",
                      fontFamily: "var(--font-sf-pro)",
                      fontSize: isMobile ? "clamp(2.5rem, 11vw, 3.5rem)" : "clamp(3.5rem, 7vw, 8rem)",
                      fontWeight: 700,
                      letterSpacing: "-0.04em",
                      lineHeight: 0.9,
                      whiteSpace: isMobile ? "normal" : "nowrap",
                    }}
                  >
                    {s.title}
                  </h2>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.75)",
                      fontFamily: "var(--font-sf-pro)",
                      fontSize: isMobile ? "0.95rem" : "clamp(1rem, 1.4vw, 1.2rem)",
                      lineHeight: 1.65,
                      maxWidth: isMobile ? "100%" : "560px",
                      margin: 0,
                    }}
                  >
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
