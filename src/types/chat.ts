export type message_role = "user" | "assistant" | "system";

export interface chat_message {
  id: string;
  role: message_role;
  content: string;
  timestamp: Date;
  sources?: citation_source[];
  follow_up_questions?: string[];
  is_streaming?: boolean;
}

export interface citation_source {
  name: string;
  url?: string;
  type: "civic_api" | "ballotpedia" | "openstates" | "fec" | "vote_gov" | "cisa" | "other";
}

export interface election_info {
  election_id?: string;
  election_name?: string;
  election_day?: string;
  polling_location?: polling_location;
  contests?: contest[];
  state?: string;
  zip_code?: string;
}

export interface polling_location {
  address: {
    location_name?: string;
    line1?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  hours?: string;
  polling_hours?: string;
}

export interface contest {
  type: string;
  office?: string;
  district?: {
    name?: string;
    scope?: string;
  };
  candidates?: candidate[];
  ballot_title?: string;
  ballot_summary?: string;
}

export interface candidate {
  name: string;
  party?: string;
  candidacy_url?: string;
  photo_url?: string;
  channels?: { type: string; id: string }[];
}

export interface voice_state {
  is_listening: boolean;
  is_speaking: boolean;
  is_supported: boolean;
  mode: "push_to_talk" | "toggle";
  error?: string;
}

export interface deadline_item {
  label: string;
  date: Date;
  type: "registration" | "early_voting" | "mail_ballot_request" | "election_day" | "ballot_return";
  state?: string;
}

export interface election_calendar_item {
  id: string;
  name: string;
  election_day: string;
  type: "primary" | "general" | "special" | "runoff" | "local";
  ocd_division_id?: string;
}
