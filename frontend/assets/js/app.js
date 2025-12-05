// frontend/assets/js/app.js

const API_BASE = "http://localhost:5000/api";

let authMode = "login"; // or "register"

let currentGroupId = null;

const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const authTitle = document.getElementById("authTitle");
const authNameRow = document.getElementById("authNameRow");
const authUsernameRow = document.getElementById("authUsernameRow");
const authNameInput = document.getElementById("authName");
const authUsernameInput = document.getElementById("authUsername");
const authIdentifierInput = document.getElementById("authIdentifier");
const authPasswordInput = document.getElementById("authPassword");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const toggleAuthModeText = document.getElementById("toggleAuthModeText");
const toggleAuthModeLink = document.getElementById("toggleAuthModeLink");
const authError = document.getElementById("authError");


const groupListDiv = document.getElementById("groupList");


function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  if (token) localStorage.setItem("token", token);
}

function clearToken() {
  localStorage.removeItem("token");
}

function showAuth() {
  authSection.classList.remove("hidden");
  appSection.classList.add("hidden");
}

function showApp() {
  authSection.classList.add("hidden");
  appSection.classList.remove("hidden");
}

function updateAuthMode() {
  if (authMode === "login") {
    authTitle.textContent = "Login";
    authSubmitBtn.textContent = "Login";
    toggleAuthModeText.textContent = "New user?";
    toggleAuthModeLink.textContent = "Create an account";
    authNameRow.classList.add("hidden");
  } else {
    authTitle.textContent = "Register";
    authSubmitBtn.textContent = "Register";
    toggleAuthModeText.textContent = "Already registered?";
    toggleAuthModeLink.textContent = "Login";
    authNameRow.classList.remove("hidden");
  }
  authError.textContent = "";
}


async function registerUser() {
  const name = authNameInput.value.trim();
  const username = authUsernameInput.value.trim();
  const contact = authIdentifierInput.value.trim();
  const password = authPasswordInput.value.trim();

  if (!name || !username || !contact || !password) {
    authError.textContent = "Please fill all fields.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, contact, password })
    });

    const data = await res.json();

    if (data.error) {
      authError.textContent = data.error;
      return;
    }

    alert("Registered successfully. Now login.");
    authMode = "login";
    updateAuthMode();
    authPasswordInput.value = "";
  } catch (err) {
    authError.textContent = "Already registered.";
  }
}

async function loginUser() {
  const username = authUsernameInput.value.trim();
  const password = authPasswordInput.value.trim();

  if (!username || !password) {
    authError.textContent = "Please enter username and password.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.error) {
      authError.textContent = data.error;
      return;
    }

    if (!data.token) {
      authError.textContent = "Token missing in response.";
      return;
    }

    setToken(data.token);


    showApp();
    authError.textContent = "";


    await loadMyGroups();
  } catch (err) {
    authError.textContent = "Something went wrong.";
  }
}

async function loadMyGroups() {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/groups/my`, {
      headers: {
        "Authorization": token
      }
    });

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.log("Unexpected groups response:", data);
      return;
    }

    renderGroupList(data);
  } catch (err) {
    console.log("Error loading groups:", err);
  }
}

function renderGroupList(groups) {
  if (!groupListDiv) return;

  groupListDiv.innerHTML = "";

  if (!groups.length) {
    const p = document.createElement("p");
    p.className = "placeholder";
    p.textContent = "No groups yet. Create one below.";
    groupListDiv.appendChild(p);
    return;
  }

  groups.forEach((g) => {
    const div = document.createElement("div");
    div.className = "group-item";
    div.textContent = g.name || "Unnamed group";

    if (currentGroupId === g._id) {
      div.classList.add("active");
    }

    div.addEventListener("click", () => {
      currentGroupId = g._id;

      document.querySelectorAll(".group-item").forEach(el => {
        el.classList.remove("active");
      });
      div.classList.add("active");

      loadGroupDetail(g._id);
    });

    groupListDiv.appendChild(div);
  });
}
const groupDetailPlaceholder = document.getElementById("groupDetailPlaceholder");
const rightPanePlaceholder = document.getElementById("rightPanePlaceholder");

async function loadGroupDetail(groupId) {
  const token = getToken();
  if (!token) {
    alert("Please login again.");
    showAuth();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/groups/${groupId}`, {
      headers: { "Authorization": token }
    });

    const data = await res.json();

    if (data.error) {
      console.log("Group detail error:", data.error);
      return;
    }

    renderGroupDetail(data);
  } catch (err) {
    console.log("Error loading group detail:", err);
  }
}

function renderGroupDetail(data) {
  if (!groupDetailPlaceholder) return;

  const g = data.group;
  const members = data.members || [];

  groupDetailPlaceholder.innerHTML = `
    <h3>${g.name}</h3>
    <p>${g.description || "No description yet."}</p>
    <p class="small">
      Created at: ${new Date(g.createdAt).toLocaleString()}
    </p>
    <p class="small">
      Members (${members.length}): 
      ${members.length
      ? members.map(m => m.name || m.username).join(", ")
      : "none"}
    </p>
  `;

  if (rightPanePlaceholder) {
    rightPanePlaceholder.innerHTML = `
      <p class="small">
        Balances & chat for <strong>${g.name}</strong> will be implemented next.
      </p>
    `;
  }
}


async function createGroup() {
  const name = document.getElementById("groupNameInput").value.trim();
  const description = document.getElementById("groupDescInput").value.trim();

  if (!name) {
    alert("Group name is required");
    return;
  }

  const token = getToken();
  if (!token) {
    alert("Please login again.");
    showAuth();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/groups/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({ name, description })
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    document.getElementById("groupNameInput").value = "";
    document.getElementById("groupDescInput").value = "";

    await loadMyGroups();
  } catch (err) {
    console.log("Error creating group:", err);
  }
}


toggleAuthModeLink.addEventListener("click", function (e) {
  e.preventDefault();
  authMode = authMode === "login" ? "register" : "login";
  authPasswordInput.value = "";
  updateAuthMode();
});

authSubmitBtn.addEventListener("click", function (e) {
  e.preventDefault();
  authError.textContent = "";

  if (authMode === "login") {
    loginUser();
  } else {
    registerUser();
  }
});

const createGroupBtn = document.getElementById("createGroupBtn");
if (createGroupBtn) {
  createGroupBtn.addEventListener("click", createGroup);
}


(function init() {
  if (getToken()) {
    showApp();
    loadMyGroups();
  } else {
    showAuth();
  }
  updateAuthMode();
})();