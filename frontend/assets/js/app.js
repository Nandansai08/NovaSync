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
    if (data.userId) localStorage.setItem("userId", data.userId);

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

    // Calculate user's totals
    const currentUsername = localStorage.getItem("name") || "You";
    let totalYouOwe = 0;
    let totalYouAreOwed = 0;

    if (data.plan && data.plan.length > 0) {
      data.plan.forEach(p => {
        if (p.from === currentUsername) {
          totalYouOwe += parseFloat(p.amount);
        }
        if (p.to === currentUsername) {
          totalYouAreOwed += parseFloat(p.amount);
        }
      });
    }

    // Display settlement plan with summary
    if (settlementPlanArea) {
      let html = "";

      // Summary Cards
      html += `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
          <div style="background: #1a1f2e; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
            <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 5px;">You Owe</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #ef4444;">₹${totalYouOwe.toFixed(2)}</div>
          </div>
          <div style="background: #1a1f2e; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
            <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 5px;">You Are Owed</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #10b981;">₹${totalYouAreOwed.toFixed(2)}</div>
          </div>
        </div>
      `;

      // Settlement Plan
      if (!data.plan || data.plan.length === 0) {
        html += "<p style='text-align:center; padding: 20px;'>All settled up! ✅</p>";
      } else {
        html += "<h4 style='margin-bottom: 10px; color: #94a3b8; font-size: 0.85rem; text-transform: uppercase;'>Settlement Plan</h4>";
        data.plan.forEach(p => {
          const isYouPaying = p.from === currentUsername;
          const isYouReceiving = p.to === currentUsername;
          const highlightColor = isYouPaying ? "#ef4444" : isYouReceiving ? "#10b981" : "#38bdf8";

          html += `
            <div style="margin-bottom: 0.75rem; padding: 12px; background: #1e2530; border-radius: 8px; border-left: 4px solid ${highlightColor};">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: ${isYouPaying ? '#ef4444' : '#f0f0f0'};">${p.from}</strong> 
                  <span style="color: #94a3b8;">→</span> 
                  <strong style="color: ${isYouReceiving ? '#10b981' : '#f0f0f0'};">${p.to}</strong>
                </div>
                <span style="color: ${highlightColor}; font-weight: 700; font-size: 1.1rem;">₹${p.amount.toFixed(2)}</span>
              </div>
            </div>
          `;
        });
      }

      settlementPlanArea.innerHTML = html;
    }

  } catch (e) {
    console.error(e);
    if (settlementPlanArea) settlementPlanArea.innerHTML = "<p>Error loading settlement plan</p>";
  }
}

// --- Chat Logic ---
let chatInterval = null;

async function loadGroupChat(groupId) {
  const chatMessages = document.getElementById('chatMessages');
  // Only show loading if empty
  if (chatMessages.innerHTML.includes("Loading chat...") || chatMessages.children.length === 0) {
    chatMessages.innerHTML = "<p class='small' style='text-align:center; color:#64748b;'>Loading...</p>";
  }

  try {
    const res = await fetch(`${API_BASE}/comments/${groupId}`, {
      headers: { "Authorization": getToken() }
    });
    const comments = await res.json();

    if (comments.error) {
      chatMessages.innerHTML = `<p class="error">${comments.error}</p>`;
      return;
    }

    renderChatMessages(comments);

  } catch (e) {
    console.error(e);
    // Don't overwrite if transient error during polling
    if (chatMessages.innerHTML.includes("Loading...")) {
      chatMessages.innerHTML = "<p class='small error'>Error loading chat.</p>";
    }
  }
}

function renderChatMessages(comments) {
  const chatMessages = document.getElementById('chatMessages');
  const userId = localStorage.getItem("userId");

  // If list is empty/loading, clear it
  if (chatMessages.innerHTML.includes("Loading") || chatMessages.innerHTML.includes("Group chat coming soon")) {
    chatMessages.innerHTML = "";
  }

  // Basic optimization: clear and rebuild (simpler than diffing for now)
  // For scrolling: check if already at bottom
  const isAtBottom = chatMessages.scrollHeight - chatMessages.scrollTop === chatMessages.clientHeight;

  chatMessages.innerHTML = "";

  if (comments.length === 0) {
    chatMessages.innerHTML = "<p class='small' style='text-align: center; color: #64748b;'>No messages yet. Say hi! 👋</p>";
    return;
  }

  comments.forEach(c => {
    const isMe = c.userId._id === userId;
    const div = document.createElement('div');

    // Style bubble
    div.style.maxWidth = "80%";
    div.style.padding = "8px 12px";
    div.style.borderRadius = "12px";
    div.style.fontSize = "0.95rem";
    div.style.marginBottom = "4px";
    div.style.position = "relative";
    div.style.lineHeight = "1.4";

    if (isMe) {
      div.style.alignSelf = "flex-end";
      div.style.backgroundColor = "#3b82f6"; // Blue
      div.style.color = "white";
      div.style.borderBottomRightRadius = "2px";
    } else {
      div.style.alignSelf = "flex-start";
      div.style.backgroundColor = "#334155"; // Gray
      div.style.color = "#f1f5f9";
      div.style.borderBottomLeftRadius = "2px";
    }

    const time = new Date(c.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sender = isMe ? "" : `<div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 2px;">${c.userId.name}</div>`;

    div.innerHTML = `
      ${sender}
      <div>${c.text}</div>
      <div style="font-size: 0.7rem; opacity: 0.7; text-align: right; margin-top: 4px;">${time}</div>
    `;

    chatMessages.appendChild(div);
  });

  // Auto-scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Start/Stop Polling
function startChatPolling(groupId) {
  if (chatInterval) clearInterval(chatInterval);
  loadGroupChat(groupId); // Initial load
  chatInterval = setInterval(() => loadGroupChat(groupId), 3000); // 3s
}

function stopChatPolling() {
  if (chatInterval) clearInterval(chatInterval);
  chatInterval = null;
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();

  if (!text) return;

  // Optimistic clear
  input.value = "";

  try {
    const res = await fetch(`${API_BASE}/comments/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": getToken()
      },
      body: JSON.stringify({ groupId: currentGroupId, text })
    });
    const data = await res.json();

    if (data.error) {
      alert(data.error);
    } else {
      loadGroupChat(currentGroupId); // Refresh immediately
    }
  } catch (e) {
    console.error(e);
    alert("Error sending message");
  }
}


// Load Group Activity
async function loadGroupActivity(groupId) {
  const activityList = document.getElementById('activityFeedList');
  activityList.innerHTML = "<p class='small'>Loading activity...</p>";

  try {
    const res = await fetch(`${API_BASE}/activity/${groupId}`, {
      headers: { "Authorization": getToken() }
    });
    const data = await res.json();

    if (data.error) {
      activityList.innerHTML = `<p class="error">${data.error}</p>`;
      return;
    }

    if (!data || data.length === 0) {
      activityList.innerHTML = "<p class='small'>No recent activity.</p>";
      return;
    }

    renderActivityFeed(data);

  } catch (e) {
    console.error(e);
    activityList.innerHTML = "<p class='small error'>Error loading activity.</p>";
  }
}

function renderActivityFeed(activities) {
  const activityList = document.getElementById('activityFeedList');
  activityList.innerHTML = "";

  activities.forEach(act => {
    const div = document.createElement('div');
    div.className = 'activity-item';
    div.style.padding = '10px';
    div.style.marginBottom = '8px';
    div.style.backgroundColor = '#1e2530';
    div.style.borderRadius = '8px';
    div.style.borderLeft = '3px solid #3b82f6';

    const date = new Date(act.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Icon based on type
    let icon = '📝';
    if (act.type === 'EXPENSE_ADDED') icon = '💸';
    if (act.type === 'EXPENSE_DELETED') icon = '🗑️';
    if (act.type === 'MEMBER_ADDED') icon = '👤';
    if (act.type === 'GROUP_CREATED') icon = '✨';

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
        <span style="font-size:0.85rem; color:#94a3b8;">${date}</span>
        <span style="font-size:1.2rem;">${icon}</span>
      </div>
      <div style="font-size:0.95rem; line-height:1.4;">${act.description}</div>
    `;
    activityList.appendChild(div);
  });
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
    // Refresh activity if valid
    const actTab = document.getElementById('activityTab');
    if (actTab && actTab.classList.contains('active')) {
      loadGroupActivity(currentGroupId);
    }
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
    row.className = 'member-item';
    row.style.marginTop = '0'; // reset style

    // Avatar Initials
    const initials = m.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

    // Admin Check
    const isAdmin = String(group.createdBy) === m.id;

    row.innerHTML = `
        <div class="member-avatar-placeholder">${initials}</div>
        <div class="member-info">
            <div class="member-name">
                ${m.name} 
                ${isAdmin ? '<span class="member-badge">Admin</span>' : ''}
            </div>
            <div class="member-username">@${m.username}</div>
        </div>
        ${(typeof currentGroupId === 'undefined' || !group.createdBy) ? '' :
        (String(group.createdBy) === localStorage.getItem("userId") && m.id !== localStorage.getItem("userId")
          ? `<button class="remove-member-btn" onclick="removeMember('${group._id}', '${m.id}')" title="Remove Member">
                   <span style="font-size: 1.2rem; margin-right: 2px;">×</span> Remove
                 </button>`
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
        // Refresh activity if valid
        const actTab = document.getElementById('activityTab');
        if (actTab && actTab.classList.contains('active')) {
          loadGroupActivity(groupId);
        }
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

// Exact Splits Functions
let currentGroupMembers = [];

function renderExactSplitsUI(members) {
  currentGroupMembers = members;
  const exactSplitsList = document.getElementById('exactSplitsList');
  const totalAmount = parseFloat(document.getElementById('expenseAmount').value) || 0;

  exactSplitsList.innerHTML = '';

  members.forEach(member => {
    const div = document.createElement('div');
    div.className = 'row';
    div.style.marginBottom = '0.5rem';
    div.style.alignItems = 'center';

    const suggestedAmount = (totalAmount / members.length).toFixed(2);

    div.innerHTML = `
      <label style="flex: 1; margin: 0;">${member.name}</label>
      <input type="number" 
             class="exact-split-input" 
             data-user-id="${member.id}" 
             placeholder="0.00" 
             value="0"
             step="0.01" 
             style="flex: 0.6; margin: 0;" />
    `;
    exactSplitsList.appendChild(div);
  });

  // Add event listeners for validation
  document.querySelectorAll('.exact-split-input').forEach(input => {
    input.addEventListener('input', validateExactSplits);
  });

  validateExactSplits();
}

function validateExactSplits() {
  const totalAmount = parseFloat(document.getElementById('expenseAmount').value) || 0;
  const inputs = document.querySelectorAll('.exact-split-input');
  const validationDiv = document.getElementById('exactSplitValidation');

  let sum = 0;
  inputs.forEach(input => {
    sum += parseFloat(input.value) || 0;
  });

  const difference = Math.abs(sum - totalAmount);

  if (difference < 0.01) {
    validationDiv.innerHTML = `<span style="color: #10b981;">✓ Sum matches total: ₹${sum.toFixed(2)}</span>`;
    return true;
  } else {
    validationDiv.innerHTML = `<span style="color: #ef4444;">⚠ Sum: ₹${sum.toFixed(2)} | Total: ₹${totalAmount.toFixed(2)} | Difference: ₹${difference.toFixed(2)}</span>`;
    return false;
  }
}

function collectExactSplits() {
  const inputs = document.querySelectorAll('.exact-split-input');
  const splits = [];

  inputs.forEach(input => {
    splits.push({
      userId: input.dataset.userId,
      amount: parseFloat(input.value) || 0
    });
  });

  return splits;
  return splits;
}

// Percent Splits Functions
function renderPercentSplitsUI(members) {
  currentGroupMembers = members;
  const percentSplitsList = document.getElementById('percentSplitsList');
  const totalAmount = parseFloat(document.getElementById('expenseAmount').value) || 0;

  percentSplitsList.innerHTML = '';

  members.forEach(member => {
    const div = document.createElement('div');
    div.className = 'row';
    div.style.marginBottom = '0.5rem';
    div.style.alignItems = 'center';

    div.innerHTML = `
      <label style="flex: 1; margin: 0;">${member.name}</label>
      <div style="flex: 1.2; display: flex; align-items: center; gap: 0.5rem;">
        <input type="number" 
               class="percent-split-input" 
               data-user-id="${member.id}" 
               placeholder="0" 
               value="0"
               step="0.01" 
               max="100"
               style="width: 70px; margin: 0;" />
        <span style="font-size: 0.8rem; opacity: 0.7;">%</span>
        <span class="calc-amount" style="font-size: 0.8rem; margin-left: auto;">₹0.00</span>
      </div>
    `;
    percentSplitsList.appendChild(div);
  });

  // Add event listeners for validation and calc
  document.querySelectorAll('.percent-split-input').forEach(input => {
    input.addEventListener('input', () => {
      updatePercentCalculations(totalAmount);
      validatePercentSplits();
    });
  });

  validatePercentSplits();
}

function updatePercentCalculations(totalAmount) {
  document.querySelectorAll('.percent-split-input').forEach(input => {
    const percent = parseFloat(input.value) || 0;
    const amount = (percent / 100) * totalAmount;
    input.parentElement.querySelector('.calc-amount').textContent = `₹${amount.toFixed(2)}`;
  });
}

function validatePercentSplits() {
  const inputs = document.querySelectorAll('.percent-split-input');
  const validationDiv = document.getElementById('percentSplitValidation');

  let sum = 0;
  inputs.forEach(input => {
    sum += parseFloat(input.value) || 0;
  });

  const difference = Math.abs(sum - 100);

  if (difference < 0.01) {
    validationDiv.innerHTML = `<span style="color: #10b981;">✓ Total: ${sum.toFixed(2)}%</span>`;
    return true;
  } else {
    validationDiv.innerHTML = `<span style="color: #ef4444;">⚠ Total: ${sum.toFixed(2)}% (Target: 100%)</span>`;
    return false;
  }
}

function collectPercentSplits() {
  const inputs = document.querySelectorAll('.percent-split-input');
  const splits = [];

  inputs.forEach(input => {
    splits.push({
      userId: input.dataset.userId,
      percentage: parseFloat(input.value) || 0
    });
  });

  return splits;
}

// Create Expense
// Create Expense
async function createExpense() {
  const description = expenseDescInput.value.trim();
  const amount = expenseAmountInput.value.trim();
  const splitType = document.getElementById('expenseSplitType').value;

  if (!description || !amount) {
    addExpenseError.textContent = "Required fields missing.";
    return;
  }

  if (parseFloat(amount) <= 0) {
    addExpenseError.textContent = "Amount must be positive.";
    return;
  }

  // Validate exact/percent splits if needed
  let splits = null;
  if (splitType === 'EXACT') {
    if (!validateExactSplits()) {
      addExpenseError.textContent = "Split amounts must equal total amount.";
      return;
    }
    splits = collectExactSplits();
  } else if (splitType === 'PERCENT') {
    if (!validatePercentSplits()) {
      addExpenseError.textContent = "Percentages must sum to 100%.";
      return;
    }
    splits = collectPercentSplits();
  }

  try {
    const requestBody = { description, amount, groupId: currentGroupId, splitType };
    if (splits) {
      requestBody.splits = splits;
    }

    const res = await fetch(`${API_BASE}/expenses/add`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": getToken()
      },
      body: JSON.stringify(requestBody)
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
    document.getElementById('expenseSplitType').value = 'EQUAL';
    document.getElementById('exactSplitsContainer').classList.add('hidden');
    document.getElementById('percentSplitsContainer').classList.add('hidden');
    addExpenseError.textContent = "";
    loadGroupExpenses(currentGroupId);
    loadGroupBalances(currentGroupId);
    // Refresh activity if valid
    const actTab = document.getElementById('activityTab');
    if (actTab && actTab.classList.contains('active')) {
      loadGroupActivity(currentGroupId);
    }

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
openAddExpenseBtn.addEventListener("click", async () => {
  addExpenseModal.classList.remove("hidden");

  // Load current group members for exact splits
  if (currentGroupId) {
    try {
      const res = await fetch(`${API_BASE}/groups/${currentGroupId}`, {
        headers: { "Authorization": getToken() }
      });
      const data = await res.json();
      if (data.members) {
        currentGroupMembers = data.members;
      }
    } catch (e) {
      console.error("Error loading members:", e);
    }
  }
});
cancelAddExpenseBtn.addEventListener("click", () => {
  addExpenseModal.classList.add("hidden");
  addExpenseError.textContent = "";
  document.getElementById('exactSplitsContainer').classList.add('hidden');
});
confirmAddExpenseBtn.addEventListener("click", createExpense);

// Split Type Change
document.getElementById('expenseSplitType').addEventListener('change', (e) => {
  const exactContainer = document.getElementById('exactSplitsContainer');
  const percentContainer = document.getElementById('percentSplitsContainer');

  // Hide all first
  exactContainer.classList.add('hidden');
  percentContainer.classList.add('hidden');

  if (e.target.value === 'EXACT') {
    exactContainer.classList.remove('hidden');
    renderExactSplitsUI(currentGroupMembers);
  } else if (e.target.value === 'PERCENT') {
    percentContainer.classList.remove('hidden');
    renderPercentSplitsUI(currentGroupMembers);
  }
});

// Amount Change - Update exact splits if shown
document.getElementById('expenseAmount').addEventListener('input', () => {
  const splitType = document.getElementById('expenseSplitType').value;
  const totalAmount = parseFloat(document.getElementById('expenseAmount').value) || 0;

  if (splitType === 'EXACT' && currentGroupMembers.length > 0) {
    // If we want exact values to scale, we'd do it here, but they are manual.
    // However, percent calculations DO depend on amount.
  } else if (splitType === 'PERCENT' && currentGroupMembers.length > 0) {
    updatePercentCalculations(totalAmount);
  }
});

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
// Tab Switching Logic
const settlementTab = document.getElementById("settlementTab");
const chatTab = document.getElementById("chatTab");
const activityTab = document.getElementById("activityTab");

const settlementView = document.getElementById("settlementView");
const chatView = document.getElementById("chatView");
const activityView = document.getElementById("activityView");

// Helper to hide all views and reset tabs
function resetTabs() {
  [settlementTab, chatTab, activityTab].forEach(t => t && t.classList.remove("active"));
  [settlementView, chatView, activityView].forEach(v => v && v.classList.add("hidden"));
}

if (settlementTab && settlementView) {
  settlementTab.addEventListener("click", () => {
    resetTabs();
    stopChatPolling(); // Stop polling
    settlementTab.classList.add("active");
    settlementView.classList.remove("hidden");
    if (currentGroupId) loadGroupBalances(currentGroupId);
  });
}

if (chatTab && chatView) {
  chatTab.addEventListener("click", () => {
    resetTabs();
    chatTab.classList.add("active");
    chatView.classList.remove("hidden");
    if (currentGroupId) startChatPolling(currentGroupId);
  });
}

if (activityTab && activityView) {
  activityTab.addEventListener("click", () => {
    resetTabs();
    stopChatPolling(); // Stop polling
    activityTab.classList.add("active");
    activityView.classList.remove("hidden");
    if (currentGroupId) loadGroupActivity(currentGroupId);
  });
}

// Global Chat Listeners
const sendChatBtn = document.getElementById('sendChatBtn');
const chatInput = document.getElementById('chatInput');

if (sendChatBtn) {
  sendChatBtn.addEventListener('click', sendChatMessage);
}
if (chatInput) {
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
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