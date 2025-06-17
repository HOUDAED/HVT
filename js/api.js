fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .catch(error => {
    console.error('Fetch error:', error);
    // Handle the error appropriately
    displayErrorMessage('Unable to load data. Please try again later.');
  });
