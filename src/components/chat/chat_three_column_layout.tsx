/**
 * Three-column layout: sidebar | chat | info panel
 * Mobile: sidebars become overlays
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ChatThreeColumnLayoutProps {
  sidebar_open: boolean;
  info_panel_open: boolean;
  sidebar: ReactNode;
  chat: ReactNode;
  info_panel: ReactNode;
  on_sidebar_close?: () => void;
  on_info_panel_close?: () => void;
}

export function ChatThreeColumnLayout({
  sidebar_open,
  info_panel_open,
  sidebar,
  chat,
  info_panel,
  on_sidebar_close,
  on_info_panel_close,
}: ChatThreeColumnLayoutProps) {
  // Close panels on mobile when opening
  useEffect(() => {
    const handle_resize = () => {
      if (window.innerWidth < 768) {
        // Mobile: close both panels
        if (sidebar_open && on_sidebar_close) on_sidebar_close();
        if (info_panel_open && on_info_panel_close) on_info_panel_close();
      }
    };
    
    window.addEventListener('resize', handle_resize);
    return () => window.removeEventListener('resize', handle_resize);
  }, [sidebar_open, info_panel_open, on_sidebar_close, on_info_panel_close]);

  return (
    <div className="flex flex-1 overflow-hidden relative">
      {/* Left sidebar: Desktop = column, Mobile = overlay */}
      <AnimatePresence initial={false}>
        {sidebar_open && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={on_sidebar_close}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              aria-hidden="true"
            />
            
            {/* Sidebar */}
            <motion.div
              key="sidebar"
              initial={{ x: -240, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -240, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="shrink-0 overflow-hidden fixed left-0 top-12 bottom-0 z-50 md:relative md:top-0 shadow-xl md:shadow-none"
              aria-hidden={!sidebar_open}
            >
              <div className="w-60 h-full relative">
                {/* Mobile close button */}
                <button
                  onClick={on_sidebar_close}
                  className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-[#2D5016]/10 hover:bg-[#2D5016]/20 md:hidden"
                  aria-label="Close sidebar"
                >
                  <X size={12} className="text-[#2D5016]" />
                </button>
                {sidebar}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Center: Chat window */}
      <div className="flex-1 min-w-0 overflow-hidden">{chat}</div>

      {/* Right panel: Desktop = column, Mobile = overlay */}
      <AnimatePresence initial={false}>
        {info_panel_open && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={on_info_panel_close}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              aria-hidden="true"
            />
            
            {/* Info panel */}
            <motion.div
              key="info_panel"
              initial={{ x: 256, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 256, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="shrink-0 overflow-hidden fixed right-0 top-12 bottom-0 z-50 md:relative md:top-0 shadow-xl md:shadow-none"
              aria-hidden={!info_panel_open}
            >
              <div className="w-64 h-full">{info_panel}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
