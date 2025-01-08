import soccerdata as sd

fbref = sd.FBref(leagues="ENG-Premier League", seasons=2425)
team_match_stats = fbref.read_team_match_stats(stat_type="schedule", team="Manchester City")
player_match_stats = fbref.read_player_match_stats(stat_type="summary", match_id='67a0c715')
player_match_stats = player_match_stats.reset_index()
print(player_match_stats.index)
print('Jerry Mice')