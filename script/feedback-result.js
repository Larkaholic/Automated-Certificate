import { app } from "./firebase.js";

// Initialize Firestore using the global firebase object from CDN
const db = firebase.firestore();

const eventSelect = document.getElementById("eventSelect");
const resultsContainer = document.getElementById("resultsContainer");

// Populate event dropdown
async function populateEventDropdown() {
    if (!eventSelect) return;

    eventSelect.innerHTML = `<option value="">-- Select an event --</option>`;

    const snapshot = await db.collection("events").orderBy("createdAt", "asc").get();

    if (snapshot.empty) {
        eventSelect.innerHTML = `<option value="">No events found</option>`;
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = data.name || `Event (${doc.id})`;
        eventSelect.appendChild(option);
    });
}

// Fetch all event titles and display all events, questions, and answers
async function loadEventsAndResults() {
    const eventsSnapshot = await db.collection("events").get();
    eventSelect.innerHTML = `<option value="">-- Select an event --</option>`;
    let allEventsHtml = "";

    for (const doc of eventsSnapshot.docs) {
        const eventTitle = doc.id;
        // Add to select
        const option = document.createElement("option");
        option.value = eventTitle;
        option.textContent = eventTitle;
        eventSelect.appendChild(option);

        // Fetch questions
        const questionsSnap = await db.collection("events").doc(eventTitle).collection("questions").orderBy("createdAt", "asc").get();
        const questions = [];
        questionsSnap.forEach(qdoc => {
            questions.push({ id: qdoc.id, ...qdoc.data() });
        });

        // Fetch responses
        const responsesSnap = await db.collection("events").doc(eventTitle).collection("responses").get();
        const responses = [];
        responsesSnap.forEach(rdoc => {
            responses.push(rdoc.data());
        });

        // Build HTML for this event
        let html = `
            <div class="mb-12">
                <h2 class="text-2xl font-bold mb-2 mt-8">${eventTitle}</h2>
        `;

        if (questions.length === 0) {
            html += `<div class="text-center text-red-600">No questions found for this event.</div>`;
        } else {
            html += `
                <table class="w-full mb-4 border">
                    <thead>
                        <tr>
                            <th class="border px-4 py-2">Question</th>
                            <th class="border px-4 py-2">Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${questions.map((q, idx) => `
                            <tr>
                                <td class="border px-4 py-2 font-semibold">${idx + 1}. ${q.text}</td>
                                <td class="border px-4 py-2">${q.type === "rating" ? "Rating (1-5)" : "Text"}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            `;
        }

        if (responses.length === 0) {
            html += `<div class="text-center text-gray-600">No feedback responses submitted yet.</div>`;
        } else {
            html += `
                <h3 class="text-xl font-bold mb-2">Responses</h3>
                <div class="overflow-x-auto">
                <table class="w-full border">
                    <thead>
                        <tr>
                            <th class="border px-4 py-2">#</th>
                            <th class="border px-4 py-2">Name</th>
                            <th class="border px-4 py-2">Email</th>
                            ${questions.map((q, idx) => `<th class="border px-4 py-2">Q${idx + 1}</th>`).join("")}
                        </tr>
                    </thead>
                    <tbody>
                        ${responses.map((resp, idx) => `
                            <tr>
                                <td class="border px-4 py-2">${idx + 1}</td>
                                <td class="border px-4 py-2">${resp.name || ""}</td>
                                <td class="border px-4 py-2">${resp.email || ""}</td>
                                ${questions.map((q, qidx) => {
                                    const ans = resp.answers && resp.answers[q.id];
                                    return `<td class="border px-4 py-2">${ans !== undefined ? ans : ""}</td>`;
                                }).join("")}
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
                </div>
            `;
        }

        html += `</div>`;
        allEventsHtml += html;
    }

    resultsContainer.innerHTML = allEventsHtml;
}

// When an event is selected, show only that event's results
async function displayResultsForEvent(eventTitle) {
    if (!eventTitle) {
        await loadEventsAndResults();
        return;
    }
    resultsContainer.innerHTML = "";

    // Fetch questions
    const questionsSnap = await db.collection("events").doc(eventTitle).collection("questions").orderBy("createdAt", "asc").get();
    const questions = [];
    questionsSnap.forEach(doc => {
        questions.push({ id: doc.id, ...doc.data() });
    });

    // Fetch responses
    const responsesSnap = await db.collection("events").doc(eventTitle).collection("responses").get();
    const responses = [];
    responsesSnap.forEach(doc => {
        responses.push(doc.data());
    });

    // Build HTML for this event
    let html = `
        <div class="mb-12">
            <h2 class="text-2xl font-bold mb-2 mt-8">${eventTitle}</h2>
    `;

    if (questions.length === 0) {
        html += `<div class="text-center text-red-600">No questions found for this event.</div>`;
    } else {
        html += `
            <table class="w-full mb-4 border">
                <thead>
                    <tr>
                        <th class="border px-4 py-2">Question</th>
                        <th class="border px-4 py-2">Type</th>
                    </tr>
                </thead>
                <tbody>
                    ${questions.map((q, idx) => `
                        <tr>
                            <td class="border px-4 py-2 font-semibold">${idx + 1}. ${q.text}</td>
                            <td class="border px-4 py-2">${q.type === "rating" ? "Rating (1-5)" : "Text"}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    }

    if (responses.length === 0) {
        html += `<div class="text-center text-gray-600">No feedback responses submitted yet.</div>`;
    } else {
        html += `
            <h3 class="text-xl font-bold mb-2">Responses</h3>
            <div class="overflow-x-auto">
            <table class="w-full border">
                <thead>
                    <tr>
                        <th class="border px-4 py-2">#</th>
                        <th class="border px-4 py-2">Name</th>
                        <th class="border px-4 py-2">Email</th>
                        ${questions.map((q, idx) => `<th class="border px-4 py-2">Q${idx + 1}</th>`).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${responses.map((resp, idx) => `
                        <tr>
                            <td class="border px-4 py-2">${idx + 1}</td>
                            <td class="border px-4 py-2">${resp.name || ""}</td>
                            <td class="border px-4 py-2">${resp.email || ""}</td>
                            ${questions.map((q, qidx) => {
                                const ans = resp.answers && resp.answers[q.id];
                                return `<td class="border px-4 py-2">${ans !== undefined ? ans : ""}</td>`;
                            }).join("")}
                        </tr>
                    `).join("")}
                </tbody>
            </table>
            </div>
        `;
    }

    html += `</div>`;
    resultsContainer.innerHTML = html;
}

eventSelect.addEventListener("change", async (e) => {
    const eventTitle = e.target.value;
    await displayResultsForEvent(eventTitle);
});

window.addEventListener("DOMContentLoaded", async () => {
    await populateEventDropdown();
    await loadEventsAndResults();
});
