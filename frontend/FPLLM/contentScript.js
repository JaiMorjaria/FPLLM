/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!******************************!*\
  !*** ./src/contentScript.ts ***!
  \******************************/
__webpack_require__.r(__webpack_exports__);
chrome.runtime.onMessage.addListener(message => {
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
function showOverlay() {
  let player = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  let matchups = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  let analysis = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  let errorMessage = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
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

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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S0FBSyxDQUFDMEIsTUFBTSxHQUFHLFNBQVM7RUFDbENSLFNBQVMsQ0FBQ0gsU0FBUyxHQUFHO0FBQ3hCO0FBQ0EsR0FBRzs7RUFHRDtFQUNBbEIsT0FBTyxDQUFDOEIsV0FBVyxDQUFDVCxTQUFTLENBQUM7O0VBRTlCO0VBQ0F4QixRQUFRLENBQUNrQyxJQUFJLENBQUNELFdBQVcsQ0FBQzlCLE9BQU8sQ0FBQzs7RUFFbEM7RUFDQXFCLFNBQVMsQ0FBQ1csZ0JBQWdCLENBQUMsT0FBTyxFQUFFLE1BQU07SUFDeENoQyxPQUFPLENBQUNELE1BQU0sQ0FBQyxDQUFDO0VBQ2xCLENBQUMsQ0FBQztBQUNKIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY2hyb21lLWV4dGVuc2lvbi13ZWJwYWNrL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2Nocm9tZS1leHRlbnNpb24td2VicGFjay93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2Nocm9tZS1leHRlbnNpb24td2VicGFjay8uL3NyYy9jb250ZW50U2NyaXB0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFRoZSByZXF1aXJlIHNjb3BlXG52YXIgX193ZWJwYWNrX3JlcXVpcmVfXyA9IHt9O1xuXG4iLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBNYXRjaHVwLCBQbGF5ZXIgfSBmcm9tICcuL3R5cGVzJztcclxuXHJcblxyXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UpID0+IHtcclxuICBpZiAobWVzc2FnZS5hY3Rpb24gPT09IFwiZGlzcGxheU92ZXJsYXlcIikge1xyXG4gICAgaWYgKG1lc3NhZ2UubG9hZGluZykge1xyXG4gICAgICBzaG93T3ZlcmxheShudWxsLCBudWxsLCBudWxsLCBudWxsKTtcclxuICAgIH1cclxuICAgIGlmIChtZXNzYWdlLmVycm9yKSB7XHJcbiAgICAgIC8vIFVwZGF0ZSB0aGUgb3ZlcmxheSB3aXRoIGFuIGVycm9yIG1lc3NhZ2VcclxuICAgICAgc2hvd092ZXJsYXkobnVsbCwgbnVsbCwgbnVsbCwgbWVzc2FnZS5lcnJvcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBVcGRhdGUgdGhlIG92ZXJsYXkgd2l0aCB0aGUgYWN0dWFsIGRhdGFcclxuICAgICAgICBzaG93T3ZlcmxheShtZXNzYWdlLnBsYXllciwgbWVzc2FnZS5tYXRjaHVwcywgbWVzc2FnZS5hbmFseXNpcyk7XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcbmZ1bmN0aW9uIHNob3dPdmVybGF5KHBsYXllcjpQbGF5ZXIgfCBudWxsID0gbnVsbCwgbWF0Y2h1cHM6IE1hdGNodXBbXSB8IG51bGwgPSBudWxsLCBhbmFseXNpczpzdHJpbmcgPSBudWxsLCBlcnJvck1lc3NhZ2U6c3RyaW5nID0gbnVsbCkge1xyXG4gIC8vIFJlbW92ZSBhbnkgZXhpc3Rpbmcgb3ZlcmxheVxyXG4gIGNvbnN0IGV4aXN0aW5nT3ZlcmxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYW5hbHl6ZS1waWNrLW92ZXJsYXlcIik7XHJcbiAgaWYgKGV4aXN0aW5nT3ZlcmxheSkgZXhpc3RpbmdPdmVybGF5LnJlbW92ZSgpO1xyXG5cclxuICAvLyBDcmVhdGUgdGhlIG92ZXJsYXlcclxuICBjb25zdCBvdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICBvdmVybGF5LmlkID0gXCJhbmFseXplLXBpY2stb3ZlcmxheVwiO1xyXG4gIG92ZXJsYXkuc3R5bGUucG9zaXRpb24gPSBcImZpeGVkXCI7XHJcbiAgb3ZlcmxheS5zdHlsZS50b3AgPSBcIjUwJVwiO1xyXG4gIG92ZXJsYXkuc3R5bGUubGVmdCA9IFwiNTAlXCI7XHJcbiAgb3ZlcmxheS5zdHlsZS50cmFuc2Zvcm0gPSBcInRyYW5zbGF0ZSgtNTAlLCAtMzUlKVwiO1xyXG4gIG92ZXJsYXkuc3R5bGUuekluZGV4ID0gXCIxMDAwMFwiO1xyXG4gIG92ZXJsYXkuc3R5bGUucGFkZGluZyA9IFwiMjBweFwiO1xyXG4gIG92ZXJsYXkuc3R5bGUuYmFja2dyb3VuZCA9IFwid2hpdGVcIjtcclxuICBvdmVybGF5LnN0eWxlLmJvcmRlciA9IFwiMXB4IHNvbGlkICNjY2NcIjtcclxuICBvdmVybGF5LnN0eWxlLmJveFNoYWRvdyA9IFwiMHB4IDRweCA2cHggcmdiYSgwLCAwLCAwLCAwLjEpXCI7XHJcbiAgb3ZlcmxheS5zdHlsZS5ib3JkZXJSYWRpdXMgPSBcIjIwcHhcIjtcclxuICBvdmVybGF5LnN0eWxlLmNvbG9yID0gXCIjMzMzXCI7XHJcbiAgb3ZlcmxheS5zdHlsZS5taW5XaWR0aCA9IFwiMzAwcHhcIjtcclxuICBvdmVybGF5LnN0eWxlLm1heFdpZHRoID0gJzYwMHB4JzsgLy8gU2V0IGEgbWF4IHdpZHRoIGZvciBsb25nZXIgYW5hbHlzaXNcclxuICBvdmVybGF5LnN0eWxlLm92ZXJmbG93V3JhcCA9ICdicmVhay13b3JkJztcclxuXHJcbiAgaWYgKGVycm9yTWVzc2FnZSkge1xyXG4gICAgLy8gU2hvdyBlcnJvciBtZXNzYWdlXHJcbiAgICBvdmVybGF5LmlubmVySFRNTCA9IGBcclxuICAgICAgPGgyPkVycm9yPC9oMj5cclxuICAgICAgPHA+JHtlcnJvck1lc3NhZ2V9PC9wPlxyXG4gICAgYDtcclxuICB9IGVsc2UgaWYgKHBsYXllciAmJiBtYXRjaHVwcyAmJiBhbmFseXNpcykge1xyXG4gICAgLy8gU2hvdyBwbGF5ZXIgYW5hbHlzaXNcclxuICAgIG92ZXJsYXkuaW5uZXJIVE1MID0gYFxyXG4gICAgICA8aDI+UGxheWVyIEFuYWx5c2lzPC9oMj5cclxuICAgICAgPHA+PHN0cm9uZz5OYW1lOjwvc3Ryb25nPiAke3BsYXllcj8ubmFtZSB8fCBcIk4vQVwifTwvcD5cclxuICAgICAgPHA+PHN0cm9uZz5UZWFtOjwvc3Ryb25nPiAke3BsYXllcj8udGVhbV9uYW1lIHx8IFwiTi9BXCJ9PC9wPlxyXG4gICAgICA8cD48c3Ryb25nPkFuYWx5c2lzOjwvc3Ryb25nPjwvcD5cclxuICAgICAgPGRpdiBzdHlsZT1cIndoaXRlLXNwYWNlOiBwcmUtbGluZTtcIj4ke2FuYWx5c2lzIHx8IFwiTm8gYW5hbHlzaXMgYXZhaWxhYmxlLlwifTwvZGl2PlxyXG4gICAgYDtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gU2hvdyBsb2FkaW5nIG1lc3NhZ2VcclxuICAgIG92ZXJsYXkuaW5uZXJIVE1MID0gYFxyXG4gICAgICA8aDI+UGxheWVyIEFuYWx5c2lzPC9oMj5cclxuICAgICAgPHAgc3R5bGU9XCJtYXJnaW4tdG9wOiA1MHB4O1wiPkdhdGhlcmluZyBiYWxsIGtub3dsZWRnZS4uLjwvcD5cclxuICAgIGA7XHJcbiAgfVxyXG5cclxuICBjb25zdCBjbG9zZUljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gIGNsb3NlSWNvbi5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcclxuICBjbG9zZUljb24uc3R5bGUudG9wID0gXCIxMHB4XCI7XHJcbiAgY2xvc2VJY29uLnN0eWxlLnJpZ2h0ID0gXCIxMHB4XCI7IC8vIEVuc3VyZSBpdCdzIGF0IHRoZSB0b3AtcmlnaHQgY29ybmVyIG9mIHRoZSBvdmVybGF5XHJcbiAgY2xvc2VJY29uLnN0eWxlLndpZHRoID0gXCIyNHB4XCI7XHJcbiAgY2xvc2VJY29uLnN0eWxlLmhlaWdodCA9IFwiMjRweFwiO1xyXG4gIGNsb3NlSWNvbi5zdHlsZS5ib3JkZXJSYWRpdXMgPSBcIjUwJVwiO1xyXG4gIGNsb3NlSWNvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiNlOTAwNTJcIjtcclxuICBjbG9zZUljb24uc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xyXG4gIGNsb3NlSWNvbi5zdHlsZS5qdXN0aWZ5Q29udGVudCA9IFwiY2VudGVyXCI7XHJcbiAgY2xvc2VJY29uLnN0eWxlLmFsaWduSXRlbXMgPSBcImNlbnRlclwiO1xyXG4gIGNsb3NlSWNvbi5zdHlsZS5jdXJzb3IgPSBcInBvaW50ZXJcIjtcclxuICBjbG9zZUljb24uaW5uZXJIVE1MID0gYFxyXG4gICAgPHNwYW4gc3R5bGU9XCJjb2xvcjogd2hpdGU7IGZvbnQtZmFtaWx5OiAnQXJpYWwnLCBzYW5zLXNlcmlmOyBmb250LXNpemU6IDE2cHg7XCI+JnRpbWVzOzwvc3Bhbj5cclxuICBgO1xyXG5cclxuICBcclxuICAvLyBBcHBlbmQgY2xvc2UgaWNvbiB0byBvdmVybGF5XHJcbiAgb3ZlcmxheS5hcHBlbmRDaGlsZChjbG9zZUljb24pO1xyXG5cclxuICAvLyBBcHBlbmQgb3ZlcmxheSB0byB0aGUgYm9keVxyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3ZlcmxheSk7XHJcblxyXG4gIC8vIEFkZCBmdW5jdGlvbmFsaXR5IHRvIGNsb3NlIHRoZSBvdmVybGF5IHdoZW4gdGhlIGljb24gaXMgY2xpY2tlZFxyXG4gIGNsb3NlSWNvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgb3ZlcmxheS5yZW1vdmUoKTtcclxuICB9KTtcclxufVxyXG4iXSwibmFtZXMiOlsiY2hyb21lIiwicnVudGltZSIsIm9uTWVzc2FnZSIsImFkZExpc3RlbmVyIiwibWVzc2FnZSIsImFjdGlvbiIsImxvYWRpbmciLCJzaG93T3ZlcmxheSIsImVycm9yIiwicGxheWVyIiwibWF0Y2h1cHMiLCJhbmFseXNpcyIsImFyZ3VtZW50cyIsImxlbmd0aCIsInVuZGVmaW5lZCIsImVycm9yTWVzc2FnZSIsImV4aXN0aW5nT3ZlcmxheSIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJyZW1vdmUiLCJvdmVybGF5IiwiY3JlYXRlRWxlbWVudCIsImlkIiwic3R5bGUiLCJwb3NpdGlvbiIsInRvcCIsImxlZnQiLCJ0cmFuc2Zvcm0iLCJ6SW5kZXgiLCJwYWRkaW5nIiwiYmFja2dyb3VuZCIsImJvcmRlciIsImJveFNoYWRvdyIsImJvcmRlclJhZGl1cyIsImNvbG9yIiwibWluV2lkdGgiLCJtYXhXaWR0aCIsIm92ZXJmbG93V3JhcCIsImlubmVySFRNTCIsIm5hbWUiLCJ0ZWFtX25hbWUiLCJjbG9zZUljb24iLCJyaWdodCIsIndpZHRoIiwiaGVpZ2h0IiwiYmFja2dyb3VuZENvbG9yIiwiZGlzcGxheSIsImp1c3RpZnlDb250ZW50IiwiYWxpZ25JdGVtcyIsImN1cnNvciIsImFwcGVuZENoaWxkIiwiYm9keSIsImFkZEV2ZW50TGlzdGVuZXIiXSwic291cmNlUm9vdCI6IiJ9