import random

def adivinhe_o_numero():
    numero_secreto = random.randint(1, 100)
    tentativas = 0
    print("Bem-vindo ao jogo 'Adivinhe o Número'!")
    print("Estou pensando em um número entre 1 e 100.")

    while True:
        palpite = input("Digite seu palpite: ")
        tentativas += 1

        try:
            palpite = int(palpite)
        except ValueError:
            print("Por favor, digite um número válido.")
            continue

        if palpite < numero_secreto:
            print("Muito baixo!")
        elif palpite > numero_secreto:
            print("Muito alto!")
        else:
            print(f"Parabéns! Você adivinhou o número em {tentativas} tentativas.")
            break

if __name__ == "__main__":
    adivinhe_o_numero()
