import { initializeStorageWithDefaults } from './storage';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai'

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });



chrome.runtime.onInstalled.addListener(async () => {
    // Here goes everything you want to execute after extension initialization

    await initializeStorageWithDefaults({});

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
    try {
        const systemPrompt = `You are a fantasy football analyst. Analyze the following player data and matchups 
        to provide a very concise analysis of the player's pros, cons, and a verdict on whether they are a good pick. 
        Give some evidence for your statements, e.g. when listing tough or easy matchup names give their xG/xGA as it applies to the player
        (xG for defenders and goalkeepers, xGA for midfielders and forwards).
        When speaking about team xG and xGA make sure to mention that it's the AVERAGE and whether or not they're home or away as that does affect it. 
        Also mention the team's rank in that metric as the "nth-ranked" home/away offense/defense in the league by {metric}. ALWAYS mention home/away right next to the offense/defence.
        When mentioning a player's xG/xA stats mention that it's the average of their last 5 games, but don't be verbose with either of these statements.
        Only mention penalty, corner and free kick duties if they exist and do not mention if they don't.
        Don't talk about reliance on these duties for goals since you don't have any scope for where the goals come from. 
        Provide your analysis in the following format:\n Pros: ...\nCons: ...\nVerdict: ...
        Never surround any of the required formatting things with *** around them, just plain text. It's distracting and unnecessary.
        `;


        const prompt = `
        ${systemPrompt}
          Player: ${player.web_name}
          Team: ${player.team_name}
          Position: ${player.position}
          Price: £${player.price}
          Selected by: ${player.selected_by_percent}%
          Clean sheets per 90: ${player.clean_sheets_per_90}
          Last 5 games xG: ${player.l5_average_xg}
          Last 5 games xA: ${player.l5_average_xa}
          Matchups: ${JSON.stringify(matchups)}

          ${player.penalty_duties ? `Has penalty duties, ` : ''}
          ${player.corner_duties ? `Has corner duties, ` : ''}
          ${player.freekick_duties ? `Has free kick duties.` : ''}
        `;

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