const state = {
  successCount: 0,
  failureCount: 0,
};

const elements = {
  apiVersion: document.getElementById("api-version"),
  apiDelay: document.getElementById("api-delay"),
  apiErrorRate: document.getElementById("api-error-rate"),
  burstButton: document.getElementById("burst-button"),
  callApiButton: document.getElementById("call-api-button"),
  failureCount: document.getElementById("failure-count"),
  lastStatus: document.getElementById("last-status"),
  responsePanel: document.getElementById("response-panel"),
  statusPill: document.getElementById("status-pill"),
  successCount: document.getElementById("success-count"),
};

async function bootstrap() {
  bindEvents();
  await loadConfig();
}

function bindEvents() {
  elements.callApiButton.addEventListener("click", async () => {
    await requestInfo();
  });

  elements.burstButton.addEventListener("click", async () => {
    await runBurst(20);
  });
}

async function loadConfig() {
  try {
    const response = await fetch("/api/config");
    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(payload.details || payload.error || `HTTP ${response.status}`);
    }

    elements.apiVersion.textContent = payload.version ?? "-";
    elements.apiDelay.textContent = `${payload.responseDelayMs ?? 0} ms`;
    elements.apiErrorRate.textContent = `${Math.round((payload.errorRate ?? 0) * 100)}%`;
    setStatus("success", "Ready");
  } catch (error) {
    elements.apiVersion.textContent = "-";
    elements.apiDelay.textContent = "-";
    elements.apiErrorRate.textContent = "-";
    elements.responsePanel.textContent = `Failed to load config: ${error.message}`;
    setStatus("error", "Config error");
  }
}

async function requestInfo() {
  setStatus("loading", "Loading");

  try {
    const response = await fetch("/api/info", {
      headers: {
        "X-Request-Id": crypto.randomUUID(),
      },
    });

    const payload = await parseJsonResponse(response);
    updateResponse(response.status, payload);
    return response.ok;
  } catch (error) {
    state.failureCount += 1;
    renderCounters();
    elements.lastStatus.textContent = "network-error";
    elements.responsePanel.textContent = JSON.stringify(
      { ok: false, error: error.message },
      null,
      2
    );
    setStatus("error", "Error");
    return false;
  }
}

async function runBurst(size) {
  elements.burstButton.disabled = true;
  elements.callApiButton.disabled = true;

  for (let index = 0; index < size; index += 1) {
    await requestInfo();
  }

  elements.burstButton.disabled = false;
  elements.callApiButton.disabled = false;
}

function updateResponse(statusCode, payload) {
  if (statusCode >= 200 && statusCode < 400) {
    state.successCount += 1;
    setStatus("success", "Healthy");
  } else {
    state.failureCount += 1;
    setStatus("error", "Error");
  }

  renderCounters();
  elements.lastStatus.textContent = String(statusCode);
  elements.apiVersion.textContent = payload.version || "-";
  elements.responsePanel.textContent = JSON.stringify(payload, null, 2);
}

function renderCounters() {
  elements.successCount.textContent = String(state.successCount);
  elements.failureCount.textContent = String(state.failureCount);
}

function setStatus(type, label) {
  elements.statusPill.className = `pill pill-${type}`;
  elements.statusPill.textContent = label;
}

async function parseJsonResponse(response) {
  const raw = await response.text();

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Expected JSON but received: ${raw.slice(0, 160)}`
    );
  }
}

bootstrap();
