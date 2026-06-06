/**
 * @file SimulationScreen.tsx
 * @description Interactive HTML/CSS simulation of the Attendance app rendered
 * inside a WebView — lets you demo the full Login → Dashboard → Clock-In flow
 * without a live backend.
 */

import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';

// ── Simulation HTML ──────────────────────────────────────────────────────────
const SIMULATION_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<title>Attendance App Simulation</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:        #0F172A;
    --surface:   #1E293B;
    --border:    #334155;
    --accent:    #6366F1;
    --accent2:   #818CF8;
    --green:     #22C55E;
    --red:       #EF4444;
    --amber:     #F59E0B;
    --text:      #F1F5F9;
    --muted:     #94A3B8;
    --dim:       #64748B;
    --card-in:   #052E16;
    --card-out:  #1C1917;
    --border-in: #166534;
    --border-out:#44403C;
  }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── Screens ── */
  .screen { display: none; flex-direction: column; min-height: 100vh; padding: 0; animation: fadeIn .25s ease; }
  .screen.active { display: flex; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

  /* ── Shared ── */
  .btn {
    border: none; border-radius: 12px; padding: 16px;
    font-size: 16px; font-weight: 700; cursor: pointer;
    width: 100%; transition: opacity .15s, transform .1s;
  }
  .btn:active { opacity: .8; transform: scale(.98); }
  .btn-primary  { background: var(--accent); color: #fff; }
  .btn-danger   { background: #7F1D1D; color: #fff; border: 1px solid var(--red); }
  .btn-ghost    { background: var(--surface); color: var(--muted); border: 1px solid var(--border); }
  .btn-blue     { background: #1E3A5F; color: #93C5FD; border: 1px solid #1E40AF; text-align:left; display:flex; align-items:center; gap:14px; border-radius:16px; }
  .btn-amber    { background: #1C1407; color: #FCD34D; border: 1px solid #92400E; text-align:left; display:flex; align-items:center; gap:14px; border-radius:16px; }
  .btn .emoji   { font-size: 28px; }
  .btn .btn-info h3 { color: var(--text); font-size:16px; margin-bottom:3px; }
  .btn .btn-info p  { font-size:12px; opacity:.8; font-weight:400; }

  input {
    background: var(--bg); border: 1px solid var(--border); border-radius: 10px;
    color: var(--text); font-size: 15px; padding: 12px 14px; width: 100%;
    outline: none; transition: border-color .2s;
  }
  input:focus { border-color: var(--accent); }
  label { font-size:13px; font-weight:600; color:var(--muted); display:block; margin-bottom:6px; }
  .input-group { margin-bottom:16px; }
  .error-banner {
    background: #450A0A; border: 1px solid #7F1D1D;
    border-radius: 10px; padding: 12px; color: #FCA5A5;
    font-size: 13px; margin-bottom: 16px; display:none;
  }
  .pill {
    background: rgba(255,255,255,.06); border-radius:10px;
    padding: 8px 12px; display:inline-block;
  }
  .pill .pill-label { font-size:10px; color:var(--dim); font-weight:700; letter-spacing:1px; }
  .pill .pill-value { font-size:15px; font-weight:700; color:var(--text); margin-top:2px; }
  .pill .pill-value.auto  { color: #34D399; }
  .pill .pill-value.manual{ color: #F59E0B; }

  /* ── Login Screen ── */
  #login {
    align-items: center; justify-content: center;
    padding: 48px 24px;
  }
  .brand { text-align:center; margin-bottom:40px; }
  .logo-circle {
    width:72px; height:72px; border-radius:50%;
    background:var(--surface); border:2px solid var(--accent);
    font-size:32px; display:flex; align-items:center; justify-content:center;
    margin: 0 auto 12px;
  }
  .brand h1 { font-size:28px; font-weight:800; letter-spacing:-.5px; }
  .brand p  { font-size:14px; color:var(--dim); margin-top:4px; }
  .card {
    background:var(--surface); border:1px solid var(--border);
    border-radius:20px; padding:24px; width:100%; max-width:400px;
  }
  .card h2 { font-size:20px; font-weight:700; margin-bottom:24px; }
  .footer-text { margin-top:32px; color:var(--border); font-size:12px; }

  /* ── Dashboard Screen ── */
  #dashboard { padding: 0; }
  .dash-header {
    display:flex; justify-content:space-between; align-items:flex-start;
    padding: 56px 20px 0;
  }
  .dash-header h2 { font-size:22px; font-weight:700; }
  .dash-header p  { font-size:13px; color:var(--dim); margin-top:2px; }
  .logout-btn {
    background:var(--surface); border:1px solid var(--border);
    border-radius:8px; padding:8px 14px; color:var(--muted);
    font-size:13px; font-weight:600; cursor:pointer;
  }
  .dash-body { padding: 0 20px 40px; }
  .status-card {
    border-radius:20px; padding:20px; margin: 16px 0;
    border: 1px solid;
  }
  .status-card.clocked-out { background:var(--card-out); border-color:var(--border-out); }
  .status-card.clocked-in  { background:var(--card-in);  border-color:var(--border-in);  }
  .status-icon { font-size:20px; margin-bottom:4px; }
  .status-label { font-size:18px; font-weight:700; margin-bottom:16px; }
  .pills-row { display:flex; flex-wrap:wrap; gap:8px; }
  .gps-row {
    display:flex; align-items:center; gap:6px;
    background:var(--surface); border-radius:10px;
    padding:10px 14px; margin-bottom:16px; font-size:12px; color:var(--dim);
    font-family: monospace;
  }
  .action-title { font-size:13px; font-weight:700; color:var(--dim); letter-spacing:1px; margin-bottom:12px; }
  .actions { display:flex; flex-direction:column; gap:12px; }

  /* ── Manual Modal ── */
  #manualModal {
    position:fixed; inset:0; background:var(--bg); z-index:100;
    display:none; flex-direction:column; padding:24px; overflow-y:auto;
    animation: slideUp .3s ease;
  }
  #manualModal.open { display:flex; }
  @keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
  .modal-header { margin-bottom:24px; }
  .modal-header h2 { font-size:24px; font-weight:700; }
  .modal-header p  { font-size:12px; color:var(--dim); font-family:monospace; margin-top:4px; }
  .camera-mock {
    background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%);
    border-radius:16px; height:240px; margin-bottom:24px;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    border: 1px solid var(--border); position:relative; overflow:hidden;
  }
  .camera-mock .scan-line {
    position:absolute; top:0; left:0; right:0; height:2px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    animation: scan 2s linear infinite;
  }
  @keyframes scan { from{top:0} to{top:100%} }
  .camera-mock p { color:var(--muted); font-size:14px; margin-top:12px; }
  .capture-btn {
    width:64px; height:64px; border-radius:50%;
    background:rgba(255,255,255,.2); border:none;
    display:flex; align-items:center; justify-content:center; cursor:pointer;
  }
  .capture-inner { width:48px; height:48px; border-radius:50%; background:#fff; }
  .photo-preview {
    border-radius:16px; height:240px; margin-bottom:24px;
    background: linear-gradient(135deg, #1E3A5F, #312E81);
    display:none; align-items:center; justify-content:center;
    font-size:48px; position:relative;
  }
  .photo-preview.show { display:flex; }
  .retake-btn {
    position:absolute; bottom:12px; right:12px;
    background:rgba(0,0,0,.6); border:none; border-radius:8px;
    color:#fff; padding:6px 12px; font-size:12px; font-weight:600; cursor:pointer;
  }
  textarea {
    background:var(--bg); border:1px solid var(--border); border-radius:12px;
    color:var(--text); font-size:15px; padding:14px; width:100%; resize:none;
    outline:none; font-family:inherit; transition:border-color .2s;
  }
  textarea:focus { border-color:var(--accent); }
  .char-count { font-size:11px; color:var(--dim); text-align:right; margin-top:4px; }
  .modal-actions { display:flex; gap:12px; margin-top:8px; }
  .modal-actions .btn { flex:1; }
  .modal-actions .btn-primary { flex:2; }

  /* ── Toast ── */
  #toast {
    position:fixed; bottom:32px; left:50%; transform:translateX(-50%) translateY(80px);
    background:var(--surface); border:1px solid var(--border);
    border-radius:12px; padding:12px 20px; font-size:14px; font-weight:600;
    color:var(--text); z-index:200; white-space:nowrap;
    transition:transform .3s cubic-bezier(.175,.885,.32,1.275);
    box-shadow: 0 8px 32px rgba(0,0,0,.4);
  }
  #toast.show { transform:translateX(-50%) translateY(0); }

  /* ── Loading spinner ── */
  .spinner { display:inline-block; width:20px; height:20px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:spin .6s linear infinite; vertical-align:middle; margin-right:8px; }
  @keyframes spin { to { transform:rotate(360deg); } }

  /* ── Clock-out status card ── */
  .time-badge { font-size:11px; color:var(--dim); margin-bottom:4px; font-weight:700; letter-spacing:1px; }
</style>
</head>
<body>

<!-- ══ SCREEN 1: Login ════════════════════════════════════════════════════ -->
<div id="login" class="screen active">
  <div class="brand">
    <div class="logo-circle">🏢</div>
    <h1>Attendance</h1>
    <p>Clock in with precision</p>
  </div>
  <div class="card">
    <h2>Sign In</h2>
    <div class="input-group">
      <label>Username</label>
      <input id="username" type="text" placeholder="Enter your username" />
    </div>
    <div class="input-group">
      <label>Password</label>
      <input id="password" type="password" placeholder="Enter your password" />
    </div>
    <div id="loginError" class="error-banner">⚠️ Invalid username or password.</div>
    <button class="btn btn-primary" id="loginBtn" onclick="handleLogin()">Sign In →</button>
  </div>
  <p class="footer-text">Powered by HRMS · Attendance Phase 1</p>
</div>

<!-- ══ SCREEN 2: Dashboard ════════════════════════════════════════════════ -->
<div id="dashboard" class="screen">
  <div class="dash-header">
    <div>
      <h2 id="greetingName">👋 John</h2>
      <p id="todayDate"></p>
    </div>
    <button class="logout-btn" onclick="handleLogout()">Sign out</button>
  </div>
  <div class="dash-body">

    <!-- Status card (not clocked in) -->
    <div id="cardOut" class="status-card clocked-out">
      <div class="status-icon">🔴</div>
      <div class="status-label">Not Clocked In</div>
      <p style="color:var(--dim);font-size:14px;">No attendance record for today.</p>
    </div>

    <!-- Status card (clocked in) - hidden initially -->
    <div id="cardIn" class="status-card clocked-in" style="display:none;">
      <div class="status-icon">🟢</div>
      <div class="status-label">Currently Clocked In</div>
      <div class="pills-row" id="pillsRow"></div>
    </div>

    <!-- GPS -->
    <div class="gps-row">
      <span>📍</span>
      <span>13.756331, 100.501765 · Bangkok</span>
    </div>

    <!-- Actions: not clocked in -->
    <div id="actionsCheckIn">
      <div class="action-title">CHECK-IN OPTIONS</div>
      <div class="actions">
        <button class="btn btn-blue" onclick="handleAutoCheckIn()">
          <span class="emoji">🛰️</span>
          <div class="btn-info">
            <h3>Auto Check-In</h3>
            <p>Uses GPS · instant, no approval needed</p>
          </div>
        </button>
        <button class="btn btn-amber" onclick="openManualModal()">
          <span class="emoji">📸</span>
          <div class="btn-info">
            <h3>Manual Check-In</h3>
            <p>Photo + reason required · pending approval</p>
          </div>
        </button>
      </div>
    </div>

    <!-- Action: clocked in → clock out -->
    <div id="actionsCheckOut" style="display:none;">
      <button class="btn btn-danger" style="font-size:18px;font-weight:800;padding:20px;" onclick="handleClockOut()">
        🏁&nbsp; Clock Out
      </button>
    </div>

  </div>
</div>

<!-- ══ MODAL: Manual Check-In ════════════════════════════════════════════ -->
<div id="manualModal">
  <div class="modal-header">
    <h2>Manual Check-In</h2>
    <p>📍 13.756331, 100.501765</p>
  </div>

  <!-- Camera / Preview -->
  <div id="cameraView" class="camera-mock">
    <div class="scan-line"></div>
    <button class="capture-btn" onclick="capturePhoto()">
      <div class="capture-inner"></div>
    </button>
    <p>Tap to capture</p>
  </div>
  <div id="photoPreview" class="photo-preview">
    🤳
    <button class="retake-btn" onclick="retakePhoto()">↩ Retake</button>
  </div>

  <!-- Reason -->
  <div class="input-group">
    <label>Reason *</label>
    <textarea id="reasonText" rows="3" maxlength="1000" placeholder="Why are you checking in manually?" oninput="updateCharCount()"></textarea>
    <div class="char-count"><span id="charCount">0</span>/1000</div>
  </div>

  <div class="modal-actions">
    <button class="btn btn-ghost" onclick="closeManualModal()">Cancel</button>
    <button class="btn btn-primary" id="submitManualBtn" onclick="handleManualSubmit()" disabled style="opacity:.5;">
      Submit Check-In
    </button>
  </div>
</div>

<!-- Toast -->
<div id="toast"></div>

<script>
  // ── State ───────────────────────────────────────────────────────────────
  let isClockedIn    = false;
  let clockInTime    = null;
  let checkInMethod  = 'Auto';
  let photoCaptured  = false;

  // ── Helpers ─────────────────────────────────────────────────────────────
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  function showToast(msg, duration = 2500) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), duration);
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  }

  function today() {
    return new Date().toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'long' });
  }

  // ── Login ────────────────────────────────────────────────────────────────
  function handleLogin() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    const err = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');

    if (!u || !p) { err.style.display='block'; err.textContent='⚠️ Please enter username and password.'; return; }
    err.style.display = 'none';
    btn.innerHTML = '<span class="spinner"></span>Signing in…';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = 'Sign In →';
      btn.disabled = false;
      if (u === 'admin' && p === 'wrong') {
        err.style.display='block'; err.textContent='⚠️ Invalid username or password.';
        return;
      }
      const name = u.charAt(0).toUpperCase() + u.slice(1);
      document.getElementById('greetingName').textContent = '👋 ' + name;
      document.getElementById('todayDate').textContent = today();
      showScreen('dashboard');
      showToast('✅ Welcome back, ' + name + '!');
    }, 1000);
  }

  function handleLogout() {
    isClockedIn = false; clockInTime = null; photoCaptured = false;
    resetDashboard();
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('loginError').style.display = 'none';
    showScreen('login');
  }

  // ── Auto Check-In ────────────────────────────────────────────────────────
  function handleAutoCheckIn() {
    const btn = document.querySelector('.btn-blue');
    btn.innerHTML = '<span class="spinner"></span><div class="btn-info"><h3>Checking in…</h3><p>Acquiring GPS</p></div>';
    btn.disabled = true;

    setTimeout(() => {
      clockIn('Auto');
      btn.innerHTML = '<span class="emoji">🛰️</span><div class="btn-info"><h3>Auto Check-In</h3><p>Uses GPS · instant, no approval needed</p></div>';
      btn.disabled = false;
    }, 1200);
  }

  // ── Manual Modal ─────────────────────────────────────────────────────────
  function openManualModal() {
    checkInMethod = 'Manual';
    photoCaptured = false;
    document.getElementById('reasonText').value = '';
    document.getElementById('charCount').textContent = '0';
    document.getElementById('cameraView').style.display = 'flex';
    document.getElementById('photoPreview').classList.remove('show');
    document.getElementById('submitManualBtn').disabled = true;
    document.getElementById('submitManualBtn').style.opacity = '.5';
    document.getElementById('manualModal').classList.add('open');
  }

  function closeManualModal() {
    document.getElementById('manualModal').classList.remove('open');
  }

  function capturePhoto() {
    photoCaptured = true;
    document.getElementById('cameraView').style.display = 'none';
    document.getElementById('photoPreview').classList.add('show');
    updateSubmitState();
    showToast('📸 Photo captured!');
  }

  function retakePhoto() {
    photoCaptured = false;
    document.getElementById('cameraView').style.display = 'flex';
    document.getElementById('photoPreview').classList.remove('show');
    updateSubmitState();
  }

  function updateCharCount() {
    const val = document.getElementById('reasonText').value;
    document.getElementById('charCount').textContent = val.length;
    updateSubmitState();
  }

  function updateSubmitState() {
    const hasReason  = document.getElementById('reasonText').value.trim().length > 0;
    const hasPhoto   = photoCaptured;
    const btn        = document.getElementById('submitManualBtn');
    const ok         = hasReason && hasPhoto;
    btn.disabled     = !ok;
    btn.style.opacity = ok ? '1' : '.5';
  }

  function handleManualSubmit() {
    const btn = document.getElementById('submitManualBtn');
    btn.innerHTML = '<span class="spinner"></span>Submitting…';
    btn.disabled = true;

    setTimeout(() => {
      closeManualModal();
      clockIn('Manual');
    }, 1200);
  }

  // ── Clock-In / Out ────────────────────────────────────────────────────────
  function clockIn(method) {
    isClockedIn   = true;
    clockInTime   = new Date();
    checkInMethod = method;

    document.getElementById('cardOut').style.display = 'none';
    document.getElementById('cardIn').style.display  = 'block';
    document.getElementById('actionsCheckIn').style.display   = 'none';
    document.getElementById('actionsCheckOut').style.display  = 'block';

    const pr = document.getElementById('pillsRow');
    const badge = method === 'Manual'
      ? '<span class="pill-value manual">Manual</span>'
      : '<span class="pill-value auto">Auto</span>';

    pr.innerHTML = \`
      <div class="pill"><div class="pill-label">IN</div><div class="pill-value">\${formatTime(clockInTime)}</div></div>
      <div class="pill"><div class="pill-label">METHOD</div>\${badge}</div>
      <div class="pill"><div class="pill-label">APPROVED</div><div class="pill-value" style="color:\${method==='Auto'?'#34D399':'#F59E0B'}">\${method==='Auto'?'Yes':'Pending'}</div></div>
    \`;

    const msg = method === 'Auto'
      ? '✅ Auto check-in successful!'
      : '✅ Manual check-in submitted — pending approval.';
    showToast(msg);
  }

  function handleClockOut() {
    const btn = document.querySelector('#actionsCheckOut .btn');
    btn.innerHTML = '<span class="spinner"></span>Clocking out…';
    btn.disabled = true;

    setTimeout(() => {
      const now = new Date();
      isClockedIn = false;

      const pr = document.getElementById('pillsRow');
      pr.innerHTML += \`<div class="pill"><div class="pill-label">OUT</div><div class="pill-value">\${formatTime(now)}</div></div>\`;

      document.getElementById('cardIn').querySelector('.status-icon').textContent  = '⏹️';
      document.getElementById('cardIn').querySelector('.status-label').textContent = 'Shift Complete';

      document.getElementById('actionsCheckOut').style.display = 'none';
      btn.innerHTML = '🏁&nbsp; Clock Out';
      btn.disabled = false;

      showToast('👋 Clocked out. See you tomorrow!');
    }, 1000);
  }

  function resetDashboard() {
    document.getElementById('cardOut').style.display = 'block';
    document.getElementById('cardIn').style.display  = 'none';
    document.getElementById('actionsCheckIn').style.display  = 'block';
    document.getElementById('actionsCheckOut').style.display = 'none';
    const btn = document.querySelector('.btn-blue');
    if (btn) btn.innerHTML = '<span class="emoji">🛰️</span><div class="btn-info"><h3>Auto Check-In</h3><p>Uses GPS · instant, no approval needed</p></div>';
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  document.getElementById('todayDate').textContent = today();

  document.getElementById('username').addEventListener('keydown', e => { if(e.key==='Enter') document.getElementById('password').focus(); });
  document.getElementById('password').addEventListener('keydown', e => { if(e.key==='Enter') handleLogin(); });
</script>
</body>
</html>
`;

// ── Component ──────────────────────────────────────────────────────────────

interface SimulationScreenProps {
  onClose?: () => void;
}

export function SimulationScreen({ onClose }: SimulationScreenProps) {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  return (
    <View style={styles.root}>
      {/* Header bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.dot} />
          <Text style={styles.headerTitle}>App Simulation</Text>
        </View>
        {onClose && (
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>✕ Close</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Hint bar */}
      <View style={styles.hint}>
        <Text style={styles.hintText}>
          💡 Demo login: any username + any password
        </Text>
      </View>

      {/* WebView */}
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loaderText}>Loading simulation…</Text>
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ html: SIMULATION_HTML }}
        style={[styles.webview, loading && { opacity: 0 }]}
        originWhitelist={['*']}
        scrollEnabled
        showsVerticalScrollIndicator={false}
        onLoadEnd={() => setLoading(false)}
        // Suppress mixed-content warnings for inline HTML
        mixedContentMode="always"
        javaScriptEnabled
      />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  headerTitle: { fontSize: 14, fontWeight: '700', color: '#F1F5F9' },
  closeBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: '#334155',
  },
  closeText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  hint: {
    backgroundColor: '#1C1407',
    borderBottomWidth: 1, borderBottomColor: '#92400E',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  hintText: { color: '#FCD34D', fontSize: 12, fontWeight: '500' },
  webview: { flex: 1 },
  loader: {
    position: 'absolute', inset: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0F172A', zIndex: 10,
    top: 100,
  },
  loaderText: { color: '#64748B', fontSize: 14, marginTop: 12 },
});
