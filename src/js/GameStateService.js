export default class GameStateService {
  constructor(storage) {
    this.storage = storage;
  }

  save(state) {
    const saveData = {
      level: state.level,
      theme: state.theme,
      currentTurn: state.currentTurn,
      selectedCell: state.selectedCell,
      positions: state.positions.map((pos) => ({
        character: {
          level: pos.character.level,
          attack: pos.character.attack,
          defence: pos.character.defence,
          health: pos.character.health,
          type: pos.character.type,
        },
        position: pos.position,
      })),
      playerTeam: {
        characters: state.playerTeam.characters.map((char) => ({
          level: char.level,
          attack: char.attack,
          defence: char.defence,
          health: char.health,
          type: char.type,
        })),
      },
      computerTeam: {
        characters: state.computerTeam.characters.map((char) => ({
          level: char.level,
          attack: char.attack,
          defence: char.defence,
          health: char.health,
          type: char.type,
        })),
      },
    };
    this.storage.setItem('state', JSON.stringify(saveData));
  }

  load() {
    try {
      const data = JSON.parse(this.storage.getItem('state'));
      if (!data) return null;
      return data;
    } catch (e) {
      throw new Error('Invalid state');
    }
  }
}
