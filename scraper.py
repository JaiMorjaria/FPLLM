from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
from typing import List
from time import sleep

import chromedriver_binary  # Adds chromedriver binary to path

options = Options()
options.add_experimental_option("detach", True)
driver = webdriver.Chrome(options=options)

big_chances_missed = {}
hit_woodwork = {}
yellow_cards = {}
red_cards = {}
fouls = {}

def grabStatValue(stat):
  driver.get(f'https://www.premierleague.com/stats/top/players/{stat}')
  if(driver.find_elements(By.ID, "onetrust-accept-btn-handler")):
    acceptAll = driver.find_element(By.ID, "onetrust-accept-btn-handler")
    acceptAll.click()

  if(driver.find_element(By.ID, "advertClose")):
      advertisement = driver.find_element(By.ID, "advertClose")
      advertisement.click()

  sleep(1)
  next_button = driver.find_element(By.XPATH, "//div[@class='paginationContainer']//div[@class='paginationBtn paginationNextContainer']")
  sleep(1)
  next_button.click()
  prev_button = driver.find_element(By.XPATH, "//div[@class='paginationContainer']//div[@class='paginationBtn paginationPreviousContainer']")
  sleep(1)
  prev_button.click()
  sleep(1)
  names = driver.find_elements(By.XPATH, "//td[@class='stats-table__player']")
  values = driver.find_elements(By.XPATH, "//td[@class='stats-table__main-stat']") 

  while (len(names) > 9):
    grab_names_and_values(names, values, stat)
    sleep(1)
    next_button.click()
    sleep(2)
    names = driver.find_elements(By.XPATH, "//td[@class='stats-table__player']")
    values = driver.find_elements(By.XPATH, "//td[@class='stats-table__main-stat']") 
    grab_names_and_values(names, values, stat)

def grab_names_and_values(names:List[WebElement], values:List[WebElement], stat:str) -> None:
   for i in range(len(values)):
      curr_name = names[i].text
      curr_value = values[i].text

      match stat:
        case "big_chance_missed":
          big_chances_missed[curr_name] = int(curr_value)
        case "red_card":
          red_cards[curr_name] = int(curr_value)

grabStatValue("big_chance_missed")
grabStatValue("red_card")

print(big_chances_missed)
print(red_cards)
