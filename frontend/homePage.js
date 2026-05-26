
function logoutButton() {
  API.logout();
  window.location.href = "login.html";
}

function getSubjects() {
  return fetch("/data/subjects.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Could not fetch subjects:", error);
      return null;
    });
}

if (!API.loggedIn()) {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
const auth = API.currentAuth();
if (auth) {
  const username = auth.username;
  document.getElementById("welcome-message").textContent = `Welcome back, ${username}!`;
} else {
  console.log("No user is currently logged in.");
}

  // Execute the function and handle the resulting promise
  getSubjects().then(async (subjectsData) => {
    if (!subjectsData) return;
    
    console.log("Fetched Subjects Data:", subjectsData);
    const subjectsElement = document.getElementById("subjects");

    if (!subjectsElement) {
      console.error("Target element #subjects not found in DOM");
      return;
    }

    // Fetch the data ONCE before starting the loop
    const completedSubjects = await API.getCompletedSubjects() || [];

    // This loop runs synchronously now and won't throw errors
    subjectsData.forEach((subject) => {
      const pSubjectName = document.createElement("p");
      const aElement = document.createElement("a");
      const pProgress = document.createElement("p");
      const fieldsetElement = document.createElement("fieldset");

      pProgress.id = "progress";

      // Use the fetched completedSubjects array here
      const isCompleted = completedSubjects.includes(subject);
      pProgress.textContent = isCompleted ? "✅" : "";

      // Configure the link with a query parameter
      let subjectTitle = subject
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

      aElement.textContent = subjectTitle;
      aElement.href = `subject.html?name=${subject}`;

      // Nest and append
      pSubjectName.appendChild(aElement);
      fieldsetElement.appendChild(pSubjectName);
      fieldsetElement.appendChild(pProgress);
      subjectsElement.appendChild(fieldsetElement);
    });
  });
});