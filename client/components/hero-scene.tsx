
"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Atom,
  BookOpen,
  Calculator,
  GraduationCap,
  Lightbulb,
  Sparkles,
} from "lucide-react";

const floatTransition = {
  duration: 6,
  repeat: Infinity,
  ease: "easeInOut" as const,
};

export default function HeroScene() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-label="A cinematic three-dimensional learning scene"
      role="img"
      className="relative mx-auto aspect-square w-full max-w-[650px] overflow-hidden"
      style={{ perspective: "1100px" }}
    >
      {/* Atmospheric lighting */}
      <div className="pointer-events-none absolute inset-[12%] rounded-full bg-[#B6FF2E]/20 blur-[85px]" />
      <div className="pointer-events-none absolute left-[15%] top-[15%] h-40 w-40 rounded-full bg-white/80 blur-[65px]" />
      <div className="pointer-events-none absolute bottom-[10%] right-[5%] h-48 w-48 rounded-full bg-[#D8D5C8]/70 blur-[75px]" />

      {/* Background orbital rings */}
      <motion.div
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/2 top-1/2 h-[83%] w-[83%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[0.09]"
        style={{ transformStyle: "preserve-3d", rotateX: "67deg" }}
      />

      <motion.div
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/2 top-1/2 h-[68%] w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-black/15"
        style={{ transformStyle: "preserve-3d", rotateX: "70deg" }}
      />

      {/* Orbiting educational symbols */}
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -13, 0], rotate: [0, 7, 0] }}
        transition={{ ...floatTransition, delay: 0.4 }}
        className="absolute left-[12%] top-[23%] flex h-14 w-14 items-center justify-center border border-black/10 bg-white/80 text-[#292B20] shadow-[0_15px_40px_rgba(0,0,0,0.08)] backdrop-blur-md"
        style={{ borderRadius: "18px", transform: "rotate(-12deg)" }}
      >
        <Atom size={27} strokeWidth={1.5} />
      </motion.div>

      <motion.div
        animate={reduceMotion ? undefined : { y: [0, 12, 0], rotate: [0, -8, 0] }}
        transition={{ ...floatTransition, delay: 1 }}
        className="absolute right-[12%] top-[25%] flex h-16 w-16 items-center justify-center border border-black/10 bg-[#B6FF2E] text-[#171910] shadow-[0_15px_40px_rgba(0,0,0,0.10)]"
        style={{ borderRadius: "20px", transform: "rotate(10deg)" }}
      >
        <Calculator size={28} strokeWidth={1.5} />
      </motion.div>

      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -10, 0], rotate: [0, -6, 0] }}
        transition={{ ...floatTransition, delay: 1.6 }}
        className="absolute bottom-[19%] left-[12%] flex h-14 w-14 items-center justify-center border border-black/10 bg-white/85 text-[#292B20] shadow-[0_15px_40px_rgba(0,0,0,0.08)] backdrop-blur-md"
        style={{ borderRadius: "18px", transform: "rotate(9deg)" }}
      >
        <Lightbulb size={26} strokeWidth={1.5} />
      </motion.div>

      {/* Central dimensional sphere */}
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { y: [0, -10, 0], rotateY: [0, 12, 0], rotateZ: [0, 3, 0] }
        }
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-[43%] h-[48%] w-[48%] -translate-x-1/2 -translate-y-1/2"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="absolute inset-[9%] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 32% 25%, #F8FFE9 0%, #DFFF9B 15%, #B6FF2E 38%, #7DB51B 66%, #26380E 100%)",
            boxShadow:
              "inset -22px -24px 45px rgba(24,42,8,0.28), inset 12px 12px 30px rgba(255,255,255,0.65), 0 35px 80px rgba(92,126,35,0.25)",
          }}
        />

        <div
          className="absolute inset-[9%] rounded-full border border-white/40"
          style={{
            background:
              "linear-gradient(125deg, transparent 35%, rgba(255,255,255,0.36) 50%, transparent 64%)",
          }}
        />

        <motion.div
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-[8%] rounded-full border border-black/20"
          style={{ transform: "rotateX(72deg)" }}
        />

        <motion.div
          animate={reduceMotion ? undefined : { rotate: -360 }}
          transition={{ duration: 23, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-[17%] rounded-full border border-dashed border-black/15"
          style={{ transform: "rotateY(68deg) rotateX(20deg)" }}
        />
      </motion.div>

      {/* Three-dimensional open book */}
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -8, 0], rotateZ: [-4, -2, -4] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-[53%] w-[76%] -translate-x-1/2"
        style={{
          transform: "translateX(-50%) rotateX(57deg) rotateZ(-8deg)",
          transformStyle: "preserve-3d",
          filter: "drop-shadow(0 35px 22px rgba(20,25,10,0.18))",
        }}
      >
        <svg viewBox="0 0 560 300" className="h-auto w-full" fill="none">
          <path
            d="M42 76 Q145 35 277 87 L277 258 Q145 207 42 249 Z"
            fill="#D8D6CC"
            stroke="#8D8C80"
            strokeWidth="2"
          />
          <path
            d="M283 87 Q415 35 518 76 L518 249 Q415 207 283 258 Z"
            fill="#D8D6CC"
            stroke="#8D8C80"
            strokeWidth="2"
          />
          <path
            d="M42 63 Q145 22 277 74 L277 245 Q145 194 42 236 Z"
            fill="#FFFDF5"
            stroke="#B6B3A7"
            strokeWidth="2"
          />
          <path
            d="M283 74 Q415 22 518 63 L518 236 Q415 194 283 245 Z"
            fill="#F7F5EC"
            stroke="#B6B3A7"
            strokeWidth="2"
          />
          <path
            d="M277 74 Q280 68 283 74 L283 245 Q280 251 277 245 Z"
            fill="#B6FF2E"
          />
          <path
            d="M67 91 Q160 60 250 94 M67 112 Q160 81 250 115 M67 133 Q160 102 250 136 M67 154 Q160 123 250 157 M67 175 Q160 144 250 178"
            stroke="#C7C4B8"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M310 94 Q400 60 493 91 M310 115 Q400 81 493 112 M310 136 Q400 102 493 133 M310 157 Q400 123 493 154 M310 178 Q400 144 493 175"
            stroke="#C7C4B8"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M67 202 Q160 171 250 205 M310 205 Q400 171 493 202"
            stroke="#B6FF2E"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* Floating graduation cap */}
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { y: [0, -15, 0], rotate: [7, 1, 7], rotateZ: [7, 2, 7] }
        }
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[16%] top-[9%] z-20"
        style={{ transform: "rotate(-10deg)" }}
      >
        <svg viewBox="0 0 180 130" className="w-[125px] sm:w-[155px]">
          <path
            d="M12 42 L90 10 L168 42 L90 75 Z"
            fill="#20221A"
            stroke="#080907"
            strokeWidth="3"
          />
          <path
            d="M48 59 L48 91 Q90 120 132 91 L132 59 L90 77 Z"
            fill="#37392D"
          />
          <path
            d="M168 42 L168 89"
            stroke="#B6FF2E"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="168" cy="94" r="6" fill="#B6FF2E" />
          <path d="M25 42 L90 17 L151 42" stroke="#777A65" strokeWidth="2" />
        </svg>
      </motion.div>

      {/* Small light particles */}
      {[
        ["22%", "53%", "0s"],
        ["78%", "55%", "1.2s"],
        ["35%", "16%", "2.1s"],
        ["69%", "78%", "0.7s"],
        ["49%", "10%", "1.7s"],
        ["87%", "39%", "2.5s"],
      ].map(([left, top, delay], index) => (
        <motion.span
          key={index}
          animate={
            reduceMotion
              ? undefined
              : { opacity: [0.25, 1, 0.25], scale: [0.7, 1.3, 0.7], y: [0, -8, 0] }
          }
          transition={{
            duration: 3 + index * 0.35,
            delay: Number.parseFloat(delay),
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute h-2 w-2 rounded-full bg-[#9ACD36] shadow-[0_0_16px_rgba(182,255,46,0.8)]"
          style={{ left, top }}
        />
      ))}

      {/* Tiny floating brand detail */}
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -7, 0], rotate: [0, 5, 0] }}
        transition={{ ...floatTransition, delay: 0.8 }}
        className="absolute bottom-[13%] right-[15%] flex items-center gap-2 text-[#55554F]"
      >
        <Sparkles size={15} />
        <span className="font-brand text-[9px] font-bold uppercase tracking-[0.2em]">
          Learn beyond limits
        </span>
      </motion.div>

      <div className="pointer-events-none absolute bottom-[4%] left-1/2 h-5 w-[58%] -translate-x-1/2 rounded-full bg-black/10 blur-xl" />
    </div>
  );
}
