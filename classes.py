from dataclasses import dataclass, field
from uuid import UUID, uuid4
from datetime import datetime

@dataclass
class Player:
    id: UUID = ""
    name: str = ""
    team: str = ""
    position: str = ""
    points: int = 0
    
    def __init__(self, name: str, team: str, position: str): 
        self.id = uuid4()
        self.name = name
        self.team = team
        self.position = position
        self.points = 0
    
    def __str__(self,):
        return f"{self.name}, a {self.position} playing for {self.team}. ID: {self.id}"

    def setPoints(self, points:int):
        self.points = points
    
@dataclass
class Game:
    id: UUID = ""
    game_date: datetime = datetime.today()
    home_team: str = ""
    away_team: str = ""
    game_week: int = 0

    def __init__(self, game_date: datetime, home_team: str, away_team: str, game_week: int): 
       self.id = uuid4()
       self.game_date = game_date
       self.home_team = home_team
       self.away_team = away_team
       self.game_week = game_week
    
    def __str__(self):
        return f"Gameweek {self.game_week} matchup on date {self.game_date} between {self.home_team} and {self.away_team}. ID: {self.id}"

@dataclass
class Event:
    id: UUID = ""
    player_id: UUID = None
    game_id: UUID = None
    event_type: str = ""


    def __init__(self, player_id:UUID, game_id:UUID, event_type:str):
        self.id = uuid4()
        self.player_id = player_id
        self.game_id = game_id
        self.event_type = event_type
    
