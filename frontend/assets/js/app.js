// frontend/assets/js/app.js

let authMode = 'login'; // or 'register'

const authSection = document.getElementById('authSection');
const appSection = document.getElementById('appSection');

const authTitle = document.getElementById('authTitle');
const authNameRow = document.getElementById('authNameRow');
const authUsernameRow = document.getElementById('authUsernameRow');
const authNameInput = document.getElementById('authName');
const authUsernameInput = document.getElementById('authUsername');
const authIdentifierInput = document.getElementById('authIdentifier');
const authPasswordInput = document.getElementById('authPassword');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const toggleAuthModeText = document.getElementById('toggleAuthModeText');
const toggleAuthModeLink = document.getElementById('toggleAuthModeLink');
const authError = document.getElementById('authError');

function updateAuthMode() {
  if (authMode === 'login') {
    authTitle.textContent = 'Login';
    authSubmitBtn.textContent = 'Login';
    toggleAuthModeText.textContent = 'New user?';
    toggleAuthModeLink.textContent = 'Create an account';
    authNameRow.classList.add('hidden');
  } else {
    authTitle.textContent = 'Register';
    authSubmitBtn.textContent = 'Register';
    toggleAuthModeText.textContent = 'Already registered?';
    toggleAuthModeLink.textContent = 'Login';
    authNameRow.classList.remove('hidden');
  }
  authError.textContent = '';
}

toggleAuthModeLink.addEventListener('click', function () {
  authMode = authMode === 'login' ? 'register' : 'login';
  authPasswordInput.value = '';
  updateAuthMode();
});

authSubmitBtn.addEventListener('click', function (e) {
  e.preventDefault();
  authError.textContent = '';

  if (authMode === 'login') {
    if (!authUsernameInput.value.trim() || !authPasswordInput.value.trim()) {
      authError.textContent = 'Please enter username and password.';
      return;
    }
    // later: call real backend login API
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
  } else {
    if (
      !authNameInput.value.trim() ||
      !authUsernameInput.value.trim() ||
      !authIdentifierInput.value.trim() ||
      !authPasswordInput.value.trim()
    ) {
      authError.textContent = 'Please fill all fields.';
      return;
    }
    // later: call real backend register API
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
  }
});

updateAuthMode();