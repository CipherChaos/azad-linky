document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  const page = path.split("/").pop();

  // Fixed mapping to match your JSON structure
  const map = {
    "courses-general.html": "general",
    "courses-fundamental.html": "fundamental",
    "courses-lab.html": "lab",
    "courses-languages.html": "language",  // Fixed: "language" not "languages"
    "courses-main.html": "main"            // Added: missing main category
  };

  const category = map[page];

  if (category) {
    fetch("data.json")
      .then((res) => res.json())
      .then((data) => {
        const courses = data.courses[category];
        if (courses) {
          renderCourses(courses, category);
        } else {
          console.error(`Category "${category}" not found in data`);
        }
      })
      .catch((err) => console.error("Error loading data:", err));
  }
});

function renderCourses(courses, category) {
  // Target the existing courses-grid container
  const container = document.querySelector(".courses-grid");
  
  if (!container) {
    console.error("courses-grid container not found");
    return;
  }

  // Clear existing content
  container.innerHTML = "";

  courses.forEach((course) => {
    // Create the course card HTML structure
    const article = document.createElement("article");
    article.className = "course-card";

    // Determine the appropriate CSS class for the course code
    const codeClass = getCourseCodeClass(category);
    
    // Build instructors HTML
    let instructorsHTML = "";
    if (course.instructors && course.instructors.length > 0) {
      instructorsHTML = course.instructors.map(instructor => 
        `<a href="${instructor.telegram}"><li class="instructor-badge">${instructor.name}</li></a>`
      ).join("");
    } else {
      instructorsHTML = '<li class="instructor-badge">استاد اعلام نشده</li>';
    }

    article.innerHTML = `
      <details>
        <summary class="course-summary">
          <div class="course-code ${codeClass}">${course.code}</div>
          <h2 class="course-title">${course.title}</h2>
          <div class="expand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>
        </summary>
        <div class="course-details">
          <h3 class="instructors-label">استاد ها</h3>
          <ul class="instructors-list">
            ${instructorsHTML}
          </ul>
        </div>
      </details>
    `;

    container.appendChild(article);
  });
}

// Helper function to get the appropriate CSS class for course codes
function getCourseCodeClass(category) {
  const classMap = {
    "main": "course-main",
    "general": "course-general", 
    "lab": "course-lab",
    "fundamental": "course-fundamental",
    "language": "course-language"
  };
  
  return classMap[category] || "";
}