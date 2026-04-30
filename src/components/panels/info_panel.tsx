'use client';

/**
 * Right collapsible panel — source citations, polling locations, civic data cards.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  MapPin,
  ExternalLink,
  Info,
  Users,
  X,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { use_voter_info } from '@/hooks/use_election_data';
import { use_chat_store } from '@/stores/chat_store';
import { cn } from '@/lib/utils';

interface info_tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const CIVIC_SOURCES = [
  {
    title: 'Google Civic Information API',
    description: 'Polling locations, voter registration, elected officials',
    url: 'https://developers.google.com/civic-information',
    domain: 'Google',
  },
  {
    title: 'Vote.gov',
    description: 'Official US government voter registration guide',
    url: 'https://vote.gov',
    domain: 'USA.gov',
  },
  {
    title: 'Ballotpedia',
    description: 'Candidate bios, ballot measures, election data',
    url: 'https://ballotpedia.org',
    domain: 'Ballotpedia',
  },
  {
    title: 'OpenStates',
    description: 'State legislature and bill tracking',
    url: 'https://openstates.org',
    domain: 'OpenStates',
  },
  {
    title: 'Federal Election Commission',
    description: 'Campaign finance data',
    url: 'https://www.fec.gov',
    domain: 'FEC',
  },
];

function SourceCard({
  source,
}: {
  source: (typeof CIVIC_SOURCES)[number];
}) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-2.5 p-2.5 rounded-xl border border-[#E7E0D0] hover:border-[#2D5016]/30 hover:bg-[#F5F0E8] transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
      aria-label={`${source.title} — ${source.description} (opens in new tab)`}
    >
      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#2D5016]/10 flex items-center justify-center mt-0.5">
        <BookOpen size={12} className="text-[#2D5016]" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#1C1917] leading-tight">{source.title}</p>
        <p className="text-[10px] text-[#57534e] leading-snug mt-0.5">{source.description}</p>
        <span className="text-[10px] text-[#C9A84C] font-medium">{source.domain}</span>
      </div>
      <ExternalLink
        size={11}
        className="text-[#a8a29e] group-hover:text-[#2D5016] transition-colors flex-shrink-0 mt-0.5"
        aria-hidden="true"
      />
    </a>
  );
}

function PollingLocationsTab({ zip }: { zip: string | null }) {
  const { data: voter_info, isLoading, isError, error } = use_voter_info(zip);

  if (!zip) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center px-4">
        <div className="w-12 h-12 rounded-full bg-[#F5F0E8] flex items-center justify-center">
          <MapPin size={20} className="text-[#C9A84C]" aria-hidden="true" />
        </div>
        <p className="text-sm text-[#57534e]">
          Share your ZIP code in the chat and I'll show your local polling locations.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8" aria-live="polite" aria-label="Loading polling locations">
        <Loader2 size={20} className="animate-spin text-[#2D5016]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-6 px-3" role="alert">
        <p className="text-xs text-[#57534e]">
          {error?.message ?? 'Could not find polling data for this ZIP.'}{' '}
          <a
            href="https://vote.gov/polling-place-locator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2D5016] underline"
            aria-label="Try the official polling place locator (opens in new tab)"
          >
            Try official locator
          </a>
        </p>
      </div>
    );
  }

  const locations = voter_info?.polling_locations ?? [];
  const early_sites = voter_info?.early_vote_sites ?? [];
  const election = voter_info?.election;

  return (
    <div className="flex flex-col gap-3">
      {election && (
        <div className="rounded-xl bg-[#2D5016]/5 border border-[#2D5016]/10 px-3 py-2.5">
          <p className="text-xs font-semibold text-[#2D5016]">{election.name}</p>
          <p className="text-[10px] text-[#57534e] mt-0.5">Election day: {election.election_day}</p>
        </div>
      )}

      {locations.length === 0 && early_sites.length === 0 ? (
        <p className="text-xs text-[#57534e] text-center py-3">
          No polling locations found for ZIP {zip}.
        </p>
      ) : (
        <>
          {locations.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#57534e] font-medium mb-1.5 px-0.5">
                Election Day Polling
              </p>
              {locations.slice(0, 3).map((loc, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 py-2 border-b border-[#E7E0D0] last:border-0"
                >
                  <MapPin size={12} className="text-[#C9A84C] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    {loc.address.location_name && (
                      <p className="text-xs font-medium text-[#1C1917]">{loc.address.location_name}</p>
                    )}
                    <p className="text-[10px] text-[#57534e]">
                      {loc.address.line1}, {loc.address.city}, {loc.address.state}
                    </p>
                    {loc.hours && (
                      <p className="text-[10px] text-[#57534e] mt-0.5">{loc.hours}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {early_sites.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#57534e] font-medium mb-1.5 px-0.5">
                Early Voting
              </p>
              {early_sites.slice(0, 2).map((site, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 py-2 border-b border-[#E7E0D0] last:border-0"
                >
                  <MapPin size={12} className="text-[#2D5016] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    {site.address.location_name && (
                      <p className="text-xs font-medium text-[#1C1917]">{site.address.location_name}</p>
                    )}
                    <p className="text-[10px] text-[#57534e]">
                      {site.address.line1}, {site.address.city}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AboutEloraTab() {
  return (
    <div className="flex flex-col gap-3">
      {/* About */}
      <div className="rounded-xl bg-[#2D5016]/5 border border-[#2D5016]/10 p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#2D5016] flex items-center justify-center">
            <span className="font-serif text-white font-bold text-sm">E</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#2D5016]">Elora</p>
            <p className="text-[10px] text-[#57534e]">Civic Education Guide</p>
          </div>
        </div>
        <p className="text-xs text-[#57534e] leading-relaxed">
          Elora is a neutral AI guide powered by Taheri Developers. She explains elections,
          voting processes, and civic topics without ever endorsing candidates or taking political
          positions.
        </p>
      </div>

      {/* Capabilities */}
      {[
        { icon: '🗳️', label: 'Voter Registration', desc: 'Step-by-step registration guidance' },
        { icon: '📍', label: 'Polling Locations', desc: 'Find where to vote by ZIP code' },
        { icon: '📊', label: 'Candidate Info', desc: 'Factual, non-partisan comparisons' },
        { icon: '⏰', label: 'Deadlines', desc: 'State-specific election timelines' },
        { icon: '🎙️', label: 'Voice Input', desc: 'Speak your questions naturally' },
      ].map(({ icon, label, desc }) => (
        <div key={label} className="flex items-center gap-2.5">
          <span className="text-base w-6 text-center" aria-hidden="true">{icon}</span>
          <div>
            <p className="text-xs font-medium text-[#1C1917]">{label}</p>
            <p className="text-[10px] text-[#57534e]">{desc}</p>
          </div>
        </div>
      ))}

      {/* Powered by */}
      <div className="rounded-xl border border-[#E7E0D0] p-2.5 mt-1">
        <p className="text-[10px] text-[#57534e] font-medium uppercase tracking-wide mb-1.5">
          Powered by 
        </p>
        {[
          'Taheri Developers',
          'Gemini 3.1 Lite (AI)',
          'Civic Information API (voter data)',
        ].map((item) => (
          <div key={item} className="flex items-center gap-1.5 py-0.5">
            <ChevronRight size={10} className="text-[#C9A84C]" aria-hidden="true" />
            <span className="text-xs text-[#57534e]">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface info_panel_props {
  on_close: () => void;
}

export function info_panel({ on_close }: info_panel_props) {
  const [active_tab, set_active_tab] = useState<string>('sources');
  const { active_zip } = use_chat_store();

  const tabs: info_tab[] = [
    { id: 'sources', label: 'Sources', icon: <BookOpen size={13} /> },
    { id: 'polling', label: 'Polling', icon: <MapPin size={13} /> },
    { id: 'about', label: 'About', icon: <Info size={13} /> },
  ];

  return (
    <aside
      className="h-full flex flex-col bg-[#FDFAF4] border-l border-[#E7E0D0]"
      aria-label="Information panel"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-[#E7E0D0]">
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-[#2D5016]" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-[#2D5016]">Info Panel</h2>
        </div>
        <button
          onClick={on_close}
          aria-label="Close info panel"
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#E7E0D0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
        >
          <X size={13} className="text-[#57534e]" aria-hidden="true" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E7E0D0]" role="tablist" aria-label="Information tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active_tab === tab.id}
            aria-controls={`tab_panel_${tab.id}`}
            onClick={() => set_active_tab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#C9A84C]',
              active_tab === tab.id
                ? 'text-[#2D5016] border-b-2 border-[#2D5016] -mb-px'
                : 'text-[#57534e] hover:text-[#1C1917]'
            )}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        id={`tab_panel_${active_tab}`}
        role="tabpanel"
        aria-label={tabs.find((t) => t.id === active_tab)?.label}
        className="flex-1 overflow-y-auto p-3"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active_tab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
          >
            {active_tab === 'sources' && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-[#57534e] leading-relaxed mb-1">
                  Elora cites official and authoritative sources for all election data:
                </p>
                {CIVIC_SOURCES.map((src) => (
                  <SourceCard key={src.title} source={src} />
                ))}
              </div>
            )}

            {active_tab === 'polling' && (
              <PollingLocationsTab zip={active_zip} />
            )}

            {active_tab === 'about' && <AboutEloraTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  );
}
