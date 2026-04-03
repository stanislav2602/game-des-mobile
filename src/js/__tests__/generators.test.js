import { characterGenerator, generateTeam } from '../generators';
import Swordsman from '../characters/Swordsman';

describe('characterGenerator', () => {
  test('generates characters', () => {
    const gen = characterGenerator([Swordsman], 2);
    expect(gen.next().value).toBeDefined();
    expect(gen.next().value).toBeDefined();
  });
});

describe('generateTeam', () => {
  test('creates 3 characters', () => {
    const team = generateTeam([Swordsman], 2, 3);
    expect(team.characters.length).toBe(3);
  });
});
