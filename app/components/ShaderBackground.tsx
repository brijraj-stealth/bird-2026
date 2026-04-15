"use client";
import { useEffect, useRef } from "react";

// Full-screen quad vertex shader
const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

// Domain-warped FBM fragment shader — inverted Stitch aurora
// Light/white base with flowing lavender → purple → periwinkle bands
const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2 u_res;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i),              hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8660, 0.5, -0.5, 0.8660); // 30-degree rotation per octave
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p = rot * p * 2.1 + vec2(3.7, 1.5);
    a *= 0.48;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  uv.y = 1.0 - uv.y; // flip Y so top is 0

  float t = u_time * 0.10;

  // Three levels of domain warping for organic flow
  vec2 p = uv * 3.2;

  vec2 q = vec2(
    fbm(p + t * vec2( 0.11,  0.06)),
    fbm(p + vec2(5.2, 1.3) + t * vec2(-0.06,  0.09))
  );

  vec2 r = vec2(
    fbm(p + 3.2 * q + vec2(1.7, 9.2) + t * 0.07),
    fbm(p + 3.2 * q + vec2(8.3, 2.8) + t * 0.05)
  );

  float f = fbm(p + 4.2 * r + t * 0.04);

  // ── Palette (inverted Stitch) ──────────────────────────────────────────────
  // Stitch: vivid aurora on black. Inverted: soft aurora washes on white.
  vec3 white     = vec3(1.00, 1.00, 1.00);
  vec3 lavender  = vec3(0.88, 0.83, 0.99); // lightest tint
  vec3 periwinkle= vec3(0.65, 0.72, 0.97); // cool blue-purple
  vec3 violet    = vec3(0.70, 0.55, 0.95); // deeper purple
  vec3 blush     = vec3(0.90, 0.72, 0.98); // warm pink-mauve
  vec3 teal      = vec3(0.62, 0.86, 0.93); // cool accent

  // Layer colors with the noise field
  vec3 col = mix(lavender, periwinkle, clamp(f * f * 3.0, 0.0, 1.0));
  col = mix(col, violet,   clamp(f * f * f * 2.8, 0.0, 1.0));
  col = mix(col, teal,     clamp(length(r) * 0.55, 0.0, 1.0));
  col = mix(col, blush,    clamp(length(q) * 0.50, 0.0, 1.0));

  // Blend toward white for the "inverted" wash — never fully saturated
  float saturation = 0.38 + f * 0.38;
  col = mix(white, col, saturation);

  // Soft vignette: edges fade toward white
  vec2 vUv = uv * 2.0 - 1.0;
  float vig = 1.0 - dot(vUv * vec2(0.55, 0.70), vUv * vec2(0.55, 0.70));
  col = mix(white, col, clamp(vig * 1.3, 0.0, 1.0));

  // Bottom quarter fades cleanly to white (hero transitions below)
  float bottomFade = smoothstep(0.0, 0.28, uv.y);
  col = mix(white, col, bottomFade);

  gl_FragColor = vec4(col, 1.0);
}
`;

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;

    // Compile + link
    const mkShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(s));
      }
      return s;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // Full-screen quad (two triangles as TRIANGLE_STRIP)
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes  = gl.getUniformLocation(prog, "u_res");

    let raf: number;
    const t0 = performance.now();

    const resize = () => {
      // Cap DPR at 2 — higher gives no visible benefit for a blur-heavy shader
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const frame = () => {
      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        zIndex: 0,
      }}
    />
  );
}
