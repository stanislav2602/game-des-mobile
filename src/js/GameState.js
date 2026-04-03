import Swordsman from './characters/Swordsman';
import Bowman from './characters/Bowman';
import Magician from './characters/Magician';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import PositionedCharacter from './PositionedCharacter';
import Team from './Team';

export default class GameState {
  constructor() {
    this.level = 1;
    this.positions = [];
    this.playerTeam = null;
    this.computerTeam = null;
    this.currentTurn = 'player';
    this.selectedCell = null;
    this.theme = 'prairie';
  }

  static from(object) {
    if (!object) return new GameState();

    const state = new GameState();
    state.level = object.level ?? 1;
    state.theme = object.theme ?? 'prairie';
    state.currentTurn = object.currentTurn ?? 'player';
    state.selectedCell = null;

    const characterMap = {
      swordsman: Swordsman,
      bowman: Bowman,
      magician: Magician,
      daemon: Daemon,
      undead: Undead,
      vampire: Vampire,
    };

    state.positions = [];
    if (object.positions && Array.isArray(object.positions)) {
      for (const posData of object.positions) {
        if (posData && posData.character) {
          const CharacterClass = characterMap[posData.character.type];
          if (CharacterClass) {
            const character = new CharacterClass(posData.character.level ?? 1);
            character.attack = posData.character.attack ?? 0;
            character.defence = posData.character.defence ?? 0;
            character.health = posData.character.health ?? 50;

            state.positions.push(new PositionedCharacter(character, posData.position ?? 0));
          }
        }
      }
    }

    if (object.playerTeam && object.playerTeam.characters) {
      const playerCharacters = [];
      for (const charData of object.playerTeam.characters) {
        if (charData && charData.type) {
          const CharacterClass = characterMap[charData.type];
          if (CharacterClass) {
            const character = new CharacterClass(charData.level ?? 1);
            character.attack = charData.attack ?? 0;
            character.defence = charData.defence ?? 0;
            character.health = charData.health ?? 50;
            playerCharacters.push(character);
          }
        }
      }
      state.playerTeam = new Team(playerCharacters);
    }

    if (object.computerTeam && object.computerTeam.characters) {
      const computerCharacters = [];
      for (const charData of object.computerTeam.characters) {
        if (charData && charData.type) {
          const CharacterClass = characterMap[charData.type];
          if (CharacterClass) {
            const character = new CharacterClass(charData.level ?? 1);
            character.attack = charData.attack ?? 0;
            character.defence = charData.defence ?? 0;
            character.health = charData.health ?? 50;
            computerCharacters.push(character);
          }
        }
      }
      state.computerTeam = new Team(computerCharacters);
    }

    return state;
  }
}
