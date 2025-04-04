// Keep track of the currently selected book globally
let currentBook = null;
let deleteBtnVisible = false; // Track delete button visibility
let pageClickCount = 0; // Track page click count

// Load all books from the server and display them
function loadBooks() {
  fetch('http://localhost:3000/books')
    .then(res => res.json())
    .then(books => {
      const bookList = document.getElementById('book-list');
      bookList.innerHTML = '';

      books.forEach(renderBookCard);

      if (books.length > 0) {
        showBookDetails(books[0]);
      }
    })
    .catch(err => console.error('Error loading books:', err));
}

// Render a single book as a card in the book list
function renderBookCard(book) {
  const bookList = document.getElementById('book-list');

  const card = document.createElement('div');
  card.className = 'book-card';

  card.innerHTML = `
    <h3>${book.title}</h3>
    <p><strong>Author:</strong> ${book.author}</p>
  `;

  card.addEventListener('click', () => {
    showBookDetails(book);
    deleteBtnVisible = false;
    hideDeleteButton();
  });

  bookList.appendChild(card);
}

// Display full details of a book in the detail section
function showBookDetails(book) {
    const detailSection = document.getElementById('book-detail');
    detailSection.innerHTML = `
      <h2>${book.title}</h2>
      <p><strong>Author:</strong> ${book.author}</p>
      <p><strong>Description:</strong> ${book.description}</p>
      <p><strong>Rating:</strong> ${book.rating} / 10</p>
      <img id="cover-img" src="${book.cover}" alt="${book.title} cover" />
    `;
  
    currentBook = book;

    console.log('currentBook in showBookDetails:', currentBook);

    pageClickCount = 0; // Reset click counter
  
    // ✅ Fill the edit form when book is selected
    const editForm = document.getElementById('edit-form');
    if (editForm) {
      editForm.rating.value = book.rating;
      editForm.description.value = book.description;
    }
  }

// Show delete button dynamically
function showDeleteButton() {
  const detailSection = document.getElementById('book-detail');
  const existingButton = document.getElementById('delete-book');
  if (!existingButton) {
    const button = document.createElement('button');
    button.id = 'delete-book';
    button.textContent = 'Delete';
    button.style.display = 'inline-block';
    button.addEventListener('click', handleDelete);
    detailSection.appendChild(button);
  } else {
    existingButton.style.display = 'inline-block';
  }
}

// Hide delete button
function hideDeleteButton() {
  const existingButton = document.getElementById('delete-book');
  if (existingButton) {
    existingButton.style.display = 'none';
  }
}

// Handle form submission to add a new book and persist it to the server
function handleFormSubmit() {
    const form = document.getElementById('new-book-form'); // Match the form ID in your HTML
  
    form.addEventListener('submit', (e) => {
      e.preventDefault();
  
      // Get values from input fields
      const title = form.title.value.trim();
      const author = form.author.value.trim();
      const cover = form.image.value.trim(); // 'image' corresponds to the input's name/id
      const description = form.description.value.trim();
  
      // Do not proceed if any field is empty
      if (!title || !author || !cover || !description) return;
  
      // Build new book object
      const newBook = {
        title,
        author,
        cover,
        description,
        rating: 0 // Default rating
      };
  
      // ✅ POST request to json-server to save the new book
      fetch('http://localhost:3000/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBook)
      })
        .then(res => res.json())
        .then(savedBook => {
          renderBookCard(savedBook);       // Add book to the list
          showBookDetails(savedBook);      // Show book detail view
          currentBook = savedBook;         // Update currently selected book
          form.reset();                    // Clear the form
        })
        .catch(err => console.error('Error adding book:', err));
    });
  }

// Handle book update from the edit form
function handleEditForm() {
  const form = document.getElementById('edit-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const rating = form.rating.value.trim();
    const description = form.description.value.trim();

    if (!currentBook || !rating || !description) return;

    const updatedData = {
      ...currentBook,
      rating,
      description
    };
    console.log('Current book before PATCH:', currentBook);

    fetch(`http://localhost:3000/books/${currentBook.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    })
      .then(res => res.json())
      .then(updatedBook => {
        showBookDetails(updatedBook);
        loadBooks();
        form.reset();
      })
      .catch(err => console.error('Error updating book:', err));
  });
}

// Handle book deletion
function handleDelete() {
  if (!currentBook || !currentBook.id) return;

  fetch(`http://localhost:3000/books/${currentBook.id}`, {
    method: 'DELETE'
  })
    .then(() => {
      loadBooks();
      document.getElementById('book-detail').innerHTML = '';
    })
    .catch(err => console.error('Error deleting book:', err));
}

// Initialize everything after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  loadBooks();
  handleFormSubmit();
  handleEditForm();
});

// Handle double click on cover image to show delete button
document.body.addEventListener('click', (e) => {
  if (e.target.id === 'cover-img') {
    pageClickCount++;
    if (pageClickCount === 2) {
      showDeleteButton();
      deleteBtnVisible = true;
      pageClickCount = 0; // Reset after showing the button
    }
  } else {
    pageClickCount = 0; // Reset if clicking outside the cover image
  }
});

// Autofill edit form with selected book's data
const editForm = document.getElementById('edit-form');
if (editForm) {
  editForm.rating.value = book.rating;
  editForm.description.value = book.description;
}
