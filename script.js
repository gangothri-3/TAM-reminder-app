let reminders = [];
let currentUser = null;

window.onload = () => {
  const user = localStorage.getItem("loggedInUser");
  if (user && localStorage.getItem(`reminders_${user}`)) {
    currentUser = user;
    showApp();
    loadReminders();
  } else {
    document.getElementById("auth-container").style.display = "block";
    document.getElementById("app-container").style.display = "none";
  }
};

function toggleAuthMode() {
  const text = document.querySelector("#auth-container p");
  const button = document.querySelector("#auth-container button");
  if (button.textContent === "Login") {
    button.textContent = "Sign Up";
    text.innerHTML = `Already have an account? <a href="#" onclick="toggleAuthMode()">Login</a>`;
  } else {
    button.textContent = "Login";
    text.innerHTML = `New here? <a href="#" onclick="toggleAuthMode()">Create account</a>`;
  }
}

function loginUser() {
  const username = document.getElementById("auth-username").value.trim();
  const password = document.getElementById("auth-password").value;

  if (!username || !password) {
    alert("Please enter both username and password.");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const isSignup = document.querySelector("#auth-container button").textContent === "Sign Up";

  if (isSignup) {
    if (users[username]) {
      alert("Username already exists.");
      return;
    }
    users[username] = password;
    localStorage.setItem("users", JSON.stringify(users));
    alert("Account created! Please log in.");
    toggleAuthMode();
    return;
  }

  if (users[username] === password) {
    currentUser = username;
    localStorage.setItem("loggedInUser", username);
    showApp();
    loadReminders();
  } else {
    alert("Invalid username or password.");
  }
}

function logoutUser() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("loggedInUser");
    currentUser = null;
    reminders = [];
    document.getElementById("app-container").style.display = "none";
    document.getElementById("auth-container").style.display = "block";
  }
}

function showApp() {
  document.getElementById("auth-container").style.display = "none";
  document.getElementById("app-container").style.display = "block";
  const settings = getUserSettings();
  document.getElementById("user-display-name").textContent = settings.displayName || currentUser;
  applyTheme(settings.theme || "light");
}

function addReminder() {
  const task = document.getElementById("task").value.trim();
  const time = document.getElementById("reminderTime").value;
  const category = document.getElementById("category").value;

  if (!task || !time) {
    alert("Please fill in all fields.");
    return;
  }

  reminders.push({ task, time, category });
  saveToLocalStorage();
  displayReminders();

  document.getElementById("task").value = "";
  document.getElementById("reminderTime").value = "";
}

function displayReminders() {
  const list = document.getElementById("reminderList");
  const filter = document.getElementById("filterCategory").value;
  list.innerHTML = "";

  const filtered = filter === "All" ? reminders : reminders.filter(r => r.category === filter);

  filtered.forEach((reminder, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${reminder.task} - ${new Date(reminder.time).toLocaleString()} [${reminder.category}]
      <span style="float:right;">
        <button onclick="editReminder(${index})">✏️</button>
        <button onclick="deleteReminder(${index})">🗑️</button>
      </span>
    `;
    list.appendChild(li);
  });
}

function deleteReminder(index) {
  if (confirm("Delete this reminder?")) {
    reminders.splice(index, 1);
    saveToLocalStorage();
    displayReminders();
  }
}

function editReminder(index) {
  const reminder = reminders[index];
  const newTask = prompt("Edit Task:", reminder.task);
  const newTime = prompt("Edit Time:", reminder.time);
  const newCategory = prompt("Edit Category:", reminder.category);

  if (newTask && newTime && newCategory) {
    reminders[index] = { task: newTask, time: newTime, category: newCategory };
    saveToLocalStorage();
    displayReminders();
  }
}

function saveToLocalStorage() {
  if (!currentUser) return;
  localStorage.setItem(`reminders_${currentUser}`, JSON.stringify(reminders));
}

function loadReminders() {
  reminders = JSON.parse(localStorage.getItem(`reminders_${currentUser}`) || "[]");
  displayReminders();
}

function toggleProfileMenu() {
  const menu = document.getElementById("profileMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function openSettings() {
  const settings = getUserSettings();
  document.getElementById("displayName").value = settings.displayName || "";
  document.getElementById("themeSelect").value = settings.theme || "light";
  document.getElementById("settingsModal").style.display = "block";
  toggleProfileMenu();
}

function closeSettings() {
  document.getElementById("settingsModal").style.display = "none";
}

function saveSettings() {
  const displayName = document.getElementById("displayName").value.trim();
  const selectedTheme = document.getElementById("themeSelect").value;

  const settings = getUserSettings();
  settings.displayName = displayName;
  settings.theme = selectedTheme;

  localStorage.setItem(`settings_${currentUser}`, JSON.stringify(settings));
  document.getElementById("user-display-name").textContent = displayName;
  applyTheme(selectedTheme);
  closeSettings();
}

function applyTheme(theme) {
  document.body.classList.remove("light-theme", "dark-theme");
  document.body.classList.add(`${theme}-theme`);
}

function getUserSettings() {
  return JSON.parse(localStorage.getItem(`settings_${currentUser}`) || "{}");
}

function deleteAccount() {
  if (!confirm("⚠️ Are you sure you want to delete your account and all reminders? This cannot be undone.")) {
    return;
  }

  const users = JSON.parse(localStorage.getItem("users") || "{}");
  delete users[currentUser];
  localStorage.setItem("users", JSON.stringify(users));

  localStorage.removeItem(`reminders_${currentUser}`);
  localStorage.removeItem(`settings_${currentUser}`);
  localStorage.removeItem("loggedInUser");

  currentUser = null;
  reminders = [];
  document.getElementById("app-container").style.display = "none";
  document.getElementById("auth-container").style.display = "block";

  alert("Your account has been deleted.");
}
