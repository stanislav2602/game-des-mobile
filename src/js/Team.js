/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
 * ```js
 * const characters = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(characters);
 *
 * team.characters // [swordsman, bowman]
 * ```
 * */
export default class Team {
  #characters = [];

  constructor(characters = []) {
    this.#characters = characters;
  }

  get characters() {
    return this.#characters;
  }

  addCharacter(character) {
    this.#characters.push(character);
  }

  removeCharacter(character) {
    const index = this.#characters.findIndex(
      (c) => c.type === character.type &&
             c.level === character.level &&
             c.health === character.health
    );
    if (index !== -1) {
      this.#characters.splice(index, 1);
    }
  }

  has(character) {
    return this.#characters.some(
      (c) => c.type === character.type &&
             c.level === character.level &&
             c.health === character.health
    );
  }

  levelUp() {
    this.#characters.forEach((character) => {
      const healthPercent = character.health;
      character.health = Math.min(character.health + 80, 100);
      character.attack = Math.max(
        character.attack,
        Math.floor((character.attack * (80 + healthPercent)) / 100),
      );
      character.defence = Math.max(
        character.defence,
        Math.floor((character.defence * (80 + healthPercent)) / 100),
      );
      character.level = Math.min(character.level + 1, 4);
    });
  }

  isEmpty() {
    return this.#characters.length === 0;
  }
}
