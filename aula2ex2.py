#Solicite ao usuario sua idade se for igual ou maior a 18,
#Você ira apresentara a mensagem pode tirar a habilitação
#Code by Dev Hazenfratz and Dev Santana
#ex001
idade = int(1)
cnh = int(input ("Digite sua idade: "))
if cnh >= 18:
    print("Você pode tirar sua habilitação")
else:
    print("Você não pode tirar sua habilitação")

print("------------------------")

#ex002
atv1 = float(input ("Digite sua nota da atv1: "))
atv2 = float(input ("Digite sua nota da atv2: "))
atv3 = float(input ("Digite sua nota da atv3: "))

nota = (atv1+atv2+atv3)/3
print (f"sua media foi: {nota:.1f}")
if nota > 7:
    print ("Aprovado")
elif nota == 7:
    print ("Recuperação")
else :
    print ("Reprovado")

print("------------------------")

#ex003

n1 = int()
n2 = int()
n1 = input ("Escolha um numero: ")
n2 = input ("Escolha outro numero: ")
if n1 > n2:
    print ("O n1 é maior")
elif n2 == n1:
    print ("Os dois numeros são iguais")
else:
    print ("O n2 é maior")
print ("--------------------------------------------")

#ex004

etanol = float(input("Digite o valor do etanol: "))
gasolina = float(input("Digite o valor da gasolina: "))
resultado = etanol/gasolina
print (f"Seu resultado foi {resultado:.2f}")
if resultado < 0.7:
    print ("Abasteça com etanol")
else:
    print ("Abasteça com gasolina")