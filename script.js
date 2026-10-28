/* Know Your Battery — vanilla JavaScript starter
   Normal function declarations are used throughout for beginner readability. */

// Add the public EmailJS identifiers from your EmailJS account here.
var EMAILJS_CONFIG = {
  serviceId: "knowyourbattery_2001",
  templateId: "knowyourbattery_2001",
  publicKey: "Ac_EjujBGZUbW8X65",
};

var currentCalculation = null;
var recentCalculations = [];
var saveFeedbackTimeout = null;
var recentCalculationsDatabasePromise = null;
var RECENT_CALCULATIONS_DATABASE = "know-your-battery";
var RECENT_CALCULATIONS_STORE = "recent-calculations";
var RECENT_CALCULATIONS_LIMIT = 5;
var pageLabels = {
  dashboard: "Dashboard",
  calculator: "Battery Calculator",
  builder: "3D Pack Builder",
  performance: "Performance Tools",
  library: "Battery Library",
  finder: "Find My Battery",
  compare: "Compare Batteries",
  projects: "My Projects & Reports",
  about: "About Know Your Battery",
  contact: "Contact",
  help: "Help / FAQ",
  privacy: "Privacy Policy",
  terms: "Terms of Use",
  disclaimer: "Engineering Disclaimer",
};

document.addEventListener("DOMContentLoaded", function () {
  setupThemeToggle();
  setupConnectionIndicator();
  setupNavigation();
  setupCalculator();
  setupRecentCalculations();
  setupMobileMenu();
  setupDashboardButtons();
  setupPackBuilder();
  setupContactForm();
  updateResults();
  updateCopyrightYear();
  hideAppLoader();
});

function hideAppLoader() {
  var loader = document.getElementById("appLoader");
  if (!loader) return;

  loader.classList.add("is-hiding");
  window.setTimeout(function () {
    document.documentElement.classList.remove("app-loading");
    loader.remove();
  }, 240);
}
function setupConnectionIndicator() {
  var indicator = document.querySelector(".online-indicator");
  if (!indicator) return;

  function updateConnectionState(isOnline) {
    indicator.classList.toggle("is-offline", !isOnline);
    var statusText = isOnline
      ? "Network connection detected"
      : "No network connection";
    indicator.setAttribute("aria-label", statusText);
    indicator.setAttribute("title", statusText);
  }

  updateConnectionState(navigator.onLine !== false);
  window.addEventListener("online", function () {
    updateConnectionState(true);
  });
  window.addEventListener("offline", function () {
    updateConnectionState(false);
  });
}
function setupThemeToggle() {
  var toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  var savedTheme = "light";
  try {
    savedTheme =
      window.localStorage.getItem("know-your-battery-theme") || "light";
  } catch (error) {
    savedTheme = "light";
  }
  var currentTheme = savedTheme === "dark" ? "dark" : "light";
  applyTheme(currentTheme);

  toggle.addEventListener("click", function () {
    var nextTheme =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    applyTheme(nextTheme);
    try {
      window.localStorage.setItem("know-your-battery-theme", nextTheme);
    } catch (error) {}
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  var toggle = document.getElementById("themeToggle");
  if (toggle) {
    var nextTheme = theme === "dark" ? "light" : "dark";
    toggle.setAttribute("aria-label", "Toggle dark theme");
    toggle.setAttribute("title", "Switch to " + nextTheme + " theme");
    toggle.setAttribute("aria-pressed", String(theme === "dark"));
  }
}
function setupNavigation() {
  var navLinks = document.querySelectorAll("[data-page]");
  var openButtons = document.querySelectorAll("[data-open]");
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      showPage(link.getAttribute("data-page"));
    });
  });
  openButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var destination = button.getAttribute("data-open");
      if (pageLabels[destination]) showPage(destination);
    });
  });
  window.addEventListener("popstate", function () {
    var pageFromHistory = window.location.hash.slice(1);
    showPage(
      pageLabels[pageFromHistory] ? pageFromHistory : "dashboard",
      false,
    );
  });
  var initialPage = window.location.hash.slice(1);
  if (pageLabels[initialPage]) showPage(initialPage, false);
}

function showPage(pageName, updateHistory) {
  if (!pageLabels[pageName]) return;
  var pages = document.querySelectorAll("[data-page-content]");
  var links = document.querySelectorAll("[data-page]");
  var currentSection = document.getElementById("currentSection");
  var sidebar = document.getElementById("sidebar");
  pages.forEach(function (page) {
    page.classList.toggle(
      "active-page",
      page.getAttribute("data-page-content") === pageName,
    );
  });
  links.forEach(function (link) {
    var isCurrent = link.getAttribute("data-page") === pageName;
    link.classList.toggle(
      "active",
      isCurrent && link.classList.contains("nav-link"),
    );
    if (isCurrent) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  currentSection.textContent = pageLabels[pageName];
  document.title = pageLabels[pageName] + " | Know Your Battery";
  var menuWasOpen = sidebar.classList.contains("sidebar-open");
  setMobileMenuOpen(false, menuWasOpen);
  if (updateHistory !== false && window.location.hash !== "#" + pageName) {
    window.history.pushState({ page: pageName }, "", "#" + pageName);
  }
  window.scrollTo(0, 0);
}
function setupContactForm() {
  var form = document.getElementById("contactForm");
  if (!form) return;
  var fields = [
    { id: "contactName", label: "Full name" },
    { id: "contactEmail", label: "Email address" },
    { id: "contactType", label: "Enquiry type" },
    { id: "contactSubject", label: "Subject" },
    { id: "contactMessage", label: "Message" },
  ];
  var status = document.getElementById("contactStatus");
  var submitButton = document.getElementById("contactSubmit");
  var endpointNote = document.getElementById("contactEndpointNote");
  var statusTimeout = null;
  var emailJsConfigured = Boolean(
    EMAILJS_CONFIG.serviceId.trim() &&
    EMAILJS_CONFIG.templateId.trim() &&
    EMAILJS_CONFIG.publicKey.trim(),
  );

  if (endpointNote) {
    endpointNote.textContent = emailJsConfigured
      ? "Contact form messages are sent through EmailJS to damexcodeyoruba@gmail.com. You can also email the project directly."
      : "EmailJS setup is not complete yet. You can email the project directly at damexcodeyoruba@gmail.com.";
  }

  function clearFieldError(field) {
    var error = document.getElementById(field.id + "Error");
    if (error) error.textContent = "";
    field.removeAttribute("aria-invalid");
  }
  function showFieldError(field, message) {
    var error = document.getElementById(field.id + "Error");
    if (error) error.textContent = message;
    field.setAttribute("aria-invalid", "true");
  }
  function setStatus(state, message) {
    if (statusTimeout) {
      window.clearTimeout(statusTimeout);
      statusTimeout = null;
    }

    status.textContent = message;
    status.className = "contact-status" + (state ? " is-" + state : "");
    status.setAttribute("role", state === "failure" ? "alert" : "status");
    status.setAttribute(
      "aria-live",
      state === "failure" ? "assertive" : "polite",
    );

    if (state === "success" || state === "failure") {
      statusTimeout = window.setTimeout(function () {
        status.textContent = "";
        status.className = "contact-status";
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        statusTimeout = null;
      }, 5000);
    }
  }

  fields.forEach(function (item) {
    var field = document.getElementById(item.id);
    field.addEventListener("input", function () {
      clearFieldError(field);
      setStatus("", "");
    });
    field.addEventListener("change", function () {
      clearFieldError(field);
      setStatus("", "");
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    setStatus("", "");
    var firstInvalid = null;
    var invalid = false;

    fields.forEach(function (item) {
      var field = document.getElementById(item.id);
      var value = field.value.trim();
      clearFieldError(field);
      if (!value) {
        showFieldError(field, item.label + " is required.");
        invalid = true;
        if (!firstInvalid) firstInvalid = field;
      } else if (
        item.id === "contactEmail" &&
        !/^[A-Z0-9_%+-]+(?:\.[A-Z0-9_%+-]+)*@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,}$/i.test(
          value,
        )
      ) {
        showFieldError(
          field,
          "Enter a valid email address, such as name@example.com.",
        );
        invalid = true;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (invalid) {
      setStatus("failure", "Please correct the fields marked above.");
      firstInvalid.focus();
      return;
    }

    var honeypot = form.querySelector('[name="bot-field"]');
    if (honeypot && honeypot.value.trim()) {
      setStatus(
        "failure",
        "This submission could not be accepted. Your message was not sent.",
      );
      return;
    }

    if (!window.emailjs || typeof window.emailjs.sendForm !== "function") {
      setStatus(
        "failure",
        "The EmailJS service could not load. Check your connection and try again, or email damexcodeyoruba@gmail.com directly.",
      );
      return;
    }

    var originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    form.setAttribute("aria-busy", "true");
    submitButton.textContent = "Sending…";
    setStatus("submitting", "Submitting your enquiry…");

    window.emailjs
      .sendForm(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, form, {
        publicKey: EMAILJS_CONFIG.publicKey,
      })
      .then(function () {
        form.reset();
        fields.forEach(function (item) {
          clearFieldError(document.getElementById(item.id));
        });
        setStatus("success", "Your enquiry was submitted successfully.");
      })
      .catch(function () {
        setStatus(
          "failure",
          "We could not submit your enquiry. It may not have reached the project team; please try again or email damexcodeyoruba@gmail.com.",
        );
      })
      .finally(function () {
        submitButton.disabled = false;
        form.setAttribute("aria-busy", "false");
        submitButton.innerHTML = originalButtonText;
      });
  });
}

function updateCopyrightYear() {
  var year = document.getElementById("copyrightYear");
  if (year) year.textContent = String(new Date().getFullYear());
}

function setupDashboardButtons() {
  var buttonIds = ["dashboardCalcButton", "heroCalcButton", "firstCalcButton"];
  buttonIds.forEach(function (buttonId) {
    var button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener("click", function () {
        showPage("calculator");
      });
    }
  });
}

function setMobileMenuOpen(isOpen, returnFocus) {
  var menuToggle = document.getElementById("menuToggle");
  var sidebar = document.getElementById("sidebar");
  var overlay = document.getElementById("mobileOverlay");
  if (!menuToggle || !sidebar || !overlay) return;

  var isMobile = window.matchMedia("(max-width: 900px)").matches;
  var shouldOpen = isMobile && Boolean(isOpen);
  sidebar.classList.toggle("sidebar-open", shouldOpen);
  overlay.classList.toggle("overlay-visible", shouldOpen);
  menuToggle.setAttribute("aria-expanded", String(shouldOpen));
  menuToggle.setAttribute(
    "aria-label",
    shouldOpen ? "Close navigation" : "Open navigation",
  );
  menuToggle.title = shouldOpen ? "Close navigation" : "Open navigation";

  if (isMobile) {
    sidebar.inert = !shouldOpen;
    sidebar.setAttribute("aria-hidden", String(!shouldOpen));
  } else {
    sidebar.inert = false;
    sidebar.removeAttribute("aria-hidden");
  }

  if (shouldOpen) {
    var firstNavigationLink = sidebar.querySelector(".nav-list a[data-page]");
    if (firstNavigationLink) firstNavigationLink.focus();
  } else if (returnFocus) {
    menuToggle.focus();
  }
}

function setupMobileMenu() {
  var menuToggle = document.getElementById("menuToggle");
  var sidebar = document.getElementById("sidebar");
  var overlay = document.getElementById("mobileOverlay");
  if (!menuToggle || !sidebar || !overlay) return;

  menuToggle.addEventListener("click", function () {
    var isOpen = sidebar.classList.contains("sidebar-open");
    setMobileMenuOpen(!isOpen, isOpen);
  });

  overlay.addEventListener("click", function () {
    setMobileMenuOpen(false, true);
  });

  document.addEventListener("keydown", function (event) {
    if (!sidebar.classList.contains("sidebar-open")) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setMobileMenuOpen(false, true);
      return;
    }

    if (event.key !== "Tab") return;
    var focusableItems = sidebar.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusableItems.length) return;
    var firstItem = focusableItems[0];
    var lastItem = focusableItems[focusableItems.length - 1];

    if (event.shiftKey && document.activeElement === firstItem) {
      event.preventDefault();
      lastItem.focus();
    } else if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      firstItem.focus();
    }
  });

  var mobileBreakpoint = window.matchMedia("(max-width: 900px)");
  var handleBreakpointChange = function () {
    setMobileMenuOpen(false, false);
  };
  if (typeof mobileBreakpoint.addEventListener === "function") {
    mobileBreakpoint.addEventListener("change", handleBreakpointChange);
  } else if (typeof mobileBreakpoint.addListener === "function") {
    mobileBreakpoint.addListener(handleBreakpointChange);
  }

  setMobileMenuOpen(false, false);
}

function setupCalculator() {
  var form = document.getElementById("batteryForm");
  var resetButton = document.getElementById("resetButton");
  var saveButton = document.getElementById("saveCalculation");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    calculateBatteryPack();
  });

  resetButton.addEventListener("click", function () {
    window.setTimeout(function () {
      document.getElementById("formError").textContent = "";
      document.getElementById("saveFeedback").textContent = "";
      calculateBatteryPack();
    }, 0);
  });

  saveButton.addEventListener("click", saveCurrentCalculation);

  [
    "cellVoltage",
    "cellCapacity",
    "seriesCount",
    "parallelCount",
    "cellChemistry",
  ].forEach(function (fieldId) {
    document.getElementById(fieldId).addEventListener("input", function () {
      document.getElementById("formError").textContent = "";
    });
    document.getElementById(fieldId).addEventListener("change", function () {
      document.getElementById("formError").textContent = "";
    });
  });
}

function getNumberValue(fieldId) {
  return Number(document.getElementById(fieldId).value);
}

function calculateBatteryPack() {
  var cellVoltage = getNumberValue("cellVoltage");
  var cellCapacity = getNumberValue("cellCapacity");
  var seriesCount = getNumberValue("seriesCount");
  var parallelCount = getNumberValue("parallelCount");
  var chemistry = document.getElementById("cellChemistry").value;
  var errorMessage = document.getElementById("formError");

  if (
    !Number.isFinite(cellVoltage) ||
    cellVoltage <= 0 ||
    !Number.isFinite(cellCapacity) ||
    cellCapacity <= 0
  ) {
    errorMessage.textContent =
      "Enter a cell voltage and capacity greater than zero.";
    return;
  }

  if (
    !Number.isInteger(seriesCount) ||
    seriesCount < 1 ||
    !Number.isInteger(parallelCount) ||
    parallelCount < 1
  ) {
    errorMessage.textContent =
      "Series and parallel counts must be whole numbers of at least 1.";
    return;
  }

  if (
    cellVoltage > 1000 ||
    cellCapacity > 10000 ||
    seriesCount > 1000 ||
    parallelCount > 1000
  ) {
    errorMessage.textContent =
      "One or more values are outside this tool's supported range.";
    return;
  }

  var totalCells = seriesCount * parallelCount;
  if (!Number.isSafeInteger(totalCells)) {
    errorMessage.textContent =
      "The total cell count is too large to calculate safely.";
    return;
  }

  var packVoltage = cellVoltage * seriesCount;
  var packCapacity = cellCapacity * parallelCount;
  var packEnergy = packVoltage * packCapacity;

  currentCalculation = {
    cellVoltage: cellVoltage,
    cellCapacity: cellCapacity,
    seriesCount: seriesCount,
    parallelCount: parallelCount,
    chemistry: chemistry,
    totalCells: totalCells,
    packVoltage: packVoltage,
    packCapacity: packCapacity,
    packEnergy: packEnergy,
    createdAt: new Date(),
  };

  errorMessage.textContent = "";
  updateResults();
}

function formatNumber(value) {
  return Number(value.toFixed(3)).toLocaleString("en-US", {
    maximumFractionDigits: 3,
  });
}

function updateResults() {
  if (!currentCalculation) {
    currentCalculation = {
      cellVoltage: 3.6,
      cellCapacity: 2.5,
      seriesCount: 4,
      parallelCount: 3,
      chemistry: "Lithium-ion",
      totalCells: 12,
      packVoltage: 14.4,
      packCapacity: 7.5,
      packEnergy: 108,
      createdAt: new Date(),
    };
  }

  document.getElementById("configurationBadge").innerHTML =
    currentCalculation.seriesCount +
    "S" +
    currentCalculation.parallelCount +
    "P <span>•</span> " +
    currentCalculation.totalCells +
    " cells";
  document.getElementById("resultVoltage").textContent = formatNumber(
    currentCalculation.packVoltage,
  );
  document.getElementById("resultCapacity").textContent = formatNumber(
    currentCalculation.packCapacity,
  );
  document.getElementById("resultEnergy").textContent = formatNumber(
    currentCalculation.packEnergy,
  );
  document.getElementById("resultCells").textContent =
    currentCalculation.totalCells.toLocaleString("en-US");
  document.getElementById("resultCellSpec").textContent =
    formatNumber(currentCalculation.cellVoltage) + " V";
}

function setupRecentCalculations() {
  renderRecentCalculations();
  getSavedCalculations()
    .then(function (items) {
      recentCalculations = items;
      renderRecentCalculations();
    })
    .catch(function () {
      recentCalculationsDatabasePromise = null;
      showRecentCalculationsError(
        "Saved calculations could not be loaded. Check this browser’s storage settings and refresh the page.",
      );
    });
}

function openRecentCalculationsDatabase() {
  if (recentCalculationsDatabasePromise) {
    return recentCalculationsDatabasePromise;
  }

  recentCalculationsDatabasePromise = new Promise(function (resolve, reject) {
    if (!window.indexedDB) {
      reject(new Error("On-device database storage is unavailable."));
      return;
    }

    var request;
    try {
      request = window.indexedDB.open(RECENT_CALCULATIONS_DATABASE, 1);
    } catch (error) {
      reject(error);
      return;
    }

    request.onupgradeneeded = function () {
      var database = request.result;
      if (!database.objectStoreNames.contains(RECENT_CALCULATIONS_STORE)) {
        database.createObjectStore(RECENT_CALCULATIONS_STORE, {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = function () {
      var database = request.result;
      database.onversionchange = function () {
        database.close();
        recentCalculationsDatabasePromise = null;
      };
      resolve(database);
    };

    request.onerror = function () {
      recentCalculationsDatabasePromise = null;
      reject(request.error || new Error("Could not open on-device storage."));
    };

    request.onblocked = function () {
      recentCalculationsDatabasePromise = null;
      reject(new Error("On-device storage is busy in another tab."));
    };
  });

  return recentCalculationsDatabasePromise;
}

function sortSavedCalculations(items) {
  return items.sort(function (first, second) {
    return (
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
    );
  });
}

function getSavedCalculations() {
  return openRecentCalculationsDatabase().then(function (database) {
    return new Promise(function (resolve, reject) {
      var transaction;
      var items = [];
      try {
        transaction = database.transaction(
          RECENT_CALCULATIONS_STORE,
          "readonly",
        );
        var request = transaction
          .objectStore(RECENT_CALCULATIONS_STORE)
          .getAll();
        request.onsuccess = function () {
          items = request.result || [];
        };
        request.onerror = function () {
          reject(
            request.error || new Error("Could not read saved calculations."),
          );
        };
        transaction.oncomplete = function () {
          resolve(sortSavedCalculations(items));
        };
        transaction.onerror = function () {
          reject(
            transaction.error ||
              new Error("Could not read saved calculations."),
          );
        };
        transaction.onabort = function () {
          reject(
            transaction.error ||
              new Error("Could not read saved calculations."),
          );
        };
      } catch (error) {
        reject(error);
      }
    });
  });
}

function persistRecentCalculation(calculation) {
  return openRecentCalculationsDatabase().then(function (database) {
    return new Promise(function (resolve, reject) {
      var transaction;
      var retainedItems = [];
      try {
        transaction = database.transaction(
          RECENT_CALCULATIONS_STORE,
          "readwrite",
        );
        var store = transaction.objectStore(RECENT_CALCULATIONS_STORE);
        store.add(calculation);

        var request = store.getAll();
        request.onsuccess = function () {
          var allItems = sortSavedCalculations(request.result || []);
          retainedItems = allItems.slice(0, RECENT_CALCULATIONS_LIMIT);
          allItems.slice(RECENT_CALCULATIONS_LIMIT).forEach(function (item) {
            store.delete(item.id);
          });
        };
        request.onerror = function () {
          reject(request.error || new Error("Could not save the calculation."));
        };
        transaction.oncomplete = function () {
          resolve(retainedItems);
        };
        transaction.onerror = function () {
          reject(
            transaction.error || new Error("Could not save the calculation."),
          );
        };
        transaction.onabort = function () {
          reject(
            transaction.error || new Error("Could not save the calculation."),
          );
        };
      } catch (error) {
        reject(error);
      }
    });
  });
}

function saveCurrentCalculation() {
  if (!currentCalculation) {
    calculateBatteryPack();
    if (!currentCalculation) {
      return;
    }
  }

  var saveButton = document.getElementById("saveCalculation");
  var feedback = document.getElementById("saveFeedback");
  if (saveFeedbackTimeout !== null) {
    window.clearTimeout(saveFeedbackTimeout);
    saveFeedbackTimeout = null;
  }
  var originalButtonText = saveButton.innerHTML;
  var savedCalculation = {
    id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9),
    seriesCount: currentCalculation.seriesCount,
    parallelCount: currentCalculation.parallelCount,
    totalCells: currentCalculation.totalCells,
    cellVoltage: currentCalculation.cellVoltage,
    cellCapacity: currentCalculation.cellCapacity,
    packVoltage: currentCalculation.packVoltage,
    packCapacity: currentCalculation.packCapacity,
    packEnergy: currentCalculation.packEnergy,
    chemistry: currentCalculation.chemistry,
    createdAt: new Date().toISOString(),
  };

  feedback.textContent = "";
  saveButton.disabled = true;
  saveButton.setAttribute("aria-busy", "true");
  saveButton.textContent = "Saving on this device…";

  persistRecentCalculation(savedCalculation)
    .then(function (items) {
      recentCalculations = items;
      renderRecentCalculations();
      feedback.textContent = "Saved to this page's recent calculations.";
      saveFeedbackTimeout = window.setTimeout(function () {
        feedback.textContent = "";
        saveFeedbackTimeout = null;
      }, 2000);
    })
    .catch(function () {
      recentCalculationsDatabasePromise = null;
      feedback.textContent = "This calculation was not saved, try again.";
      setTimeout(function () {
        feedback.textContent = "";
      }, 3000);
    })
    .finally(function () {
      saveButton.disabled = false;
      saveButton.removeAttribute("aria-busy");
      saveButton.innerHTML = originalButtonText;
    });
}

function showRecentCalculationsError(message) {
  var container = document.getElementById("recentCalculations");
  container.className = "empty-state saved-error-state";
  container.innerHTML = "";
  var icon = document.createElement("span");
  icon.className = "empty-icon";
  icon.textContent = "!";
  var heading = document.createElement("strong");
  heading.textContent = "Saved calculations are unavailable";
  var description = document.createElement("p");
  description.textContent = message;
  container.appendChild(icon);
  container.appendChild(heading);
  container.appendChild(description);
}

function formatSavedCalculationDate(value) {
  var date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Saved calculation";
  }
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function renderRecentCalculations() {
  var container = document.getElementById("recentCalculations");
  container.innerHTML = "";

  if (recentCalculations.length === 0) {
    container.className = "empty-state";
    container.innerHTML =
      '<span class="empty-icon">⌁</span><strong>No calculations yet</strong><p>Your saved battery calculations will appear here after you save one.</p><button class="text-button" id="firstCalcButton">Create your first calculation →</button>';
    document
      .getElementById("firstCalcButton")
      .addEventListener("click", function () {
        showPage("calculator");
      });
    return;
  }

  container.className = "saved-list";
  sortSavedCalculations(recentCalculations).forEach(function (item) {
    var card = document.createElement("article");
    card.className = "saved-item";

    var heading = document.createElement("div");
    heading.className = "saved-item-top";

    var icon = document.createElement("span");
    icon.className = "saved-item-icon";
    icon.innerHTML =
      '<i class="fas fa-battery-three-quarters" aria-hidden="true"></i>';

    var titleGroup = document.createElement("div");
    titleGroup.className = "saved-item-title";
    var title = document.createElement("strong");
    title.textContent = item.seriesCount + "S" + item.parallelCount + "P pack";
    var subtitle = document.createElement("small");
    subtitle.textContent =
      item.chemistry + " · Saved " + formatSavedCalculationDate(item.createdAt);
    titleGroup.appendChild(title);
    titleGroup.appendChild(subtitle);

    var badge = document.createElement("span");
    badge.className = "saved-item-config";
    badge.textContent = item.totalCells + " cells";

    heading.appendChild(icon);
    heading.appendChild(titleGroup);
    heading.appendChild(badge);
    card.appendChild(heading);

    var metrics = document.createElement("div");
    metrics.className = "saved-item-metrics";
    [
      { label: "Voltage", value: item.packVoltage, unit: "V" },
      { label: "Capacity", value: item.packCapacity, unit: "Ah" },
      { label: "Energy", value: item.packEnergy, unit: "Wh" },
    ].forEach(function (metric) {
      var metricCard = document.createElement("div");
      metricCard.className = "saved-metric";
      var label = document.createElement("span");
      label.textContent = metric.label;
      var value = document.createElement("strong");
      value.textContent = formatNumber(metric.value);
      var unit = document.createElement("small");
      unit.textContent = metric.unit;
      value.appendChild(unit);
      metricCard.appendChild(label);
      metricCard.appendChild(value);
      metrics.appendChild(metricCard);
    });
    card.appendChild(metrics);
    container.appendChild(card);
  });
}
/* 3D Pack Builder: real-time Three.js battery pack scene. */
var builderRotation = 0;
var batteryScene3D = null;
var batteryCamera = null;
var batteryRenderer = null;
var batteryControls = null;
var batteryPackGroup = null;
var batteryResizeObserver = null;
var batteryPlatform = null;
function setupPackBuilder() {
  var updateButton = document.getElementById("updateBuilder");
  var angleSlider = document.getElementById("viewAngle");
  if (!updateButton) return;

  updateButton.addEventListener("click", updatePackBuilder);
  var rotateButton = document.getElementById("rotateBuilder");
  rotateButton.addEventListener("click", function () {
    builderRotation = (builderRotation + 15) % 360;
    if (batteryPackGroup)
      batteryPackGroup.rotation.y = (builderRotation * Math.PI) / 180;
    var sliderAngle =
      builderRotation > 180 ? builderRotation - 360 : builderRotation;
    angleSlider.value = String(Math.max(-25, Math.min(25, sliderAngle)));
    document.getElementById("viewAngleValue").textContent =
      builderRotation + "°";
  });
  angleSlider.addEventListener("input", function () {
    builderRotation = Number(angleSlider.value);
    if (batteryPackGroup)
      batteryPackGroup.rotation.y = (builderRotation * Math.PI) / 180;
    document.getElementById("viewAngleValue").textContent =
      builderRotation + "°";
  });
  [
    "builderCellVoltage",
    "builderCellCapacity",
    "builderSeries",
    "builderParallel",
    "builderCurrent",
  ].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      document.getElementById("builderError").textContent = "";
    });
  });
  initBatteryScene3D();
  updatePackBuilder();
}

function initBatteryScene3D() {
  var canvas = document.getElementById("batteryCanvas");
  if (!canvas || !window.THREE) {
    document.getElementById("sceneFallback").textContent =
      "3D library unavailable. Connect to the internet and reload.";
    return;
  }
  var THREE = window.THREE;
  batteryScene3D = new THREE.Scene();
  batteryScene3D.background = null;
  batteryScene3D.fog = new THREE.Fog(0x0b1730, 13, 27);
  batteryCamera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  batteryCamera.position.set(7.5, 6.2, 9.5);
  batteryRenderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  batteryRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  batteryRenderer.outputEncoding = THREE.sRGBEncoding;
  batteryRenderer.shadowMap.enabled = true;
  batteryRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  batteryRenderer.setClearColor(0x0b1730, 0);
  if (THREE.OrbitControls) {
    batteryControls = new THREE.OrbitControls(
      batteryCamera,
      batteryRenderer.domElement,
    );
    batteryControls.enableDamping = true;
    batteryControls.dampingFactor = 0.07;
    batteryControls.minDistance = 5;
    batteryControls.maxDistance = 20;
    batteryControls.maxPolarAngle = Math.PI;
  }

  batteryScene3D.add(new THREE.HemisphereLight(0xbfdcff, 0x18233b, 2.0));
  var keyLight = new THREE.DirectionalLight(0xffffff, 2.3);
  keyLight.position.set(5, 9, 6);
  batteryScene3D.add(keyLight);
  var blueLight = new THREE.PointLight(0x1769ff, 1.8, 18);
  blueLight.position.set(-5, 3, -3);
  batteryScene3D.add(blueLight);

  var floor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({
      color: 0x0d1b32,
      roughness: 0.92,
      metalness: 0.1,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.18;
  floor.receiveShadow = true;
  floor.visible = true;
  batteryScene3D.add(floor);
  var grid = new THREE.GridHelper(22, 22, 0x31537e, 0x1b3456);
  grid.position.y = -0.16;
  grid.material.transparent = true;
  grid.material.opacity = 0.45;
  grid.visible = true;
  batteryScene3D.add(grid);
  batteryPackGroup = new THREE.Group();
  batteryScene3D.add(batteryPackGroup);
  document.getElementById("sceneFallback").style.display = "none";
  resizeBatteryScene();
  if (typeof ResizeObserver !== "undefined") {
    batteryResizeObserver = new ResizeObserver(resizeBatteryScene);
    batteryResizeObserver.observe(document.getElementById("batteryScene"));
  } else {
    window.addEventListener("resize", resizeBatteryScene);
  }
  animateBatteryScene();
}

function resizeBatteryScene() {
  if (!batteryRenderer || !batteryCamera) return;
  var host = document.getElementById("batteryScene");
  var width = Math.max(host.clientWidth, 1);
  var height = Math.max(host.clientHeight, 1);
  batteryRenderer.setSize(width, height, false);
  batteryCamera.aspect = width / height;
  batteryCamera.updateProjectionMatrix();
}

function animateBatteryScene() {
  if (!batteryRenderer || !batteryScene3D || !batteryCamera) return;
  requestAnimationFrame(animateBatteryScene);
  if (batteryControls) batteryControls.update();
  if (batteryPlatform && batteryControls)
    batteryPlatform.visible =
      batteryCamera.position.y > batteryControls.target.y;
  batteryRenderer.render(batteryScene3D, batteryCamera);
}

function clearBatteryPack3D() {
  if (!batteryPackGroup) return;
  while (batteryPackGroup.children.length) {
    var object = batteryPackGroup.children[0];
    batteryPackGroup.remove(object);
    object.traverse(function (child) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material))
          child.material.forEach(function (material) {
            material.dispose();
          });
        else child.material.dispose();
      }
    });
  }
}

function addBatteryWire(start, end, color) {
  var THREE = window.THREE;
  var direction = new THREE.Vector3().subVectors(end, start);
  var length = direction.length();
  var wire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, length, 10),
    new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.35,
      roughness: 0.32,
      emissive: color,
      emissiveIntensity: 0.12,
    }),
  );
  wire.position.copy(start).add(end).multiplyScalar(0.5);
  wire.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  );
  batteryPackGroup.add(wire);
}

function buildBatteryPack3D(series, parallel, voltage) {
  if (!batteryPackGroup || !window.THREE) return;
  var THREE = window.THREE;
  clearBatteryPack3D();
  var cellRadius = 0.34;
  var cellHeight = 1.65;
  var xGap = 0.94;
  var zGap = 0.95;
  var totalWidth = (series - 1) * xGap;
  var totalDepth = (parallel - 1) * zGap;
  var cells = [];
  var bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x243b5d,
    metalness: 0.72,
    roughness: 0.28,
    emissive: 0x06152b,
    emissiveIntensity: 0.25,
  });
  var labelMaterial = new THREE.MeshStandardMaterial({
    color: 0x1769ff,
    metalness: 0.3,
    roughness: 0.38,
    emissive: 0x0a3d9c,
    emissiveIntensity: 0.25,
  });
  var positiveMaterial = new THREE.MeshStandardMaterial({
    color: 0xff4d5e,
    metalness: 0.45,
    roughness: 0.25,
    emissive: 0x6b1018,
    emissiveIntensity: 0.3,
  });
  var negativeMaterial = new THREE.MeshStandardMaterial({
    color: 0x5aa5ff,
    metalness: 0.6,
    roughness: 0.25,
    emissive: 0x0b3475,
    emissiveIntensity: 0.25,
  });
  var topMaterial = new THREE.MeshStandardMaterial({
    color: 0xd7e5f6,
    metalness: 0.85,
    roughness: 0.22,
  });

  for (var p = 0; p < parallel; p++) {
    cells[p] = [];
    for (var s = 0; s < series; s++) {
      var cell = new THREE.Group();
      var x = s * xGap - totalWidth / 2;
      var z = p * zGap - totalDepth / 2;
      cell.position.set(x, 0.78, z);
      var body = new THREE.Mesh(
        new THREE.CylinderGeometry(cellRadius, cellRadius, cellHeight, 40, 1),
        bodyMaterial.clone(),
      );
      body.castShadow = true;
      body.receiveShadow = true;
      cell.add(body);
      var top = new THREE.Mesh(
        new THREE.CylinderGeometry(
          cellRadius * 0.92,
          cellRadius * 0.92,
          0.09,
          40,
        ),
        topMaterial,
      );
      top.position.y = cellHeight / 2 + 0.045;
      cell.add(top);
      var cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.13, 24),
        positiveMaterial,
      );
      cap.position.y = cellHeight / 2 + 0.14;
      cell.add(cap);
      var minus = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.07, 24),
        negativeMaterial,
      );
      minus.position.y = -cellHeight / 2 - 0.04;
      cell.add(minus);

      var label = new THREE.Mesh(
        new THREE.CylinderGeometry(
          cellRadius + 0.008,
          cellRadius + 0.008,
          0.56,
          40,
          1,
          true,
          0,
          Math.PI,
        ),
        labelMaterial,
      );
      label.rotation.y = Math.PI / 2;
      label.position.y = 0.03;
      cell.add(label);
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(cellRadius * 0.84, 0.018, 8, 36),
        new THREE.MeshStandardMaterial({
          color: 0x54d9ff,
          emissive: 0x0878b4,
          emissiveIntensity: 0.8,
          metalness: 0.3,
          roughness: 0.3,
        }),
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -cellHeight * 0.23;
      cell.add(ring);
      batteryPackGroup.add(cell);
      cells[p][s] = {
        x: x,
        z: z,
        positive: new THREE.Vector3(x, 0.78 + cellHeight / 2 + 0.2, z),
        negative: new THREE.Vector3(x, 0.78 - cellHeight / 2 - 0.08, z),
      };
    }
  }

  /* Series links connect each cell's positive end to the next cell's negative end. */
  for (var row = 0; row < parallel; row++) {
    for (var col = 0; col < series - 1; col++) {
      var positive = cells[row][col].positive.clone();
      var negative = cells[row][col + 1].negative.clone();
      var routeZ = totalDepth / 2 + cellRadius + 0.2 + row * 0.12;
      var upperRouteY = 1.98;
      var upperLead = new THREE.Vector3(positive.x, upperRouteY, positive.z);
      var upperOutside = new THREE.Vector3(positive.x, upperRouteY, routeZ);
      var lowerOutsideStart = new THREE.Vector3(positive.x, negative.y, routeZ);
      var lowerOutsideEnd = new THREE.Vector3(negative.x, negative.y, routeZ);
      var lowerLead = new THREE.Vector3(negative.x, negative.y, negative.z);

      /* The cable travels above and around the pack, then underneath to the negative terminal. */
      addBatteryWire(positive, upperLead, 0xef5350);
      addBatteryWire(upperLead, upperOutside, 0xef5350);
      addBatteryWire(upperOutside, lowerOutsideStart, 0xef5350);
      addBatteryWire(lowerOutsideStart, lowerOutsideEnd, 0xef5350);
      addBatteryWire(lowerOutsideEnd, lowerLead, 0xef5350);
    }
  }

  /* Parallel strings share like-polarity rails: negatives underneath, positives above. */
  if (parallel > 1) {
    var negativeBusY = cells[0][0].negative.y - 0.2;
    var positiveBusY = cells[0][series - 1].positive.y + 0.2;

    for (var rowIndex = 0; rowIndex < parallel - 1; rowIndex++) {
      var negA = cells[rowIndex][0].negative;
      var negB = cells[rowIndex + 1][0].negative;
      var negRailA = new THREE.Vector3(negA.x, negativeBusY, negA.z);
      var negRailB = new THREE.Vector3(negB.x, negativeBusY, negB.z);
      addBatteryWire(negA, negRailA, 0x58a6ff);
      addBatteryWire(negRailA, negRailB, 0x58a6ff);
      addBatteryWire(negRailB, negB, 0x58a6ff);

      var posA = cells[rowIndex][series - 1].positive;
      var posB = cells[rowIndex + 1][series - 1].positive;
      var posRailA = new THREE.Vector3(posA.x, positiveBusY, posA.z);
      var posRailB = new THREE.Vector3(posB.x, positiveBusY, posB.z);
      addBatteryWire(posA, posRailA, 0x38d9b2);
      addBatteryWire(posRailA, posRailB, 0x38d9b2);
      addBatteryWire(posRailB, posB, 0x38d9b2);
    }
  }
  batteryPlatform = new THREE.Mesh(
    new THREE.BoxGeometry(
      Math.max(2.2, totalWidth + 1.35),
      0.12,
      Math.max(1.8, totalDepth + 1.2),
    ),
    new THREE.MeshStandardMaterial({
      color: 0x142b4d,
      metalness: 0.4,
      roughness: 0.5,
    }),
  );
  batteryPlatform.position.y = -0.12;
  batteryPlatform.receiveShadow = true;
  batteryPlatform.visible = false;
  batteryPackGroup.add(batteryPlatform);
  batteryPackGroup.rotation.y = (builderRotation * Math.PI) / 180;
  var span = Math.max(series * xGap, parallel * zGap, 3.2);
  var viewDistance = Math.max(5.2, span * 1.55);
  var viewOffset = viewDistance * 0.18;
  var viewHeight = Math.sqrt(
    viewDistance * viewDistance - 2 * viewOffset * viewOffset,
  );
  if (batteryCamera && batteryControls) {
    batteryCamera.position.set(viewOffset, 0.7 - viewHeight, viewOffset);
    batteryControls.maxPolarAngle = Math.PI;
    batteryControls.target.set(0, 0.7, 0);
    batteryControls.update();
  } else if (batteryCamera) {
    batteryCamera.position.set(viewOffset, 0.7 - viewHeight, viewOffset);
    batteryCamera.lookAt(0, 0.7, 0);
  }
  document.getElementById("sceneFallback").style.display = "none";
}

function applyBuilderRotation() {
  if (batteryPackGroup)
    batteryPackGroup.rotation.y = (builderRotation * Math.PI) / 180;
  document.getElementById("viewAngleValue").textContent = builderRotation + "°";
}

function updatePackBuilder() {
  var voltage = Number(document.getElementById("builderCellVoltage").value);
  var capacity = Number(document.getElementById("builderCellCapacity").value);
  var series = Number(document.getElementById("builderSeries").value);
  var parallel = Number(document.getElementById("builderParallel").value);
  var current = Number(document.getElementById("builderCurrent").value);
  var error = document.getElementById("builderError");

  if (
    !Number.isFinite(voltage) ||
    voltage <= 0 ||
    !Number.isFinite(capacity) ||
    capacity <= 0 ||
    !Number.isInteger(series) ||
    series < 1 ||
    series > 12 ||
    !Number.isInteger(parallel) ||
    parallel < 1 ||
    parallel > 8 ||
    !Number.isFinite(current) ||
    current < 0 ||
    voltage > 1000 ||
    capacity > 10000 ||
    current > 10000
  ) {
    error.textContent =
      "Enter positive cell voltage and capacity, 1–12 series groups, 1–8 parallel cells, and a non-negative load current.";

    setTimeout(function () {
      error.textContent = "";
    }, 3000);
    return;
  }

  var totalCells = series * parallel;
  var packVoltage = voltage * series;
  var packCapacity = capacity * parallel;
  var energy = packVoltage * packCapacity;
  var power = packVoltage * current;
  buildBatteryPack3D(series, parallel, voltage);
  document.getElementById("builderVisualTitle").textContent =
    series + "S" + parallel + "P · " + totalCells + " cells";
  document.getElementById("builderVoltage").innerHTML =
    formatNumber(packVoltage) + " <small>V</small>";
  document.getElementById("builderCapacity").innerHTML =
    formatNumber(packCapacity) + " <small>Ah</small>";
  document.getElementById("builderEnergy").innerHTML =
    formatNumber(energy) + " <small>Wh</small>";
  document.getElementById("builderPower").innerHTML =
    formatNumber(power) + " <small>W</small>";
  document.getElementById("builderTotalCells").textContent =
    totalCells.toLocaleString("en-US");
  document.getElementById("builderLayout").textContent =
    series + "S" + parallel + "P";
  document.getElementById("builderPowerNote").textContent =
    current === 0
      ? "Enter a load current above zero to estimate nominal power."
      : "At " +
        formatNumber(current) +
        " A: " +
        formatNumber(packVoltage) +
        " V × " +
        formatNumber(current) +
        " A = " +
        formatNumber(power) +
        " W, before losses.";
  error.textContent = "";
}
