document.addEventListener("DOMContentLoaded", async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const subjectName = urlParams.get("name") || "";

  let subjectTitle = subjectName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  setupUI(subjectTitle);
});

function setupUI(subjectTitle) {
  const legendElement = document.getElementById("formlegend");
  if (legendElement) legendElement.textContent = subjectTitle;

  const h1Element = document.getElementById("h1");
  if (h1Element) h1Element.textContent = subjectTitle;
}

function getQuestions(subjectName) {
  return fetch(`../backend/data/${subjectName}/questions.json`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      return data.map((item) => item.questions);
    })
    .catch((error) => {
      console.error("Could not fetch subjects:", error);
      return null;
    });
}

function renderQuestions(questions) {
  if (questions) {
    console.log("Fetched Subjects Data:", questions);
    const questionsElement = document.getElementById("questions");

    if (!questionsElement) {
      console.error("Target element #questions not found in DOM");
      return;
    }

    questions.forEach((question) => {
      const pTag = document.createElement("p");
      pTag.textContent = question;
      questionsElement.appendChild(pTag);
    });
  }
}