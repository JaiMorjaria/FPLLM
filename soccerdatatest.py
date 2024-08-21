import soccerdata as sd
import pandas as pd
from classes import Player, Game, Event
import datetime

espn = sd.ESPN(leagues="ENG-Premier League", seasons="23-24")
fbref = sd.FBref(leagues="ENG-Premier League", seasons="23-24")
epl_schedule = fbref.read_schedule()
schedule = espn.read_schedule()
game_ids = schedule["game_id"].tolist()
data = espn.read_lineup(game_ids).reset_index().drop('league', axis=1)

players = data["player"].unique()
games = data["game"].unique()
teams = data["team"].unique()

game = Game(game_week=1, game_date="2023-08-12", home_team="Team A", away_team="Team B")
print(game)

week_ctr = 1
gameweeks = []
for game in epl_schedule.iterrows():
    date = str(game[1]['date'])[0:11]
    time = str(game[1]['time'])
    home_team = game[1]['home_team']
    away_team = game[1]['away_team']
    week = game[1]['week']
    datetime_string = date + time
    game_date = datetime.datetime.strptime(datetime_string, '%Y-%m-%d %H:%M')
    gameweek = Game(game_date, home_team, away_team, week)
    gameweeks.append(str(gameweek))

players_data = []

for player_name in players:
    player_info = data.loc[data['player'] == player_name, ['team', 'position']].iloc[0]
    player = Player(player_name, player_info['team'], player_info['position'])
    players_data.append(str(player)   )

with open("outfile", "w") as outfile:
    outfile.write("\n".join(gameweeks))

with open("players", "w") as players:
    players.write("\n".join(players_data))