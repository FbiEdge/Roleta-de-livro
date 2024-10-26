const books = [];
const genres = ["fiction", "fantasy", "mystery", "romance", "science_fiction", "horror", "historical", "thriller"];
const wheel = document.getElementById("wheel");
const ctx = wheel.getContext("2d");
const spinButton = document.getElementById("spinButton");
const bookCover = document.getElementById("bookCover");
const bookTitle = document.getElementById("bookTitle");
const bookAuthor = document.getElementById("bookAuthor");

let isSpinning = false;
let selectedBookIndex = 0;

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
          key: work.key // Adiciona a chave do livro para busca posterior
        });
      });
    }
    drawWheel();
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
  }
}

function drawWheel() {
  const colors = ["#FFD700", "#000000"]; 
  const angle = (2 * Math.PI) / books.length;

  books.forEach((book, index) => {
    ctx.beginPath();
    ctx.moveTo(250, 250);
    ctx.arc(250, 250, 250, angle * index, angle * (index + 1));
    ctx.fillStyle = colors[index % colors.length]; 
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    ctx.save();
    ctx.translate(250, 250);
    ctx.rotate(angle * index + angle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#FFFFFF"; 
    ctx.font = "bold 16px Arial";
    ctx.fillText(book.title, 200, 10);
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

  const bookDetails = await fetchBookDetails(book.key.split('/').pop()); // Extrai o book_id do link
  if (bookDetails && bookDetails.description) {
    const description = typeof bookDetails.description === 'string'
      ? bookDetails.description
      : bookDetails.description.value || "Resumo não disponível."; // Lida com diferentes formatos de descrição
    document.getElementById("bookSummary").textContent = `Resumo: ${description}`;
  } else {
    document.getElementById("bookSummary").textContent = "Resumo não disponível.";
  }
}

function spinWheel() {
  if (isSpinning || books.length === 0) return;

  isSpinning = true;
  let rotation = Math.random() * 360 + 3600; 
  let start = 0;

  const spin = setInterval(() => {
    start += 20; 
    wheel.style.transform = `rotate(${start}deg)`;

    if (start >= rotation) {
      clearInterval(spin);
      isSpinning = false;
      selectedBookIndex = Math.floor(((start % 360) / 360) * books.length);
      showBook();
    }
  }, 20);
}

spinButton.addEventListener("click", spinWheel);
fetchBooks();
