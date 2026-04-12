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
  const choices = await getChoices(subjectName);
  renderChoices(choices);
});

function setupUI(subjectTitle) {
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

    questions.forEach((questionObj) => {
      const pTag = document.createElement("p");
      // Access the string property inside the object
      pTag.textContent = questionObj.question;

      // Route to the correct container based on the difficulty property
      if (questionObj.difficulty === "easy") {
        easyElement.appendChild(pTag);
      } else if (questionObj.difficulty === "medium") {
        mediumElement.appendChild(pTag);
      } else if (questionObj.difficulty === "hard") {
        hardElement.appendChild(pTag);
      }
    });
  }
}

function getChoices(subjectName) {
  return fetch(`/data/subjects/${subjectName}/questions.json`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      return Array.isArray(data) ? data : data.choices;
    })
    .catch((error) => {
      console.error("Could not fetch questions:", error);
      return [];
    });
}

function renderChoices(choices) {
  if (!choices) return;

  const containers = {
    easy: document.getElementById("easy"),
    medium: document.getElementById("medium"),
    hard: document.getElementById("hard"),
  };

  // Validate and CLEAR containers to prevent duplicates
  for (const [key, element] of Object.entries(containers)) {
    if (!element) {
      console.error(`Target element #${key} not found in DOM`);
      return;
    }
    element.innerHTML = ""; // Clear the container before rendering
  }

  choices.forEach((questionObj, qIndex) => {
    const { choices: choicesArray, difficulty, question } = questionObj;
    const parentContainer = containers[difficulty];

    if (!parentContainer) return;

    const questionGroup = document.createElement("div");
    questionGroup.className = "question-group";

    const questionTitle = document.createElement("p");
    questionTitle.textContent = question;
    questionGroup.appendChild(questionTitle);
    
    choicesArray.forEach((choice, cIndex) => {
      const choiceWrapper = document.createElement("div");
      const inputElement = document.createElement("input");
      const uniqueId = `choice-${difficulty}-${qIndex}-${cIndex}`;

      inputElement.type = "radio";
      inputElement.value = choice;
      inputElement.id = uniqueId;
      inputElement.name = `question-${difficulty}-${qIndex}`;

      const label = document.createElement("label");
      label.htmlFor = uniqueId;
      label.textContent = choice;

      choiceWrapper.append(inputElement, label);
      questionGroup.appendChild(choiceWrapper);
    });

    parentContainer.appendChild(questionGroup);
  });
}