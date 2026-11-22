
"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function AuthBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-0 overflow-hidden bg-[#EAECE5]"
    >
      {/* Base atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_20%,rgba(182,255,46,0.28),transparent_38%),radial-gradient(ellipse_at_85%_75%,rgba(94,128,77,0.15),transparent_40%),linear-gradient(135deg,#F5F5EF_0%,#E9ECE4_48%,#F2F0E9_100%)]" />

      {/* Soft grid */}
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(11,11,12,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(11,11,12,.12) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
          maskImage:
            "radial-gradient(ellipse at center, black, transparent 78%)",
        }}
      />

      {/* Large ambient glow */}
      <div className="absolute -left-40 top-[12%] h-[430px] w-[430px] rounded-full bg-[#B6FF2E]/25 blur-[100px]" />
      <div className="absolute -bottom-48 -right-32 h-[520px] w-[520px] rounded-full bg-[#78966A]/20 blur-[110px]" />

      {/* 3D orbital rings */}
      <motion.div
        className="absolute -right-[14%] top-[5%] h-[580px] w-[580px] rounded-full border border-[#71815D]/20"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{
          duration: 55,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          transform: "rotateX(64deg) rotateZ(-20deg)",
          boxShadow: "0 0 80px rgba(182,255,46,0.08)",
        }}
      />

      <motion.div
        className="absolute -right-[8%] top-[11%] h-[440px] w-[440px] rounded-full border border-dashed border-[#71815D]/25"
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={{
          duration: 42,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          transform: "rotateX(68deg) rotateZ(25deg)",
        }}
      />

      {/* Floating glass object */}
      <motion.div
        className="absolute right-[13%] top-[19%] hidden h-28 w-28 rounded-[30px] border border-white/70 bg-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_25px_65px_rgba(40,55,30,.12)] backdrop-blur-md lg:block"
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -17, 0],
                rotateX: [12, 22, 12],
                rotateY: [-18, 8, -18],
                rotateZ: [-8, 3, -8],
              }
        }
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-4 rounded-[22px] border border-[#B6FF2E]/50 bg-gradient-to-br from-[#DFFF9A]/60 to-white/10" />
        <div className="absolute right-5 top-5 h-3 w-3 rounded-full bg-[#B6FF2E] shadow-[0_0_20px_rgba(182,255,46,.8)]" />
      </motion.div>

      {/* Floating lime orb */}
      <motion.div
        className="absolute bottom-[18%] left-[8%] hidden h-20 w-20 rounded-full border border-white/70 bg-gradient-to-br from-[#E7FFB7] via-[#B6FF2E] to-[#8EBB36] shadow-[inset_-10px_-12px_25px_rgba(60,90,15,.18),0_25px_55px_rgba(80,110,35,.18)] lg:block"
        animate={reduceMotion ? undefined : { y: [0, -14, 0], scale: [1, 1.06, 1] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Small light points */}
      <motion.span
        className="absolute left-[24%] top-[18%] h-2 w-2 rounded-full bg-[#91BD34] shadow-[0_0_18px_rgba(145,189,52,.7)]"
        animate={reduceMotion ? undefined : { opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <motion.span
        className="absolute bottom-[27%] right-[25%] h-3 w-3 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,.9)]"
        animate={reduceMotion ? undefined : { opacity: [0.4, 1, 0.4], y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Fine highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
    </div>
  );
}
