import Character from '../Character';
import Swordsman from '../characters/Swordsman';

describe('Character', () => {
  test('new Character() error', () => {
    expect(() => new Character(1)).toThrow();
  });

  test('new Swordsman() no error', () => {
    expect(() => new Swordsman(1)).not.toThrow();
  });
});
