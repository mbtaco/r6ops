// Use the global r6operators object from CDN
// No need to import or require

// Load operator data from JSON file
let operators = [];

// Fetch operator data
fetch('operator-data.json')
    .then(response => response.json())
    .then(data => {
        // Convert the object to an array of operators
        operators = Object.values(data).map(operator => {
            // Check if role exists and handle it properly
            const role = operator.role ? operator.role.toLowerCase() : 'unknown';
            
            return {
                id: operator.id || '',
                name: operator.name || '',
                role: role,
                organization: operator.org || 'Unknown',
                unit: operator.squad || 'Unknown',
                armor: operator.ratings?.health || 1,
                speed: operator.ratings?.speed || 1,
                difficulty: operator.ratings?.difficulty || 1,
                bio: operator.bio?.real_name ? `${operator.bio.real_name} - ${operator.bio.birthplace}` : 'No bio available',
                season: operator.meta?.season || 'Unknown',
                country: operator.meta?.country || 'Unknown',
                gender: operator.meta?.gender || 'Unknown',
                height: operator.meta?.height || 'Unknown',
                weight: operator.meta?.weight || 'Unknown',
                price: operator.meta?.price?.renown || 'Unknown'
            };
        });
        
        // Log the first few operators to check their roles
        console.log("First 5 operators:", operators);
        
        // Initialize the page with operator data
        initializePage();
    })
    .catch(error => {
        console.error('Error loading operator data:', error);
        // Create a simple error message in the container
        const container = document.getElementById('operatorGridContainer');
        container.innerHTML = '<div class="error-message">Error loading operator data. Please try again later.</div>';
    });

// Function to initialize the page
function initializePage() {
    const operatorGrid = document.getElementById('operatorGridContainer');
    const randomButton = document.getElementById('randomPickBtn');
    const startingSideToggle = document.getElementById('startingSideToggle');
    const startingSideText = document.getElementById('startingSideText');
    const randomOperatorsContainer = document.getElementById('randomOperatorsContainer');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const deselectAllBtn = document.getElementById('deselectAllBtn');
    const operatorConfig = document.getElementById('operatorConfig');
    const copyConfigBtn = document.getElementById('copyConfigBtn');
    const pasteConfigBtn = document.getElementById('pasteConfigBtn');
    const themeSwitch = document.getElementById('theme-toggle');

    // Set dark mode by default
    document.body.classList.add('dark-mode');
    themeSwitch.checked = true;
    localStorage.setItem('theme', 'dark');

    // Create operator grid
    createOperatorGrid();
    
    // Set up filter buttons
    setupFilterButtons();
    
    // Set up random picker
    setupRandomPicker(randomButton, startingSideToggle, startingSideText, randomOperatorsContainer);
    
    // Set up theme switch
    setupThemeSwitch();

    // Set up ownership buttons
    selectAllBtn.addEventListener('click', () => {
        const allOperatorIds = operators.map(op => op.id);
        localStorage.setItem('ownedOperators', JSON.stringify(allOperatorIds));
        createOperatorGrid(); // Refresh the grid to show all operators as owned
        updateConfigText(); // Update the config text
    });

    deselectAllBtn.addEventListener('click', () => {
        localStorage.setItem('ownedOperators', JSON.stringify([]));
        createOperatorGrid(); // Refresh the grid to show all operators as unowned
        updateConfigText(); // Update the config text
    });

    // Set up config box functionality
    function updateConfigText() {
        const ownedOperators = JSON.parse(localStorage.getItem('ownedOperators') || '[]');
        operatorConfig.value = JSON.stringify(ownedOperators);
    }

    copyConfigBtn.addEventListener('click', () => {
        operatorConfig.select();
        document.execCommand('copy');
        // Show feedback
        const originalText = copyConfigBtn.textContent;
        copyConfigBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyConfigBtn.textContent = originalText;
        }, 2000);
    });

    pasteConfigBtn.addEventListener('click', () => {
        navigator.clipboard.readText().then(text => {
            try {
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed)) {
                    localStorage.setItem('ownedOperators', JSON.stringify(parsed));
                    createOperatorGrid();
                    updateConfigText();
                } else {
                    alert('Invalid configuration format');
                }
            } catch (e) {
                alert('Invalid JSON format');
            }
        }).catch(() => {
            alert('Could not read clipboard');
        });
    });

    // Update config text when ownership changes
    document.addEventListener('click', (e) => {
        if (e.target.closest('.operator-cell')) {
            setTimeout(updateConfigText, 0);
        }
    });

    // Initial update of config text
    updateConfigText();
}

// Function to create the operator grid
function createOperatorGrid() {
    const container = document.getElementById('operatorGridContainer');
    container.innerHTML = ''; // Clear existing content
    
    const table = document.createElement('table');
    
    // Calculate the number of rows and columns based on screen width
    const totalOperators = operators.length;
    let columns, rows;
    
    // Check if we're on mobile (using window.innerWidth)
    if (window.innerWidth <= 768) {
        // Mobile layout: 4 columns
        columns = 4;
        rows = Math.ceil(totalOperators / columns);
    } else if (window.innerWidth <= 1024) {
        // Tablet layout: 6 columns
        columns = 6;
        rows = Math.ceil(totalOperators / columns);
    } else {
        // Desktop layout: 8 columns
        columns = 8;
        rows = Math.ceil(totalOperators / columns);
    }
    
    // Load owned operators from localStorage or initialize as empty array
    let ownedOperators = JSON.parse(localStorage.getItem('ownedOperators') || '[]');
    
    // Create table rows and cells
    for (let i = 0; i < rows; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < columns; j++) {
            const cell = document.createElement('td');
            const operatorIndex = i * columns + j;
            
            if (operatorIndex < totalOperators) {
                const operator = operators[operatorIndex];
                const operatorCell = document.createElement('div');
                operatorCell.className = 'operator-cell';
                operatorCell.setAttribute('data-role', operator.role);
                
                // Add owned class if operator is owned
                if (ownedOperators.includes(operator.id)) {
                    operatorCell.classList.add('owned');
                }
                
                const icon = document.createElement('div');
                icon.className = 'operator-icon';
                const img = document.createElement('img');
                
                // Use SVG from assets directory
                img.src = `assets/${operator.id.toLowerCase()}.svg`;
                img.alt = operator.name;
                icon.appendChild(img);
                
                const name = document.createElement('div');
                name.className = 'operator-name';
                name.textContent = operator.name;
                
                operatorCell.appendChild(icon);
                operatorCell.appendChild(name);
                cell.appendChild(operatorCell);
                
                // Add click event to show operator details
                operatorCell.addEventListener('click', function() {
                    showOperatorDetails(operator);
                });
                
                // Add right-click event to toggle ownership
                operatorCell.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                    toggleOperatorOwnership(operator.id, operatorCell);
                });
            } else {
                // Add empty cell to maintain grid structure
                cell.style.visibility = 'hidden';
            }
            
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    
    container.appendChild(table);
}

// Function to show operator details in a modal
function showOperatorDetails(operator) {
    const modal = document.createElement('div');
    modal.className = 'operator-modal';
    
    const content = document.createElement('div');
    content.className = 'operator-modal-content';
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'operator-modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => modal.remove();
    
    const imgContainer = document.createElement('div');
    imgContainer.className = 'operator-modal-img';
    const img = document.createElement('img');
    
    // Use SVG from assets directory
    img.src = `assets/${operator.id.toLowerCase()}.svg`;
    img.alt = operator.name;
    imgContainer.appendChild(img);
    
    const info = document.createElement('div');
    info.className = 'operator-modal-info';
    
    info.innerHTML = `
        <h2>${operator.name}</h2>
        <p><strong>Role:</strong> ${operator.role}</p>
        <p><strong>Organization:</strong> ${operator.organization || 'Unknown'}</p>
        <p><strong>Squad:</strong> ${operator.unit || 'Unknown'}</p>
        
        <div class="operator-ratings">
            <div class="rating">
                <span class="rating-label">Health</span>
                <div class="rating-bars">
                    ${Array(3).fill().map((_, i) => 
                        `<div class="rating-bar ${i < operator.armor ? 'filled' : ''}"></div>`
                    ).join('')}
                </div>
            </div>
            <div class="rating">
                <span class="rating-label">Speed</span>
                <div class="rating-bars">
                    ${Array(3).fill().map((_, i) => 
                        `<div class="rating-bar ${i < operator.speed ? 'filled' : ''}"></div>`
                    ).join('')}
                </div>
            </div>
            <div class="rating">
                <span class="rating-label">Difficulty</span>
                <div class="rating-bars">
                    ${Array(3).fill().map((_, i) => 
                        `<div class="rating-bar ${i < operator.difficulty ? 'filled' : ''}"></div>`
                    ).join('')}
                </div>
            </div>
        </div>
        
        <div class="operator-bio">
            <p>${operator.bio || 'No bio available'}</p>
        </div>
        
        <div class="operator-meta">
            <p><strong>Season:</strong> ${operator.season || 'Unknown'}</p>
            <p><strong>Country:</strong> ${operator.country || 'Unknown'}</p>
            <p><strong>Gender:</strong> ${operator.gender || 'Unknown'}</p>
            <p><strong>Height:</strong> ${operator.height || 'Unknown'}</p>
            <p><strong>Weight:</strong> ${operator.weight || 'Unknown'}</p>
            <p><strong>Price:</strong> ${operator.price || 'Unknown'}</p>
        </div>
    `;
    
    content.appendChild(closeBtn);
    content.appendChild(imgContainer);
    content.appendChild(info);
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

// Set up event listeners for filter buttons
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get the filter value
            const filter = button.getAttribute('data-filter');
            
            // Apply the filter by adding/removing classes
            const operatorCells = document.querySelectorAll('.operator-cell');
            
            operatorCells.forEach(cell => {
                const role = cell.getAttribute('data-role');
                
                if (filter === 'all') {
                    cell.classList.remove('filtered-out');
                } else if (filter === 'attack' && role !== 'attacker') {
                    cell.classList.add('filtered-out');
                } else if (filter === 'defense' && role !== 'defender') {
                    cell.classList.add('filtered-out');
                } else {
                    cell.classList.remove('filtered-out');
                }
            });
        });
    });
}

// Set up random picker functionality
function setupRandomPicker(randomButton, startingSideToggle, startingSideText, randomOperatorsContainer) {
    // Function to generate random operator lineup
    function generateRandomLineup() {
        const isDefense = startingSideToggle.checked;
        console.log("Starting side:", isDefense ? "Defense" : "Attack");
        
        // Get owned operators
        const ownedOperators = JSON.parse(localStorage.getItem('ownedOperators') || '[]');
        const ownedOperatorsList = operators.filter(op => ownedOperators.includes(op.id));
        
        // Get all operators with their roles
        const attackOperators = ownedOperatorsList.filter(op => op.role === 'attacker');
        const defenseOperators = ownedOperatorsList.filter(op => op.role === 'defender');
        
        console.log("Attack operators:", attackOperators.length);
        console.log("Defense operators:", defenseOperators.length);
        
        // Select operators based on starting side
        let selectedOperators = [];
        
        if (isDefense) {
            // Starting on defense side
            // Make sure we have enough operators
            if (defenseOperators.length < 4 || attackOperators.length < 3) {
                alert('Not enough owned operators available for the selected side!');
                return;
            }
            
            // Shuffle available defenders and attackers
            const shuffledDefenders = [...defenseOperators].sort(() => Math.random() - 0.5);
            const shuffledAttackers = [...attackOperators].sort(() => Math.random() - 0.5);
            
            // Create lineup: 3 defenders, then 3 attackers, then 1 defender
            selectedOperators = [
                ...shuffledDefenders.slice(0, 3),
                ...shuffledAttackers.slice(0, 3),
                shuffledDefenders[3]
            ];
            
        } else {
            // Starting on attack side
            // Make sure we have enough operators
            if (attackOperators.length < 4 || defenseOperators.length < 3) {
                alert('Not enough owned operators available for the selected side!');
                return;
            }
            
            // Shuffle available attackers and defenders
            const shuffledAttackers = [...attackOperators].sort(() => Math.random() - 0.5);
            const shuffledDefenders = [...defenseOperators].sort(() => Math.random() - 0.5);
            
            // Create lineup: 3 attackers, then 3 defenders, then 1 attacker
            selectedOperators = [
                ...shuffledAttackers.slice(0, 3),
                ...shuffledDefenders.slice(0, 3),
                shuffledAttackers[3]
            ];
        }
        
        console.log("Selected operators:", selectedOperators.map(op => op.name));

        // Clear previous results
        randomOperatorsContainer.innerHTML = '';
        
        // Create slots for 7 operators
        for (let i = 0; i < 7; i++) {
            const slot = document.createElement('div');
            slot.className = 'random-operator-slot';
            
            // Add section labels
            if (i === 0) {
                slot.setAttribute('data-label', isDefense ? 'Defense' : 'Attack');
            } else if (i === 3) {
                slot.setAttribute('data-label', isDefense ? 'Attack' : 'Defense');
            } else if (i === 6) {
                slot.setAttribute('data-label', isDefense ? 'Defense' : 'Attack');
            }
            
            slot.innerHTML = `
                <div class="slot-icon"></div>
                <div class="slot-name"></div>
            `;
            randomOperatorsContainer.appendChild(slot);
        }

        // Display selected operators
        const slots = randomOperatorsContainer.querySelectorAll('.random-operator-slot');
        selectedOperators.forEach((operator, index) => {
            const slot = slots[index];
            const icon = slot.querySelector('.slot-icon');
            const name = slot.querySelector('.slot-name');
            
            // Add class based on operator role
            slot.classList.add(operator.role === 'attacker' ? 'attacker' : 'defender');
            
            // Use SVG from assets directory
            icon.innerHTML = `<img src="assets/${operator.id.toLowerCase()}.svg" alt="${operator.name}">`;
            name.textContent = operator.name;
            
            // Add highlight animation
            slot.classList.add('highlight');
            setTimeout(() => slot.classList.remove('highlight'), 1000);
        });
    }
    
    // Function to update UI based on selected side
    function updateStartingSideUI() {
        const isDefense = startingSideToggle.checked;
        
        // Update the text display
        startingSideText.textContent = isDefense ? 'Defense' : 'Attack';
        
        // Update any existing slots with the new labels
        const slots = randomOperatorsContainer.querySelectorAll('.random-operator-slot');
        if (slots.length > 0) {
            // Update labels based on starting side
            slots[0].setAttribute('data-label', isDefense ? 'Defense' : 'Attack');
            slots[3].setAttribute('data-label', isDefense ? 'Attack' : 'Defense');
            slots[6].setAttribute('data-label', isDefense ? 'Defense' : 'Attack');
            
            // Generate a new lineup when the switch is toggled
            generateRandomLineup();
        }
    }
    
    // Initialize the UI
    updateStartingSideUI();
    
    // Set up the click event for the random button
    randomButton.addEventListener('click', generateRandomLineup);

    // Starting side toggle functionality
    startingSideToggle.addEventListener('change', updateStartingSideUI);
}

// Set up theme switch functionality
function setupThemeSwitch() {
    const themeSwitch = document.getElementById('theme-toggle');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeSwitch.checked = true;
    }
    
    // Handle theme switch changes
    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });
}

// Add window resize event listener to recreate the grid when screen size changes
window.addEventListener('resize', function() {
    createOperatorGrid();
});

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // The page will be initialized after the operator data is loaded
    // This is handled in the fetch callback
});

// Function to toggle operator ownership
function toggleOperatorOwnership(operatorId, operatorCell) {
    const ownedOperators = JSON.parse(localStorage.getItem('ownedOperators') || '[]');
    const index = ownedOperators.indexOf(operatorId);
    
    if (index === -1) {
        // Add to owned operators
        ownedOperators.push(operatorId);
        operatorCell.classList.add('owned');
    } else {
        // Remove from owned operators
        ownedOperators.splice(index, 1);
        operatorCell.classList.remove('owned');
    }
    
    // Sort the owned operators list
    ownedOperators.sort();
    
    localStorage.setItem('ownedOperators', JSON.stringify(ownedOperators));
    
    // Update the operator configuration box
    const operatorConfig = document.getElementById('operatorConfig');
    if (operatorConfig) {
        operatorConfig.value = JSON.stringify(ownedOperators);
    }
}

// Mobile warning popup functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileWarningModal = document.getElementById('mobileWarning');
    const closeButton = document.querySelector('.mobile-warning-content button');
    
    closeButton.addEventListener('click', function() {
        mobileWarningModal.style.display = 'none';
    });
}); 