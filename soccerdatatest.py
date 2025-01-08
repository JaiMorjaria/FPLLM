import soccerdata as sd
import pandas as pd
from classes import Player, Game, Event
import datetime


understat = sd.Understat(leagues="ENG-Premier League", seasons="2024/2025")

data = understat.read_team_match_stats()

# use https://fantasy.premierleague.com/api/bootstrap-static/ to get injury reports
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
