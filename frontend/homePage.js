function getSubjects() {
  return fetch("/data/subjects.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      return data.subject.map((item) => item);
    })
    .catch((error) => {
      console.error("Could not fetch subjects:", error);
      return null;
    });
}

// Execute the function and handle the resulting promise
getSubjects().then((subjectsData) => {
  if (subjectsData) {
    console.log("Fetched Subjects Data:", subjectsData);
    const subjectsElement = document.getElementById("subjects");

    if (!subjectsElement) {
      console.error("Target element #subjects not found in DOM");
      return;
    }

    subjectsData.forEach((subject) => {
    const pElement = document.createElement("p");
    const aElement = document.createElement("a");
    const fieldsetElement = document.createElement("fieldset");

    // Configure the link with a query parameter
    aElement.textContent = subject;
    aElement.href = `subject.html?name=${subject}`;

    // Nest and append
    pElement.appendChild(aElement);
    fieldsetElement.appendChild(pElement);
    subjectsElement.appendChild(fieldsetElement);
    });
  }
});