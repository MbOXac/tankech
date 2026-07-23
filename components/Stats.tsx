"use client";

import { useEffect, useState, useRef } from "react";
import ScrollReveal from "./ScrollReveal";

const stats = [
  { value: 150, suffix: "+", label: "Projets Réalisés" },
  { value: 10, suffix: "+", label: "Ans d'Expérience" },
  { value: 98, suffix: "%", label: "Clients Satisfaits" },
  { value: 24, suffix: "/7", label: "Disponibilité Urgence" },
];

function AnimatedNumber({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const step = target / (duration / 16);
          let current = 0;

          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            setCount(Math.floor(current));
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="py-16 md:py-20 bg-yellow-500">
      <div className="mx-auto max-w-7xl px-4">
        <ScrollReveal>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-4xl md:text-6xl font-black text-gray-900">
                  <AnimatedNumber target={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-sm md:text-base font-medium text-gray-800">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
