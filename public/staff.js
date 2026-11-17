const login = document.querySelector('#login');
const requests = document.querySelector('#requests');
const list = document.querySelector('#list');
const status = document.querySelector('#staff-status');

async function request(url, method = 'GET', body) {
  const response = await fetch(url, {
    method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

async function loadBookings() {
  const bookings = await request('/api/bookings');
  login.hidden = true;
  requests.hidden = false;
  list.replaceChildren();
  status.textContent = bookings.length ? '' : 'No booking requests yet.';
  for (const booking of bookings) {
    const row = document.createElement('li');
    row.textContent = `${booking.name} · ${booking.email} · ${booking.date} at ${booking.time} · ${booking.guests} guests · ${booking.status}`;
    if (booking.status === 'Pending') {
      for (const decision of ['Approve', 'Decline']) {
        const button = document.createElement('button');
        button.className = 'button';
        button.textContent = decision;
        button.addEventListener('click', async () => {
          try {
            await request('/api/bookings/' + booking.id, 'PATCH', {decision});
            await loadBookings();
          } catch (error) {
            status.textContent = error.message;
          }
        });
        row.append(button);
      }
    }
    list.append(row);
  }
}

login.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await request('/api/login', 'POST', {password: login.elements.password.value});
    login.reset();
    await loadBookings();
  } catch (error) {
    status.textContent = error.message;
  }
});
document.querySelector('#logout').addEventListener('click', async () => {
  try {
    await request('/api/logout', 'POST');
    list.replaceChildren();
    requests.hidden = true;
    login.hidden = false;
    status.textContent = 'Signed out.';
  } catch (error) {
    status.textContent = error.message;
  }
});
loadBookings().catch(() => {});
