// --- User ID Functions ---
function getUserId() {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
  }
  return userId;
}

// --- Vercel KV Cloud Sync ---
async function saveTrackedItemsToServer() {
  try {
    const userId = getUserId();
    const response = await fetch(`/api/tracked-items?userId=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: trackedItems })
    });
    if (!response.ok) throw new Error('Failed to save');
    console.log('✅ Data saved to Vercel KV');
  } catch (error) {
    console.error('Error saving to KV:', error);
    localStorage.setItem('trackedItems', JSON.stringify(trackedItems));
    console.log('💾 Saved to local storage as backup');
  }
}

async function loadTrackedItemsFromServer() {
  try {
    const userId = getUserId();
    const response = await fetch(`/api/tracked-items?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to load');
    const data = await response.json();
    trackedItems = Array.isArray(data) ? data : [];
    console.log('✅ Data loaded from Vercel KV:', trackedItems.length, 'items');
  } catch (error) {
    console.error('Error loading from KV:', error);
    const local = localStorage.getItem('trackedItems');
    trackedItems = local ? JSON.parse(local) : [];
    console.log('💾 Loaded from local storage');
  }
}

// --- Globals ---
let trackedItems = [];
let trackingIntervals = {};
let quotaUsed = parseInt(localStorage.getItem('youtubequotaused') || '0');
let quotaResetTime = localStorage.getItem('youtubequotareset') || new Date().toDateString();
let instagramQuotaUsed = parseFloat(localStorage.getItem('instagramquotaused') || '0');
let instagramQuotaLimit = 10.00;
let instagramQuotaResetTime = localStorage.getItem('instagramquotareset') || new Date().toDateString();

document.addEventListener('DOMContentLoaded', async function() {
  await loadTrackedItemsFromServer();
  autoLoadSavedAPIs();
  updateApiStatus(localStorage.getItem('youtubeapikey') ? true : false);
  if (typeof updateInstagramQuotaDisplay === 'function') updateInstagramQuotaDisplay();
  if (typeof renderSavedKeys === 'function') renderSavedKeys();
  if (typeof renderTrackedItems === 'function') renderTrackedItems();
  if (typeof updateStatus === 'function') updateStatus();
  if (typeof initializeApifyStatus === 'function') initializeApifyStatus();
  trackedItems.forEach(item => { if (item.isTracking) item.isTracking = false; });
});

// --- API Key Management ---
function autoLoadSavedAPIs() {
  const youtubeAPIs = JSON.parse(localStorage.getItem('savedyoutubeapis') || '{}');
  const apifyAPIs = JSON.parse(localStorage.getItem('savedapifyapis') || '{}');
  const ytOwners = Object.keys(youtubeAPIs);
  if (ytOwners.length > 0) {
    const currentOwner = localStorage.getItem('currentyoutubeowner');
    if (!currentOwner || !youtubeAPIs[currentOwner]) {
      const firstOwner = ytOwners[0];
      localStorage.setItem('youtubeapikey', youtubeAPIs[firstOwner]);
      localStorage.setItem('currentyoutubeowner', firstOwner);
    }
  }
  const apifyOwners = Object.keys(apifyAPIs);
  if (apifyOwners.length > 0) {
    const currentOwner = localStorage.getItem('currentapifyowner');
    if (!currentOwner || !apifyAPIs[currentOwner]) {
      const firstOwner = apifyOwners[0];
      localStorage.setItem('apifytoken', apifyAPIs[firstOwner]);
      localStorage.setItem('currentapifyowner', firstOwner);
    }
  }
}

// --- updateApiStatus function (critical for status and error UI) ---
function updateApiStatus(isValid, errorMsg) {
  const status = document.getElementById('apiStatus');
  if (!status) return;
  if (isValid) {
    status.innerHTML = '<span style="color: green;"><i class="fas fa-check"></i> API Key Valid</span>';
  } else {
    status.innerHTML = `<span style="color: red;"><i class="fas fa-times"></i> ${errorMsg || 'API Key Required'}</span>`;
  }
}

// --- Additional utility functions (put yours here) ---
// Example only:
/*
function updateInstagramQuotaDisplay() {}
function renderSavedKeys() {}
function renderTrackedItems() {}
function updateStatus() {}
function initializeApifyStatus() {}
*/
