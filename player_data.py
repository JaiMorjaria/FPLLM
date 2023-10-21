from dataclasses import dataclass
from enum import Enum

class PlayerType:
    GK = "GK"
    DEF = "DEF"
    MID = "MID"
    FWD = "FWD"

class Player:
  name: str
  type: PlayerType
  minutes: int
  goals: int
  assists:int
  red_cards: int
  yellow_cards: int
  passes:int
  shots_on_target:int 
  passes:int
  interceptions:int
  blocks:int
  last_man_tackles:int
  aerial_battles_won:int
  aerial_battles_lost:int
  big_chances_missed:int
  hit_woodwork:int
  fouls:int
  own_goals:int
  errors_leading_to_goal:int
  penalties_conceded:int
  offsides:int
  goals_conceded:int
  clean_sheets:int
  saves:int

  def __init__(self, name, type, minutes, goals, assists, yellow_cards, red_cards, goals_conceded=0, clean_sheets=0):
    self.name = name
    self.type = type
    self.minutes = minutes
    self.goals = goals
    self.assists = assists
    self.red_cards = red_cards
    self.yellow_cards = yellow_cards
    self.passes = 0
    self.shots_on_target = 0
    self.passes = 0
    self.interceptions = 0
    self.blocks = 0
    self.last_man_tackles = 0
    self.aerial_battles_won = 0
    self.aerial_battles_lost = 0
    self.big_chances_missed = 0
    self.hit_woodwork = 0
    self.fouls = 0
    self.own_goals = 0
    self.errors_leading_to_goal = 0
    self.penalties_conceded = 0
    self.offsides = 0
    self.goals_conceded = goals_conceded
    self.clean_sheets = clean_sheets
    self.saves = 0

def __hash__(self):
   return hash(self.name)

def __eq__(self, other):
    if isinstance(other, Player):
        return self.name == other.name
    return False
