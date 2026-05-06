import React from 'react';
import { cn } from '../lib/utils';
import { ASSETS } from '../constants';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export default function Logo({ className, size = 'md', showText = false }: LogoProps) {
  const [logoUrl, setLogoUrl] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pinwei_logo_url') || ASSETS.LOGO;
    }
    return ASSETS.LOGO;
  });

  React.useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('pinwei_logo_url');
      if (saved) setLogoUrl(saved);
    };

    window.addEventListener('logo_updated', handleUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === 'pinwei_logo_url') handleUpdate();
    });

    return () => {
      window.removeEventListener('logo_updated', handleUpdate);
    };
  }, []);

  const sizeClasses = {
    sm: 'h-10',
    md: 'h-14',
    lg: 'h-20',
    xl: 'h-36'
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img 
        src={logoUrl} 
        alt="品味 Logo" 
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
        品味
      </span>
    </div>
  );
}
