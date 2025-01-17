import os
from dotenv import load_dotenv, find_dotenv
import json
import requests
import pandas as pd
from datetime import datetime
from fuzzywuzzy import fuzz, process
import soccerdata as sd
from supabase import create_client, Client
import inquirer


# Load environment variables
load_dotenv(find_dotenv())

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

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

def fuzzy_match(web_name, full_name, understat_names):
    def perform_fuzzy_match(name, understat_names):
        # Fuzzy match all candidates
        matches = process.extract(name, understat_names, limit=5)

        # Skip 100% matches
        if matches[0][1] == 100:
            match = matches[0][0]
            understat_names = understat_names[understat_names != match]
            return match, understat_names, True

        # Automatically accept a single high-confidence match (≥ 90) if no close contenders
        if matches[0][1] >= 90 and (len(matches) < 2 or matches[1][1] < 80):
            match = matches[0][0]
            understat_names = understat_names[understat_names != match]
            return match, understat_names, True

        # Prepare options for selection
        options = [f"{match[0]} (score: {match[1]})" for match in matches]
        options.append("None of these")  # Option to skip if no match is suitable

        # Interactive prompt
        questions = [
            inquirer.List(
                "selected_match",
                message=f"Select the best match for '{name}':",
                choices=options,
            )
        ]
        answer = inquirer.prompt(questions)

        if answer and answer["selected_match"] != "None of these":
            # Extract selected match name (remove score details)
            match = matches[options.index(answer["selected_match"])][0]
            understat_names = understat_names[understat_names != match]
            return match, understat_names, False

        return None, understat_names, False  # No match selected or skipped

    # First, attempt matching with web_name
    match, understat_names, high_confidence = perform_fuzzy_match(web_name, understat_names)
    if match or high_confidence:
        return match

    # If no match was selected, try with full_name
    match, understat_names, _ = perform_fuzzy_match(full_name, understat_names)
    return match



def calculate_team_stats(team_data):
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
        'home_xg_rank': home_xg['home_xg'].rank(ascending=False).astype(int),
        'home_xga_rank': home_xga['away_xg'].rank(ascending=True).astype(int),
        'away_xg_rank': away_xg['away_xg'].rank(ascending=False).astype(int),
        'away_xga_rank': away_xga['home_xg'].rank(ascending=True).astype(int)
    }).set_index('team')

    return team_stats

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
            'team_average_xg_rank': int(team_stats_row['home_xg_rank'] if is_home else team_stats_row['away_xg_rank']),
            'team_average_xga_rank': int(team_stats_row['home_xga_rank'] if is_home else team_stats_row['away_xga_rank']),
            'opponent_average_xg': opponent_stats_row['average_away_xg'] if is_home else opponent_stats_row['average_home_xg'],
            'opponent_average_xga': opponent_stats_row['average_away_xga'] if is_home else opponent_stats_row['average_home_xga'],
            'opponent_average_xg_rank': int(opponent_stats_row['away_xg_rank'] if is_home else opponent_stats_row['home_xg_rank']),
            'opponent_average_xga_rank': int(opponent_stats_row['away_xga_rank'] if is_home else opponent_stats_row['home_xga_rank']),
        }
        matchups.append(matchup)

    return matchups

# Process and map FPL player data to Understat
def process_fpl_players(player_data_fpl_site, player_season_data_understat, player_per_game_data_understat, element_types):
    names_mapping = {}

    with open('names_mapping.json', encoding='utf8') as f:
        names_mapping = json.loads(f.read())

    understat_names = player_season_data_understat["player"]
    for player in player_data_fpl_site:
        if player["status"] == "u" or player["total_points"] < 10 or float(player["selected_by_percent"]) < 0.1:
            continue

        player_position = element_types[player["element_type"] - 1]["singular_name"]
        fpl_name = player["first_name"] + " " + player["second_name"] 
        understat_name = ""
        # use this as a field for players in the database because players will be 
        if fpl_name not in names_mapping:
            understat_name = fuzzy_match(player["web_name"], fpl_name, understat_names)
        else:
            understat_name = names_mapping[fpl_name]["name"]
        names_mapping[fpl_name] = {"name": understat_name, "position": player_position}
        names_mapping[fpl_name]["lookup_name"] = fpl_name
        names_mapping[fpl_name]["selected_by_percent"] = player["selected_by_percent"]

        names_mapping[fpl_name]["yellow_cards"] = player["yellow_cards"]
        names_mapping[fpl_name]["price"] = player["now_cost"]

        if player_position != "Goalkeeper":
            names_mapping[fpl_name]["penalty_duties"] = True if player["penalties_order"] == 1 else False
            names_mapping[fpl_name]["freekick_duties"] = True if player["direct_freekicks_order"] == 1 else False
            names_mapping[fpl_name]["corner_duties"] = True if player["corners_and_indirect_freekicks_order"] == 1 else False


        if player_position != "Forward":
            names_mapping[fpl_name]["clean_sheets_per_90"] = player["clean_sheets_per_90"]

        # # Get last 5 games xG and xA
        l5_xg, l5_xa = get_last_5_games_xgi(names_mapping[fpl_name]["name"], player_per_game_data_understat)

        # Get the player's season data
        player_data = player_season_data_understat[player_season_data_understat["player"] == names_mapping[fpl_name]["name"]]
        minutes_per_game = float(player_data["minutes"].sum() / player_data["matches"].sum()) if not player_data.empty else 0

        names_mapping[fpl_name]["team"] = player_data["team"].iloc[0]
        if player_position != "Goalkeeper":
            names_mapping[fpl_name]["l5_average_xg"] = l5_xg
            names_mapping[fpl_name]["l5_average_xa"] = l5_xa
        names_mapping[fpl_name]["minutes_per_game"] = int(minutes_per_game)

    return names_mapping

# Process and map team data
def process_team_data(schedule, team_stats):
    teams = schedule["home_team"].unique()
    team_matchups = {}

    for team in teams:
        team_matchups[team] = get_next_5_opponent_stats(team, schedule, team_stats)

    return team_matchups

# Function to insert data into Supabase
def insert_player_data(player_mapping):
    players_table = supabase.table("players")  # Replace with your actual table name
    for player, data in player_mapping.items():
        team_id_req = supabase.table("teams").select("id").eq("team_name", data["team"]).execute()
        players_table.upsert({
            "web_name": data["lookup_name"],
            "name": data["name"],
            "position": data["position"],
            "selected_by_percent": data["selected_by_percent"],     
            "yellow_cards": data["yellow_cards"],
            "price": data["price"] / 10,
            "penalty_duties": data.get("penalty_duties", None),
            "freekick_duties": data.get("freekick_duties", None),
            "corner_duties": data.get("corner_duties", None),
            "clean_sheets_per_90": data.get("clean_sheets_per_90", None),  # Optional field
            "l5_average_xg": data.get("l5_average_xg", None),
            "l5_average_xa": data.get("l5_average_xa", None),
            "minutes_per_game": data.get("minutes_per_game", 0),
            "team_id": team_id_req.data[0]['id']
        }, on_conflict=["name"]).execute()

def insert_matchup_data(team_matchups):
    matchups_table = supabase.table("matchups")  
    matchups_table.delete()
    for team, matchups in team_matchups.items():
        team_id_req = supabase.table("teams").select("id").eq("team_name", team).execute()
        for matchup in matchups:
            opponent_id_req = supabase.table("teams").select("id").eq("team_name", matchup['opponent']).execute()
            matchups_table.upsert({
                "team_id": team_id_req.data[0]['id'],
                "opponent_id": opponent_id_req.data[0]['id'],
                "home_or_away": matchup["home_or_away"],
                "team_average_xg": matchup["team_average_xg"],
                "team_average_xga": matchup["team_average_xga"],
                "team_average_xg_rank": matchup["team_average_xg_rank"],
                "team_average_xga_rank": matchup["team_average_xga_rank"],
                "opponent_average_xg": matchup["opponent_average_xg"],
                "opponent_average_xga": matchup["opponent_average_xga"],
                "opponent_average_xg_rank": matchup["opponent_average_xg_rank"],
                "opponent_average_xga_rank": matchup["opponent_average_xga_rank"]
            }, on_conflict=["team_id, opponent_id"]).execute()

def insert_team_stats(team_stats):
    teams_table = supabase.table("teams")  # Replace with your actual table name
    for team, stats in team_stats.iterrows():
        teams_table.upsert({
            "team_name": team,
            "average_home_xg": stats["average_home_xg"],
            "average_home_xga": stats["average_home_xga"],
            "average_away_xg": stats["average_away_xg"],
            "average_away_xga": stats["average_away_xga"],
            "home_xg_rank": stats["home_xg_rank"],
            "home_xga_rank": stats["home_xga_rank"],
            "away_xg_rank": stats["away_xg_rank"],
            "away_xga_rank": stats["away_xga_rank"]
        }, on_conflict=["team_name"]).execute()

# Main function
def main():
    # Load Data
    player_data_fpl_site, element_types = load_fpl_data()
    player_season_data, player_per_game_data, team_data, schedule = load_understat_data()

    # Calculations
    # team_stats = calculate_team_stats(team_data)
    players_mapping = process_fpl_players(player_data_fpl_site, player_season_data, player_per_game_data, element_types)
    # team_matchups = process_team_data(schedule, team_stats)


    # Insertion
    # insert_team_stats(team_stats)
    insert_player_data(players_mapping)
    # insert_matchup_data(team_matchups)

    
    # Save the results
    with open('names_mapping.json', 'w', encoding='utf-8') as f:
        json.dump(players_mapping, f, ensure_ascii=False, indent=4)

    # with open('team_data.json', 'w', encoding='utf-8') as f:
    #     json.dump(team_matchups, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    main()
