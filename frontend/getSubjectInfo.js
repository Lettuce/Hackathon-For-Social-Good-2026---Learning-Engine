let subjectName = "";

document.addEventListener("DOMContentLoaded", async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  subjectName = urlParams.get("name") ?? "";

  let subjectTitle = subjectName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  setupUI(subjectTitle);
  
  const questions = await getQuestions(subjectName);
  renderChoices(questions);

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
    const { choices: choicesArray, difficulty, question, resourceId } = questionObj;
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

    const answerResult = document.createElement("p");
    answerResult.id = resourceId;
    questionGroup.appendChild(answerResult);

    parentContainer.appendChild(questionGroup);
  });
}

function getAnswers(formElement) {
  const formData = new FormData(formElement);
  return Object.fromEntries(formData.entries());
}