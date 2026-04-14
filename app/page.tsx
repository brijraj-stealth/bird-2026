"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import heroBase from "@/public/home/hero/arc.png";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const logoRef      = useRef<SVGSVGElement>(null);
  const line1        = useRef<HTMLSpanElement>(null);
  const line2        = useRef<HTMLSpanElement>(null);
  const subtextRef   = useRef<HTMLParagraphElement>(null);
  const baseImgRef   = useRef<HTMLDivElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoRef     = useRef<HTMLVideoElement>(null);
  const heroWrapRef  = useRef<HTMLDivElement>(null);
  // targetTime is written by ScrollTrigger onUpdate; lerp'd by the RAF loop
  const targetTime   = useRef(0);

  const GRADIENT_BG = "linear-gradient(180deg, #EAE1FF 0%, #ffffff 50%, #ffffff 100%)";

  useLayoutEffect(() => {
    gsap.set(logoRef.current,      { opacity: 0, y: 28 });
    gsap.set(line1.current,        { y: "105%" });
    gsap.set(line2.current,        { y: "105%" });
    gsap.set(subtextRef.current,   { opacity: 0, y: 22 });
    gsap.set(baseImgRef.current,   { opacity: 0 });
    gsap.set(videoWrapRef.current, { opacity: 0 });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.pause();

    const reveal = () => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl
        .to(logoRef.current,      { opacity: 1, y: 0, duration: 0.85 },               0)
        .to(line1.current,        { y: "0%", duration: 1.0 },                          0.04)
        .to(line2.current,        { y: "0%", duration: 1.0 },                          0.18)
        .to(subtextRef.current,   { opacity: 1, y: 0, duration: 0.8 },                0.38)
        .to(baseImgRef.current,   { opacity: 1, duration: 1.1, ease: "power3.out" },  0.05)
        .to(videoWrapRef.current, { opacity: 1, duration: 0.95, ease: "power4.out" }, 0.28);
    };

    document.addEventListener("bird:reveal", reveal, { once: true });
    return () => document.removeEventListener("bird:reveal", reveal);
  }, []);

  // ScrollTrigger scrub + RAF lerp for video seeking.
  // We don't use ScrollTrigger's pin because the sticky CSS already handles it.
  useEffect(() => {
    const video = videoRef.current;
    const wrap  = heroWrapRef.current;
    if (!video || !wrap) return;

    video.pause();

    // RAF lerp loop: decouples seeks from scroll events, bridges decode latency
    let currentTime = 0;
    let rafId: number;

    const tick = () => {
      currentTime += (targetTime.current - currentTime) * 0.1;
      if (Math.abs(currentTime - video.currentTime) > 0.01) {
        video.currentTime = currentTime;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // ScrollTrigger tracks the outer 300vh wrapper.
    // start/end: top→bottom of wrapper against viewport top = 200vh of scroll.
    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        // Video time: map full scroll range to full video duration
        if (video.duration) {
          targetTime.current = self.progress * video.duration;
        }

        const isDesktop = window.innerWidth >= 768;

        // Desktop only: slide video up from 50vh → 0 at 60%+ scroll
        if (isDesktop && videoWrapRef.current) {
          if (self.progress >= 0.6) {
            const moveProgress = (self.progress - 0.6) / 0.4;
            videoWrapRef.current.style.translate = `0 ${50 * (1 - moveProgress)}vh`;
          } else {
            videoWrapRef.current.style.translate = ""; // let Tailwind class take over
          }
        }

      },
    });

    return () => {
      cancelAnimationFrame(rafId);
      trigger.kill();
    };
  }, []);

  return (
    <main>  
      <div ref={heroWrapRef} style={{ height: "300vh" }}>
      <section
        style={{
          background: GRADIENT_BG,
          fontFamily: "var(--font-sf-pro)",
          height: "100vh",
          position: "sticky",
          top: 0,
          overflow: "hidden",
        }}
        className="flex flex-col items-center justify-top pt-24 pb-8 md:py-30"
      >
        <div className="flex flex-col items-center text-center px-4 md:px-0">
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

        {/* Hero image stack */}
        <div style={{ position: "absolute", bottom: 0, width: "100%", mixBlendMode: "darken" }}>
          {/* Base arc image */}
          <div ref={baseImgRef} className="max-md:translate-y-0 md:translate-y-[70vh]" style={{ zIndex: 3 }}>
            <Image
              src={heroBase}
              alt=""
              sizes="100vw"
              style={{ width: "100%", height: "auto", objectFit: "contain" }}
              placeholder="blur"
              priority
            />
          </div>

          {/* Scroll-scrubbed video */}
          <div
            ref={videoWrapRef}
            className="max-md:scale-[2] md:translate-y-[50vh]"
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
            />
          </div>
        </div>
      </section>
    </div>
    </main>
  
  );
}
