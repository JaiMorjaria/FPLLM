export type Matchup = {
  team_id: number;
  opponent_id: number;
  team: string;
  opponent: string;
  home_or_away: "Home" | "Away";
  team_average_xg: number;
  team_average_xga: number;
  team_average_xg_rank: number;
  team_average_xga_rank: number;
  opponent_average_xg: number;
  opponent_average_xga: number;
  opponent_average_xg_rank: number;
  opponent_average_xga_rank: number;
};


export type Player = {
  web_name: string;
  name: string;
  position: string;
  selected_by_percent: number;
  yellow_cards: number;
  price: number;
  penalty_duties: string | null;
  freekick_duties: string | null;
  corner_duties: string | null;
  clean_sheets_per_90: number | null;
  l5_average_xg: number | null;
  l5_average_xa: number | null;
  minutes_per_game: number;
  team_id: number | null;
  team_name: string | null;
};

export type Team = {
  id: number;
  team_name: string;
  average_home_xg: number;
  average_home_xga: number;
  average_away_xg: number;
  average_away_xga: number;
  home_xg_rank: number;
  home_xga_rank: number;
  away_xg_rank: number;
  away_xga_rank: number;
};

