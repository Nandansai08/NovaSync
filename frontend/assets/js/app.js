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
const closeProfileBtn = document.getElementById("closeProfileBtn");
const menuProfileBtn = document.getElementById("menuProfile");
const currentAvatarDisplay = document.getElementById("currentAvatarDisplay");
const avatarGrid = document.getElementById("avatarGrid");

const AVATARS = ["😊", "😎", "🐱", "🐶", "🦊", "🦁", "🐸", "🦄", "🤖", "👻", "👽", "💩"];
let currentAvatar = "😊";

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
  const settlementPlanArea = document.getElementById("settlementPlanArea");

  if (settlementPlanArea) settlementPlanArea.innerHTML = "<p>Loading...</p>";

  try {
    const tokens = getToken();
    if (!tokens) return;
    const res = await fetch(`${API_BASE}/expenses/group/${groupId}/balances`, {
      headers: { "Authorization": tokens }
    });
    const data = await res.json();

    if (data.error) {
      if (settlementPlanArea) settlementPlanArea.innerHTML = `<p class="error">${data.error}</p>`;
      return;
    }

    // Display settlement plan
    if (settlementPlanArea) {
      if (!data.plan || data.plan.length === 0) {
        settlementPlanArea.innerHTML = "<p style='text-align:center; padding: 20px;'>All settled up! ✅</p>";
      } else {
        let planHTML = "";
        data.plan.forEach(p => {
          planHTML += `
            <div style="margin-bottom: 0.75rem; padding: 12px; background: #1e2530; border-radius: 8px; border-left: 4px solid #38bdf8;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: #f0f0f0;">${p.from}</strong> 
                  <span style="color: #94a3b8;">→</span> 
                  <strong style="color: #f0f0f0;">${p.to}</strong>
                </div>
                <span style="color: #38bdf8; font-weight: 700; font-size: 1.1rem;">₹${p.amount.toFixed(2)}</span>
              </div>
            </div>
          `;
        });
        settlementPlanArea.innerHTML = planHTML;
      }
    }

  } catch (e) {
    console.error(e);
    if (settlementPlanArea) settlementPlanArea.innerHTML = "<p>Error loading settlement plan</p>";
  }
}

// Load and Render Expenses
async function loadGroupExpenses(groupId) {
  expenseListArea.innerHTML = "<p>Loading expenses...</p>";
  try {
    const res = await fetch(`${API_BASE}/expenses/group/${groupId}`, {
      headers: { "Authorization": getToken() }
    });
    const data = await res.json();

    if (data.error) {
      expenseListArea.innerHTML = `<p class="error">${data.error}</p>`;
      return;
    }

    if (!data || data.length === 0) {
      expenseListArea.innerHTML = "<p class='small'>No expenses yet. Add one!</p>";
      return;
    }

    renderExpenses(data);
  } catch (e) {
    console.error(e);
    expenseListArea.innerHTML = "<p>Error loading expenses</p>";
  }
}

function renderExpenses(expenses) {
  expenseListArea.innerHTML = "";
  expenses.forEach(ex => {
    const div = document.createElement("div");
    div.className = "expense-card";
    div.style.cursor = "pointer";
    div.innerHTML = `
      <div class="flex-space">
        <strong>${ex.description}</strong>
        <span style="color:var(--brand-primary);">₹${parseFloat(ex.amount).toFixed(2)}</span>
      </div>
      <div class="small" style="opacity:0.7; margin-top:0.2rem;">
        Paid by ${ex.paidBy ? ex.paidBy.name : 'Unknown'}
      </div>
    `;
    div.addEventListener("click", () => showExpenseDetails(ex));
    expenseListArea.appendChild(div);
  });
}

function showExpenseDetails(ex) {
  currentSelectedExpenseId = ex._id;
  expenseDetailModal.classList.remove("hidden");
  detailDescription.textContent = ex.description;
  detailAmount.textContent = "₹" + parseFloat(ex.amount).toFixed(2);
  const date = new Date(ex.date).toLocaleString();
  const payer = ex.paidBy ? ex.paidBy.name : "Unknown";
  detailMeta.textContent = `Paid by ${payer} on ${date}`;

  // Render splits
  detailSplitsList.innerHTML = "";
  if (ex.splits && ex.splits.length > 0) {
    ex.splits.forEach(s => {
      const li = document.createElement("li");
      li.textContent = `${s.userId.name}: ₹${parseFloat(s.amount).toFixed(2)}`;
      detailSplitsList.appendChild(li);
    });
  } else {
    detailSplitsList.innerHTML = "<li>No split details available</li>";
  }
}

async function deleteExpense() {
  if (!confirm("Delete this expense?")) return;

  try {
    const res = await fetch(`${API_BASE}/expenses/${currentSelectedExpenseId}`, {
      method: 'DELETE',
      headers: { "Authorization": getToken() }
    });
    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    expenseDetailModal.classList.add("hidden");
    loadGroupExpenses(currentGroupId);
    loadGroupBalances(currentGroupId);
  } catch (e) {
    console.error(e);
    alert("Error deleting expense");
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
            ${(typeof currentGroupId === 'undefined' || !group.createdBy) ? '' :
        (group.createdBy === localStorage.getItem("userId") && m.id !== localStorage.getItem("userId")
          ? `<button class="text-danger small" onclick="removeMember('${group._id}', '${m.id}')" style="padding:0;font-size:0.7rem;">Remove</button>`
          : '')
      }
        `;
    memberListArea.appendChild(row);
  });

  // Add Remove Member / Leave Group handlers if not exists
  window.removeMember = async (groupId, userId) => {
    if (!confirm("Remove this member?")) return;
    try {
      const res = await fetch(`${API_BASE}/groups/${groupId}/members/${userId}`, {
        method: 'DELETE',
        headers: { "Authorization": getToken() }
      });
      const d = await res.json();
      if (d.error) alert(d.error);
      else {
        loadGroupDetail(groupId);
      }
    } catch (e) { console.error(e); }
  };

  // Check if we should show Leave Group button
  // We need to inject it into the header or near members
  const existingLeaveBtn = document.getElementById("leaveGroupBtn");
  if (existingLeaveBtn) existingLeaveBtn.remove();

  const leaveBtn = document.createElement("button");
  leaveBtn.id = "leaveGroupBtn";
  leaveBtn.className = "secondary small text-danger";
  leaveBtn.style.marginTop = "1rem";
  leaveBtn.textContent = "Leave Group";
  leaveBtn.onclick = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;
    try {
      const res = await fetch(`${API_BASE}/groups/${group._id}/leave`, {
        method: 'POST',
        headers: { "Authorization": getToken() }
      });
      const d = await res.json();
      if (d.error) alert(d.error);
      else {
        alert("You left the group.");
        pageMode = "main";
        loadMyGroups();
        applyPageMode();
      }
    } catch (e) { console.error(e); }
  };
  memberListArea.appendChild(leaveBtn);

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

function renderAvatarSelection() {
  avatarGrid.innerHTML = "";
  AVATARS.forEach(emoji => {
    const span = document.createElement("span");
    span.textContent = emoji;
    span.style.cursor = "pointer";
    span.style.fontSize = "1.5rem";
    span.style.padding = "0.2rem";
    if (emoji === currentAvatar) {
      span.style.border = "2px solid var(--brand-primary)";
      span.style.borderRadius = "50%";
    }
    span.addEventListener("click", () => {
      currentAvatar = emoji;
      currentAvatarDisplay.textContent = emoji;
      renderAvatarSelection();
    });
    avatarGrid.appendChild(span);
  });
}

menuProfileBtn.addEventListener("click", async () => {
  headerMenu.classList.add("hidden");
  profileModal.classList.remove("hidden");

  // Fetch latest profile
  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: { "Authorization": getToken() }
    });
    const user = await res.json();
    if (user) {
      profileNameInput.value = user.name || "";
      profileBioInput.value = user.bio || "";
      currentAvatar = user.avatar || "😊";
      currentAvatarDisplay.textContent = currentAvatar;
    }
    renderAvatarSelection();
  } catch (e) {
    console.error(e);
    // Fallback
    profileNameInput.value = localStorage.getItem("name") || "";
  }
});

closeProfileBtn.addEventListener("click", () => profileModal.classList.add("hidden"));
cancelProfileBtn.addEventListener("click", () => profileModal.classList.add("hidden"));

saveProfileBtn.addEventListener("click", async () => {
  const name = profileNameInput.value.trim();
  const bio = profileBioInput.value.trim();

  if (!name) {
    alert("Name is required");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        "Authorization": getToken()
      },
      body: JSON.stringify({ name, bio, avatar: currentAvatar })
    });
    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    // Update local storage
    localStorage.setItem("name", data.user.name);

    alert("Profile updated!");
    profileModal.classList.add("hidden");

  } catch (e) {
    console.error(e);
    alert("Server error updating profile");
  }
});


// Tab Switching Logic
const settlementTab = document.getElementById("settlementTab");
const chatTab = document.getElementById("chatTab");
const settlementView = document.getElementById("settlementView");
const chatView = document.getElementById("chatView");

if (settlementTab && chatTab && settlementView && chatView) {
  settlementTab.addEventListener("click", () => {
    settlementTab.classList.add("active");
    chatTab.classList.remove("active");
    settlementView.classList.remove("hidden");
    chatView.classList.add("hidden");
  });

  chatTab.addEventListener("click", () => {
    chatTab.classList.add("active");
    settlementTab.classList.remove("active");
    chatView.classList.remove("hidden");
    settlementView.classList.add("hidden");
  });
}

// Initialization
(function init() {
  updateAppVisibility();
  updateAuthMode();
  if (getToken()) {
    loadMyGroups();
  }
})();