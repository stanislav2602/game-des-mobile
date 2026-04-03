import themes from './themes';
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import GameState from './GameState';
import cursors from './cursors';
import { canMove, canAttack } from './attackUtils';

import Swordsman from './characters/Swordsman';
import Bowman from './characters/Bowman';
import Magician from './characters/Magician';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

const MAX_LEVEL = 4;

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = null;
    this.currentTurn = 'player';
  }

  init() {
    const loadAfterRefresh = localStorage.getItem('loadAfterRefresh');
    if (loadAfterRefresh) {
      try {
        const savedState = JSON.parse(loadAfterRefresh);
        this.gameState = GameState.from(savedState);
        this.currentTurn = this.gameState.currentTurn ?? 'player';
        localStorage.removeItem('loadAfterRefresh');
        this.gamePlay.constructor.showMessage('Game loaded!');
      } catch (e) {
        this.startNewGame();
      }
    } else {
      try {
        const savedState = this.stateService.load();
        if (savedState) {
          this.gameState = GameState.from(savedState);
          this.currentTurn = this.gameState.currentTurn ?? 'player';
          this.gamePlay.constructor.showMessage('Game loaded!');
        } else {
          this.startNewGame();
        }
      } catch (e) {
        this.startNewGame();
      }
    }

    this.setupEventListeners();
    this.gamePlay.drawUi(this.gameState.theme);
    this.redrawPositions();
  }

  setupEventListeners() {
    this.gamePlay.clearListeners();
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGame.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this));
  }

  startNewGame() {
    this.gameState = new GameState();
    this.gameState.level = 1;
    this.gameState.theme = themes.prairie;
    this.gameState.selectedCell = null;
    this.currentTurn = 'player';

    const playerTypes = [Swordsman, Bowman, Magician];
    const computerTypes = [Daemon, Undead, Vampire];

    this.gameState.playerTeam = generateTeam(playerTypes, 1, 2);
    this.gameState.computerTeam = generateTeam(computerTypes, 1, 2);
    this.placeCharacters();
  }

  placeCharacters() {
    this.gameState.positions = [];
    const { boardSize } = this.gamePlay;

    const playerPositions = [];
    for (let i = 0; i < boardSize * 2; i += 2) {
      if (playerPositions.length < this.gameState.playerTeam.characters.length) {
        playerPositions.push(i);
      }
    }

    const computerStartIndex = boardSize * (boardSize - 2);
    const computerPositions = [];
    for (let i = computerStartIndex; i < boardSize * boardSize; i += 2) {
      if (computerPositions.length < this.gameState.computerTeam.characters.length) {
        computerPositions.push(i);
      }
    }

    this.gameState.playerTeam.characters.forEach((character, index) => {
      if (playerPositions[index] !== undefined) {
        this.gameState.positions.push(new PositionedCharacter(character, playerPositions[index]));
      }
    });

    this.gameState.computerTeam.characters.forEach((character, index) => {
      if (computerPositions[index] !== undefined) {
        this.gameState.positions.push(new PositionedCharacter(character, computerPositions[index]));
      }
    });
  }

  redrawPositions() {
    this.gamePlay.redrawPositions(this.gameState.positions);
  }

  getCharacterByPosition(position) {
    const positioned = this.gameState.positions.find((p) => p.position === position);
    return positioned ? positioned.character : null;
  }

  isPlayerCharacter(character) {
    if (!this.gameState?.playerTeam) return false;
    return this.gameState.playerTeam.has(character);
  }

  isComputerCharacter(character) {
    if (!this.gameState?.computerTeam) return false;
    return this.gameState.computerTeam.has(character);
  }

  clearHighlightedCells() {
    for (let i = 0; i < this.gamePlay.boardSize ** 2; i += 1) {
      this.gamePlay.deselectCell(i);
    }
  }

  clearSelection() {
    if (this.gameState.selectedCell !== null) {
      this.gamePlay.deselectCell(this.gameState.selectedCell);
      this.gameState.selectedCell = null;
    }
    this.clearHighlightedCells();
  }

  showPossibleActions(index) {
    const character = this.getCharacterByPosition(index);
    if (!character || !this.isPlayerCharacter(character)) return;

    const { boardSize } = this.gamePlay;

    for (let i = 0; i < boardSize ** 2; i += 1) {
      const targetCharacter = this.getCharacterByPosition(i);
      if (!targetCharacter && canMove(character, index, i, boardSize)) {
        this.gamePlay.selectCell(i, 'green');
      }
    }

    for (let i = 0; i < boardSize ** 2; i += 1) {
      const targetCharacter = this.getCharacterByPosition(i);
      if (targetCharacter && this.isComputerCharacter(targetCharacter)
          && canAttack(character, index, i, boardSize)) {
        this.gamePlay.selectCell(i, 'red');
      }
    }
  }

  onCellClick(index) {
    if (!this.gameState || this.currentTurn !== 'player') {
      return;
    }

    const characterAtCell = this.getCharacterByPosition(index);

    if (this.gameState.selectedCell === null) {
      if (characterAtCell && this.isPlayerCharacter(characterAtCell)) {
        this.gameState.selectedCell = index;
        this.gamePlay.selectCell(index);
        this.showPossibleActions(index);
      }
    } else if (this.gameState.selectedCell === index) {
      this.clearSelection();
    } else if (characterAtCell && this.isPlayerCharacter(characterAtCell)) {
      this.clearSelection();
      this.gameState.selectedCell = index;
      this.gamePlay.selectCell(index);
      this.showPossibleActions(index);
    } else {
      this.performAction(this.gameState.selectedCell, index);
    }
  }

  performAction(fromIndex, toIndex) {
    const character = this.getCharacterByPosition(fromIndex);
    const targetCharacter = this.getCharacterByPosition(toIndex);
    const { boardSize } = this.gamePlay;

    if (targetCharacter && this.isComputerCharacter(targetCharacter)
        && canAttack(character, fromIndex, toIndex, boardSize)) {
      this.attack(character, targetCharacter, toIndex);
    } else if (!targetCharacter && canMove(character, fromIndex, toIndex, boardSize)) {
      this.moveCharacter(fromIndex, toIndex);
    } else {
      this.clearSelection();
    }
  }

  attack(attacker, target, targetIndex) {
    const damage = Math.max(attacker.attack - target.defence, attacker.attack * 0.1);
    target.health -= damage;

    this.gamePlay.showDamage(targetIndex, Math.round(damage)).then(() => {
      if (target.health <= 0) {
        this.removeCharacter(targetIndex);
      }

      this.redrawPositions();
      this.clearSelection();

      if (this.checkGameOver()) {
        return;
      }

      this.currentTurn = 'computer';
      this.gamePlay.setCursor(cursors.auto);

      setTimeout(() => {
        this.computerTurn();
      }, 500);
    });
  }

  moveCharacter(fromIndex, toIndex) {
    const positionIndex = this.gameState.positions.findIndex((p) => p.position === fromIndex);
    if (positionIndex !== -1) {
      this.gameState.positions[positionIndex].position = toIndex;
    }

    this.redrawPositions();
    this.clearSelection();

    if (this.checkGameOver()) {
      return;
    }

    this.currentTurn = 'computer';
    this.gamePlay.setCursor(cursors.auto);

    setTimeout(() => {
      this.computerTurn();
    }, 500);
  }

  computerTurn() {
    if (this.currentTurn !== 'computer') return;

    const computerPositions = this.gameState.positions.filter(
      (pos) => this.isComputerCharacter(pos.character),
    );
    const playerPositions = this.gameState.positions.filter(
      (pos) => this.isPlayerCharacter(pos.character),
    );

    if (computerPositions.length === 0 || playerPositions.length === 0) {
      this.checkGameOver();
      return;
    }

    for (const computerPos of computerPositions) {
      const computerChar = computerPos.character;
      const computerCell = computerPos.position;

      for (const playerPos of playerPositions) {
        if (canAttack(computerChar, computerCell, playerPos.position, this.gamePlay.boardSize)) {
          const damage = Math.max(
            computerChar.attack - playerPos.character.defence,
            computerChar.attack * 0.1,
          );
          playerPos.character.health -= damage;

          this.gamePlay.showDamage(playerPos.position, Math.round(damage)).then(() => {
            if (playerPos.character.health <= 0) {
              this.removeCharacter(playerPos.position);
            }
            this.redrawPositions();

            if (this.checkGameOver()) {
              return;
            }

            this.currentTurn = 'player';
          });
          return;
        }
      }
    }

    for (const computerPos of computerPositions) {
      const computerChar = computerPos.character;
      const computerCell = computerPos.position;

      let closestPlayerPos = null;
      let closestDistance = Infinity;

      for (const playerPos of playerPositions) {
        const distance = Math.abs(Math.floor(computerCell / this.gamePlay.boardSize)
                                   - Math.floor(playerPos.position / this.gamePlay.boardSize))
                         + Math.abs((computerCell % this.gamePlay.boardSize)
                                   - (playerPos.position % this.gamePlay.boardSize));
        if (distance < closestDistance) {
          closestDistance = distance;
          closestPlayerPos = playerPos.position;
        }
      }

      if (closestPlayerPos !== null) {
        const possibleMoves = [];
        for (let i = 0; i < this.gamePlay.boardSize ** 2; i += 1) {
          const targetChar = this.getCharacterByPosition(i);
          if (!targetChar && canMove(computerChar, computerCell, i, this.gamePlay.boardSize)) {
            const newRow = Math.floor(i / this.gamePlay.boardSize);
            const newCol = i % this.gamePlay.boardSize;
            const targetRow = Math.floor(closestPlayerPos / this.gamePlay.boardSize);
            const targetCol = closestPlayerPos % this.gamePlay.boardSize;
            const newDistance = Math.abs(newRow - targetRow) + Math.abs(newCol - targetCol);

            possibleMoves.push({ index: i, distance: newDistance });
          }
        }

        if (possibleMoves.length > 0) {
          possibleMoves.sort((a, b) => a.distance - b.distance);
          const bestMove = possibleMoves[0];

          const positionIndex = this.gameState.positions.findIndex(
            (p) => p.position === computerCell,
          );
          if (positionIndex !== -1) {
            this.gameState.positions[positionIndex].position = bestMove.index;
            this.redrawPositions();
            this.currentTurn = 'player';
            return;
          }
        }
      }
    }

    this.currentTurn = 'player';
  }

  removeCharacter(position) {
    const positioned = this.gameState.positions.find((p) => p.position === position);
    if (positioned) {
      const index = this.gameState.positions.indexOf(positioned);
      if (index !== -1) {
        this.gameState.positions.splice(index, 1);
      }

      if (this.isPlayerCharacter(positioned.character)) {
        this.gameState.playerTeam.removeCharacter(positioned.character);
      } else if (this.isComputerCharacter(positioned.character)) {
        this.gameState.computerTeam.removeCharacter(positioned.character);
      }
    }
  }

  checkGameOver() {
    const playerAlive = this.gameState.positions.some(
      (pos) => this.isPlayerCharacter(pos.character),
    );
    const computerAlive = this.gameState.positions.some(
      (pos) => this.isComputerCharacter(pos.character),
    );

    if (!playerAlive) {
      this.gamePlay.constructor.showMessage('Game Over! You lost!');
      this.startNewGame();
      this.gamePlay.drawUi(this.gameState.theme);
      this.redrawPositions();
      this.clearHighlightedCells();
      return true;
    }

    if (!computerAlive) {
      this.gamePlay.constructor.showMessage(
        `Level ${this.gameState.level} completed!`,
      );
      this.nextLevel();
      return true;
    }

    return false;
  }

  nextLevel() {
    if (this.gameState.level >= MAX_LEVEL) {
      this.gamePlay.constructor.showMessage('Поздравляем! Вы прошли игру!');
      this.currentTurn = null;
      this.gamePlay.setCursor(cursors.notallowed);
      return;
    }

    this.gameState.level += 1;

    const themesMap = {
      1: 'prairie',
      2: 'desert',
      3: 'arctic',
      4: 'mountain',
    };

    this.gameState.theme = themesMap[this.gameState.level] || 'mountain';

    this.gameState.playerTeam.levelUp();

    const computerTypes = [Daemon, Undead, Vampire];
    const maxLevel = Math.min(this.gameState.level, MAX_LEVEL);
    this.gameState.computerTeam = generateTeam(computerTypes, maxLevel, 2);

    this.placeCharacters();
    this.gamePlay.drawUi(this.gameState.theme);
    this.redrawPositions();
    this.clearSelection();
    this.currentTurn = 'player';
    this.gamePlay.setCursor(cursors.auto);
  }

  onCellEnter(index) {
    if (this.currentTurn !== 'player') {
      this.gamePlay.setCursor(cursors.notallowed);
      return;
    }

    const characterAtCell = this.getCharacterByPosition(index);

    if (characterAtCell) {
      const tooltip = `\u{1F396} ${characterAtCell.level} \u{2694} ${characterAtCell.attack} `
        + `\u{1F6E1} ${characterAtCell.defence} \u{2764} ${characterAtCell.health}`;
      this.gamePlay.showCellTooltip(tooltip, index);
    }

    if (this.gameState.selectedCell !== null) {
      const selectedCharacter = this.getCharacterByPosition(this.gameState.selectedCell);

      if (selectedCharacter && this.isPlayerCharacter(selectedCharacter)) {
        if (characterAtCell && this.isComputerCharacter(characterAtCell)) {
          if (canAttack(selectedCharacter, this.gameState.selectedCell, index, this.gamePlay.boardSize)) {
            this.gamePlay.setCursor(cursors.crosshair);
          } else {
            this.gamePlay.setCursor(cursors.notallowed);
          }
        } else if (!characterAtCell) {
          if (canMove(selectedCharacter, this.gameState.selectedCell, index, this.gamePlay.boardSize)) {
            this.gamePlay.setCursor(cursors.pointer);
          } else {
            this.gamePlay.setCursor(cursors.notallowed);
          }
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
    } else if (characterAtCell && this.isPlayerCharacter(characterAtCell)) {
      this.gamePlay.setCursor(cursors.pointer);
    } else {
      this.gamePlay.setCursor(cursors.auto);
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }

  onNewGame() {
    this.startNewGame();
    this.gamePlay.drawUi(this.gameState.theme);
    this.redrawPositions();
    this.clearSelection();
    this.currentTurn = 'player';
    this.gamePlay.setCursor(cursors.auto);
  }

  onSaveGame() {
    if (!this.gameState) {
      this.gamePlay.constructor.showError('No game to save!');
      return;
    }
    this.gameState.currentTurn = this.currentTurn;
    this.stateService.save(this.gameState);
    this.gamePlay.constructor.showMessage('Game saved!');
  }

  onLoadGame() {
    try {
      const savedState = this.stateService.load();
      if (savedState) {
        localStorage.setItem('loadAfterRefresh', JSON.stringify(savedState));
        window.location.reload();
      } else {
        this.gamePlay.constructor.showError('No saved game found!');
      }
    } catch (e) {
      this.gamePlay.constructor.showError('Failed to load game!');
    }
  }
}
