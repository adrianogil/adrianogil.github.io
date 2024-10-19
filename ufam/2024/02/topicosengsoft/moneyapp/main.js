let currentMonth = 10; // October (10th month)
let year = 2024;


function changeMonth(direction) {
  const monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];

  currentMonth += direction;

  if (currentMonth < 1) {
    currentMonth = 12; // go to December
    year = year -1;
  } else if (currentMonth > 12) {
    currentMonth = 1; // go to January
    year = year + 1;
  }

  const prevMonth = currentMonth - 1 < 1 ? 12 : currentMonth - 1;
  const nextMonth = currentMonth + 1 > 12 ? 1 : currentMonth + 1;

  document.getElementById("currentMonth").textContent = `${monthNames[currentMonth - 1]} ${year}`;
  document.getElementById("prevMonthBtn").textContent = `◀ ${monthNames[prevMonth - 1]} ${year}`;
  document.getElementById("nextMonthBtn").textContent = `${monthNames[nextMonth - 1]} ${year} ▶`;

  // Call a function here to update your table with the correct month's data
  // For example, updateTableForMonth(currentMonth);
}

function logout() {
    alert("Você será desconectado. Até logo!");
    // Aqui você pode adicionar a lógica de logout real
    window.location.href = 'login.html';
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    // if (document.body.classList.contains('dark-mode')) {
    //     alert("Modo escuro ativado.");
    // } else {
    //     alert("Modo claro ativado.");
    // }
}

document.addEventListener('click', function(event) {
    const userInfo = document.querySelector('.user-info');
    const submenu = document.querySelector('.submenu');
    if (!userInfo.contains(event.target)) {
        submenu.style.visibility = 'hidden';
        submenu.style.opacity = 0;
        submenu.style.transform = 'translateY(-10px)';
    } else {
        submenu.style.visibility = 'visible';
        submenu.style.opacity = 1;
        submenu.style.transform = 'translateY(0)';
    }
});
