let subjectName = "";

document.addEventListener("DOMContentLoaded", async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  subjectName = urlParams.get("name") || "";

  let subjectTitle = subjectName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  setupUI(subjectTitle);
  
  const questions = await getQuestions(subjectName);
  renderQuestions(questions);
  const choices = await getChoices(subjectName);
  renderChoices(choices);

  const form = document.getElementById("form");
  form.addEventListener("submit", (event) => {
    event.preventDefault(); 
    formSubmission(event)
  });
});

function setupUI(subjectTitle) {
  const imageMap = {
    Astronomy:
      "https://upload.wikimedia.org/wikipedia/commons/b/b8/Laser_Towards_Milky_Ways_Centre.jpg",
    Biology: "https://www.susla.edu/assets/susla/images/Biology.jpg",
    Chemistry:
      "https://www.chemicals.co.uk/wp-content/uploads/2021/09/molecules-and-formula-graphic-scaled.jpg.webp",
    "Computer Science":
      "https://blog.engineering.vanderbilt.edu/hubfs/AdobeStock_588772865.jpeg",
    Geology:
      "https://upload.wikimedia.org/wikipedia/commons/c/c6/Marsh_Butte_and_Geikie_Peak%2C_Grand_Canyon.jpg",
  };

  const h1Element = document.getElementById("h1");
  if (h1Element) h1Element.textContent = subjectTitle;

  const imgElement = document.getElementById("img");
  if (imgElement && imageMap[subjectTitle]) {
    imgElement.src = imageMap[subjectTitle];
    imgElement.alt = `Illustration for ${subjectTitle}`;
  }
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
    
    const questionId = questionObj.id;

    choicesArray.forEach((choice, cIndex) => {
      const choiceWrapper = document.createElement("div");
      const inputElement = document.createElement("input");
      const uniqueId = `choice-${difficulty}-${qIndex}-${cIndex}`;

      inputElement.type = "radio";
      inputElement.required = "required";
      inputElement.value = cIndex;
      inputElement.id = uniqueId;
      inputElement.name = questionId;

      const label = document.createElement("label");
      label.htmlFor = uniqueId;
      label.textContent = choice;

      choiceWrapper.append(inputElement, label);
      questionGroup.appendChild(choiceWrapper);
    });

    parentContainer.appendChild(questionGroup);
  });
}

async function formSubmission(event)
{
    const answers = getAnswers(event.target);
    console.log(answers);

    const mapObject = (object, func) => Object.fromEntries(Object.entries(object).map(([k, v]) => [k, func(k, v)]));
    const processedAnswers = mapObject(answers, (k, v) => v|0);
    let feedback = await API.submitAnswers(subjectName, processedAnswers);

    feedback = Object.entries(feedback).map(([k, v]) => v);
    feedback = feedback.filter((i) => i);
    const trueAnswers = feedback.length;
  
    console.log(trueAnswers);

    const result = document.createElement("div");
    const resultText = document.createElement("p");
    
    resultText.textContent = `You got ${trueAnswers} correct out of 6`;
    result.appendChild(resultText);
    const body = document.getElementById("body");
    body.appendChild(result);
}

function getAnswers(formElement) {
  const formData = new FormData(formElement);
  return Object.fromEntries(formData.entries());

  let data = {};

  for (let [key, value] of formData.entries()) {
    // value is returned as a string from FormData, 
    // convert to Number if your API expects integers
    data[key] = parseInt(value, 10);
  }

  return data;
}