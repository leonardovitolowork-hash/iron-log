// Iron Log - Workout Tracker App
// Main application logic

// Default exercises database
const defaultExercises = [
  { id: 'bench-press', name: 'Bench Press', category: 'chest' },
  { id: 'incline-bench', name: 'Incline Bench Press', category: 'chest' },
  { id: 'dumbbell-fly', name: 'Dumbbell Fly', category: 'chest' },
  { id: 'pull-up', name: 'Pull Up', category: 'back' },
  { id: 'barbell-row', name: 'Barbell Row', category: 'back' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', category: 'back' },
  { id: 'deadlift', name: 'Deadlift', category: 'back' },
  { id: 'overhead-press', name: 'Overhead Press', category: 'shoulders' },
  { id: 'lateral-raise', name: 'Lateral Raise', category: 'shoulders' },
  { id: 'face-pull', name: 'Face Pull', category: 'shoulders' },
  { id: 'bicep-curl', name: 'Bicep Curl', category: 'arms' },
  { id: 'tricep-extension', name: 'Tricep Extension', category: 'arms' },
  { id: 'hammer-curl', name: 'Hammer Curl', category: 'arms' },
  { id: 'squat', name: 'Squat', category: 'legs' },
  { id: 'leg-press', name: 'Leg Press', category: 'legs' },
  { id: 'leg-curl', name: 'Leg Curl', category: 'legs' },
  { id: 'leg-extension', name: 'Leg Extension', category: 'legs' },
  { id: 'calf-raise', name: 'Calf Raise', category: 'legs' },
  { id: 'plank', name: 'Plank', category: 'core' },
  { id: 'crunch', name: 'Crunch', category: 'core' },
  { id: 'russian-twist', name: 'Russian Twist', category: 'core' },
  { id: 'treadmill', name: 'Treadmill', category: 'cardio' },
  { id: 'bike', name: 'Stationary Bike', category: 'cardio' },
  { id: 'rowing-machine', name: 'Rowing Machine', category: 'cardio' }
];

// App state
let exercises = [];
let workoutHistory = [];
let activeWorkout = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  console.log('Iron Log initialized');
  loadData();
  renderExerciseList();
  setupEventListeners();
  updateDate();
});

// Load data from localStorage
function loadData() {
  try {
    const savedExercises = localStorage.getItem('ironlog_exercises');
    const savedHistory = localStorage.getItem('ironlog_history');
    
    if (savedExercises) {
      exercises = JSON.parse(savedExercises);
    } else {
      exercises = [...defaultExercises];
      saveData();
    }
    
    if (savedHistory) {
      workoutHistory = JSON.parse(savedHistory);
    }
  } catch (error) {
    console.error('Error loading data:', error);
    exercises = [...defaultExercises];
  }
}

// Save data to localStorage
function saveData() {
  try {
    localStorage.setItem('ironlog_exercises', JSON.stringify(exercises));
    localStorage.setItem('ironlog_history', JSON.stringify(workoutHistory));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Update current date display
function updateDate() {
  const dateElement = document.getElementById('current-date');
  if (dateElement) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = new Date().toLocaleDateString('en-US', options);
  }
}

// Render exercise list
function renderExerciseList() {
  const exerciseList = document.getElementById('exercise-list');
  if (!exerciseList) {
    console.error('Exercise list element not found');
    return;
  }
  
  if (exercises.length === 0) {
    exerciseList.innerHTML = '<p class="empty-message">No exercises yet. Add some in Settings!</p>';
    return;
  }
  
  // Group by category
  const categories = {};
  exercises.forEach(exercise => {
    if (!categories[exercise.category]) {
      categories[exercise.category] = [];
    }
    categories[exercise.category].push(exercise);
  });
  
  let html = '';
  const categoryNames = {
    chest: 'Chest',
    back: 'Back',
    shoulders: 'Shoulders',
    arms: 'Arms',
    legs: 'Legs',
    core: 'Core',
    cardio: 'Cardio'
  };
  
  Object.keys(categories).forEach(category => {
    html += `<div class="category-section">
      <h3 class="category-title">${categoryNames[category] || category}</h3>
      <div class="exercise-grid">`;
    
    categories[category].forEach(exercise => {
      html += `<div class="exercise-card" data-exercise-id="${exercise.id}">
        <div class="exercise-name">${exercise.name}</div>
        <button class="btn btn-small add-to-workout" data-exercise-id="${exercise.id}">+ Add</button>
      </div>`;
    });
    
    html += '</div></div>';
  });
  
  exerciseList.innerHTML = html;
}

// Setup event listeners
function setupEventListeners() {
  // Navigation buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = e.target.dataset.view;
      switchView(view);
    });
  });
  
  // Start workout button
  const startBtn = document.getElementById('start-workout-btn');
  if (startBtn) {
    startBtn.addEventListener('click', startWorkout);
  }
  
  // Finish workout button
  const finishBtn = document.getElementById('finish-workout-btn');
  if (finishBtn) {
    finishBtn.addEventListener('click', finishWorkout);
  }
  
  // Add exercise button
  const addExerciseBtn = document.getElementById('add-exercise-btn');
  if (addExerciseBtn) {
    addExerciseBtn.addEventListener('click', () => {
      document.getElementById('add-exercise-modal').style.display = 'flex';
    });
  }
  
  // Add exercise form
  const addExerciseForm = document.getElementById('add-exercise-form');
  if (addExerciseForm) {
    addExerciseForm.addEventListener('submit', handleAddExercise);
  }
  
  // Export data button
  const exportBtn = document.getElementById('export-data-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportData);
  }
  
  // Import data button
  const importBtn = document.getElementById('import-data-btn');
  if (importBtn) {
    importBtn.addEventListener('click', importData);
  }
  
  // Clear data button
  const clearBtn = document.getElementById('clear-data-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearData);
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('add-exercise-modal');
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Delegate click events for exercise cards
  document.getElementById('exercise-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-workout')) {
      const exerciseId = e.target.dataset.exerciseId;
      addToWorkout(exerciseId);
    } else if (e.target.closest('.exercise-card')) {
      const card = e.target.closest('.exercise-card');
      const exerciseId = card.dataset.exerciseId;
      addToWorkout(exerciseId);
    }
  });
}

// Switch view
function switchView(viewName) {
  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.view === viewName) {
      btn.classList.add('active');
    }
  });
  
  // Update views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  
  const targetView = document.getElementById(`${viewName}-view`);
  if (targetView) {
    targetView.classList.add('active');
  }
  
  // Render history if switching to history view
  if (viewName === 'history') {
    renderHistory();
  }
}

// Start workout
function startWorkout() {
  activeWorkout = {
    startTime: new Date().toISOString(),
    exercises: []
  };
  
  document.getElementById('active-workout').style.display = 'block';
  document.getElementById('start-workout-btn').style.display = 'none';
  renderActiveWorkout();
}

// Add exercise to active workout
function addToWorkout(exerciseId) {
  if (!activeWorkout) {
    startWorkout();
  }
  
  const exercise = exercises.find(e => e.id === exerciseId);
  if (exercise) {
    activeWorkout.exercises.push({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: []
    });
    renderActiveWorkout();
  }
}

// Render active workout
function renderActiveWorkout() {
  const container = document.getElementById('active-exercises');
  if (!container) return;
  
  if (activeWorkout.exercises.length === 0) {
    container.innerHTML = '<p class="empty-message">No exercises added yet. Click "+ Add" on any exercise.</p>';
    return;
  }
  
  let html = '';
  activeWorkout.exercises.forEach((exercise, index) => {
    html += `<div class="active-exercise">
      <h4>${exercise.exerciseName}</h4>
      <div class="sets-container">`;
    
    exercise.sets.forEach((set, setIndex) => {
      html += `<div class="set-row">
        <span>Set ${setIndex + 1}:</span>
        <input type="number" value="${set.weight || ''}" placeholder="kg" class="set-input" data-exercise="${index}" data-set="${setIndex}" data-field="weight">
        <span>×</span>
        <input type="number" value="${set.reps || ''}" placeholder="reps" class="set-input" data-exercise="${index}" data-set="${setIndex}" data-field="reps">
      </div>`;
    });
    
    html += `<button class="btn btn-small add-set" data-exercise="${index}">+ Add Set</button>`;
    html += '</div></div>';
  });
  
  container.innerHTML = html;
  
  // Add event listeners for set inputs
  container.querySelectorAll('.set-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const exerciseIndex = parseInt(e.target.dataset.exercise);
      const setIndex = parseInt(e.target.dataset.set);
      const field = e.target.dataset.field;
      const value = parseFloat(e.target.value) || 0;
      
      if (field === 'weight') {
        activeWorkout.exercises[exerciseIndex].sets[setIndex].weight = value;
      } else if (field === 'reps') {
        activeWorkout.exercises[exerciseIndex].sets[setIndex].reps = value;
      }
    });
  });
  
  // Add event listeners for add set buttons
  container.querySelectorAll('.add-set').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const exerciseIndex = parseInt(e.target.dataset.exercise);
      activeWorkout.exercises[exerciseIndex].sets.push({ weight: 0, reps: 0 });
      renderActiveWorkout();
    });
  });
}

// Finish workout
function finishWorkout() {
  if (!activeWorkout) return;
  
  activeWorkout.endTime = new Date().toISOString();
  workoutHistory.unshift(activeWorkout);
  saveData();
  
  activeWorkout = null;
  document.getElementById('active-workout').style.display = 'none';
  document.getElementById('start-workout-btn').style.display = 'block';
  
  alert('Workout saved!');
  renderHistory();
}

// Render history
function renderHistory() {
  const container = document.getElementById('history-list');
  if (!container) return;
  
  if (workoutHistory.length === 0) {
    container.innerHTML = '<p class="empty-message">No workouts yet. Start your first workout!</p>';
    return;
  }
  
  let html = '';
  workoutHistory.forEach((workout, index) => {
    const startDate = new Date(workout.startTime);
    const endDate = workout.endTime ? new Date(workout.endTime) : new Date();
    const duration = Math.round((endDate - startDate) / 60000);
    
    html += `<div class="history-item">
      <div class="history-date">${startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
      <div class="history-duration">Duration: ${duration} min</div>
      <div class="history-exercises">${workout.exercises.length} exercises</div>
      <button class="btn btn-small view-workout" data-index="${index}">View Details</button>
    </div>`;
  });
  
  container.innerHTML = html;
  
  // Add event listeners
  container.querySelectorAll('.view-workout').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      viewWorkoutDetails(index);
    });
  });
}

// View workout details
function viewWorkoutDetails(index) {
  const workout = workoutHistory[index];
  if (!workout) return;
  
  let details = `Workout from ${new Date(workout.startTime).toLocaleString()}\n\n`;
  workout.exercises.forEach(ex => {
    details += `${ex.exerciseName}:\n`;
    ex.sets.forEach((set, i) => {
      details += `  Set ${i + 1}: ${set.weight}kg × ${set.reps} reps\n`;
    });
    details += '\n';
  });
  
  alert(details);
}

// Handle add exercise form
function handleAddExercise(e) {
  e.preventDefault();
  
  const nameInput = document.getElementById('exercise-name');
  const categoryInput = document.getElementById('exercise-category');
  
  const newExercise = {
    id: nameInput.value.toLowerCase().replace(/\s+/g, '-'),
    name: nameInput.value,
    category: categoryInput.value
  };
  
  exercises.push(newExercise);
  saveData();
  renderExerciseList();
  
  // Close modal
  document.getElementById('add-exercise-modal').style.display = 'none';
  nameInput.value = '';
  
  alert('Exercise added!');
}

// Close modal function (global)
window.closeModal = function() {
  document.getElementById('add-exercise-modal').style.display = 'none';
};

// Export data
function exportData() {
  const data = {
    exercises: exercises,
    history: workoutHistory,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ironlog-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import data
function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.exercises) exercises = data.exercises;
        if (data.history) workoutHistory = data.history;
        saveData();
        renderExerciseList();
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data: ' + error.message);
      }
    };
    reader.readAsText(file);
  });
  
  input.click();
}

// Clear all data
function clearData() {
  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    localStorage.removeItem('ironlog_exercises');
    localStorage.removeItem('ironlog_history');
    exercises = [...defaultExercises];
    workoutHistory = [];
    renderExerciseList();
    alert('All data cleared. Default exercises restored.');
  }
}
