document.addEventListener("DOMContentLoaded", async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const subjectName = urlParams.get("name") || "";

  let subjectTitle = subjectName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  setupUI(subjectTitle);
  
  const questions = await getQuestions(subjectName);
  renderQuestions(questions);
});

function setupUI(subjectTitle) {
  const legendElement = document.getElementById("formlegend");
  if (legendElement) legendElement.textContent = `${subjectTitle} Questions`;

  const h1Element = document.getElementById("h1");
  if (h1Element) h1Element.textContent = subjectTitle;
}

function getQuestions(subjectName) {
  return fetch(`/data/subjects/${subjectName}/questions.json`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      return Array.isArray(data) ? data : data.questions;
    })
    .catch((error) => {
      console.error("Could not fetch questions:", error);
      return [];
    });
}

function renderQuestions(questions) {
  if (questions) {
    console.log("Fetched Subjects Data:", questions);
    const easyElement = document.getElementById("easy");
    const mediumElement = document.getElementById("medium");
    const hardElement = document.getElementById("hard");

    if (!easyElement) {
      console.error("Target element #eazy not found in DOM");
      return;
    }

    if (!mediumElement) {
      console.error("Target element #medium not found in DOM");
      return;
    }

    if (!hardElement) {
      console.error("Target element #hard not found in DOM");
      return;
    }

    questions.forEach((question) => {
      const pTag = document.createElement("p");
      pTag.textContent = question;
      easyElement.appendChild(pTag);
    });
  }
}