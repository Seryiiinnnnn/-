import React from 'react';
import { cn } from '../lib/utils';
import logoImg from '../taowei-logo.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export default function Logo({ className, size = 'md', showText = false }: LogoProps) {
  const sizeClasses = {
    sm: 'h-10',
    md: 'h-14',
    lg: 'h-20',
    xl: 'h-36'
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img 
        src={logoImg} 
        alt="淘味 Logo" 
        className={cn("object-contain", sizeClasses[size])}
        onError={(e) => {
          // Fallback if image fails to load
          e.currentTarget.style.display = 'none';
          const sibling = e.currentTarget.parentElement?.querySelector('.logo-text');
          if (sibling) (sibling as HTMLElement).style.display = 'block';
        }}
        referrerPolicy="no-referrer"
      />
      <span className={cn(
        "logo-text italic font-black tracking-tighter uppercase text-[#FF6B00]",
        !showText && "hidden",
        size === 'xl' ? "text-8xl" : size === 'lg' ? "text-4xl" : "text-xl"
      )}>
        淘味
      </span>
    </div>
  );
}
