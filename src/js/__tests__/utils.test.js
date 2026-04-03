import { calcTileType } from '../utils';

describe('calcTileType', () => {
  test('top-left', () => expect(calcTileType(0, 8)).toBe('top-left'));
  test('top-right', () => expect(calcTileType(7, 8)).toBe('top-right'));
  test('bottom-left', () => expect(calcTileType(56, 8)).toBe('bottom-left'));
  test('bottom-right', () => expect(calcTileType(63, 8)).toBe('bottom-right'));
  test('top', () => expect(calcTileType(1, 8)).toBe('top'));
  test('bottom', () => expect(calcTileType(57, 8)).toBe('bottom'));
  test('left', () => expect(calcTileType(8, 8)).toBe('left'));
  test('right', () => expect(calcTileType(15, 8)).toBe('right'));
  test('center', () => expect(calcTileType(27, 8)).toBe('center'));
});
