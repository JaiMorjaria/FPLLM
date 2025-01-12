import soccerdata as sd
import pandas as pd
import json
from classes import Player, Game, Event
import datetime
import requests
from fuzzywuzzy import process


def fuzzy_match(player_name):
    match, score, index = process.extractOne(player_name, understat_names)
    return match if score >= 75 else score  

def get_last_5_games_xgi(player_name, player_per_game_data_understat):
    # Filter the player's data
    player_data = player_per_game_data_understat[player_per_game_data_understat['player'] == player_name]

    player_data['match_date'] = pd.to_datetime(player_data['game'].astype(str).str[:10], format="%Y-%m-%d")
    # Sort the data by match_date in descending order (most recent first)
    player_data_sorted = player_data.sort_values(by='match_date',  ascending=False)

    # Get the last 5 games
    last_5_games = player_data_sorted.head(5).copy()

    print(last_5_games.columns)
    # Calculate xGI (xG + xA) for the last 5 games
    last_5_games['xgi'] = last_5_games[['xg', 'xa']].sum(axis=1)
    # Sum up the xGI for the last 5 games
    mean_xgi_last_5 = last_5_games['xgi'].mean()

    return mean_xgi_last_5

bootstrap_static_url = "https://fantasy.premierleague.com/api/bootstrap-static/"
bootstrap_static_raw = requests.get(url=bootstrap_static_url).json()
player_data_fpl_site = bootstrap_static_raw["elements"]
understat = sd.Understat(leagues="ENG-Premier League", seasons="2024/2025")
player_season_data_understat = understat.read_player_season_stats().reset_index()
player_per_game_data_understat = understat.read_player_match_stats().reset_index()
team_data_understat = understat.read_team_match_stats().reset_index()
team_schedule_understart = understat.read_schedule().reset_index()
understat_names = player_season_data_understat["player"]


names_mapping = {
    "Son": "Son Heung-Min",
    "Wood": "Chris Wood",
}

player_stats_list = []

for player in player_data_fpl_site:
    if (player["status"] == "u") or float(player["selected_by_percent"]) < 1.0 or player["total_points"] < 10:
        continue
    else:
        # Check if the player's name is already mapped
        if player["web_name"] not in names_mapping:
            match = fuzzy_match(player["web_name"])
            if type(match) is str:
                names_mapping[player["web_name"]] = match
                continue
            else:
                # Try matching first and last name
                names_mapping[player["web_name"]] = fuzzy_match(player["first_name"] + " " + player["second_name"])

        player["position"] = bootstrap_static_raw["element_types"][player["element_type"] - 1]["singular_name"]
        
l5_xgis = []
for player in names_mapping.keys():
    print(names_mapping['player'])
    l5_xgis.append(get_last_5_games_xgi(player, player_per_game_data_understat))

player_season_data_understat['xgi'] = l5_xgis

with open('names_mapping.json', 'w', encoding='utf-8') as f:
    json.dump(names_mapping, f, ensure_ascii=False, indent=4)

# Calculate Home and Away xG
home_xg = team_data_understat.groupby('home_team')['home_xg'].mean().reset_index()
away_xg = team_data_understat.groupby('away_team')['away_xg'].mean().reset_index()

# Calculate Home and Away xGA
home_xga = team_data_understat.groupby('home_team')['away_xg'].mean().reset_index()
away_xga = team_data_understat.groupby('away_team')['home_xg'].mean().reset_index()
# Combine xG and xGA into a single DataFrame
team_stats = pd.DataFrame({
    'team': home_xg['home_team'].combine_first(home_xg['home_team']),
    'average_home_xg': home_xg['home_xg'],
    'average_home_xga': home_xga['away_xg'],
    'average_away_xg': away_xg['away_xg'],
    'average_away_xga': away_xga['home_xg'],
    'home_xg_rank': home_xg['home_xg'].rank(ascending=False),
    'home_xga_rank': home_xga['away_xg'].rank(ascending=True),
    'away_xg_rank': away_xg['away_xg'].rank(ascending=False),
    'away_xga_rank': away_xga['home_xg'].rank(ascending=True)
}).set_index('team')

player_per_game_data_understat['xgi'] = player_per_game_data_understat.loc[:, ['xg', 'xa']].sum(axis=1)

print(player_per_game_data_understat.columns)
# categorize player average xG, xA (maybe combine into xGI), minutes per game, number of starts, injury status
#  defensive metrics? just use team defense maybe? for attacking defenders get 
# avg xgi across defenders and anyone above a std dev of that is "high" and the rest "avg" or "low"?
# for xGA - may require downloading and modifying soccerdata module understat.py to include xGA and then using the local ver of the package
# goal: modify player and team classes in classes.py to accept new metrics and injury status related data
# then: write functions for season-long and last 5 games versions of above data requirements
# then: injury/suspension status (account for things like being close toa suspension too, yellow numbers are right there - 7 is danger territory, rule is 10 in 32)
# then: start writing gpt integration 
# then: chrome extension development
