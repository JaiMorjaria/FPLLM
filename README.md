# FPLLM
Automating your fantasy premier league research using key statistics and an LLM integration. 

![FPLLM_Demo](https://github.com/user-attachments/assets/7a1fb294-2bd1-4312-a6bc-634448ba7ee3)


## Technologies:
- TypeScript (chrome extension frontend, middleware)
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
- Average home and away xGA (")
- Above stats for a team's next 5 matchups
- Ranks for the above stats

