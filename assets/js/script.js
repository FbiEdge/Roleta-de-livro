const books = [];
const genres = ["fiction", "fantasy", "mystery", "romance", "science_fiction", "horror", "historical", "thriller"];
const wheel = document.getElementById("wheel");
const ctx = wheel.getContext("2d");
const spinButton = document.getElementById("spinButton");
const bookCover = document.getElementById("bookCover");
const bookTitle = document.getElementById("bookTitle");
const bookAuthor = document.getElementById("bookAuthor");
const bookSummary = document.getElementById("bookSummary"); // Adicionei isso para o resumo do livro

let isSpinning = false;
let selectedBookIndex = 0;
const rotationIncrement = 30; 
const totalRotation = 3600; 
const centerX = wheel.width / 2;
const centerY = wheel.height / 2;

async function fetchBooks() {
  try {
    for (let genre of genres) {
      const response = await fetch(`https://openlibrary.org/subjects/${genre}.json?limit=20`);
      const data = await response.json();
      data.works.forEach(work => {
        books.push({
          title: work.title,
          author: work.authors && work.authors.length > 0 ? work.authors[0].name : "Autor desconhecido",
          cover: work.cover_id
            ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg`
            : "https://w7.pngwing.com/pngs/18/125/png-transparent-question-mark-book-cover-livres-angle-text-rectangle.png",
          key: work.key
        });
      });
    }
    drawWheel();
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
  }
}

function drawWheel() {
  ctx.clearRect(0, 0, wheel.width, wheel.height);
  const colors = ["#FFD700", "#000000"];
  const angle = (2 * Math.PI) / books.length;

  books.forEach((book, index) => {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, centerX, angle * index, angle * (index + 1));
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle * index + angle / 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 14px Arial";
    ctx.fillText(book.title, centerX - 40, 10);
    ctx.restore();
  });
}

async function fetchBookDetails(bookId) {
  try {
    const response = await fetch(`https://openlibrary.org/works/${bookId}.json`);
    const bookDetails = await response.json();
    return bookDetails;
  } catch (error) {
    console.error("Erro ao buscar detalhes do livro:", error);
    return null;
  }
}

async function showBook() {
  const book = books[selectedBookIndex];
  bookCover.src = book.cover;
  bookTitle.textContent = book.title;
  bookAuthor.textContent = `Autor: ${book.author}`;

  const bookDetails = await fetchBookDetails(book.key.split('/').pop());
  if (bookDetails && bookDetails.description) {
    const description = typeof bookDetails.description === 'string'
      ? bookDetails.description
      : bookDetails.description.value || "Resumo não disponível.";
    bookSummary.textContent = `Resumo: ${description}`;
  } else {
    bookSummary.textContent = "Resumo não disponível.";
  }
}

function spinWheel() {
  if (isSpinning || books.length === 0) return;

  isSpinning = true;
  let currentRotation = 0;

  selectedBookIndex = Math.floor(Math.random() * books.length); // Escolhe um índice aleatório

  const spin = setInterval(() => {
    currentRotation += rotationIncrement;
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    if (currentRotation >= totalRotation) {
      clearInterval(spin);
      isSpinning = false;
      showBook(); // Chama a função para mostrar o livro
    }
  }, 20);
}

spinButton.addEventListener("click", spinWheel);
fetchBooks();
