from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
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

  
  nextButton = WebDriverWait(driver, 1).until(
    EC.presence_of_element_located((By.XPATH, "//div[@class='paginationContainer']//div[@class='paginationBtn paginationNextContainer']")).click()
  )
  names = driver.find_elements(By.XPATH, "//td[@class='stats-table__name']")
  while(len(names) == 8): 
    for i in range(1, 8):
      curr_name = names[i].text
      curr_value = names[i].text
      match stat:
        case "big_chance_missed":
          big_chances_missed[curr_name] = int(curr_value)

    nextButton.click()
    names = driver.find_elements(By.XPATH, "//td[@class='stats-table__name']")
    
  print(big_chances_missed)


grabStatValue("big_chance_missed")
