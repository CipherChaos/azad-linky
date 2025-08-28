document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  const page = path.split("/").pop();

  
  const map = {
    "courses-general.html": "general",
    "courses-fundamental.html": "fundamental",
    "courses-lab.html": "lab",
    "courses-languages.html": "language",  
    "courses-main.html": "main"            
  };

  const category = map[page];

  if (category) {
    fetch("/public/data.json")
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


//_______________ Filter Json for FAQ part _________________

document.addEventListener('DOMContentLoaded', function() {
    // Fetch the JSON data
    fetch("/public/data.json")
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Get the container for the cards
            const container = document.querySelector('.courses-grid.help-grid');
            
            // Clear any existing static content
            container.innerHTML = '';
            
            // Determine which page we're on based on URL or other indicator
            const isFAQPage = window.location.pathname.includes('faq') || 
                              document.body.classList.contains('faq-page');
            const isGuidePage = window.location.pathname.includes('guide') || 
                                document.body.classList.contains('guide-page');
            
            // Create cards for FAQ items if we're on the FAQ page
            if (isFAQPage && data.faqs && Array.isArray(data.faqs)) {
                data.faqs.forEach(faq => {
                    const card = createCard(faq, 'faq');
                    container.appendChild(card);
                });
            }
            // Create cards for Guide items if we're on the Guide page
            else if (isGuidePage && data.guide && Array.isArray(data.guide)) {
                data.guide.forEach(guideItem => {
                    const card = createCard(guideItem, 'guide');
                    container.appendChild(card);
                });
            }
            // Fallback: if we can't determine the page type, show all content
            else {
                // Create cards for FAQ items if they exist
                if (data.faqs && Array.isArray(data.faqs)) {
                    data.faqs.forEach(faq => {
                        const card = createCard(faq, 'faq');
                        container.appendChild(card);
                    });
                }
                
                // Create cards for Guide items if they exist
                if (data.guide && Array.isArray(data.guide)) {
                    data.guide.forEach(guideItem => {
                        const card = createCard(guideItem, 'guide');
                        container.appendChild(card);
                    });
                }
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            // You might want to show an error message to the user here
        });
});

function createCard(item, type) {
    // Check if the item is valid
    if (!item || (type === 'faq' && !item.question) || (type === 'guide' && !item.title)) {
        console.warn('Invalid item skipped:', item);
        return document.createDocumentFragment(); // Return empty fragment
    }
    
    // Create the article element
    const article = document.createElement('article');
    article.className = 'course-card';
    if (type === 'guide') {
        article.classList.add('guide-card');
    }
    
    // Create the details element
    const details = document.createElement('details');
    
    // Create the summary element
    const summary = document.createElement('summary');
    summary.className = 'course-summary';
    
    // Create the title
    const title = document.createElement('h2');
    title.className = 'course-title';
    title.textContent = type === 'guide' ? item.title : item.question;
    
    // Create the expand icon
    const expandIcon = document.createElement('div');
    expandIcon.className = 'expand-icon';
    expandIcon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
    `;
    
    // Add title and icon to summary
    summary.appendChild(title);
    summary.appendChild(expandIcon);
    
    // Create the details content
    const content = document.createElement('div');
    content.className = 'course-details';
    
    // Create the paragraph for the answer/content
    const paragraph = document.createElement('p');
    
    // Get the text content based on type
    let contentText = type === 'guide' ? item.content : item.answer;
    
    // Handle special cases where links are needed (only for FAQs)
    if (type === 'faq') {
        if (item.question.includes("از لیست ارائه ها گروهی پیدا نکردم") || 
            item.question.includes("اگه گروهی بر روی سایت قرار نداشت") ||
            item.question.includes("من هم می توانم لینک بر روی سایت قرار بدم")) {
            contentText = contentText.replace("گزارش مشکل", 
                '<a class="btn--link" href="https://t.me/Ariyan_Bolandi">گزارش مشکل</a>');
        }
        
        if (item.question.includes("برای استفاده از سایت باید هزینه ای پرداخت کنم")) {
            contentText = contentText.replace("توسعه دهنده", 
                '<a class="btn--link" href="aboutme.html">توسعه دهنده</a>');
        }
        
        if (item.question.includes("من چند تا ایده خوب دارم برای سایت")) {
            contentText = contentText.replace("مراحل مشارکت:", 
                '<a class="btn--link" href="https://www.freecodecamp.org/news/git-and-github-workflow-for-open-source/">مراحل مشارکت:</a>');
        }
    }
    
    paragraph.innerHTML = contentText;
    
    // Add paragraph to content
    content.appendChild(paragraph);
    
    // Add summary and content to details
    details.appendChild(summary);
    details.appendChild(content);
    
    // Add details to article
    article.appendChild(details);
    
    return article;
}