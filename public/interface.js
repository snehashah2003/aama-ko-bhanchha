const drawer = document.querySelector('#mobile-menu');
document.querySelector('.menu-toggle').addEventListener('click', () => drawer.showModal());
drawer.querySelectorAll('nav a').forEach((link) => {
  link.addEventListener('click', () => drawer.close());
});

const today = new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Kathmandu'}).format(new Date());
document.querySelectorAll('input[type=date]').forEach((input) => { input.min = today; });
const booking = document.querySelector('#booking-form');
if (booking) {
  const query = new URLSearchParams(location.search);
  const date = query.get('date');
  const guests = Number(query.get('guests'));
  if (date && date >= today) booking.elements.date.value = date;
  if (Number.isInteger(guests) && guests >= 1 && guests <= 30) booking.elements.guests.value = guests;
}

const filterButtons = document.querySelectorAll('[data-filter]');
const galleryItems = document.querySelectorAll('[data-category]');
filterButtons.forEach((button) => button.addEventListener('click', () => {
  filterButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  galleryItems.forEach((item) => {
    item.hidden = button.dataset.filter !== 'All' && item.dataset.category !== button.dataset.filter;
  });
}));

const photoDialog = document.querySelector('#photo-dialog');
galleryItems.forEach((item) => item.querySelector('button').addEventListener('click', () => {
  const source = item.querySelector('img');
  const image = photoDialog.querySelector('img');
  image.src = source.src;
  image.alt = source.alt;
  photoDialog.querySelector('p').textContent = source.alt;
  photoDialog.showModal();
}));
