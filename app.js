// State management
let weightEntries = [];
let userGoal = null;
let selectedUnit = 'lbs';

// DOM elements
const weightForm = document.getElementById('weight-form')
const entriesList = document.getElementById('entries-list')
const goalDisplay = document.getElementById('goal-display')
const setGoalBtn = document.getElementById('set-goal-btn')
const dateInput = document.getElementById('date')
const unitSelect = document.getElementById('unit')

//Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    setDefaultDate();
    setupEventListeners();
    renderEntries();
    renderGoal();
}
);

//Set today's date as default
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0]
    dateInput.value = today;
}

//Event listeners
function setupEventListeners() {
    if (weightForm) weightForm.addEventListener('submit', handleWeightSubmit);
    if (setGoalBtn) setGoalBtn.addEventListener('click', handleSetGoal);
    if (unitSelect) unitSelect.addEventListener('change', handleUnitChange);
}

//Handle form submission
function handleWeightSubmit(e) {
    e.preventDefault();

    const weight = parseFloat(document.getElementById('weight').value);
    const date = document.getElementById('date').value;
    const unit = document.getElementById('unit').value;

    // Create entry object
    const entry = {
        id: Date.now(),
        weight: weight,
        unit: unit,
        date: date,
        timestamp: new Date().toISOString()
    };
    // Add to entries array
    weightEntries.push(entry);
    // Save to localStorage
    saveToLocalStorage();
    // Update UI
    renderEntries();
    // Reset form
    weightForm.reset();
    setDefaultDate();
    // Show success message (we'll make this prettier later)
    showNotification('Entry saved successfully!', 'success');
}

// Handle goal setting
function handleSetGoal() {
    const goalWeight = prompt('Enter your goal weight:');
    
    if (goalWeight && !isNaN(goalWeight)) {
        userGoal = {
            weight: parseFloat(goalWeight),
            unit: selectedUnit,
            setDate: new Date().toISOString()
        };
        
        saveToLocalStorage();
        renderGoal();
        showNotification('Goal set successfully!', 'success');
    }
}

// Handle unit change
function handleUnitChange(e) {
    selectedUnit = e.target.value;
    
    // Convert existing entries if needed
    if (confirm('Convert existing entries to ' + selectedUnit + '?')) {
        weightEntries = weightEntries.map(entry => ({
            ...entry,
            weight: convertWeight(entry.weight, entry.unit, selectedUnit),
            unit: selectedUnit
        }));
        
        if (userGoal) {
            userGoal.weight = convertWeight(userGoal.weight, userGoal.unit, selectedUnit);
            userGoal.unit = selectedUnit;
        }
        
        saveToLocalStorage();
        renderEntries();
        renderGoal();
    }
}

// Weight conversion
function convertWeight(weight, fromUnit, toUnit) {
    if (fromUnit === toUnit) return weight;
    
    if (fromUnit === 'lbs' && toUnit === 'kg') {
        return weight * 0.453592;
    } else if (fromUnit === 'kg' && toUnit === 'lbs') {
        return weight * 2.20462;
    }
    
    return weight;
}

// Render entries to DOM
function renderEntries() {
    if (weightEntries.length === 0) {
        entriesList.innerHTML = '<p class="empty-state">No entries yet. Add your first weight!</p>';
        return;
    }
    
    // Sort by date (most recent first)
    const sortedEntries = [...weightEntries].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    // Create HTML for entries
    const entriesHTML = sortedEntries.slice(0, 10).map(entry => {
        let weightDisplay = (typeof entry.weight === 'number' && !isNaN(entry.weight))
            ? entry.weight.toFixed(1)
            : entry.weight;
        return `
            <div class="entry-item">
                <div class="entry-date">${formatDate(entry.date)}</div>
                <div class="entry-weight">${weightDisplay} ${entry.unit}</div>
                <button class="delete-btn" onclick="deleteEntry(${entry.id})">×</button>
            </div>
        `;
    }).join('');
    
    entriesList.innerHTML = entriesHTML;
}

// Render goal
function renderGoal() {
    if (!userGoal) {
        goalDisplay.innerHTML = `
            <p>No goal set</p>
            <button id="set-goal-btn" class="btn-secondary">Set Goal</button>
        `;
        document.getElementById('set-goal-btn').addEventListener('click', handleSetGoal);
        return;
    }
    
    const latestEntry = weightEntries[weightEntries.length - 1];
    const difference = latestEntry 
        ? (latestEntry.weight - userGoal.weight).toFixed(1)
        : null;
    
    goalDisplay.innerHTML = `
        <div class="goal-info">
            <p>Goal: ${userGoal.weight} ${userGoal.unit}</p>
            ${difference ? `<p class="goal-difference">${difference > 0 ? '+' : ''}${difference} ${userGoal.unit} to go</p>` : ''}
            <button onclick="handleSetGoal()" class="btn-secondary mt-2">Update Goal</button>
        </div>
    `;
}

// Delete entry
function deleteEntry(id) {
    if (confirm('Delete this entry?')) {
        weightEntries = weightEntries.filter(entry => entry.id !== id);
        saveToLocalStorage();
        renderEntries();
        showNotification('Entry deleted', 'info');
    }
}

// Local Storage Functions
function saveToLocalStorage() {
    localStorage.setItem('weightEntries', JSON.stringify(weightEntries));
    localStorage.setItem('userGoal', JSON.stringify(userGoal));
    localStorage.setItem('selectedUnit', selectedUnit);
}

function loadFromLocalStorage() {
    const savedEntries = localStorage.getItem('weightEntries');
    const savedGoal = localStorage.getItem('userGoal');
    const savedUnit = localStorage.getItem('selectedUnit');
    
    if (savedEntries) {
        weightEntries = JSON.parse(savedEntries);
    }
    
    if (savedGoal) {
        userGoal = JSON.parse(savedGoal);
    }
    
    if (savedUnit) {
        selectedUnit = savedUnit;
        document.getElementById('unit').value = savedUnit;
    }
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
}

function showNotification(message, type) {
    // For now, just console.log
    console.log(`[${type}] ${message}`);
// Tomorrow we'll make this a nice toast notification
}