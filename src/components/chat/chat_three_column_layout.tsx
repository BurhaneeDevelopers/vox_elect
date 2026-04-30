/**
 * Three-column layout: sidebar | chat | info panel
 */

'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatThreeColumnLayoutProps {
  sidebar_open: boolean;
  info_panel_open: boolean;
  sidebar: ReactNode;
  chat: ReactNode;
  info_panel: ReactNode;
}

export function ChatThreeColumnLayout({
  sidebar_open,
  info_panel_open,
  sidebar,
  chat,
  info_panel,
}: ChatThreeColumnLayoutProps) {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left sidebar: Election Calendar */}
      <AnimatePresence initial={false}>
        {sidebar_open && (
          <motion.div
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="shrink-0 overflow-hidden"
            aria-hidden={!sidebar_open}
          >
            <div className="w-60 h-full">{sidebar}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center: Chat window */}
      <div className="flex-1 min-w-0 overflow-hidden">{chat}</div>

      {/* Right panel: Info / Sources / Polling */}
      <AnimatePresence initial={false}>
        {info_panel_open && (
          <motion.div
            key="info_panel"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="shrink-0 overflow-hidden"
            aria-hidden={!info_panel_open}
          >
            <div className="w-64 h-full">{info_panel}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
