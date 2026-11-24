// As soon as the page loads, checks if there is an active session (function from auth.js)
const currentUser = getLoggedInUser();

if (currentUser) {
    // Fills the name and profile in the top right corner
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-profile').textContent = currentUser.profile_name;

    // Role-Based Access Control (RBAC): If not Admin, hides the Administration menu
    if (currentUser.profile_name !== 'Admin') {
        const adminMenu = document.getElementById('admin-menu-group');
        if (adminMenu) {
            adminMenu.classList.add('d-none');
        }
    }
}

/**
 * Function to switch between views without reloading the page.
 * @param {string} viewName - Ex: 'monitoring', 'retention', 'users', 'telemetry'
 * @param {HTMLElement} clickedLink - The sidebar menu button that was clicked
 */
function switchView(viewName, clickedLink) {
    // Hides all sections by adding Bootstrap's 'd-none' class
    const allSections = document.querySelectorAll('.view-section');
    allSections.forEach((section) => section.classList.add('d-none'));

    // Shows only the chosen section by removing 'd-none'
    const targetSection = document.getElementById('view-' + viewName);
    if (targetSection) {
        targetSection.classList.remove('d-none');
    }

    // Removes the 'active' highlight from all menu links and applies it only to the clicked one
    const allLinks = document.querySelectorAll('.sidebar .nav-link');
    allLinks.forEach((link) => link.classList.remove('active'));
    if (clickedLink) {
        clickedLink.classList.add('active');
    }

    // Updates the title in the top bar
    const titles = {
        monitoring: 'Monitoring & Risk Diagnosis',
        retention: 'Retention Actions Management',
        users: 'Users & Profiles Administration',
        telemetry: 'Usability & Decision Time Metrics (HCI)'
    };
    document.getElementById('page-title').textContent = titles[viewName] || 'ChurnGuard';
}