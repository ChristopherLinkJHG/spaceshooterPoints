import './styles.css';
import Game from './tetris.js';

const app = document.getElementById('app');
const game = new Game();
app.appendChild(game.canvas);

// Start game loop
game.start();

// Controls
window.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'ArrowLeft':
      game.move(-1);
      break;
    case 'ArrowRight':
      game.move(1);
      break;
    case 'ArrowDown':
      game.drop();
      break;
    case 'Space':
      game.hardDrop();
      break;
    case 'KeyZ':
      game.rotate(-1);
      break;
    case 'KeyX':
      game.rotate(1);
      break;
  }
});
