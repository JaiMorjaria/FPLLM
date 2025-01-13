chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "displayOverlay") {
    if (message.error) {
      showOverlay(null, null, null, message.error);
    } else {
      showOverlay(message.player, message.matchups, message.analysis);
    }
  }
});

function showOverlay(player, matchups, analysis, errorMessage = null) {
  // Remove any existing overlay
  const existingOverlay = document.getElementById("analyze-pick-overlay");
  if (existingOverlay) existingOverlay.remove();
  console.log(player, matchups, analysis);

  // Create the overlay
  const overlay = document.createElement("div");
  overlay.id = "analyze-pick-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "20%";
  overlay.style.left = "50%";
  overlay.style.transform = "translate(-50%, -50%)";
  overlay.style.zIndex = "10000";
  overlay.style.padding = "20px";
  overlay.style.background = "white";
  overlay.style.border = "1px solid #ccc";
  overlay.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
  overlay.style.borderRadius = "8px";
  overlay.style.fontFamily = "Arial, sans-serif";
  overlay.style.color = "#333";
  overlay.style.minWidth = "300px";
    overlay.style.maxWidth = '600px'; // Set a max width for longer analysis
    overlay.style.overflowWrap = 'break-word';

  // Add content to the overlay
  if (errorMessage) {
    overlay.innerHTML = `
      <h2>Error</h2>
      <p>${errorMessage}</p>
      <button id="analyze-close-btn" style="margin-top: 10px;">Close</button>
    `;
  } else {
      overlay.innerHTML = `
      <h2>Player Analysis</h2>
        <p><strong>Name:</strong> ${player.name}</p>
        <p><strong>Team:</strong> ${player.team_name}</p>
        <p><strong>Analysis:</strong></p>
        <div style="white-space: pre-line;">${analysis}</div>
        <button id="analyze-close-btn" style="margin-top: 10px;">Close</button>
    `;
  }

  // Append overlay to the body
  document.body.appendChild(overlay);

  // Add close button functionality
  document.getElementById("analyze-close-btn").addEventListener("click", () => {
    overlay.remove();
  });
}