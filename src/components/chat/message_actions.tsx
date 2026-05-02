'use client';

/**
 * Message action buttons (edit, rerun, copy) shown on hover
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, RotateCcw, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface message_actions_props {
  message_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  on_edit?: () => void;
  on_rerun?: (message_id: string) => void;
  on_copy?: (content: string) => void;
}

export function message_actions({
  message_id,
  role,
  content,
  on_edit,
  on_rerun,
  on_copy,
}: message_actions_props) {
  const [copied, set_copied] = useState(false);

  const handle_copy = async () => {
    if (on_copy) {
      on_copy(content);
    } else {
      await navigator.clipboard.writeText(content);
    }
    set_copied(true);
    setTimeout(() => set_copied(false), 2000);
  };

  const handle_edit = () => {
    on_edit?.();
  };

  const handle_rerun = () => {
    on_rerun?.(message_id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-[#E7E0D0] shadow-md',
        role === 'user' ? 'flex-row-reverse' : 'flex-row'
      )}
      role="toolbar"
      aria-label="Message actions"
    >
      {/* Copy button */}
      <button
        onClick={handle_copy}
        className="p-1.5 rounded hover:bg-[#F5F0E8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
        aria-label="Copy message"
        title="Copy"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check size={14} className="text-green-600" />
            </motion.div>
          ) : (
            <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Copy size={14} className="text-[#57534e]" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Edit button (user messages only) */}
      {role === 'user' && on_edit && (
        <button
          onClick={handle_edit}
          className="p-1.5 rounded hover:bg-[#F5F0E8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
          aria-label="Edit message"
          title="Edit"
        >
          <Edit2 size={14} className="text-[#57534e]" />
        </button>
      )}

      {/* Rerun button (user messages only) */}
      {role === 'user' && on_rerun && (
        <button
          onClick={handle_rerun}
          className="p-1.5 rounded hover:bg-[#F5F0E8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
          aria-label="Rerun from here"
          title="Rerun"
        >
          <RotateCcw size={14} className="text-[#57534e]" />
        </button>
      )}
    </motion.div>
  );
}
