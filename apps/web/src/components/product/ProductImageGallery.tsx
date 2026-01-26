"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getOptimizedImageUrl } from "@/utils/image";

export default function ProductImageGallery({ images, title, productId }: { images: string[]; title: string; productId?: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const list = useMemo(() => (Array.isArray(images) && images.length > 0 ? images : []), [images]);
  const main = list[active] || list[0];
  const mainSrc = useMemo(() => {
    if (!main) return `https://placehold.co/800x800?text=${encodeURIComponent(title)}`;
    return getOptimizedImageUrl(main, { width: 800, quality: 85 });
  }, [main, title]);

  const move = (dir: -1 | 1) => {
    if (!list.length) return;
    setActive((i) => (i + dir + list.length) % list.length);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowLeft') move(-1);
      if (e.key === 'ArrowRight') move(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, list.length]);

  const addToCart = () => {
    try {
      if (!productId) return;
      const raw = localStorage.getItem('cart');
      const cart: string[] = raw ? JSON.parse(raw) : [];
      cart.push(productId);
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('cart:update', { detail: { count: cart.length } }));
    } catch { }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[72px_1fr] gap-3">
        {/* vertical thumbs (desktop) */}
        <div className="hidden md:flex md:flex-col gap-2 overflow-auto max-h-[520px] pr-1">
          {(list.length ? list : [undefined as unknown as string]).slice(0, 8).map((img, idx) => {
            const thumbSrc = img ? getOptimizedImageUrl(img, { width: 150, quality: 70 }) : `https://placehold.co/300x300?text=${encodeURIComponent(title)}`;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={idx}
                src={thumbSrc}
                alt="thumb"
                onError={(e) => {
                  if (img && e.currentTarget.src !== img) {
                    e.currentTarget.src = img;
                  }
                }}
                className={`h-20 w-full object-cover rounded-md bg-neutral-100 dark:bg-neutral-900 cursor-pointer hover:opacity-90 ${active === idx ? 'ring-2 ring-blue-500' : ''}`}
                onMouseEnter={() => setActive(idx)}
                onClick={() => setActive(idx)}
              />
            );
          })}
        </div>
        {/* main image */}
        <div className="aspect-square rounded-lg bg-neutral-100 dark:bg-neutral-900 overflow-hidden cursor-zoom-in" onClick={() => setOpen(true)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mainSrc} alt={title} className="w-full h-full object-cover transition-opacity" onError={(e) => {
            if (main && e.currentTarget.src !== main) {
              e.currentTarget.src = main;
            }
          }} />
        </div>
        {/* horizontal thumbs (mobile) */}
        <div className="md:hidden flex justify-center gap-2 -mt-1">
          {list.slice(0, 8).map((img, idx) => {
            const thumbSrc = getOptimizedImageUrl(img, { width: 120, quality: 70 });
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={idx}
                src={thumbSrc || `https://placehold.co/200x200?text=${encodeURIComponent(title)}`}
                alt="thumb"
                onError={(e) => {
                  if (img && e.currentTarget.src !== img) {
                    e.currentTarget.src = img;
                  }
                }}
                className={`h-14 w-14 object-cover rounded-md bg-neutral-100 dark:bg-neutral-900 ${active === idx ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setActive(idx)}
              />
            );
          })}
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-[1px]" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-screen h-screen md:w-[96vw] md:h-[92vh] md:max-w-[1100px] md:max-h-[760px] bg-white dark:bg-neutral-950 md:rounded-2xl p-3 md:p-6 flex flex-col md:flex-row gap-3 md:gap-4">
            <button aria-label="Close" onClick={() => setOpen(false)} className="absolute z-10 right-3 top-3 md:right-4 md:top-4 rounded-full bg-white/90 p-3 md:p-2 text-black shadow hover:bg-white">
              <X size={18} />
            </button>
            {/* thumbs (desktop) */}
            <div className="hidden md:flex md:flex-col gap-2 overflow-auto max-h-full pr-1 w-[88px]">
              {(list.length ? list : [undefined as unknown as string]).slice(0, 12).map((img, idx) => {
                const thumbSrc = img ? getOptimizedImageUrl(img, { width: 150, quality: 70 }) : `https://placehold.co/300x300?text=${encodeURIComponent(title)}`;
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={idx}
                    src={thumbSrc}
                    alt="thumb"
                    onError={(e) => {
                      if (img && e.currentTarget.src !== img) {
                        e.currentTarget.src = img;
                      }
                    }}
                    className={`h-20 w-full object-cover rounded-md bg-neutral-100 dark:bg-neutral-900 cursor-pointer hover:opacity-90 ${active === idx ? 'ring-2 ring-blue-500' : ''}`}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => setActive(idx)}
                  />
                );
              })}
            </div>
            {/* main */}
            <div className="relative flex-1 flex items-center justify-center">
              <button aria-label="Prev" onClick={() => move(-1)} className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 md:p-2 text-black shadow hover:bg-white"><ChevronLeft size={22} /></button>
              <div className="h-full w-full flex items-center justify-center"
                onTouchStart={(e) => (e.currentTarget as any)._sx = e.touches[0].clientX}
                onTouchEnd={(e) => { const sx = (e.currentTarget as any)._sx || 0; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) move(dx > 0 ? -1 : 1); }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mainSrc} alt={title} className="max-h-full max-w-full object-contain" onError={(e) => {
                  if (main && e.currentTarget.src !== main) {
                    e.currentTarget.src = main;
                  }
                }} />
              </div>
              <button aria-label="Next" onClick={() => move(1)} className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 md:p-2 text-black shadow hover:bg-white"><ChevronRight size={22} /></button>
            </div>
            {/* thumbs (mobile horizontal) */}
            <div className="md:hidden flex justify-center gap-2 overflow-x-auto pt-1 -mb-1">
              {list.slice(0, 12).map((img, idx) => {
                const thumbSrc = getOptimizedImageUrl(img, { width: 120, quality: 70 });
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={idx}
                    src={thumbSrc || `https://placehold.co/200x200?text=${encodeURIComponent(title)}`}
                    alt="thumb"
                    onError={(e) => {
                      if (img && e.currentTarget.src !== img) {
                        e.currentTarget.src = img;
                      }
                    }}
                    className={`h-16 w-16 object-cover rounded-md bg-neutral-100 dark:bg-neutral-900 flex-shrink-0 ${active === idx ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setActive(idx)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

