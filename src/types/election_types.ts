// Election data types for VoxElect — Google Civic API, OpenStates, FEC

export interface polling_location {
  address: {
    location_name?: string;
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
  hours?: string;
  notes?: string;
}

export interface election_contest {
  type: string;
  election_id?: string;
  office?: string;
  level?: string[];
  roles?: string[];
  district?: {
    name: string;
    scope?: string;
    id?: string;
  };
  candidates?: civic_candidate[];
  ballot_title?: string;
  ballot_summary?: string;
}

export interface civic_candidate {
  name: string;
  party?: string;
  candidate_url?: string;
  photo_url?: string;
  channels?: { type: string; id: string }[];
}

export interface civic_election_info {
  election_id: string;
  name: string;
  election_day: string;
  ocd_division_id?: string;
}

export interface civic_voter_info {
  election: civic_election_info;
  polling_locations?: polling_location[];
  early_vote_sites?: polling_location[];
  drop_off_locations?: polling_location[];
  contests?: election_contest[];
  state?: state_info[];
}

export interface state_info {
  name: string;
  election_administration_body?: {
    name?: string;
    election_info_url?: string;
    voter_registration_url?: string;
    absentee_voting_info_url?: string;
    ballot_info_url?: string;
    correspondence_address?: {
      line1: string;
      city: string;
      state: string;
      zip: string;
    };
  };
}

export interface election_deadline {
  state: string;
  deadline_type: 'voter_registration' | 'absentee_request' | 'absentee_return' | 'election_day';
  date: string;
  notes?: string;
  url?: string;
}

export interface election_calendar_event {
  id: string;
  title: string;
  date: string;
  type: 'primary' | 'general' | 'runoff' | 'special' | 'deadline';
  state?: string;
  description?: string;
  url?: string;
}

export interface openstates_legislator {
  id: string;
  name: string;
  party: string;
  current_role?: {
    title: string;
    org_classification: string;
    district: string;
    division_id: string;
  };
  jurisdiction?: {
    id: string;
    name: string;
    classification: string;
  };
}

export interface civic_api_error {
  code: number;
  message: string;
  status: string;
}
