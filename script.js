let teams = [];
let showingAnswer = false;
let currentTile = null;
// Add team button handler
document.getElementById('addTeam').addEventListener('click', () => {
  const team = { name: `Team ${teams.length + 1}`, score: 0 };
  teams.push(team);
  renderTeams();
});
// Render teams in sidebar
function renderTeams() {
  const scoreboard = document.getElementById('scoreboard');
  scoreboard.innerHTML = '';
  teams.forEach((team, i) => {
    const div = document.createElement('div');
    div.className = 'team';
    div.innerHTML = `
      <input value="${team.name}" onchange="teams[${i}].name = this.value" />
      <div>Score: ${team.score}</div>
      <button onclick="teams[${i}].score -= 100; renderTeams()">-100</button>
      <button onclick="teams[${i}].score += 100; renderTeams()">+100</button>
    `;
    scoreboard.appendChild(div);
  });
}

// Parse CSV upload
document.getElementById('fileInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      if (!results.data || results.data.length === 0) {
        alert('CSV is empty or formatted incorrectly.');
        return;
      }
      buildBoard(results.data);
    }
  });
});
// Build the Jeopardy board
function buildBoard(data) {
  const board = document.getElementById('board');
  board.innerHTML = '';
  // Get unique categories
  const categories = [...new Set(data.map(q => q.Category))];
  categories.forEach(cat => {
    const div = document.createElement('div');
    div.className = 'category';
    div.textContent = cat;
    board.appendChild(div);
  });
  // Get unique point values sorted
  const values = [...new Set(data.map(q => parseInt(q.Value)))].sort((a, b) => a - b);
  values.forEach(value => {
    categories.forEach(cat => {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.textContent = value;
      const question = data.find(q => q.Category === cat && parseInt(q.Value) === value);
      if (question) {
        tile.dataset.question = question.Question;
        tile.dataset.answer = question.Answer;
        tile.dataset.value = value;
        tile.dataset.category = cat;
        tile.addEventListener('click', () => openModal(tile));
      } else {
        tile.textContent = '';
      }
      board.appendChild(tile);
    });
  });
}
// Open modal on question click
function openModal(tile) {
  currentTile = tile;
  showingAnswer = false;
  const modal = document.getElementById('modal');
  modal.style.display = 'flex';
  document.getElementById('modal-category').textContent = tile.dataset.category;
  document.getElementById('modal-text').textContent = tile.dataset.question;
}
// Clicking modal toggles question/answer or closes modal
document.getElementById('modal').addEventListener('click', () => {
  if (!showingAnswer) {
    // Show answer
    document.getElementById('modal-text').textContent = currentTile.dataset.answer;
    showingAnswer = true;
  } else {
    // Close modal and disable tile
    document.getElementById('modal').style.display = 'none';
    currentTile.classList.add('used');
    currentTile.removeEventListener('click', openModal);
    currentTile = null;
  }
});
