"use client";

import { useState } from "react";
import { testimonialsData } from "@/data/testimonialsData";
import ScrollReveal from "./ScrollReveal";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const t = testimonialsData[index];

  const prev = () =>
    setIndex((i) => (i === 0 ? testimonialsData.length - 1 : i - 1));
  const next = () =>
    setIndex((i) => (i === testimonialsData.length - 1 ? 0 : i + 1));

  return (
    <section className="py-20 md:py-28 bg-gray-900 text-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="inline-block rounded-full bg-yellow-500/10 px-4 py-1.5 text-sm font-semibold text-yellow-400 mb-4">
              Témoignages
            </span>
            <h2 className="text-3xl md:text-5xl font-black">
              Ce que disent <span className="text-yellow-400">nos clients</span>
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="relative mx-auto max-w-3xl">
            {/* Quote card */}
            <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-8 md:p-12">
              {/* Quote icon */}
              <Quote className="h-10 w-10 text-yellow-500/40 mb-6" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < t.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-lg md:text-xl leading-relaxed text-white/90 mb-6">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{t.name}</p>
                  <p className="text-sm text-white/50">
                    {t.role} — {t.location}
                  </p>
                  <p className="text-xs text-yellow-400 font-medium mt-1">
                    {t.service}
                  </p>
                </div>

                {/* Nav arrows */}
                <div className="flex gap-2">
                  <button
                    onClick={prev}
                    className="rounded-lg border border-white/10 p-2 text-white/50 hover:bg-white/10 hover:text-white transition"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={next}
                    className="rounded-lg border border-white/10 p-2 text-white/50 hover:bg-white/10 hover:text-white transition"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Dots */}
              <div className="mt-6 flex justify-center gap-2">
                {testimonialsData.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === index
                        ? "w-8 bg-yellow-400"
                        : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
