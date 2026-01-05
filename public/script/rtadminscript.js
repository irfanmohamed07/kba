document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.sidebar a');
    const sections = document.querySelectorAll('.content-section');
  
    // Function to handle section visibility
    function showSection(sectionId) {
      sections.forEach(section => {
        if (section.id === sectionId) {
          section.classList.add('active');
        } else {
          section.classList.remove('active');
        }
      });
    }
  
    // Initially show the users section
    showSection('pendinggatepass-section');
  
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
  
        // Determine which section to show based on the link clicked
        const sectionId = link.id.replace('-link', '-section');
        showSection(sectionId);
      });
    });
  });
  function filterTable(tbodyId, searchInput) {
    // Get the filter text
    const filter = searchInput.value.toLowerCase();
  
    // Get the tbody and all its rows
    const tbody = document.getElementById(tbodyId);
    const rows = tbody.getElementsByTagName("tr");
  
    // Loop through rows to hide/show based on the search term
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      let match = false;
  
      // Check each cell in the row
      const cells = row.getElementsByTagName("td");
      for (let j = 0; j < cells.length - 1; j++) { // Skip the 'Action' column
        const cell = cells[j];
        if (cell && cell.textContent.toLowerCase().includes(filter)) {
          match = true;
          break;
        }
      }
  
      // Show or hide the row based on the match
      row.style.display = match ? "" : "none";
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    // Select all password toggle icons
    const toggleButtons = document.querySelectorAll('.password-toggle');
  
    toggleButtons.forEach(toggleButton => {
      toggleButton.addEventListener('click', function () {
        // Find the sibling input field of type "password"
        const passwordInput = this.previousElementSibling;
  
        if (passwordInput && passwordInput.type === 'password') {
          // Show password
          passwordInput.type = 'text';
          this.classList.remove('fa-eye');
          this.classList.add('fa-eye-slash');
        } else if (passwordInput && passwordInput.type === 'text') {
          // Hide password
          passwordInput.type = 'password';
          this.classList.remove('fa-eye-slash');
          this.classList.add('fa-eye');
        }
      });
    });
  });
  
 
document.addEventListener("DOMContentLoaded", function() {
  const menu = document.querySelector(".three-dot-menu");
  const menuItems = document.querySelectorAll(".menu-content a");
  const sections = document.querySelectorAll(".content-section");

  // Toggle menu visibility
  menu.addEventListener("click", function() {
    menu.classList.toggle("active");
  });

  // Close the menu if clicked outside
  window.addEventListener("click", function(event) {
    if (!menu.contains(event.target)) {
      menu.classList.remove("active");
    }
  });

  // Handle menu item clicks
  menuItems.forEach(item => {
    item.addEventListener("click", function(event) {
      event.preventDefault();
      const targetSectionId = item.getAttribute("data-section");
      
      // Hide all sections
      sections.forEach(section => {
        section.classList.remove("active");
      });

      // Show the selected section
      const targetSection = document.getElementById(targetSectionId);
      if (targetSection) {
        targetSection.classList.add("active");
      }

      // Close the menu after selection
      menu.classList.remove("active");
    });
  });
});
