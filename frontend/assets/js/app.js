const API_BASE = "http://localhost:5000/api";

// --- State Variables ---
let authMode = "login";
let currentGroupId = null;
let pageMode = 'main'; // 'main' | 'createGroup' | 'allGroups' | 'invites'
let viewMode = 'groups'; // 'groups' | 'chat'

// --- DOM Elements ---

// Auth
const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const authTitle = document.getElementById("authTitle");
const authUsernameLabel = document.getElementById("authUsernameLabel");
const authUsernameInput = document.getElementById("authUsername");
const authNameRow = document.getElementById("authNameRow");
const authNameInput = document.getElementById("authName");
const authContactLabel = document.getElementById("authContactLabel");
const authContactInput = document.getElementById("authContact");
const authPasswordInput = document.getElementById("authPassword");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const toggleAuthModeText = document.getElementById("toggleAuthModeText");
const toggleAuthModeLink = document.getElementById("toggleAuthModeLink");
const authError = document.getElementById("authError");

// App

const mainLayout = document.getElementById("mainLayout");
const currentUserArea = document.getElementById("currentUserArea");

// Menu
const headerMenu = document.getElementById("headerMenu");
const menuToggleBtn = document.getElementById("menuToggleBtn"); // Created dynamically
const menuLogoutBtn = document.getElementById("menuLogout");
const menuCreateGroupBtn = document.getElementById("menuCreateGroup");
const menuGroupsBtn = document.getElementById("menuGroups");

// Pages
const createGroupPage = document.getElementById("createGroupPage");
const createPageGroupName = document.getElementById("createPageGroupName");
const createPageGroupDesc = document.getElementById("createPageGroupDesc");
const createPageCreateBtn = document.getElementById("createPageCreateBtn");
const createPageCancelBtn = document.getElementById("createPageCancelBtn");
const createPageError = document.getElementById("createPageError");

const allGroupsPage = document.getElementById("allGroupsPage");
const allGroupsList = document.getElementById("allGroupsList");

const invitesPage = document.getElementById("invitesPage");
const groupInvitesList = document.getElementById("groupInvitesList");


// Sidebar
const groupListDiv = document.getElementById("groupList");

// Main Detail Area
const groupColumn = document.getElementById("groupColumn");
const menuInvitesBtn = document.getElementById("menuInvites");
const noGroupSelectedText = document.getElementById("noGroupSelectedText");
const groupDetail = document.getElementById("groupDetail");
const groupTitle = document.getElementById("groupTitle");
const groupMeta = document.getElementById("groupMeta");
const groupMemberCount = document.getElementById("groupMemberCount");
const memberListArea = document.getElementById("memberListArea");
const expenseListArea = document.getElementById("expenseListArea");
const openAddExpenseBtn = document.getElementById("openAddExpenseBtn");

// Modals
const addExpenseModal = document.getElementById("addExpenseModal");
const expenseDescInput = document.getElementById("expenseDesc");
const expenseAmountInput = document.getElementById("expenseAmount");
const confirmAddExpenseBtn = document.getElementById("confirmAddExpenseBtn");
const cancelAddExpenseBtn = document.getElementById("cancelAddExpenseBtn");
const addExpenseError = document.getElementById("addExpenseError");
const activityList = document.getElementById("activityList");

// Profile Modal
const profileModal = document.getElementById("profileModal");
const profileNameInput = document.getElementById("profileName");
const profileBioInput = document.getElementById("profileBio");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const cancelProfileBtn = document.getElementById("cancelProfileBtn");
const menuProfileBtn = document.getElementById("menuProfile");

// Add Member Modal
const openAddMemberBtn = document.getElementById("openAddMemberBtn");
const addMemberModal = document.getElementById("addMemberModal");
const addMemberUsername = document.getElementById("addMemberUsername");
const addMemberError = document.getElementById("addMemberError");
const cancelAddMemberBtn = document.getElementById("cancelAddMemberBtn");
const confirmAddMemberBtn = document.getElementById("confirmAddMemberBtn");

const balancesArea = document.getElementById("balancesArea");

// Expense Detail Modal
const expenseDetailModal = document.getElementById("expenseDetailModal");
const detailDescription = document.getElementById("detailDescription");
const detailAmount = document.getElementById("detailAmount");
const detailMeta = document.getElementById("detailMeta");
const detailSplitsList = document.getElementById("detailSplitsList");
const deleteExpenseBtn = document.getElementById("deleteExpenseBtn");
const closeDetailBtn = document.getElementById("closeDetailBtn");

let currentSelectedExpenseId = null;

// --- API Helpers ---

function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  if (token) localStorage.setItem("token", token);
}

function clearToken() {
  localStorage.removeItem("token");
}

function updateAppVisibility() {
  if (getToken()) {
    authSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    renderUserDropdown();
  } else {
    authSection.classList.remove("hidden");
    appSection.classList.add("hidden");
    currentUserArea.innerHTML = "";
  }
}

// --- Auth Functions ---

function updateAuthMode() {
  authError.textContent = "";
  if (authMode === "login") {
    authTitle.textContent = "Login";
    authSubmitBtn.textContent = "Login";
    toggleAuthModeText.textContent = "New to NovaSync?";
    toggleAuthModeLink.textContent = "Create an account";

    authUsernameLabel.textContent = "Username";
    authNameRow.classList.add("hidden");
    authContactLabel.classList.add("hidden");
    authContactInput.classList.add("hidden");
  } else {
    authTitle.textContent = "Register";
    authSubmitBtn.textContent = "Register";
    toggleAuthModeText.textContent = "Already have an account?";
    toggleAuthModeLink.textContent = "Login";

    authUsernameLabel.textContent = "Choose a username";
    authNameRow.classList.remove("hidden");
    authContactLabel.classList.remove("hidden");
    authContactInput.classList.remove("hidden");
  }
}

async function registerUser() {
  const name = authNameInput.value.trim();
  const username = authUsernameInput.value.trim();
  const contact = authContactInput.value.trim();
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
      alert("Error: " + data.error);
      return;
    }

    alert("Registered successfully. Now login.");
    authMode = "login";
    updateAuthMode();
    authPasswordInput.value = "";
  } catch (err) {
    console.error(err);
    authError.textContent = "Server error during registration.";
    alert("Connection error: " + err.message);
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
      authError.textContent = "Token missing.";
      return;
    }

    setToken(data.token);
    // Store user info
    localStorage.setItem("username", data.username);
    if (data.name) localStorage.setItem("name", data.name);

    updateAppVisibility();
    authError.textContent = "";
    loadMyGroups();
  } catch (err) {
    console.error(err);
    authError.textContent = err.message === "Failed to fetch"
      ? "Cannot connect to server. Is it running?"
      : "Error: " + err.message;
  }
}

function clearAppState() {
  currentGroupId = null;
  groupListDiv.innerHTML = "";
  noGroupSelectedText.classList.remove("hidden");
  groupDetail.classList.add("hidden");
  // Reset page mode
  pageMode = 'main';
  applyPageMode();
}

function logout() {
  clearToken();
  clearAppState();
  updateAppVisibility();
}

// --- Group Functions ---

async function loadMyGroups() {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/groups/my`, {
      headers: { "Authorization": token }
    });
    const data = await res.json();

    if (data.error) {
      console.log("Error loading groups:", data.error);
      return;
    }

    renderGroupList(data);
  } catch (err) {
    console.log("Network error loading groups");
  }
}

function renderGroupList(groups) {
  groupListDiv.innerHTML = "";
  if (!groups || groups.length === 0) {
    groupListDiv.innerHTML = `<p class="small">No groups yet. Use "Create group" in the menu.</p>`;
    return;
  }

  groups.forEach(g => {
    const div = document.createElement("div");
    div.className = "group-item" + (g._id === currentGroupId ? " active" : "");
    div.innerHTML = `
        <div class="flex-space">
          <strong style="font-size:0.88rem;">${g.name}</strong>
        </div>
        <div class="small">
          ${g.description || '<span style="opacity:0.6;">No description</span>'}
        </div>
    `;
    div.addEventListener("click", () => {
      currentGroupId = g._id;
      // switch to main view if not already
      pageMode = 'main';
      applyPageMode();

      // update sidebar active state
      document.querySelectorAll(".group-item").forEach(el => el.classList.remove("active"));
      div.classList.add("active");

      loadGroupDetail(g._id);
    });
    groupListDiv.appendChild(div);
  });
}

async function loadGroupDetail(groupId) {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/groups/${groupId}`, {
      headers: { "Authorization": token }
    });
    const data = await res.json();

    if (data.error) {
      console.log("Error details:", data.error);
      return;
    }

    renderGroupDetailView(data.group, data.members);

    // Load Expenses and Balances
    loadGroupExpenses(groupId);
    loadGroupBalances(groupId);

  } catch (e) {
    console.error(e);
  }
}

// Load Balances
async function loadGroupBalances(groupId) {
  balancesArea.innerHTML = "<p>Loading...</p>";
  try {
    const tokens = getToken();
    if (!tokens) return;
    const res = await fetch(`${API_BASE}/expenses/group/${groupId}/balances`, {
      headers: { "Authorization": tokens }
    });
    const data = await res.json();

    if (data.error) {
      balancesArea.innerHTML = `<p class="error">${data.error}</p>`;
      return;
    }

    if (!data.plan || data.plan.length === 0) {
      balancesArea.innerHTML = "<p>All settled up!</p>";
      return;
    }

    balancesArea.innerHTML = "";
    data.plan.forEach(p => {
      const div = document.createElement("div");
      div.className = "small";
      div.style.marginBottom = "0.4rem";
      div.innerHTML = `<strong>${p.from}</strong> owes <strong>${p.to}</strong>: <span style="color:var(--brand-primary);">${p.amount}</span>`;
      balancesArea.appendChild(div);
    });
  } catch (e) {
    console.error(e);
    balancesArea.innerHTML = "<p>Error loading balances</p>";
  }
}

function renderGroupDetailView(group, members) {
  if (!group) return;

  noGroupSelectedText.classList.add("hidden");
  groupDetail.classList.remove("hidden");

  groupTitle.textContent = group.name;
  // We don't have creator name in this endpoint yet easily unless populated, 
  // but we can show description.
  groupMeta.innerHTML = `${group.description || ''}<br/>`;

  groupMemberCount.textContent = `${members.length} member${members.length !== 1 ? 's' : ''}`;

  // Members
  memberListArea.innerHTML = "";
  members.forEach(m => {
    const row = document.createElement('div');
    row.className = 'flex-space small';
    row.style.marginTop = '0.15rem';
    row.innerHTML = `
            <div>${m.name} (@${m.username})</div>
            <!-- Remove button placeholder -->
        `;
    memberListArea.appendChild(row);
  });
}




// --- UI Navigation & Layout ---

// Create Expense
async function createExpense() {
  const description = expenseDescInput.value.trim();
  const amount = expenseAmountInput.value.trim();

  if (!description || !amount) {
    addExpenseError.textContent = "Required fields missing.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/expenses/add`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": getToken()
      },
      body: JSON.stringify({ description, amount, groupId: currentGroupId })
    });
    const data = await res.json();
    if (data.error) {
      addExpenseError.textContent = data.error;
      return;
    }

    // Success
    addExpenseModal.classList.add("hidden");
    expenseDescInput.value = "";
    expenseAmountInput.value = "";
    addExpenseError.textContent = "";
    loadGroupExpenses(currentGroupId);

  } catch (e) {
    console.error(e);
    addExpenseError.textContent = "Server error.";
  }
}

async function createGroup() {
  const name = createPageGroupName.value.trim();
  const description = createPageGroupDesc.value.trim();

  if (!name) {
    createPageError.textContent = "Group name is required.";
    return;
  }

  const token = getToken();
  if (!token) return;

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
      createPageError.textContent = data.error;
      return;
    }

    // success
    createPageGroupName.value = "";
    createPageGroupDesc.value = "";
    createPageError.textContent = "";

    // switch back to main
    pageMode = "main";
    applyPageMode();
    loadMyGroups();

  } catch (e) {
    createPageError.textContent = "Server error.";
  }
}

async function addMemberToGroup() {
  const username = addMemberUsername.value.trim();
  if (!username) {
    addMemberError.textContent = "Enter a username";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/groups/add-member`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": getToken()
      },
      body: JSON.stringify({ groupId: currentGroupId, username })
    });
    const data = await res.json();
    if (data.error) {
      addMemberError.textContent = data.error;
      return;
    }

    // Success
    addMemberModal.classList.add("hidden");
    addMemberUsername.value = "";
    addMemberError.textContent = "";
    loadGroupDetail(currentGroupId); // Refresh members AND balances

  } catch (e) {
    console.error(e);
    addMemberError.textContent = "Server error";
  }
}


// --- UI Navigation & Layout ---

function applyPageMode() {
  mainLayout.classList.add('hidden');
  createGroupPage.classList.add('hidden');
  allGroupsPage.classList.add('hidden');
  invitesPage.classList.add('hidden');

  if (pageMode === 'createGroup') {
    createGroupPage.classList.remove('hidden');
  } else if (pageMode === 'allGroups') {
    allGroupsPage.classList.remove('hidden');
    renderAllGroupsPage();
  } else if (pageMode === 'invites') {
    invitesPage.classList.remove('hidden');
    renderInvitesPage();
  } else {
    mainLayout.classList.remove('hidden');
  }
}
// --- Event Listeners and Helpers ---

function renderInvitesPage() {
  // Placeholder for invites
  groupInvitesList.innerHTML = "<p class='small'>No new invites at the moment.</p>";
}


function renderUserDropdown() {
  // Re-create the menu toggle button since we might have cleared it
  currentUserArea.innerHTML = `
      <button class="icon-button" id="menuToggleBtn" aria-label="Menu">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
    `;

  // Bind click
  document.getElementById("menuToggleBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    headerMenu.classList.toggle("hidden");
  });
}

// Temporary placeholders for All Groups Page
function renderAllGroupsPage() {
  // In a real app we might fetch again or reuse logic
  const tokens = getToken();
  if (!tokens) return;

  // fetch my groups again to populate this
  fetch(`${API_BASE}/groups/my`, { headers: { "Authorization": tokens } })
    .then(r => r.json())
    .then(groups => {
      allGroupsList.innerHTML = "";
      if (!groups || !groups.length) {
        allGroupsList.innerHTML = "<p>No groups found.</p>";
        return;
      }
      groups.forEach(g => {
        const d = document.createElement("div");
        d.className = "group-card-full";
        d.innerHTML = `
             <div class="group-card-full-header">
                <div>
                   <h3>${g.name}</h3>
                   <p class="small">${g.description || 'No description'}</p>
                </div>
                <button class="secondary small" onclick="openGroupFromAll('${g._id}')">View</button>
             </div>
            `;
        allGroupsList.appendChild(d);
      });
    })
    .catch(e => console.error(e));
}

// Helper to open group from All Groups page
window.openGroupFromAll = (gid) => {
  currentGroupId = gid;
  pageMode = "main";
  applyPageMode();
  loadGroupDetail(gid);
  // update sidebar
  document.querySelectorAll(".group-item").forEach(el => el.classList.remove("active"));
  // We can't easily find the sidebar element without ID, but it's fine.
}


// --- Event Listeners ---

toggleAuthModeLink.addEventListener("click", () => {
  authMode = authMode === "login" ? "register" : "login";
  updateAuthMode();
});

authSubmitBtn.addEventListener("click", () => {
  if (authMode === "login") loginUser();
  else registerUser();
});

// Menu Actions
menuLogoutBtn.addEventListener("click", () => {
  headerMenu.classList.add("hidden");
  logout();
});

menuCreateGroupBtn.addEventListener("click", () => {
  headerMenu.classList.add("hidden");
  pageMode = "createGroup";
  applyPageMode();
});

menuGroupsBtn.addEventListener("click", () => {
  headerMenu.classList.add("hidden");
  pageMode = "main";
  applyPageMode();
});

menuInvitesBtn.addEventListener("click", () => {
  headerMenu.classList.add("hidden");
  pageMode = "invites";
  applyPageMode();
});

// Create Group Page
createPageCreateBtn.addEventListener("click", createGroup);

createPageCancelBtn.addEventListener("click", () => {
  pageMode = "main";
  applyPageMode();
});



// Add Member Modal
openAddMemberBtn.addEventListener("click", () => {
  addMemberModal.classList.remove("hidden");
});
cancelAddMemberBtn.addEventListener("click", () => {
  addMemberModal.classList.add("hidden");
  addMemberError.textContent = "";
});
confirmAddMemberBtn.addEventListener("click", addMemberToGroup);

// Add Expense Modal
openAddExpenseBtn.addEventListener("click", () => {
  addExpenseModal.classList.remove("hidden");
});
cancelAddExpenseBtn.addEventListener("click", () => {
  addExpenseModal.classList.add("hidden");
  addExpenseError.textContent = "";
});
confirmAddExpenseBtn.addEventListener("click", createExpense);

// Expense Detail
closeDetailBtn.addEventListener("click", () => {
  expenseDetailModal.classList.add("hidden");
});
deleteExpenseBtn.addEventListener("click", deleteExpense);

// Global clicks to close menu
document.addEventListener('click', (e) => {
  if (!headerMenu || headerMenu.classList.contains('hidden')) return;
  const toggleBtn = document.getElementById('menuToggleBtn');
  if (headerMenu.contains(e.target) || (toggleBtn && toggleBtn.contains(e.target))) {
    return;
  }
  headerMenu.classList.add('hidden');
});

// Profile Logic
menuProfileBtn.addEventListener("click", () => {
  headerMenu.classList.add("hidden");
  profileModal.classList.remove("hidden");
  // Pre-fill
  // In real app we fetch user profile. 
  // Here we use localStorage or just placeholder.
  profileNameInput.value = localStorage.getItem("name") || "";
});

cancelProfileBtn.addEventListener("click", () => {
  profileModal.classList.add("hidden");
});

saveProfileBtn.addEventListener("click", () => {
  const newName = profileNameInput.value.trim();
  if (newName) {
    // Mock save
    localStorage.setItem("name", newName); 
    alert("Profile updated (Local Only)");
    profileModal.classList.add("hidden");
  }
});


// Initialization
(function init() {
  updateAppVisibility();
  updateAuthMode();
  if (getToken()) {
    loadMyGroups();
  }
})();