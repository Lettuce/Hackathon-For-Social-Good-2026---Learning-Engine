function getSubjects() {
  return fetch("../backend/data/subjects.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Extract the "subject" property from each object in the array
      return data.map((item) => item.subject);
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
      const pTag = document.createElement("p");
      const aTag = document.createElement("a");

      // Configure the link
      aTag.textContent = subject;
      aTag.href = `${subject}.html`;

      // Nest and append
      pTag.appendChild(aTag);
      subjectsElement.appendChild(pTag);
    });
  }
});