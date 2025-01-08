import soccerdata as sd
import pandas as pd
from classes import Player, Game, Event
import datetime

def correctNamingDiscrepancies(team_name:str) -> str:
    espn_fbref_discrepancies = {
        "Nott'ham Forest": "Nottingham Forest",
        "Brighton": "Brighton & Hove Albion",
        "Bournemouth": "AFC Bournemouth",
        "Manchester Utd": "Manchester United",
        "Newcastle Utd": "Newcastle United",
        "Sheffield Utd": "Sheffield United",
        "West Ham": "West Ham United",
        "Tottenham": "Tottenham Hotspur",
        "Wolves": "Wolverhampton Wanderers"
    }
    if team_name in espn_fbref_discrepancies:
        return espn_fbref_discrepancies[team_name]
    else:
        return team_name

espn = sd.ESPN(leagues="ENG-Premier League", seasons="23-24")
fbref = sd.FBref(leagues="ENG-Premier League", seasons="23-24")
epl_schedule = fbref.read_schedule()
schedule = espn.read_schedule()
game_ids = schedule["game_id"].tolist()
data = espn.read_lineup(game_ids).reset_index().drop('league', axis=1)

players = data["player"].unique()
games = data["game"].unique()
teams = data["team"].unique()

negative_events = [ "yellow_card", "red_card", "goal_conceded", "offsides", "fouls_committed", "sub_out", "bench_start", "shot_off_target", "own_goal"]
positive_events = ["goal", "goal_assist", "shot_on_target", "save", "start"]
non_event_columns = ['season', 'game', 'team', 'player', 'is_home', 'position', 'formation_place']

week_ctr = 1
gameweeks_data = pd.Series()
gameweeks = {}
for game in epl_schedule.iterrows():
    date = str(game[1]['date'])[0:11]
    time = str(game[1]['time'])
    home_team = correctNamingDiscrepancies(game[1]['home_team'])
    away_team = correctNamingDiscrepancies(game[1]['away_team'])
    week = game[1]['week']
    datetime_string = date + time
    game_date = datetime.datetime.strptime(datetime_string, '%Y-%m-%d %H:%M')
    gameweek = Game(game_date, home_team, away_team, week)
    game_str = date + home_team + "-" + away_team
    gameweeks[game_str] = gameweek.id

players_data = pd.Series()
players_mapping = {} 
for player_name in players:
    filtered_data = data.loc[(data['player'] == player_name) & (data['position'] != 'Substitute'), ['position', 'team']]

# Check if the filtered data is not empty before accessing the first row
    if not filtered_data.empty:  # No parentheses here, since empty is a property
        player_info = filtered_data.iloc[0]    
        if not player_info.empty:
            player = Player(player_name, player_info['team'], player_info['position'])
            players_mapping[player_name] = player

events = []

for _, row in data.iterrows():
    for column, value in row.items():
        if column not in non_event_columns and value != 0:
            if row.player in players_mapping:
                # Create an event for this stat
                event = Event(
                    player_id=players_mapping[row.player].id,
                    game_id=gameweeks[row.game],
                    event_type=column,  # Use the column name as the event type (e.g., 'total_goals')
                    quantity=value
                )
                events.append(event)

'''
Things I want to look for:

Start/didn't start -1 for playing the whole game -1 for not playing at all
Minutes played +1 for less than 60 minutes
Win -1
Draw +1
Loss +3
Goals -4 for fwds -5 for mids -6 for defs
Assists -3 for fwds -4 for mids -5 for defs
Shots on target -1
Shots off target +2
Goal conceded +6 for GK +5 for DEF
Foul +3
Yellow +4
Red +8
Own goal +15
Offside +5
Save -1 for GKP
Clean sheet -5 for GKP
'''


print(events)

