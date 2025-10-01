document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  const page = path.split("/").pop();

  
  const map = {
    "courses-general.html": "general",
    "courses-fundamental.html": "fundamental",
    "courses-lab.html": "lab",
    "courses-languages.html": "language",  
    "courses-main.html": "main" ,
    "courses-practical.html": "practical",
  };

  const category = map[page];

  if (category) {
    fetch("../../../public/data.json")
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
  
  const container = document.querySelector(".courses-grid");
  
  if (!container) {
    console.error("courses-grid container not found");
    return;
  }

  
  container.innerHTML = "";

  courses.forEach((course) => {
    
    const article = document.createElement("article");
    article.className = "course-card";

    
    const codeClass = getCourseCodeClass(category);
    
    
    let instructorsHTML = "";
    if (course.instructors && course.instructors.length > 0) {
      instructorsHTML = course.instructors.map(instructor => {
        const gender = instructor.gender || "male";
        const bgColor = gender === "female" ? "var(--accent-pink)" : "var(--accent-color)";
        return `<a href="${instructor.telegram}"><li class="instructor-badge" style="--badge-bg: ${bgColor}">${instructor.name}</li></a>`;
      }).join("");
    } else {
      instructorsHTML = '<li class="instructor-badge" style="--badge-bg: var(--accent-color)">استاد اعلام نشده</li>';
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


function getCourseCodeClass(category) {
  const classMap = {
    "main": "course-main",
    "general": "course-general", 
    "lab": "course-lab",
    "fundamental": "course-fundamental",
    "language": "course-language",
    "practical": "course-practical"

  };
  
  return classMap[category] || "";
}


//_______________ Filter Json for FAQ part _________________

document.addEventListener('DOMContentLoaded', function() {
    
    fetch("../../public/data.json")
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            
            const container = document.querySelector('.courses-grid.help-grid');
            
            
            container.innerHTML = '';
            
            
            const isFAQPage = window.location.pathname.includes('faq') || 
                              document.body.classList.contains('faq-page');
            const isGuidePage = window.location.pathname.includes('guide') || 
                                document.body.classList.contains('guide-page');
            
           
            if (isFAQPage && data.faqs && Array.isArray(data.faqs)) {
                data.faqs.forEach(faq => {
                    const card = createCard(faq, 'faq');
                    container.appendChild(card);
                });
            }
            
            else if (isGuidePage && data.guide && Array.isArray(data.guide)) {
                data.guide.forEach(guideItem => {
                    const card = createCard(guideItem, 'guide');
                    container.appendChild(card);
                });
            }
            
            else {
               
                if (data.faqs && Array.isArray(data.faqs)) {
                    data.faqs.forEach(faq => {
                        const card = createCard(faq, 'faq');
                        container.appendChild(card);
                    });
                }
                
                
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
           
        });
});

function createCard(item, type) {
    
    if (!item || (type === 'faq' && !item.question) || (type === 'guide' && !item.title)) {
        console.warn('Invalid item skipped:', item);
        return document.createDocumentFragment(); 
    }
    
    
    const article = document.createElement('article');
    article.className = 'course-card';
    if (type === 'guide') {
        article.classList.add('guide-card');
    }
    
    
    const details = document.createElement('details');
    
    
    const summary = document.createElement('summary');
    summary.className = 'course-summary';
    
    
    const title = document.createElement('h2');
    title.className = 'course-title';
    title.textContent = type === 'guide' ? item.title : item.question;
    
    
    const expandIcon = document.createElement('div');
    expandIcon.className = 'expand-icon';
    expandIcon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
    `;
    
    
    summary.appendChild(title);
    summary.appendChild(expandIcon);
    
    
    const content = document.createElement('div');
    content.className = 'course-details';
    
    
    const paragraph = document.createElement('p');
    
    
    let contentText = type === 'guide' ? item.content : item.answer;
    
    
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
    
    
    content.appendChild(paragraph);
    
    
    details.appendChild(summary);
    details.appendChild(content);
    
    
    article.appendChild(details);
    
    return article;
}