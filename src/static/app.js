document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Deelnemerslijst genereren
        let participantsHTML = "";
        if (details.participants.length > 0) {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <ul class="participants-list">
                ${details.participants.map(p => `
                  <li class="participant-item">
                    <span class="participant-name">${p}</span>
                    <button class="delete-participant" title="Verwijder" data-activity="${name}" data-participant="${p}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c62828" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m5 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </li>
                `).join("")}
              </ul>
            </div>
          `;
        } else {
          participantsHTML = `
            <div class="participants-section empty">
              <strong>Participants:</strong>
              <span class="no-participants">No one signed up yet.</span>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
  messageDiv.textContent = result.message;
  messageDiv.className = "success";
  signupForm.reset();
  // Herlaad activiteiten zodat de deelnemerslijst direct wordt bijgewerkt
  activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
  fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();

  // Event delegation voor delete-knoppen
  activitiesList.addEventListener("click", async (event) => {
    const btn = event.target.closest(".delete-participant");
    if (!btn) return;
    const activity = btn.getAttribute("data-activity");
    const participant = btn.getAttribute("data-participant");
    if (!activity || !participant) return;

    try {
      const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(participant)}`, {
        method: "POST"
      });
      const result = await response.json();
      if (response.ok) {
        messageDiv.textContent = result.message || "Deelnemer verwijderd.";
        messageDiv.className = "success";
        // Herlaad activiteiten zodat de deelnemerslijst direct wordt bijgewerkt
        activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "Verwijderen mislukt.";
        messageDiv.className = "error";
      }
      messageDiv.classList.remove("hidden");
      setTimeout(() => messageDiv.classList.add("hidden"), 5000);
    } catch (error) {
      messageDiv.textContent = "Verwijderen mislukt. Probeer opnieuw.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error deleting participant:", error);
    }
  });
});
