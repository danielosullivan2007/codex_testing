const suits = ['♠', '♥', '♦', '♣'];
const ranks = [
  { label: 'A', value: [1, 11] },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '7', value: 7 },
  { label: '8', value: 8 },
  { label: '9', value: 9 },
  { label: '10', value: 10 },
  { label: 'J', value: 10 },
  { label: 'Q', value: 10 },
  { label: 'K', value: 10 }
];

let deck = [];
let playerHand = [];
let dealerHand = [];
let gameActive = false;
let dealerHiddenCard = null;

const dealerCardsEl = document.getElementById('dealer-cards');
const playerCardsEl = document.getElementById('player-cards');
const dealerScoreEl = document.getElementById('dealer-score');
const playerScoreEl = document.getElementById('player-score');
const messageEl = document.getElementById('message');

const dealBtn = document.getElementById('deal');
const hitBtn = document.getElementById('hit');
const standBtn = document.getElementById('stand');
const resetBtn = document.getElementById('reset');

const createDeck = () => {
  const newDeck = [];
  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      newDeck.push({
        suit,
        label: rank.label,
        value: rank.value
      });
    });
  });
  return shuffle(newDeck);
};

const shuffle = (cards) => {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const dealCard = (hand) => {
  const card = deck.pop();
  if (!card) {
    deck = createDeck();
    return dealCard(hand);
  }
  hand.push(card);
  return card;
};

const calculateScore = (hand) => {
  let total = 0;
  let aces = 0;

  hand.forEach((card) => {
    if (Array.isArray(card.value)) {
      aces += 1;
      total += 11;
    } else {
      total += card.value;
    }
  });

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
};

const renderCard = (card, options = {}) => {
  const cardEl = document.createElement('div');
  cardEl.className = 'card';

  if (options.hidden) {
    cardEl.classList.add('hidden');
    cardEl.dataset.hidden = 'true';
    return cardEl;
  }

  const isRedSuit = card.suit === '♥' || card.suit === '♦';
  if (isRedSuit) {
    cardEl.classList.add('red');
  }

  const createCorner = (position) => {
    const corner = document.createElement('div');
    corner.className = `card-corner ${position}`;

    const rank = document.createElement('span');
    rank.className = 'card-rank';
    rank.textContent = card.label;

    const suit = document.createElement('span');
    suit.className = 'card-suit';
    suit.textContent = card.suit;

    corner.append(rank, suit);
    return corner;
  };

  const topCorner = createCorner('top');
  const bottomCorner = createCorner('bottom');

  const center = document.createElement('div');
  center.className = 'card-center';
  const centerSuit = document.createElement('span');
  centerSuit.className = 'card-suit large';
  centerSuit.textContent = card.suit;
  center.appendChild(centerSuit);

  cardEl.append(topCorner, center, bottomCorner);

  return cardEl;
};

const renderHands = (revealDealer = false) => {
  dealerCardsEl.innerHTML = '';
  playerCardsEl.innerHTML = '';

  dealerHand.forEach((card, index) => {
    const shouldHide = index === 1 && !revealDealer && dealerHiddenCard;
    dealerCardsEl.appendChild(renderCard(card, { hidden: shouldHide }));
  });

  playerHand.forEach((card) => {
    playerCardsEl.appendChild(renderCard(card));
  });

  const dealerScore = revealDealer ? calculateScore(dealerHand) : calculateScore([dealerHand[0]]);
  dealerScoreEl.textContent = `Score: ${dealerScore}`;
  playerScoreEl.textContent = `Score: ${calculateScore(playerHand)}`;
};

const resetGame = () => {
  playerHand = [];
  dealerHand = [];
  deck = createDeck();
  gameActive = false;
  dealerHiddenCard = null;

  dealerCardsEl.innerHTML = '';
  playerCardsEl.innerHTML = '';
  dealerScoreEl.textContent = 'Score: 0';
  playerScoreEl.textContent = 'Score: 0';
  messageEl.textContent = '';

  hitBtn.disabled = true;
  standBtn.disabled = true;
  dealBtn.disabled = false;
};

const startGame = () => {
  resetGame();
  gameActive = true;
  dealBtn.disabled = true;
  hitBtn.disabled = false;
  standBtn.disabled = false;

  dealerHand.push(dealCard(dealerHand));
  dealerHiddenCard = dealCard(dealerHand);

  dealCard(playerHand);
  dealCard(playerHand);

  renderHands(false);
  checkForBlackjack();
};

const checkForBlackjack = () => {
  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);

  if (playerScore === 21 && dealerScore === 21) {
    endRound("Push! Both have Blackjack.");
  } else if (playerScore === 21) {
    endRound('Blackjack! You win!');
  } else if (dealerScore === 21) {
    endRound('Dealer has Blackjack. You lose.');
  }
};

const endRound = (resultText) => {
  gameActive = false;
  hitBtn.disabled = true;
  standBtn.disabled = true;
  dealBtn.disabled = false;
  messageEl.textContent = resultText;
  renderHands(true);
};

const playerHit = () => {
  if (!gameActive) return;
  dealCard(playerHand);
  renderHands(false);

  const score = calculateScore(playerHand);
  if (score > 21) {
    endRound('Bust! Dealer wins.');
  }
};

const dealerPlay = () => {
  while (calculateScore(dealerHand) < 17) {
    dealCard(dealerHand);
  }
};

const handleStand = () => {
  if (!gameActive) return;
  gameActive = false;
  hitBtn.disabled = true;
  standBtn.disabled = true;
  dealBtn.disabled = false;

  dealerPlay();
  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);

  renderHands(true);

  if (dealerScore > 21) {
    messageEl.textContent = 'Dealer busts! You win!';
  } else if (dealerScore > playerScore) {
    messageEl.textContent = 'Dealer wins.';
  } else if (dealerScore < playerScore) {
    messageEl.textContent = 'You win!';
  } else {
    messageEl.textContent = "Push! It's a tie.";
  }
};

resetBtn.addEventListener('click', resetGame);
dealBtn.addEventListener('click', startGame);
hitBtn.addEventListener('click', playerHit);
standBtn.addEventListener('click', handleStand);

resetGame();
