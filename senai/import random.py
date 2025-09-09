import random

# mini_rpg_animals.py


class Animal:
    def __init__(self, name, species, power):
        self.name = name
        self.species = species
        self.power = power
        self.hp = 100

    def attack(self, other):
        damage = random.randint(10, self.power)
        other.hp -= damage
        return f"{self.name} attacks {other.name} for {damage} damage!"

    def strong_attack(self, other):
        damage = random.randint(self.power, self.power + 15)
        other.hp -= damage
        return f"{self.name} uses STRONG ATTACK on {other.name} for {damage} damage!"

    def heal(self):
        heal_amount = random.randint(10, 25)
        self.hp += heal_amount
        return f"{self.name} heals for {heal_amount} HP!"

    def is_alive(self):
        return self.hp > 0

def main():
    print("Welcome to News Animals RPG!")
    animals = [
        Animal("Leo", "Lion", 25),
        Animal("Ellie", "Elephant", 20),
        Animal("Rex", "Raccoon", 15),
        Animal("Polly", "Parrot", 10)
    ]

    player = random.choice(animals)
    enemy = random.choice([a for a in animals if a != player])

    print(f"You are {player.name} the {player.species}.")
    print(f"Your opponent is {enemy.name} the {enemy.species}.")

    while player.is_alive() and enemy.is_alive():
        print(f"\n{player.name} HP: {player.hp} | {enemy.name} HP: {enemy.hp}")
        print("Choose your action: [1] Attack [2] Strong Attack [3] Heal")
        choice = input("Enter 1, 2, or 3: ").strip()
        if choice == "1":
            print(player.attack(enemy))
        elif choice == "2":
            print(player.strong_attack(enemy))
        elif choice == "3":
            print(player.heal())
        else:
            print("Invalid choice. You lose your turn.")

        if not enemy.is_alive():
            print(f"{enemy.name} has been defeated! You win!")
            break

        # Enemy randomly chooses an action
        enemy_choice = random.choice(["attack", "strong_attack", "heal"])
        if enemy_choice == "attack":
            print(enemy.attack(player))
        elif enemy_choice == "strong_attack":
            print(enemy.strong_attack(player))
        else:
            print(enemy.heal())

        if not player.is_alive():
            print(f"{player.name} has been defeated! Game over.")
            break

if __name__ == "__main__":
    main()