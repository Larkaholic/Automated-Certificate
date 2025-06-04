import { app } from "./firebase.js";

// Initialize Firestore using the global firebase object from CDN
const db = firebase.firestore();

// Fetch all events and populate the dropdown
async function populateEventDropdown() {
    const eventSelect = document.getElementById("eventSelect");
    if (!eventSelect) {
        console.log("eventSelect element not found");
        return;
    }

    eventSelect.innerHTML = `<option value="">-- Choose an event --</option>`;

    console.log("Fetching events from Firestore...");
    const snapshot = await db.collection("events").get();
    console.log("Events snapshot:", snapshot);

    if (snapshot.empty) {
        console.log("No events found in Firestore.");
        eventSelect.innerHTML = `<option value="">No events found</option>`;
        return;
    }

    // Optional: sort by name in JS if you want
    const docs = snapshot.docs.sort((a, b) => {
        const aName = (a.data().name || "").toLowerCase();
        const bName = (b.data().name || "").toLowerCase();
        return aName.localeCompare(bName);
    });

    docs.forEach(doc => {
        const data = doc.data();
        console.log("Event doc:", doc.id, data);
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = data.name || `Event (${doc.id})`;
        eventSelect.appendChild(option);
    });
}

// Load questions for a specific event
async function loadFeedbackForm(eventId) {
    const formContainer = document.getElementById("dynamicFeedbackForm");
    if (!formContainer) {
        console.log("dynamicFeedbackForm element not found");
        return;
    }

    formContainer.innerHTML = ""; // Clear previous content

    if (!eventId) {
        console.log("No event selected.");
        formContainer.innerHTML = "<div class='text-center text-gray-600'>Please select an event to view questions.</div>";
        return;
    }

    console.log(`Fetching questions for eventId: ${eventId}`);
    const questionsRef = db.collection("events").doc(eventId).collection("questions");
    const questionsSnapshot = await questionsRef.orderBy("createdAt", "asc").get();
    console.log("Questions snapshot:", questionsSnapshot);

    if (questionsSnapshot.empty) {
        console.log("No questions found for this event.");
        formContainer.innerHTML = "<div class='text-center text-red-600'>No questions found for this event.</div>";
        return;
    }

    questionsSnapshot.forEach((doc, idx) => {
        const q = doc.data();
        console.log("Question doc:", doc.id, q);
        const div = document.createElement("div");
        div.className = "mb-4";
        div.innerHTML = `
            <label class="block text-lg font-medium mb-2">${q.text}</label>
            ${
                q.type === "rating"
                ? `<div class="flex gap-4">
                        ${[1,2,3,4,5].map(num => `
                            <label class="flex flex-col items-center">
                                <input type="radio" name="answer${idx + 1}" value="${num}" class="form-radio text-blue-600" />
                                <span>${num}</span>
                            </label>
                        `).join('')}
                   </div>`
                : `<input type="text" name="answer${idx + 1}" class="w-full px-4 py-2 border border-gray-400 rounded-xl shadow-xl focus:outline-none" />`
            }
        `;
        formContainer.appendChild(div);
    });

    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.textContent = "Submit Feedback";
    submitBtn.className = "bg-black text-white px-4 py-2 rounded hover:bg-blue-700";
    formContainer.appendChild(submitBtn);
}

// Listen for event selection changes
function setupEventSelection() {
    const eventSelect = document.getElementById("eventSelect");
    if (!eventSelect) {
        console.log("eventSelect element not found for event listener");
        return;
    }
    eventSelect.addEventListener("change", (e) => {
        const eventId = e.target.value;
        console.log("Event selected:", eventId);
        loadFeedbackForm(eventId);
    });
}

window.addEventListener("DOMContentLoaded", async () => {
    console.log("DOMContentLoaded");
    await populateEventDropdown();
    setupEventSelection();
    loadFeedbackForm(null);
});
