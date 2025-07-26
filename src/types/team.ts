export enum TeamRole {
  CAPTAIN = 'CAPTAIN',
  VICE_CAPTAIN = 'VICE_CAPTAIN',
  BATSMAN = 'BATSMAN',
  ALL_ROUNDER = 'ALL_ROUNDER',
  BATTING_ALL_ROUNDER = 'BATTING_ALL_ROUNDER',
  BOWLING_ALL_ROUNDER = 'BOWLING_ALL_ROUNDER',
  BOWLER = 'BOWLER',
  WICKET_KEEPER = 'WICKET_KEEPER'
}

export interface TeamMember {
  id: string;
  teamId: string;
  studentId: string;
  roles: TeamRole[];
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  student: {
    id: string;
    studentName: string;
    email: string;
    academy: string;
    sport: string;
    user?: {
      image?: string;
    };
  };
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  coachId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  members: TeamMember[];
}

export interface RoleColorMap {
  [key: string]: {
    bg: string;
    text: string;
    border: string;
  };
}

export const ROLE_COLORS: RoleColorMap = {
  CAPTAIN: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300'
  },
  VICE_CAPTAIN: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300'
  },
  BATSMAN: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300'
  },
  ALL_ROUNDER: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300'
  },
  BATTING_ALL_ROUNDER: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-300'
  },
  BOWLING_ALL_ROUNDER: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-800',
    border: 'border-cyan-300'
  },
  BOWLER: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300'
  },
  WICKET_KEEPER: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-300'
  }
};

export const ROLE_DISPLAY_NAMES: { [key: string]: string } = {
  CAPTAIN: 'Captain',
  VICE_CAPTAIN: 'Vice Captain',
  BATSMAN: 'Batsman',
  ALL_ROUNDER: 'All-Rounder',
  BATTING_ALL_ROUNDER: 'Batting All-Rounder',
  BOWLING_ALL_ROUNDER: 'Bowling All-Rounder',
  BOWLER: 'Bowler',
  WICKET_KEEPER: 'Wicket Keeper'
}; 