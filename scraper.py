from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from time import sleep
import pandas, os, json
from dotenv import load_dotenv
from supabase import create_client, Client
from player_data import Player, PlayerType, Defender, Forward, Midfielder, Goalkeeper

options = Options()
service = Service(executable_path="C:\Program Files\Selenium\chromedriver.exe")
# options.add_experimental_option("detach", True)
options.add_argument("--headless=new")
options.add_experimental_option('excludeSwitches', ['enable-logging'])
driver = webdriver.Chrome(service=service, options=options)
load_dotenv()
url:str = os.getenv("SUPABASE_URL")
key:str = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)



player_data = {}
def grabPlayerNames():
  players = pandas.read_csv("players.csv")

  for index, row in players.iterrows():
    player_name = row["first_name"] + " " + row["second_name"]
    player_name = player_name.strip()
    element_type = row["element_type"]

    if element_type == PlayerType.GK:
        new_player = Goalkeeper(player_name, PlayerType.GK, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
    elif element_type == PlayerType.DEF:
        new_player = Defender(player_name, PlayerType.DEF, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
    elif element_type == PlayerType.MID:
        new_player = Midfielder(player_name, PlayerType.MID, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
    elif element_type == PlayerType.FWD:
        new_player = Forward(player_name, PlayerType.FWD, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
    else:
        # Handle the case if the element_type is not one of the expected values
        new_player = None

    if new_player is not None:
        player_data[player_name] = new_player



def grabStatValue(stat):
  driver.get(f'https://www.premierleague.com/stats/top/players/{stat}')
  sleep(1)
  if(len(driver.find_elements(By.ID, "onetrust-accept-btn-handler")) > 0):
    acceptAll = driver.find_element(By.ID, "onetrust-accept-btn-handler")
    acceptAll.click()
  sleep(1)
  if(len(driver.find_elements(By.ID, "advertClose")) > 0):
      advertisement = driver.find_element(By.ID, "advertClose")
      if(advertisement.is_displayed() and advertisement.is_enabled()):
        advertisement.click() 
  
  if(len(driver.find_elements(By.XPATH, "//div[@class='paginationContainer']//div[@class='paginationBtn paginationNextContainer inactive']")) > 0):
      names = driver.find_elements(By.XPATH, "//td[@class='stats-table__name']")
      values = driver.find_elements(By.XPATH, "//td[@class='stats-table__main-stat']") 
      return None
  else:
    #the only reason I'm doing this is because once you get off the first page the xpath for player name changes to stats-table__player instead of stats-table__name and then stays that way - weird choice there but we'll roll with it🤝
    next_button = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "//div[@class='paginationBtn paginationNextContainer']")))
    next_button.click()
    prev_button = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "//div[@class='paginationBtn paginationPreviousContainer']")))
    prev_button.click()

    while(True):
      if(len(driver.find_elements(By.XPATH, "//div[@class='paginationContainer']//div[@class='paginationBtn paginationNextContainer inactive']")) != 0):
        break
      else:
        grab_names_and_values(driver, stat)
        sleep(2)
        next_button = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "//div[@class='paginationBtn paginationNextContainer']")))
        next_button.click()

#takes in list of name web elements, values web elements and a stat and fills out the relevant dict based on what stat was passed in.
def grab_names_and_values(driver, stat):
  try:
    sleep(1)
    names = WebDriverWait(driver, 10).until(EC.presence_of_all_elements_located((By.XPATH, "//td[@class='stats-table__player']")))
    values = WebDriverWait(driver, 10).until(EC.presence_of_all_elements_located((By.XPATH, "//td[@class='stats-table__main-stat']")))
    for i in range(len(values)):
      curr_name = names[i].text
      curr_value = int(values[i].text.replace(',', ''))
      if(curr_name not in player_data):
        print(curr_name)
        continue
      else:
        curr_player = player_data[curr_name]
        match stat:           
          case "mins_played":
            curr_player.minutes = curr_value
          case "goals":
            curr_player.goals = curr_value
          case "assists":
            curr_player.assists = curr_value
          case "yellow_cards":
            curr_player.yellow_cards = curr_value
          case "red_cards":
            curr_player.red_cards = curr_value
          case "aerial_won":
            curr_player.aerial_battles_won = curr_value
          case "aerial_lost":
            curr_player.aerial_battles_lost = curr_value
          case "fouls":
            curr_player.fouls = curr_value
          case "own_goals":
            curr_player.own_goals = curr_value
          case "total_offside":
            curr_player.offsides = curr_value
          case "penalty_conceded":
            curr_player.penalties_conceded = curr_value
          case "dispossessed":
            curr_player.times_disposssessed = curr_value

  except Exception as e:
    print(f"An error occurred: {str(e)}")

def main_grabber():
  bad_stats = ["mins_played", "goals", "assists", "yellow_cards", "red_cards", "aerial_won", "aerial_lost", "fouls", "own_goals", "total_offside", "penalty_conceded", "dispossessed"]
  for stat in bad_stats:
    grabStatValue(stat)

grabPlayerNames()
main_grabber()


player_data_fr = player_data.values()

for player in player_data_fr:
  player = player.__dict__

print(player_data_fr)

with open("data.json", "w") as f:
  json.dump(player_data_fr, f)
