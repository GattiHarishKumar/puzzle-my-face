const imageInput = document.getElementById('imageInput');
const startBtn = document.getElementById('startBtn');
const canvas = document.getElementById('canvas');
const puzzleContainer = document.getElementById('puzzleContainer');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');

let image = new Image();
let pieceSize = 100;
let rows = 3, cols = 3;
let timer, time = 0;
let moves = 0;

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      image.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

startBtn.addEventListener('click', () => {
  if (!image.src) {
    alert("Please upload an image first.");
    return;
  }

  image.onload = () => {
    sliceImage();
    startTimer();
    moves = 0;
    updateMoves();
  };
});

function sliceImage() {
  puzzleContainer.innerHTML = '';
  canvas.width = cols * pieceSize;
  canvas.height = rows * pieceSize;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  let pieces = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const pieceCanvas = document.createElement('canvas');
      pieceCanvas.width = pieceSize;
      pieceCanvas.height = pieceSize;
      const pieceCtx = pieceCanvas.getContext('2d');

      pieceCtx.drawImage(
        canvas,
        x * pieceSize,
        y * pieceSize,
        pieceSize,
        pieceSize,
        0,
        0,
        pieceSize,
        pieceSize
      );

      pieceCanvas.classList.add('puzzle-piece');
      pieceCanvas.setAttribute('draggable', true);
      pieceCanvas.dataset.correctIndex = y * cols + x;
      pieces.push(pieceCanvas);
    }
  }

  // Shuffle
  pieces.sort(() => Math.random() - 0.5);
  pieces.forEach(piece => puzzleContainer.appendChild(piece));

  enableDragDrop();
}

function enableDragDrop() {
  let dragged = null;

  document.querySelectorAll('.puzzle-piece').forEach(piece => {
    piece.addEventListener('dragstart', () => {
      dragged = piece;
    });

    piece.addEventListener('dragover', (e) => e.preventDefault());

    piece.addEventListener('drop', (e) => {
      e.preventDefault();
      if (dragged && dragged !== piece) {
        const fromIndex = [...puzzleContainer.children].indexOf(dragged);
        const toIndex = [...puzzleContainer.children].indexOf(piece);

        const children = [...puzzleContainer.children];
        puzzleContainer.innerHTML = '';

        // Swap
        children[fromIndex] = piece;
        children[toIndex] = dragged;

        children.forEach(child => puzzleContainer.appendChild(child));

        moves++;
        updateMoves();
        checkIfSolved();
      }
    });
  });
}

function checkIfSolved() {
  const pieces = [...puzzleContainer.children];
  const isSolved = pieces.every((piece, index) => {
    return parseInt(piece.dataset.correctIndex) === index;
  });

  if (isSolved) {
    clearInterval(timer);
    setTimeout(() => {
      alert(`🎉 Puzzle completed in ${time} seconds with ${moves} moves!`);
    }, 200);
  }
}

function startTimer() {
  time = 0;
  clearInterval(timer);
  timer = setInterval(() => {
    time++;
    timerDisplay.textContent = `⏱ Time: ${time}s`;
  }, 1000);
}

function updateMoves() {
  movesDisplay.textContent = `🎯 Moves: ${moves}`;
}
