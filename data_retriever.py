import json
import requests
import pandas as pd
from datetime import datetime
from fuzzywuzzy import process
import soccerdata as sd

# Constants and URLs
bootstrap_static_url = "https://fantasy.premierleague.com/api/bootstrap-static/"
understat = sd.Understat(leagues="ENG-Premier League", seasons="2024/2025")

# Load Data
def load_fpl_data():
    general_fpl_data = requests.get(url=bootstrap_static_url).json()
    return general_fpl_data["elements"], general_fpl_data["element_types"]

def load_understat_data():
    player_season_data = understat.read_player_season_stats().reset_index()
    player_per_game_data = understat.read_player_match_stats().reset_index()
    team_data = understat.read_team_match_stats().reset_index()
    schedule = understat.read_schedule().reset_index()
    return player_season_data, player_per_game_data, team_data, schedule

# Fuzzy match player names
def fuzzy_match(player_name, understat_names):
    match, score, index = process.extractOne(player_name, understat_names)
    return match if score >= 75 else None

# Get last 5 games xG and xA
def get_last_5_games_xgi(player_name, player_per_game_data):
    player_data = player_per_game_data[player_per_game_data['player'] == player_name].copy()
    player_data['match_date'] = pd.to_datetime(player_data['game'].astype(str).str[:10], format="%Y-%m-%d")
    player_data_sorted = player_data.sort_values(by='match_date', ascending=False)
    last_5_games = player_data_sorted.head(5)
    mean_xg_last_5 = float(last_5_games['xg'].mean().round(2))
    mean_xa_last_5 = float(last_5_games['xa'].mean().round(2))
    return mean_xg_last_5, mean_xa_last_5

# Get next 5 opponent stats
def get_next_5_opponent_stats(team, schedule, team_stats):
    team_games = schedule[(schedule['home_team'] == team) | (schedule['away_team'] == team)]
    team_games['date'] = pd.to_datetime(team_games['date'], format="%Y-%m-%d")
    future_games = team_games[team_games['date'] > datetime.today()]
    next_5_games = future_games.sort_values(by='date', ascending=True).head(5)

    matchups = []
    for _, game in next_5_games.iterrows():
        is_home = game['home_team'] == team
        opponent = game['away_team'] if is_home else game['home_team']
        team_stats_row = team_stats.loc[team]
        opponent_stats_row = team_stats.loc[opponent]

        matchup = {
            'opponent': opponent,
            'home_or_away': 'home' if is_home else 'away',
            'team_average_xg': team_stats_row['average_home_xg'] if is_home else team_stats_row['average_away_xg'],
            'team_average_xga': team_stats_row['average_home_xga'] if is_home else team_stats_row['average_away_xga'],
            'team_average_xg_rank': team_stats_row['home_xg_rank'] if is_home else team_stats_row['away_xg_rank'],
            'team_average_xga_rank': team_stats_row['home_xga_rank'] if is_home else team_stats_row['away_xga_rank'],
            'opponent_average_xg': opponent_stats_row['average_away_xg'] if is_home else opponent_stats_row['average_home_xg'],
            'opponent_average_xga': opponent_stats_row['average_away_xga'] if is_home else opponent_stats_row['average_home_xga'],
            'opponent_average_xg_rank': opponent_stats_row['home_xg_rank'] if is_home else opponent_stats_row['away_xg_rank'],
            'opponent_average_xga_rank': opponent_stats_row['home_xga_rank'] if is_home else opponent_stats_row['away_xga_rank'],
        }
        matchups.append(matchup)

    return matchups

# Process and map FPL player data to Understat
def process_fpl_players(player_data_fpl_site, player_season_data_understat, player_per_game_data_understat, element_types):
    names_mapping = {}

    understat_names = player_season_data_understat["player"]
    for player in player_data_fpl_site:
        if player["status"] == "u" or float(player["selected_by_percent"]) < 1.0 or player["total_points"] < 10:
            continue

        player_position = element_types[player["element_type"] - 1]["singular_name"]
        web_name = player["web_name"]

        if web_name not in names_mapping:
            match = fuzzy_match(web_name, understat_names)
            if match:
                understat_name = match
            else:
                understat_name = fuzzy_match(player["first_name"] + " " + player["second_name"], understat_names)

            names_mapping[web_name] = {"name": understat_name, "position": player_position}

        # Update player data with FPL info
        names_mapping[web_name]["selected_by_percent"] = player["selected_by_percent"]
        names_mapping[web_name]["yellow_cards"] = player["yellow_cards"]

        if player_position != "Goalkeeper":
            names_mapping[web_name]["penalty_duties"] = True if player["penalties_order"] == 1 else False
            names_mapping[web_name]["freekick_duties"] = True if player["direct_freekicks_order"] == 1 else False
            names_mapping[web_name]["corner_duties"] = True if player["corners_and_indirect_freekicks_order"] == 1 else False

        if player_position != "Forward":
            names_mapping[web_name]["clean_sheets_per_90"] = player["clean_sheets_per_90"]

        # Get last 5 games xG and xA
        l5_xg, l5_xa = get_last_5_games_xgi(names_mapping[web_name]["name"], player_per_game_data_understat)

        # Get the player's season data
        player_data = player_season_data_understat[player_season_data_understat["player"] == names_mapping[web_name]["name"]]
        minutes_per_game = float(player_data["minutes"].sum() / player_data["matches"].sum()) if not player_data.empty else 0

        names_mapping[web_name]["team"] = player_data["team"].iloc[0]
        names_mapping[web_name]["l5_average_xg"] = l5_xg
        names_mapping[web_name]["l5_average_xa"] = l5_xa
        names_mapping[web_name]["minutes_per_game"] = int(minutes_per_game)

    return names_mapping

# Process and map team data
def process_team_data(schedule, team_stats):
    teams = schedule["home_team"].unique()
    team_matchups = {}

    for team in teams:
        team_matchups[team] = get_next_5_opponent_stats(team, schedule, team_stats)

    return team_matchups

# Main function
def main():
    # Load Data
    player_data_fpl_site, element_types = load_fpl_data()
    player_season_data, player_per_game_data, team_data, schedule = load_understat_data()

    # Calculate Home and Away xG, xGA
    home_xg = team_data.groupby('home_team')['home_xg'].mean().reset_index().round(2)
    away_xg = team_data.groupby('away_team')['away_xg'].mean().reset_index().round(2)
    home_xga = team_data.groupby('home_team')['away_xg'].mean().reset_index().round(2)
    away_xga = team_data.groupby('away_team')['home_xg'].mean().reset_index().round(2)

    team_stats = pd.DataFrame({
        'team': home_xg['home_team'],
        'average_home_xg': home_xg['home_xg'],
        'average_home_xga': home_xga['away_xg'],
        'average_away_xg': away_xg['away_xg'],
        'average_away_xga': away_xga['home_xg'],
        'home_xg_rank': home_xg['home_xg'].rank(ascending=False),
        'home_xga_rank': home_xga['away_xg'].rank(ascending=True),
        'away_xg_rank': away_xg['away_xg'].rank(ascending=False),
        'away_xga_rank': away_xga['home_xg'].rank(ascending=True)
    }).set_index('team')

    # Process Players and Teams
    names_mapping = process_fpl_players(player_data_fpl_site, player_season_data, player_per_game_data, element_types)
    team_matchups = process_team_data(schedule, team_stats)

    # Save the results
    with open('names_mapping.json', 'w', encoding='utf-8') as f:
        json.dump(names_mapping, f, ensure_ascii=False, indent=4)

    with open('team_data.json', 'w', encoding='utf-8') as f:
        json.dump(team_matchups, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    main()
