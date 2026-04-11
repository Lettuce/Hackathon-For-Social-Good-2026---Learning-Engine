async function fetchSubjects() {
  try {
    const response = await fetch("../backend/data/subjects.json");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Could not fetch subjects:", error);
    return null;
  }
}

(async () => {
  const subjectsData = await fetchSubjects();
  if (subjectsData) {
    console.log("Fetched Subjects Data:", subjectsData);
  }
})();