// Initial mock parking spots (10-20 objects required by TZ)
const initialSpots = [
  {
    id: "A-101",
    zone: "Zone A",
    status: "free",
    price: 150,
    type: "standard",
  },
  {
    id: "A-102",
    zone: "Zone A",
    status: "occupied",
    price: 150,
    type: "standard",
  },
  {
    id: "A-103",
    zone: "Zone A",
    status: "reserved",
    price: 150,
    type: "standard",
  },
  {
    id: "A-104",
    zone: "Zone A",
    status: "free",
    price: 150,
    type: "standard",
  },
  {
    id: "A-105",
    zone: "Zone A",
    status: "free",
    price: 180,
    type: "vip",
  },
  {
    id: "B-201",
    zone: "Zone B",
    status: "free",
    price: 200,
    type: "standard",
  },
  {
    id: "B-202",
    zone: "Zone B",
    status: "occupied",
    price: 200,
    type: "standard",
  },
  {
    id: "B-203",
    zone: "Zone B",
    status: "free",
    price: 200,
    type: "standard",
  },
  {
    id: "B-204",
    zone: "Zone B",
    status: "reserved",
    price: 220,
    type: "vip",
  },
  {
    id: "B-205",
    zone: "Zone B",
    status: "free",
    price: 200,
    type: "standard",
  },
  {
    id: "C-301",
    zone: "Zone C",
    status: "free",
    price: 100,
    type: "street",
  },
  {
    id: "C-302",
    zone: "Zone C",
    status: "occupied",
    price: 100,
    type: "street",
  },
  {
    id: "C-303",
    zone: "Zone C",
    status: "free",
    price: 100,
    type: "street",
  },
  {
    id: "C-304",
    zone: "Zone C",
    status: "free",
    price: 100,
    type: "street",
  },
  {
    id: "C-305",
    zone: "Zone C",
    status: "occupied",
    price: 100,
    type: "street",
  },
];

// App state
let parkingSpots =
  JSON.parse(localStorage.getItem("parkingFlow_spots")) || initialSpots;
let currentUser =
  JSON.parse(localStorage.getItem("parkingFlow_currentUser")) || null;
let userBookings = JSON.parse(localStorage.getItem("parkingFlow_bookings")) || [
  {
    id: "BOK-901",
    spotId: "A-103",
    date: "2026-06-10",
    timeStart: "14:00",
    timeEnd: "16:00",
    total: 300,
    status: "Активна",
  },
];
let isRegisterMode = false;

// Initialize App on load
window.addEventListener("DOMContentLoaded", () => {
  renderParkingGrid(parkingSpots);
  updateAuthNav();
  // Set default date inputs to today
  const todayStr = new Date().toISOString().split("T")[0];
  const quickDateEl = document.getElementById("quickDate");
  const bookingDateEl = document.getElementById("bookingDate");
  if (quickDateEl) quickDateEl.value = todayStr;
  if (bookingDateEl) bookingDateEl.value = todayStr;
});

// Navigation Controller
function navigateTo(pageId) {
  // Hide all pages
  document
    .querySelectorAll(".page-view")
    .forEach((el) => el.classList.remove("active"));
  document
    .querySelectorAll(".navbar-nav .nav-link")
    .forEach((el) => el.classList.remove("active"));

  // Show target page
  const target = document.getElementById("page-" + pageId);
  if (target) {
    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Highlight nav link
  const navLink = document.querySelector(
    `.navbar-nav .nav-link[data-page="${pageId}"]`,
  );
  if (navLink) {
    navLink.classList.add("active");
  }

  // If navigating to profile, render profile data
  if (pageId === "profile") {
    if (!currentUser) {
      showToast("Пожалуйста, войдите в систему");
      navigateTo("login");
      return;
    }
    renderProfileData();
  }
}

// Render Parking Grid
function renderParkingGrid(spotsToRender) {
  const container = document.getElementById("parkingGridContainer");
  if (!container) return;
  container.innerHTML = "";

  if (spotsToRender.length === 0) {
    container.innerHTML = `<div class="col-12 text-center py-5 text-muted">Парковочные места не найдены</div>`;
    return;
  }

  spotsToRender.forEach((spot) => {
    let statusClass = "spot-free";
    let statusText = "Свободно";
    if (spot.status === "occupied") {
      statusClass = "spot-occupied";
      statusText = "Занято";
    } else if (spot.status === "reserved") {
      statusClass = "spot-reserved";
      statusText = "Забронировано";
    }

    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-3";
    col.innerHTML = `
                    <div class="parking-spot ${statusClass}" onclick="handleSpotClick('${spot.id}')">
                        <span class="fs-5">${spot.id}</span>
                        <small class="opacity-75">${spot.price} ₸/ч • ${statusText}</small>
                    </div>
                `;
    container.appendChild(col);
  });
}

// Spot Click Handler
function handleSpotClick(spotId) {
  const spot = parkingSpots.find((s) => s.id === spotId);
  if (!spot) return;

  if (spot.status !== "free") {
    showToast(
      `Место ${spotId} в данный момент недоступно (${spot.status === "occupied" ? "занято" : "забронировано"})`,
    );
    return;
  }

  // Populate details page
  document.getElementById("detailZone").innerText = spot.zone;
  document.getElementById("detailSpotTitle").innerText = `Место #${spot.id}`;
  document.getElementById("detailPriceRate").innerText =
    `${spot.price} ₸ / час`;
  document.getElementById("bookingSpotId").value = spot.id;

  calculateTotal();
  navigateTo("details");
}

// Calculate Booking Total
function calculateTotal() {
  const spotId = document.getElementById("bookingSpotId").value;
  const spot = parkingSpots.find((s) => s.id === spotId);
  const rate = spot ? spot.price : 150;

  const start = document.getElementById("bookingTimeStart").value;
  const end = document.getElementById("bookingTimeEnd").value;

  if (start && end) {
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    let diffHours = endH + endM / 60 - (startH + startM / 60);
    if (diffHours <= 0) diffHours += 24; // Handle overnight if needed

    const total = Math.round(diffHours * rate);
    document.getElementById("calcDuration").innerText =
      `${diffHours.toFixed(1)} ч.`;
    document.getElementById("calcTotalSum").innerText = `${total} ₸`;
  }
}

// Confirm Booking Submission
function confirmBooking(e) {
  e.preventDefault();
  if (!currentUser) {
    showToast("Для бронирования необходимо войти в систему");
    navigateTo("login");
    return;
  }

  const spotId = document.getElementById("bookingSpotId").value;
  const date = document.getElementById("bookingDate").value;
  const timeStart = document.getElementById("bookingTimeStart").value;
  const timeEnd = document.getElementById("bookingTimeEnd").value;
  const totalText = document.getElementById("calcTotalSum").innerText;

  // Update spot status
  const spotIndex = parkingSpots.findIndex((s) => s.id === spotId);
  if (spotIndex !== -1) {
    parkingSpots[spotIndex].status = "reserved";
    localStorage.setItem("parkingFlow_spots", JSON.stringify(parkingSpots));
  }

  // Add booking record
  const newBooking = {
    id: "BOK-" + Math.floor(100 + Math.random() * 900),
    spotId: spotId,
    date: date,
    timeStart: timeStart,
    timeEnd: timeEnd,
    total: totalText,
    status: "Активна",
  };

  userBookings.unshift(newBooking);
  localStorage.setItem("parkingFlow_bookings", JSON.stringify(userBookings));

  showToast(`Место ${spotId} успешно забронировано!`);
  renderParkingGrid(parkingSpots);
  navigateTo("profile");
}

// Filtering spots
function filterSpots(status, btnElement) {
  // Update buttons active state
  const group = btnElement.parentElement;
  group.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
  btnElement.classList.add("active");

  if (status === "all") {
    renderParkingGrid(parkingSpots);
  } else {
    const filtered = parkingSpots.filter((s) => s.status === status);
    renderParkingGrid(filtered);
  }
}

function filterSpotsByZone() {
  const zone = document.getElementById("zoneFilterSelect").value;
  if (zone === "all") {
    renderParkingGrid(parkingSpots);
  } else {
    const filtered = parkingSpots.filter((s) => s.zone === zone);
    renderParkingGrid(filtered);
  }
}

function searchSpots() {
  const query = document.getElementById("spotSearchInput").value.toLowerCase();
  const filtered = parkingSpots.filter((s) =>
    s.id.toLowerCase().includes(query),
  );
  renderParkingGrid(filtered);
}

function handleQuickSearch(e) {
  e.preventDefault();
  navigateTo("catalog");
}

// Auth & Profile Management
function toggleAuthMode(e) {
  e.preventDefault();
  isRegisterMode = !isRegisterMode;
  const title = document.getElementById("authFormTitle");
  const subtitle = document.getElementById("authFormSubtitle");
  const nameContainer = document.getElementById("nameFieldContainer");
  const submitBtn = document.getElementById("authSubmitBtn");
  const toggleText = document.getElementById("authToggleText");

  if (isRegisterMode) {
    title.innerText = "Регистрация";
    subtitle.innerText = "Создайте новый аккаунт в ParkingFlow";
    nameContainer.style.display = "block";
    submitBtn.innerText = "Зарегистрироваться";
    toggleText.innerText = "Уже есть аккаунт? Войти";
  } else {
    title.innerText = "Вход в систему";
    subtitle.innerText = "Введите данные своей учетной записи";
    nameContainer.style.display = "none";
    submitBtn.innerText = "Войти";
    toggleText.innerText = "Нет аккаунта? Зарегистрироваться";
  }
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById("authEmail").value;
  const name = isRegisterMode
    ? document.getElementById("authName").value
    : "Иван Петров";

  currentUser = { name, email, role: "Клиент" };
  localStorage.setItem("parkingFlow_currentUser", JSON.stringify(currentUser));

  updateAuthNav();
  showToast(`Добро пожаловать, ${name}!`);
  navigateTo("profile");
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem("parkingFlow_currentUser");
  updateAuthNav();
  showToast("Вы вышли из системы");
  navigateTo("home");
}

function updateAuthNav() {
  const container = document.getElementById("authNavContainer");
  if (currentUser) {
    container.innerHTML = `<a class="btn btn-primary px-4 rounded-pill" href="#profile" data-page="profile" onclick="navigateTo('profile')"><i class="fa-solid fa-user me-2"></i>Личный кабинет</a>`;
  } else {
    container.innerHTML = `<a class="btn btn-outline-primary px-4 rounded-pill" href="#login" data-page="login" onclick="navigateTo('login')">Войти</a>`;
  }
}

function renderProfileData() {
  if (!currentUser) return;
  document.getElementById("profileUserName").innerText = currentUser.name;
  document.getElementById("profileUserEmail").innerText = currentUser.email;

  // Render active bookings
  const activeContainer = document.getElementById("activeBookingsContainer");
  const activeList = userBookings.filter((b) => b.status === "Активна");

  if (activeList.length === 0) {
    activeContainer.innerHTML = `<p class="text-muted small">У вас нет активных бронирований</p>`;
  } else {
    activeContainer.innerHTML = activeList
      .map(
        (b) => `
                    <div class="border rounded-3 p-3 mb-3 d-flex justify-content-between align-items-center">
                        <div>
                            <span class="badge bg-primary bg-opacity-10 text-primary mb-1">Место #${b.spotId}</span>
                            <h6 class="fw-bold mb-0">${b.date} с ${b.timeStart} по ${b.timeEnd}</h6>
                            <small class="text-muted">Сумма: ${b.total}</small>
                        </div>
                        <button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="cancelBooking('${b.id}', '${b.spotId}')">Отменить</button>
                    </div>
                `,
      )
      .join("");
  }

  // Render history table
  const historyBody = document.getElementById("historyTableBody");
  historyBody.innerHTML = userBookings
    .map(
      (b) => `
                <tr>
                    <td class="fw-semibold">#${b.spotId}</td>
                    <td>${b.date}</td>
                    <td>${b.timeStart} - ${b.timeEnd}</td>
                    <td class="fw-semibold text-primary">${b.total}</td>
                    <td><span class="badge ${b.status === "Активна" ? "bg-success" : "bg-secondary"} bg-opacity-10 text-${b.status === "Активна" ? "success" : "secondary"} px-2 py-1">${b.status}</span></td>
                </tr>
            `,
    )
    .join("");
}

function cancelBooking(bookingId, spotId) {
  // Update booking status
  const bIndex = userBookings.findIndex((b) => b.id === bookingId);
  if (bIndex !== -1) {
    userBookings[bIndex].status = "Отменена";
    localStorage.setItem("parkingFlow_bookings", JSON.stringify(userBookings));
  }

  // Free up spot
  const sIndex = parkingSpots.findIndex((s) => s.id === spotId);
  if (sIndex !== -1) {
    parkingSpots[sIndex].status = "free";
    localStorage.setItem("parkingFlow_spots", JSON.stringify(parkingSpots));
  }

  showToast("Бронирование отменено");
  renderProfileData();
  renderParkingGrid(parkingSpots);
}

function handleContactSubmit(e) {
  e.preventDefault();
  showToast("Спасибо! Ваше сообщение успешно отправлено.");
  e.target.reset();
}

// Toast Helper
function showToast(message) {
  const toastEl = document.getElementById("liveToast");
  document.getElementById("toastMessage").innerText = message;
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}
