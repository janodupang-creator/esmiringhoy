(() => {
  const board = document.querySelector('#board');
  const triesDisplay = document.querySelector('#tries');
  const matchesDisplay = document.querySelector('#matches');
  const restartButton = document.querySelector('#restart');
  const difficultySelect = document.querySelector('#difficulty');
  const soundToggle = document.querySelector('#sound-toggle');
  const wrongSound = document.querySelector('#wrong-sound');
  const matchSound = document.querySelector('#match-sound');
  const winSound = document.querySelector('#win-sound');
  const soundClips = [wrongSound, matchSound, winSound];
  const status = document.querySelector('#status');

  const symbols = ['🍓', '🌈', '🐸', '🍋', '🐙', '🌼', '🦋', '🍉', '⭐', '🐳', '🍄', '🧁'];
  const levels = {
    easy: { pairs: 6, columns: 3 },
    medium: { pairs: 8, columns: 4 },
    hard: { pairs: 12, columns: 4 },
  };

  let cards = [];
  let firstCard = null;
  let secondCard = null;
  let locked = false;
  let tries = 0;
  let matches = 0;
  let soundOn = true;
  let flipBackTimer = null;

  function shuffle(items) {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function updateScore(totalPairs) {
    triesDisplay.textContent = String(tries);
    matchesDisplay.innerHTML = `${matches} <small>/ ${totalPairs}</small>`;
  }

  function flipUp(card) {
    card.classList.add('is-flipped');
    card.setAttribute('aria-label', `Revealed ${card.dataset.symbol}`);
  }

  function flipDown(card) {
    card.classList.remove('is-flipped');
    card.setAttribute('aria-label', 'Hidden card');
  }

  function playSound(clip) {
    if (!soundOn) return;
    soundClips.forEach((sound) => {
      if (sound !== clip) {
        sound.pause();
        sound.currentTime = 0;
      }
    });
    clip.currentTime = 0;
    const playback = clip.play();
    if (playback) playback.catch(() => {});
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
    const { pairs: totalPairs } = levels[difficultySelect.value];
    updateScore(totalPairs);

    if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
      firstCard.classList.add('is-matched');
      secondCard.classList.add('is-matched');
      firstCard.setAttribute('aria-label', `Matched ${firstCard.dataset.symbol}`);
      secondCard.setAttribute('aria-label', `Matched ${secondCard.dataset.symbol}`);
      matches += 1;
      updateScore(totalPairs);
      firstCard = null;
      secondCard = null;
      locked = false;

      if (matches === totalPairs) {
        status.innerHTML = '<span aria-hidden="true">🎉</span> You found them all! Great memory!';
        playSound(winSound);
      } else {
        status.innerHTML = '<span aria-hidden="true">✨</span> Match found! Keep going!';
        playSound(matchSound);
      }
      return;
    }

    status.innerHTML = '<span aria-hidden="true">💭</span> No match — try to remember those cards!';
    playSound(wrongSound);
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
    const { pairs: totalPairs, columns } = levels[difficultySelect.value];
    const deck = shuffle([...symbols.slice(0, totalPairs), ...symbols.slice(0, totalPairs)]);
    board.dataset.columns = String(columns);
    board.setAttribute('aria-label', `${difficultySelect.value} memory card grid`);
    board.replaceChildren();

    cards = deck.map((symbol, index) => {
      const card = document.createElement('button');
      card.className = 'memory-card';
      card.type = 'button';
      card.setAttribute('aria-label', 'Hidden card');
      card.dataset.symbol = symbol;
      card.innerHTML = `<span class="card-inner"><span class="card-face card-back" aria-hidden="true">✦</span><span class="card-face card-front" aria-hidden="true">${symbol}</span></span>`;
      card.addEventListener('click', handleCardClick);
      board.append(card);
      return card;
    });

    updateScore(totalPairs);
    status.innerHTML = '<span aria-hidden="true">☀</span> Take your time — you’ve got this!';
  }

  soundToggle.addEventListener('click', () => {
    soundOn = !soundOn;
    soundToggle.setAttribute('aria-pressed', String(soundOn));
    soundToggle.textContent = soundOn ? '🔊 Sound on' : '🔇 Sound off';
    if (!soundOn) {
      soundClips.forEach((sound) => {
        sound.pause();
        sound.currentTime = 0;
      });
    }
  });

  restartButton.addEventListener('click', startGame);
  difficultySelect.addEventListener('change', startGame);
  startGame();
})();
