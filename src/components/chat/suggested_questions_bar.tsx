'use client';

/**
 * Renders Elara's suggested follow-up question chips below a response.
 */

import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

interface suggested_questions_bar_props {
  questions: string[];
  on_select: (question: string) => void;
}

export function suggested_questions_bar({ questions, on_select }: suggested_questions_bar_props) {
  if (questions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.25 }}
      className="flex flex-wrap gap-2 mt-1"
      role="group"
      aria-label="Suggested follow-up questions"
    >
      {questions.map((q, i) => (
        <button
          key={i}
          onClick={() => on_select(q)}
          className="
            flex items-center gap-1.5 text-xs px-3 py-1.5
            bg-[#F5F0E8] hover:bg-[#EDE7D6]
            border border-[#2D5016]/20 hover:border-[#2D5016]/40
            text-[#2D5016] rounded-full
            transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]
            cursor-pointer
          "
          aria-label={`Ask: ${q}`}
        >
          <HelpCircle size={11} aria-hidden="true" />
          <span>{q}</span>
        </button>
      ))}
    </motion.div>
  );
}
