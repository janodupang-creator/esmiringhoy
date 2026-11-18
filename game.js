(() => {
  const board = document.querySelector('#board');
  const triesDisplay = document.querySelector('#tries');
  const matchesDisplay = document.querySelector('#matches');
  const restartButton = document.querySelector('#restart');
  const status = document.querySelector('#status');
  const cards = [...board.querySelectorAll('.memory-card')];
  const symbols = cards.map((card) => card.querySelector('.card-front').textContent.trim());

  let firstCard = null;
  let secondCard = null;
  let locked = false;
  let tries = 0;
  let matches = 0;
  let flipBackTimer = null;

  function shuffle(items) {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function updateScore() {
    triesDisplay.textContent = String(tries);
    matchesDisplay.innerHTML = `${matches} <small>/ ${cards.length / 2}</small>`;
  }

  function flipUp(card) {
    card.classList.add('is-flipped');
    card.setAttribute('aria-label', `Revealed ${card.querySelector('.card-front').textContent.trim()}`);
  }

  function flipDown(card) {
    card.classList.remove('is-flipped');
    card.setAttribute('aria-label', 'Hidden card');
  }

  function handleCardClick(event) {
    const card = event.currentTarget;
    if (locked || card === firstCard || card.classList.contains('is-matched') || card.classList.contains('is-flipped')) return;

    flipUp(card);
    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    locked = true;
    tries += 1;
    updateScore();

    const firstSymbol = firstCard.querySelector('.card-front').textContent.trim();
    const secondSymbol = secondCard.querySelector('.card-front').textContent.trim();
    if (firstSymbol === secondSymbol) {
      firstCard.classList.add('is-matched');
      secondCard.classList.add('is-matched');
      firstCard.setAttribute('aria-label', `Matched ${firstSymbol}`);
      secondCard.setAttribute('aria-label', `Matched ${secondSymbol}`);
      matches += 1;
      updateScore();
      firstCard = null;
      secondCard = null;
      locked = false;

      if (matches === cards.length / 2) {
        status.innerHTML = '<span aria-hidden="true">🎉</span> You found them all! Great memory!';
      } else {
        status.innerHTML = '<span aria-hidden="true">✨</span> Match found! Keep going!';
      }
      return;
    }

    status.innerHTML = '<span aria-hidden="true">💭</span> No match — try to remember those cards!';
    flipBackTimer = window.setTimeout(() => {
      flipDown(firstCard);
      flipDown(secondCard);
      firstCard = null;
      secondCard = null;
      locked = false;
      flipBackTimer = null;
      status.innerHTML = '<span aria-hidden="true">☀</span> Take your time — you’ve got this!';
    }, 850);
  }

  function startGame() {
    if (flipBackTimer !== null) window.clearTimeout(flipBackTimer);
    flipBackTimer = null;
    firstCard = null;
    secondCard = null;
    locked = false;
    tries = 0;
    matches = 0;
    updateScore();
    status.innerHTML = '<span aria-hidden="true">☀</span> Take your time — you’ve got this!';

    const mixedSymbols = shuffle(symbols);
    cards.forEach((card, index) => {
      card.classList.remove('is-flipped', 'is-matched');
      card.querySelector('.card-front').textContent = mixedSymbols[index];
      card.setAttribute('aria-label', 'Hidden card');
    });
  }

  cards.forEach((card) => card.addEventListener('click', handleCardClick));
  restartButton.addEventListener('click', startGame);
  startGame();
})();
