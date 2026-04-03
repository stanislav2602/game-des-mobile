import { canMove, canAttack } from '../attackUtils';
import Swordsman from '../characters/Swordsman';
import Bowman from '../characters/Bowman';
import Magician from '../characters/Magician';

const boardSize = 8;

describe('Movement', () => {
  test('Swordsman moves 4', () => {
    const char = new Swordsman(1);
    expect(canMove(char, 0, 4, boardSize)).toBe(true);
    expect(canMove(char, 0, 5, boardSize)).toBe(false);
  });

  test('Bowman moves 2', () => {
    const char = new Bowman(1);
    expect(canMove(char, 0, 2, boardSize)).toBe(true);
    expect(canMove(char, 0, 3, boardSize)).toBe(false);
  });

  test('Magician moves 1', () => {
    const char = new Magician(1);
    expect(canMove(char, 0, 1, boardSize)).toBe(true);
    expect(canMove(char, 0, 2, boardSize)).toBe(false);
  });
});

describe('Attack', () => {
  test('Swordsman attacks 1', () => {
    const char = new Swordsman(1);
    expect(canAttack(char, 0, 1, boardSize)).toBe(true);
    expect(canAttack(char, 0, 2, boardSize)).toBe(false);
  });

  test('Bowman attacks 2', () => {
    const char = new Bowman(1);
    expect(canAttack(char, 0, 2, boardSize)).toBe(true);
    expect(canAttack(char, 0, 3, boardSize)).toBe(false);
  });

  test('Magician attacks 4', () => {
    const char = new Magician(1);
    expect(canAttack(char, 0, 4, boardSize)).toBe(true);
    expect(canAttack(char, 0, 5, boardSize)).toBe(false);
  });
});
