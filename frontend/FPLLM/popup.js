/******/ (() => { // webpackBootstrap
/*!**********************!*\
  !*** ./src/popup.ts ***!
  \**********************/
// Listen for messages from the background script
window.addEventListener('message', event => {
  if (event.data.type === 'SHOW_POPUP') {
    const {
      player,
      matchups
    } = event.data;

    // Get the mouse position from the event
    document.addEventListener('mousemove', e => {
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
  const matchupsInfo = matchups.map((matchup, index) => `
      <p><strong>Matchup ${index + 1}:</strong> ${matchup.opponent_team_name} (${matchup.home_or_away})</p>
    `).join('');

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
  popup.style.left = `${x + 15}px`; // Offset from the cursor
  popup.style.top = `${y + 15}px`; // Offset from the cursor

  // Show the popup
  popup.style.position = 'absolute';
  popup.style.display = 'block';
  popup.style.zIndex = '9999';
}
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAuanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0FBLE1BQU0sQ0FBQ0MsZ0JBQWdCLENBQUMsU0FBUyxFQUFHQyxLQUFLLElBQUs7RUFDNUMsSUFBSUEsS0FBSyxDQUFDQyxJQUFJLENBQUNDLElBQUksS0FBSyxZQUFZLEVBQUU7SUFDcEMsTUFBTTtNQUFFQyxNQUFNO01BQUVDO0lBQVMsQ0FBQyxHQUFHSixLQUFLLENBQUNDLElBQUk7O0lBRXZDO0lBQ0FJLFFBQVEsQ0FBQ04sZ0JBQWdCLENBQUMsV0FBVyxFQUFHTyxDQUFDLElBQUs7TUFDNUMsTUFBTUMsTUFBTSxHQUFHRCxDQUFDLENBQUNFLEtBQUs7TUFDdEIsTUFBTUMsTUFBTSxHQUFHSCxDQUFDLENBQUNJLEtBQUs7O01BRXRCO01BQ0FDLFNBQVMsQ0FBQ0osTUFBTSxFQUFFRSxNQUFNLEVBQUVOLE1BQU0sRUFBRUMsUUFBUSxDQUFDO0lBQzdDLENBQUMsQ0FBQztFQUNKO0FBQ0YsQ0FBQyxDQUFDO0FBRUYsU0FBU08sU0FBU0EsQ0FBQ0MsQ0FBQyxFQUFFQyxDQUFDLEVBQUVWLE1BQU0sRUFBRUMsUUFBUSxFQUFFO0VBQ3pDO0VBQ0EsTUFBTVUsVUFBVSxHQUFHO0FBQ3JCLGdDQUFnQ1gsTUFBTSxDQUFDWSxRQUFRO0FBQy9DLG9DQUFvQ1osTUFBTSxDQUFDYSxRQUFRO0FBQ25ELGdDQUFnQ2IsTUFBTSxDQUFDYyxTQUFTO0FBQ2hELHVDQUF1Q2QsTUFBTSxDQUFDZSxXQUFXO0FBQ3pELEdBQUc7RUFFRCxNQUFNQyxZQUFZLEdBQUdmLFFBQVEsQ0FDMUJnQixHQUFHLENBQUMsQ0FBQ0MsT0FBTyxFQUFFQyxLQUFLLEtBQUs7QUFDN0IsMkJBQTJCQSxLQUFLLEdBQUcsQ0FBQyxjQUFjRCxPQUFPLENBQUNFLGtCQUFrQixLQUFLRixPQUFPLENBQUNHLFlBQVk7QUFDckcsS0FBSyxDQUFDLENBQ0RDLElBQUksQ0FBQyxFQUFFLENBQUM7O0VBRVg7RUFDQSxNQUFNQyxZQUFZLEdBQUc7QUFDdkI7QUFDQTtBQUNBLDZCQUE2QlosVUFBVTtBQUN2QywrQkFBK0JLLFlBQVk7QUFDM0M7QUFDQSxHQUFHOztFQUVEO0VBQ0EsSUFBSVEsS0FBSyxHQUFHdEIsUUFBUSxDQUFDdUIsY0FBYyxDQUFDLE9BQU8sQ0FBQztFQUM1QyxJQUFJLENBQUNELEtBQUssRUFBRTtJQUNWQSxLQUFLLEdBQUd0QixRQUFRLENBQUN3QixhQUFhLENBQUMsS0FBSyxDQUFDO0lBQ3JDRixLQUFLLENBQUNHLEVBQUUsR0FBRyxPQUFPO0lBQ2xCekIsUUFBUSxDQUFDMEIsSUFBSSxDQUFDQyxXQUFXLENBQUNMLEtBQUssQ0FBQztFQUNsQztFQUVBQSxLQUFLLENBQUNNLFNBQVMsR0FBR1AsWUFBWTs7RUFFOUI7RUFDQUMsS0FBSyxDQUFDTyxLQUFLLENBQUNDLElBQUksR0FBRyxHQUFHdkIsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUU7RUFDbkNlLEtBQUssQ0FBQ08sS0FBSyxDQUFDRSxHQUFHLEdBQUcsR0FBR3ZCLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFFOztFQUVsQztFQUNBYyxLQUFLLENBQUNPLEtBQUssQ0FBQ2xCLFFBQVEsR0FBRyxVQUFVO0VBQ2pDVyxLQUFLLENBQUNPLEtBQUssQ0FBQ0csT0FBTyxHQUFHLE9BQU87RUFDN0JWLEtBQUssQ0FBQ08sS0FBSyxDQUFDSSxNQUFNLEdBQUcsTUFBTTtBQUM3QixDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY2hyb21lLWV4dGVuc2lvbi13ZWJwYWNrLy4vc3JjL3BvcHVwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIExpc3RlbiBmb3IgbWVzc2FnZXMgZnJvbSB0aGUgYmFja2dyb3VuZCBzY3JpcHRcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgKGV2ZW50KSA9PiB7XG4gIGlmIChldmVudC5kYXRhLnR5cGUgPT09ICdTSE9XX1BPUFVQJykge1xuICAgIGNvbnN0IHsgcGxheWVyLCBtYXRjaHVwcyB9ID0gZXZlbnQuZGF0YTtcblxuICAgIC8vIEdldCB0aGUgbW91c2UgcG9zaXRpb24gZnJvbSB0aGUgZXZlbnRcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xuICAgICAgY29uc3QgbW91c2VYID0gZS5wYWdlWDtcbiAgICAgIGNvbnN0IG1vdXNlWSA9IGUucGFnZVk7XG5cbiAgICAgIC8vIENyZWF0ZSBhbmQgZGlzcGxheSB0aGUgcG9wdXAgbmVhciB0aGUgbW91c2UgcG9zaXRpb25cbiAgICAgIHNob3dQb3B1cChtb3VzZVgsIG1vdXNlWSwgcGxheWVyLCBtYXRjaHVwcyk7XG4gICAgfSk7XG4gIH1cbn0pO1xuXG5mdW5jdGlvbiBzaG93UG9wdXAoeCwgeSwgcGxheWVyLCBtYXRjaHVwcykge1xuICAvLyBGb3JtYXQgcGxheWVyIGFuZCBtYXRjaHVwcyBkYXRhIGludG8gSFRNTFxuICBjb25zdCBwbGF5ZXJJbmZvID0gYFxuICAgIDxwPjxzdHJvbmc+TmFtZTo8L3N0cm9uZz4gJHtwbGF5ZXIud2ViX25hbWV9PC9wPlxuICAgIDxwPjxzdHJvbmc+UG9zaXRpb246PC9zdHJvbmc+ICR7cGxheWVyLnBvc2l0aW9ufTwvcD5cbiAgICA8cD48c3Ryb25nPlRlYW06PC9zdHJvbmc+ICR7cGxheWVyLnRlYW1fbmFtZX08L3A+XG4gICAgPHA+PHN0cm9uZz5TZWxlY3RlZCBCeTo8L3N0cm9uZz4gJHtwbGF5ZXIuc2VsZWN0ZWRfYnl9JTwvcD5cbiAgYDtcblxuICBjb25zdCBtYXRjaHVwc0luZm8gPSBtYXRjaHVwc1xuICAgIC5tYXAoKG1hdGNodXAsIGluZGV4KSA9PiBgXG4gICAgICA8cD48c3Ryb25nPk1hdGNodXAgJHtpbmRleCArIDF9Ojwvc3Ryb25nPiAke21hdGNodXAub3Bwb25lbnRfdGVhbV9uYW1lfSAoJHttYXRjaHVwLmhvbWVfb3JfYXdheX0pPC9wPlxuICAgIGApXG4gICAgLmpvaW4oJycpO1xuXG4gIC8vIENvbWJpbmUgdGhlIHBsYXllciBpbmZvIGFuZCBtYXRjaHVwcyBpbmZvXG4gIGNvbnN0IHBvcHVwQ29udGVudCA9IGBcbiAgICA8ZGl2IGlkPVwicG9wdXBcIj5cbiAgICAgIDxoMz5QbGF5ZXIgU3RhdHM8L2gzPlxuICAgICAgPGRpdiBpZD1cInBsYXllckluZm9cIj4ke3BsYXllckluZm99PC9kaXY+XG4gICAgICA8ZGl2IGlkPVwibWF0Y2h1cHNJbmZvXCI+JHttYXRjaHVwc0luZm99PC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG5cbiAgLy8gQ3JlYXRlIG9yIHVwZGF0ZSB0aGUgcG9wdXBcbiAgbGV0IHBvcHVwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BvcHVwJyk7XG4gIGlmICghcG9wdXApIHtcbiAgICBwb3B1cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHBvcHVwLmlkID0gJ3BvcHVwJztcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHBvcHVwKTtcbiAgfVxuXG4gIHBvcHVwLmlubmVySFRNTCA9IHBvcHVwQ29udGVudDtcblxuICAvLyBQb3NpdGlvbiB0aGUgcG9wdXAgbmVhciB0aGUgY3Vyc29yXG4gIHBvcHVwLnN0eWxlLmxlZnQgPSBgJHt4ICsgMTV9cHhgOyAgLy8gT2Zmc2V0IGZyb20gdGhlIGN1cnNvclxuICBwb3B1cC5zdHlsZS50b3AgPSBgJHt5ICsgMTV9cHhgOyAgLy8gT2Zmc2V0IGZyb20gdGhlIGN1cnNvclxuXG4gIC8vIFNob3cgdGhlIHBvcHVwXG4gIHBvcHVwLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgcG9wdXAuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gIHBvcHVwLnN0eWxlLnpJbmRleCA9ICc5OTk5JzsgIFxufSJdLCJuYW1lcyI6WyJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJkYXRhIiwidHlwZSIsInBsYXllciIsIm1hdGNodXBzIiwiZG9jdW1lbnQiLCJlIiwibW91c2VYIiwicGFnZVgiLCJtb3VzZVkiLCJwYWdlWSIsInNob3dQb3B1cCIsIngiLCJ5IiwicGxheWVySW5mbyIsIndlYl9uYW1lIiwicG9zaXRpb24iLCJ0ZWFtX25hbWUiLCJzZWxlY3RlZF9ieSIsIm1hdGNodXBzSW5mbyIsIm1hcCIsIm1hdGNodXAiLCJpbmRleCIsIm9wcG9uZW50X3RlYW1fbmFtZSIsImhvbWVfb3JfYXdheSIsImpvaW4iLCJwb3B1cENvbnRlbnQiLCJwb3B1cCIsImdldEVsZW1lbnRCeUlkIiwiY3JlYXRlRWxlbWVudCIsImlkIiwiYm9keSIsImFwcGVuZENoaWxkIiwiaW5uZXJIVE1MIiwic3R5bGUiLCJsZWZ0IiwidG9wIiwiZGlzcGxheSIsInpJbmRleCJdLCJzb3VyY2VSb290IjoiIn0=