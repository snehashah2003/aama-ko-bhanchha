const form = document.querySelector('#booking-form');
const status = document.querySelector('#booking-status');

form.elements.date.min = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kathmandu'
}).format(new Date());

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button');
  button.disabled = true;
  status.textContent = 'Sending your request…';
  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    if (!response.headers.get('Content-Type')?.includes('application/json')) {
      throw new Error('Start the reservation server with node server.js and open the address shown in your terminal.');
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    form.reset();
    status.textContent = `Request received. Reference ${result.id}. Your table is pending staff approval.`;
  } catch (error) {
    status.textContent = error.message || 'Could not send your booking request.';
  } finally {
    button.disabled = false;
  }
});
