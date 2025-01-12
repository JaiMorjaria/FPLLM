import soccerdata as sd
import pandas as pd
import json
from classes import Player, Game, Event
import datetime
import requests
from fuzzywuzzy import process
from unidecode import unidecode


bootstrap_static_url = "https://fantasy.premierleague.com/api/bootstrap-static/"
bootstrap_static_raw = requests.get(url=bootstrap_static_url).json()
player_data_fpl_site = bootstrap_static_raw["elements"]
player_web_names = [player["web_name"] for player in player_data_fpl_site]
understat = sd.Understat(leagues="ENG-Premier League", seasons="2024/2025")
player_data_understat = understat.read_player_season_stats().reset_index()
understat_names = player_data_understat["player"]



def fuzzy_match(player_name):
    match, score, index = process.extractOne(player_name, understat_names)
    return match if score >= 75 else score  # Adjust threshold



names_mapping = {
    "Son": "Son Heung-Min",
    "Wood": "Chris Wood",
}
for player in player_data_fpl_site:
    # if player's news doesn't include the word "injury" they're probably on loan or transferred out of the league
    #  and therefore don't need to be fuzzy matched
    # if their TSB% < 1.0, most people aren't even going to think about them as a pick
    # if they have < 10 points by this point in the season they probably don't play
    if (player["news"] != "" and "injury" not in player["news"].lower()) or float(player["selected_by_percent"]) < 1.0 or player["total_points"] < 10:
        continue
    else:
        if player["web_name"] not in names_mapping:
            match = fuzzy_match(player["web_name"])
            if type(match) is str:
                names_mapping[player["web_name"]] =  match
                continue
            else:
                #if we don't have a strong match with the web_name, try again with first and last name
                names_mapping[player["web_name"]] = fuzzy_match(player["first_name"] + " " + player["second_name"])

with open('names_mapping.json', 'w', encoding='utf-8') as f:
    json.dump(names_mapping, f, ensure_ascii=False, indent=4)



# use htxtps://fantasy.premierleague.com/api/bootstrap-static/ to get injury reports
# use web_name instead of relying on gpt to translate the name 
# categorize team  average xG, xA, goals allowed (note on xGA below)
# categorize player average xG, xA (maybe combine into xGI), minutes per game, number of starts, injury status
#  defensive metrics? just use team defense maybe? for attacking defenders get 
# avg xgi across defenders and anyone above a std dev of that is "high" and the rest "avg" or "low"?
# for xGA - may require downloading and modifying soccerdata module understat.py to include xGA and then using the local ver of the package
# goal: modify player and team classes in classes.py to accept new metrics and injury status related data
# then: write functions for season-long and last 5 games versions of above data requirements
# then: injury/suspension status (account for things like being close toa suspension too, yellow numbers are right there - 7 is danger territory, rule is 10 in 32)
# then: start writing gpt integration 
# then: chrome extension development
