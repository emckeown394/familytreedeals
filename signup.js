const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  const response = await fetch('/signup', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (data.success) {
    alert('Successfully signed up!');
  } else {
    alert('Error signing up!');
  }
});