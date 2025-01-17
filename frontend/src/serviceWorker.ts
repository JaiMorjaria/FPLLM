import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai'

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });



function jsonToSentences(jsonData) {
    const sentences:string[] = [];
    jsonData.forEach(matchup => {
      const sentence = `\n ${matchup.opponent} (${matchup.home_or_away}),  Team Average xG: ${matchup.team_average_xg}, Team xG rank: ${matchup.team_average_xg_rank}, Team average xGA: ${matchup.team_average_xga}, Team xGA rank: ${matchup.team_average_xga_rank}  Opponent Average xG: ${matchup.opponent_average_xg}, Opponent xG rank: ${matchup.opponent_average_xg_rank}, Opponent average xGA: ${matchup.opponent_average_xga}, Opponent xGA rank: ${matchup.opponent_average_xga_rank} \n`;
      sentences.push(sentence);
    });
    return sentences.join(". "); 
}

chrome.runtime.onInstalled.addListener(async () => {
   // Create context menu after installation is complete
    chrome.contextMenus.create({
        id: 'analyzePick',
        title: 'Analyze Pick',
        contexts: ['selection'],
    });

    console.log('Extension successfully installed!');
});



chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'analyzePick') {
        const selectedText = info.selectionText;

        if (selectedText) {
            console.log(`Selected player for analysis: ${selectedText}`);

            chrome.tabs.sendMessage(tab.id, {
                action: "displayOverlay",
                loading: true
            });

            // Fetch the player and matchups data from Supabase
            const { player, matchups } = await getPlayerAndMatchups(selectedText);

            if (player && matchups) {

                // Send request to gemini for analysis
                const analysis = await generateAnalysis(player, matchups);

                if (analysis) {
                    chrome.tabs.sendMessage(tab.id, {
                        action: "displayOverlay",
                        player: player,
                        matchups: matchups,
                        analysis: analysis
                    });
                } else {
                    chrome.tabs.sendMessage(tab.id, {
                        action: "displayOverlay",
                        error: "Failed to get analysis."
                    })
                }

            } else {
                chrome.tabs.sendMessage(tab.id, {
                    action: "displayOverlay",
                    error: `No data found for ${selectedText}`,
                });
            }
        }
    }
});

async function generateAnalysis(player: any, matchups: any) {
    console.log(matchups)
    try {
        const systemPrompt = `
            Objective: You are a Chrome extension designed to advise Fantasy Premier League players who need help buying, selling and holding players.
            Analyze the provided fantasy football player data and matchups to determine the player's fantasy football viability. 
            People depend on you for their picks, so be very careful and detail-oriented!


            Data:

            Player Data: (See sample below)

            Sample: "Son": { "name": "Son Heung-Min", "position": "Midfielder", "lookup_name": "Son Heung-Min", "selected_by_percent": "5.2", "yellow_cards": 0, "price": 98, "penalty_duties": true, "freekick_duties": false, "corner_duties": false, "clean_sheets_per_90": 0.15, "team": "Tottenham", "l5_average_xg": 0.37, "l5_average_xa": 0.3, "minutes_per_game": 73 }
            Key Fields:
            Name
            Position
            Yellow Cards
            Price
            Clean Sheets per 90 (defenders, goalkeepers)
            Penalty Duties (if applicable)
            Corner Kick Duties (if applicable)
            Free Kick Duties (if applicable)
            Team
            Last 5 games' average xG (forwards, midfielders)
            Last 5 games' average xA (midfielders, forwards)
            Minutes per Game


            Matchup Data: (See sample below)

            Sample: Opponent (Home/Away), Team average xG: {team_average_xg}, Team xG rank: {team_average_xg_rank}, Team average xGA: {team_average_xga}, Team xGA rank: {team_average_xga_rank} Opponent average xG: {opponent_average_xg}, Opponent xG rank: {opponent_average_xg_rank}, Opponent average xGA: {opponent_average_xga}, Opponent xGA rank: {opponent_average_xga_rank}
            Key Fields:
                Opponent Team
                Home or Away
                Opponent's Average xG (defenders, goalkeepers) 
                Opponent's Average xGA (forwards, midfielders) 
                Opponent's Rank in xG (defenders, goalkeepers) - Descending order (higher rank = higher xG)
                Opponent's Rank in xGA (forwards, midfielders) - Ascending order (higher rank = lower xGA)
                All of the above fields for the team
                For each matchup, determine the opponent's 'home_or_away' status (if the team is playing at home, the opponent is 'away' and vice versa)


            Analysis Guidelines:

                Matchup Difficulty Analysis:
                        Ranks are ordinal positions, not numerical values themselves.
                        "xGA Rank: 3" means the team has the 3rd lowest xGA in the league.
                        "xG Rank: 15" means the team has the 15th highest xG in the league.
                    Easy Matchup:
                        Defenders, Goalkeepers: Opponent's xG  rank is between 14-20 (low xG). Higher rank = better matchup!! Explicit guideline: Opponent's average xG is less than 1.5 goals per game
                        Forwards, Midfielders: Opponent's xGA rank is between 14-20 (high xGA). Higher rank = better matchup!! Explicit guideline: Opponent's average xGA is greater than 1.5 goals per game
                    Tough Matchup:
                        Defenders, Goalkeepers: Opponent's xG  rank is between 1-7 (high xG). Lower rank = worse matchup!! Explicit guideline: Opponent's average xG is greater than 1.8 goals per game
                        Forwards, Midfielders: Opponent's xGA rank is between 1-7 (low xGA). Lower rank = worse matchup!! Explicit guideline: Opponent's average xGA is less than 1.2 goals per game. 
                    Neutral Matchup:
                        Defenders, Goalkeepers: Opponent's xG  rank is between 8-13 (moderate xG).
                        Forwards, Midfielders: Opponent's xGA rank is between 8-13 (low xGA). 
                    Consider the team's average xG and xGA (and their ranks) as additional factors when assessing the overall matchup difficulty.


                    Example:

                    "Team A has an xG of 2.32, which is ranked 5th for average home xG. They face team B, which has an xGA of 1.00, ranked 3rd for average away xGA.
                    This is a tough matchup for Team A, since team B has the third lowest average away xGA in the league. One player having a high xG most likely
                    does not mitigate this issue, but it doesn't mean they don't have the potential to score points."



                    For each matchup in the provided list:
                        Extract the opponent's name.
                        Extract the opponent's average xGA.
                        Extract the opponent's xGA rank
                        Determine if the opponent's xGA rank falls within the 'Easy Matchup' range (14-20), the 'Tough Matchup' range (1-7), or the 'Neutral Matchup' range (8-13)
                        If the opponent's xG/xGA rank falls within the 'Easy Matchup' range, add the opponent's name to the 'Easy Matchups' list.
                        If the opponent's xG/xGA rank falls within the 'Tough Matchup' range, add the opponent's name to the 'Neutral Matchups' list.
                        If the opponent's xG/xGA rank falls within the 'Tough Matchup' range, add the opponent's name to the 'Tough Matchups' list.
                    
                    If the team has a high average xG/xGA rank and is facing a "neutral" opponent, consider it a potentially favorable matchup.
                    Attackers: If the matchup is in "neutral" range and the team's average xG is significantly higher than the other team's xGA, consider it an easy matchup regardless of rank.
                    Defenders: If the matchup is in "neutral" range and the team's average xGA is significantly lower than the other team's xG, consider it an easy matchup regardless of rank.

                    Return ALL matchp instructions in the following form:

                    "Facing Nottingham Forest (away). Nottingham Forest has the 3rd-lowest average away xGA (1.00 goals), indicating a strong defense."

                Player Strengths:
                    High xG/xA in recent games (>= 0.3 for forwards, >= 0.15 for midfielders)
                    Strong attacking role (for midfielders with high xG/xA)
                    Penalty, corner, or free kick duties
                    Facing easy matchups (matchups against teams that are ranked 14-20th in average xGA)
                    High average minutes (>60 in a game since that's the 2 point threshold)
                    Relatively low ownership % (<10%) IF the above are good, represents a differential pick
                    Relatively cheap price

                Player Weaknesses:
                    Low xG/xA in recent games (<= 0.1 for forwards, <= 0.05 for midfielders)
                    Facing tough matchups (matchups against teams that are in the top 7 for average xGA)
                    Defensive role (for midfielders with low xG/xA)
                    Low average minutes (<60)
                    Relatively high ownership (>25%) IF they have good strengths, represents a safe pick with a low ceiling
                    Relatively low ownership IF they have bad strengths, represents avoidance from the community
                    Relatively high price

                Consider a player's average minutes per game. Players with consistently low minutes are more susceptible to rotation and may not provide consistent fantasy returns.

            Verdict: Do not give definitive judgment, just comment on their fantasy viability based on the above information. Make sure to include minutes per game analysis.
            Prioritize and emphasize player strengths, such as high xG/xA, favorable matchups (easy or neutral), set-piece duties, and low ownership. Highlight any unique advantages, such as a player's role within the team or their recent form.

            Additional Guidelines:
                Use the "-" character for bullet points 
                List the easy matchups (if they genuinely are easy) in pros or your verdict section and the tough matchups in cons, don't lump them together.
                Mention ONLY an opponent's xGA when talking about attacking midfielders and forwards, and mention ONLY an opponent's xG when talking about defenders and goalkeepers. An opponent's xG is not relevant to attackers, and an opponent's xGA is not relevant to defenders.
                Mention ONLY the teham's xG when talking about attacking midfielders and forwards, and mention ONLY the team's xGA when talking about defenders and goalkeepers. A team's xGA is not relevant to attackers, and an team's xG is not relevant to defenders.
                When mentioning a team's rank in a certain metric, give the actual figure as well in this format: (nth-ranked average {home/away} {metric}, {metric number}). Don't use the word "opponent" in the brackets, it's understood. Make sure to mention home or away though, it's important
                Stop using your heuristic to determine matchup difficulty, ONLY use the numbers, ranks and analysis guidelines provided. A lot of teams that were historically not great are doing well now, so be open-minded when evaluating matchups.
                Remember that ranks are ORDINAL so lower values are better, e.g. rank 3 in xGA is the 3rd lowest expected goals allowed in the league, representing an excellent defense and a tough matchup.
                
            Output Format:

            Pros:
                Bullet points listing player strengths (e.g., "High xG in last 5 games",)
                Do NOT list tough matchups here. ALWAYS list tough matchups under "Cons".
            Cons:
                Bullet points listing player weaknesses (e.g., "Facing opponent with low xGA", "Low xA in last 5 games")


            Verdict: Based on the above information, {player} appears to be a {strong/decent/potential} option. While {player} faces some challenges, his [positive aspect] makes him a viable option.

        `;

        const prompt = `
        ${systemPrompt}
          Player: ${player.web_name}
          Team: ${player.team_name}
          Position: ${player.position}
          Price: £${player.price}
          Minutes per game: ${player.minutes_per_game}
          Selected by: ${player.selected_by_percent}%
          Clean sheets per 90: ${player.clean_sheets_per_90}
          Last 5 games xG: ${player.l5_average_xg}
          Last 5 games xA: ${player.l5_average_xa}
          Matchups: ${jsonToSentences(matchups)}

          ${player.penalty_duties ? `Has penalty duties, ` : ''}
          ${player.corner_duties ? `Has corner duties, ` : ''}
          ${player.freekick_duties ? `Has free kick duties.` : ''}
        `;

        console.log(prompt)
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(text)
        return text;
    } catch (error) {
        console.error('Error during Gemini analysis:', error);
        return null;
    }
}



async function getPlayerAndMatchups(selectedText: string) {
    try {
        const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('id, team_name');

        if (teamsError) {
            console.error('Error fetching teams:', teamsError);
            return null;
        }

        const teamsDictionary = {};

        teamsData.forEach((team) => {
            teamsDictionary[team.id] = team.team_name;
        }, {});

        console.log('Teams loaded into memory:', teamsDictionary);

        // 1. Query the players table for the player with web_name equal to selectedText
        const { data: playerData, error: playerError } = await supabase
            .from('players')
            .select('*')  // Select all columns
            .eq('web_name', selectedText)      // Match by web_name
            .single();                         // Expect only one result (single player)

        if (playerError) {
            console.error('Error fetching player:', playerError);
            return null;
        }

        if (!playerData) {
            console.log(`Player not found: ${selectedText}`);
            return null;
        }

        playerData['team_name'] = teamsDictionary[playerData.team_id];
        console.log(playerData)
        
        // 2. Query the matchups table using the team_id from the player data
        const { data: matchups, error: matchupError } = await supabase
            .from('matchups')
            .select('*')                     // Select all columns
            .eq('team_id', playerData.team_id);  // Match by team_id of the player

        if (matchupError) {
            console.error('Error fetching matchups:', matchupError);
            return null;
        }

        matchups.forEach(matchup => {
            matchup['team'] = teamsDictionary[matchup.team_id];
            matchup['opponent'] = teamsDictionary[matchup.opponent_id];
        });


        console.log(playerData, matchups);
        // Return both player and matchups
        return { player: playerData, matchups };

    } catch (error) {
        console.error('Error during queries:', error);
        return null;
    }
}