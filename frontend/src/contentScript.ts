import { Matchup, Player } from './types';


chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "displayOverlay") {
    if (message.loading) {
      showOverlay(null, null, null, null);
    }
    if (message.error) {
      // Update the overlay with an error message
      showOverlay(null, null, null, message.error);
    } else {
      // Update the overlay with the actual data
        showOverlay(message.player, message.matchups, message.analysis);
    }
  }
});

function showOverlay(player:Player | null = null, matchups: Matchup[] | null = null, analysis:string = null, errorMessage:string = null) {
  // Remove any existing overlay
  const existingOverlay = document.getElementById("analyze-pick-overlay");
  if (existingOverlay) existingOverlay.remove();

  // Create the overlay
  const overlay = document.createElement("div");
  overlay.id = "analyze-pick-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "50%";
  overlay.style.left = "50%";
  overlay.style.transform = "translate(-50%, -35%)";
  overlay.style.zIndex = "10000";
  overlay.style.padding = "20px";
  overlay.style.background = "white";
  overlay.style.border = "1px solid #ccc";
  overlay.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
  overlay.style.borderRadius = "20px";
  overlay.style.color = "#333";
  overlay.style.minWidth = "300px";
  overlay.style.maxWidth = '600px'; // Set a max width for longer analysis
  overlay.style.overflowWrap = 'break-word';

  if (errorMessage) {
    // Show error message
    overlay.innerHTML = `
      <h2>Error</h2>
      <p>${errorMessage}</p>
    `;
  } else if (player && matchups && analysis) {
    // Show player analysis
    overlay.innerHTML = `
      <h2>Player Analysis</h2>
      <p><strong>Name:</strong> ${player?.name || "N/A"}</p>
      <p><strong>Team:</strong> ${player?.team_name || "N/A"}</p>
      <p><strong>Analysis:</strong></p>
      <div style="white-space: pre-line;">${analysis || "No analysis available."}</div>
    `;
  } else {
    // Show loading message
    overlay.innerHTML = `
      <h2>Player Analysis</h2>
      <p style="margin-top: 50px;">Gathering ball knowledge...</p>
    `;
  }

  const closeIcon = document.createElement("div");
  closeIcon.style.position = "absolute";
  closeIcon.style.top = "10px";
  closeIcon.style.right = "10px"; // Ensure it's at the top-right corner of the overlay
  closeIcon.style.width = "24px";
  closeIcon.style.height = "24px";
  closeIcon.style.borderRadius = "50%";
  closeIcon.style.backgroundColor = "#e90052";
  closeIcon.style.display = "flex";
  closeIcon.style.justifyContent = "center";
  closeIcon.style.alignItems = "center";
  closeIcon.style.cursor = "pointer";
  closeIcon.innerHTML = `
    <span style="color: white; font-family: 'Arial', sans-serif; font-size: 16px;">&times;</span>
  `;

  
  // Append close icon to overlay
  overlay.appendChild(closeIcon);

  // Append overlay to the body
  document.body.appendChild(overlay);

  // Add functionality to close the overlay when the icon is clicked
  closeIcon.addEventListener("click", () => {
    overlay.remove();
  });
}
