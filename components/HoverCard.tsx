'use client';
import type { MouseEvent, ReactNode } from 'react';

export default function HoverCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  function move(event: MouseEvent<HTMLDivElement>) {
    const r = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mx', `${((event.clientX-r.left)/r.width)*100}%`);
    event.currentTarget.style.setProperty('--my', `${((event.clientY-r.top)/r.height)*100}%`);
  }
  return <div className={`card ${className}`} onMouseMove={move}>{children}</div>;
}
