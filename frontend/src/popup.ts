// Listen for messages from the background script
window.addEventListener('message', (event) => {
  if (event.data.type === 'SHOW_POPUP') {
    const { player, matchups } = event.data;

    // Get the mouse position from the event
    document.addEventListener('mousemove', (e) => {
      const mouseX = e.pageX;
      const mouseY = e.pageY;

      // Create and display the popup near the mouse position
      showPopup(mouseX, mouseY, player, matchups);
    });
  }
});

function showPopup(x, y, player, matchups) {
  // Format player and matchups data into HTML
  const playerInfo = `
    <p><strong>Name:</strong> ${player.web_name}</p>
    <p><strong>Position:</strong> ${player.position}</p>
    <p><strong>Team:</strong> ${player.team_name}</p>
    <p><strong>Selected By:</strong> ${player.selected_by}%</p>
  `;

  const matchupsInfo = matchups
    .map((matchup, index) => `
      <p><strong>Matchup ${index + 1}:</strong> ${matchup.opponent_team_name} (${matchup.home_or_away})</p>
    `)
    .join('');

  // Combine the player info and matchups info
  const popupContent = `
    <div id="popup">
      <h3>Player Stats</h3>
      <div id="playerInfo">${playerInfo}</div>
      <div id="matchupsInfo">${matchupsInfo}</div>
    </div>
  `;

  // Create or update the popup
  let popup = document.getElementById('popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'popup';
    document.body.appendChild(popup);
  }

  popup.innerHTML = popupContent;

  // Position the popup near the cursor
  popup.style.left = `${x + 15}px`;  // Offset from the cursor
  popup.style.top = `${y + 15}px`;  // Offset from the cursor

  // Show the popup
  popup.style.position = 'absolute';
  popup.style.display = 'block';
  popup.style.zIndex = '9999';  
}