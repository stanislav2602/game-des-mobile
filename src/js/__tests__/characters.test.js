import Swordsman from '../characters/Swordsman';
import Bowman from '../characters/Bowman';
import Magician from '../characters/Magician';

describe('Character stats level 1', () => {
  test('Swordsman attack 40 defence 10', () => {
    const char = new Swordsman(1);
    expect(char.attack).toBe(40);
    expect(char.defence).toBe(10);
  });

  test('Bowman attack 25 defence 25', () => {
    const char = new Bowman(1);
    expect(char.attack).toBe(25);
    expect(char.defence).toBe(25);
  });

  test('Magician attack 10 defence 40', () => {
    const char = new Magician(1);
    expect(char.attack).toBe(10);
    expect(char.defence).toBe(40);
  });
});
