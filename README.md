# FPLLM
Automating your fantasy premier league research using key statistics and an LLM integration. 

## Technologies:
- JavaScript (chrome extension frontend, middleware)
- Python (data propagation, stat calculation and filtering)
- PostgreSQL using Supabase to host data (medium-long term stat storage)
- Gemini 1.5 (to help users contextualize data)

## Player stats to track:
- xGI
- Selection%
- MPG/starting status
- Penalty duties
- Corner and FK involvement
- Price
- Yellow cards


## Team stats to track:
- Average home and away xG (depending on matchup)
- Average ome and away xGA (")
- Above stats for a team's next 5 matchups
- Ranks for the above stats

