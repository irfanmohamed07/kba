document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    const links = document.querySelectorAll('.sidebar a');
  
    links.forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        
        // Remove the 'active' class from all sections
        sections.forEach(section => section.classList.remove('active'));
  
        // Remove the 'active' class from all links
        links.forEach(l => l.classList.remove('active'));
  
        // Add 'active' class to the clicked link and corresponding section
        this.classList.add('active');
        const sectionId = this.getAttribute('href').substring(1);
        document.getElementById(`${sectionId}-section`).classList.add('active');
      });
    });
  });
  