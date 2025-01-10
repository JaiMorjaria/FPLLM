# FPLLM
Automating your fantasy premier league research using key statistics and an LLM integration. 

## Technologies:
- JavaScript (chrome extension frontend, middleware)
- Python (requests for middleware, Postgres within Supabase for player stats)
- GPT3.5-turbo (to analyze given stats)

## Player stats to track:
- xGI
- Selection%
- Dreamteam selection
- Injury status
- xGC
- PPG/goals/assists/contributions over last 5 games
- MPG/starting status
- Corner and FK involvement
- Average xGI and standard deviation (anyone above/below a std dev is exceptionally good/bad at what they do)

## Team stats to track:
- xG
- xGA
- Performance relative to predicted metrics (are they chokers? do they overachieve? do they concede too much? etc.)
- Average goals scored and let in over last 5 games
