#ex001
n1 = int(input("Digite um numero:"))
n2 = int(input("Digite outro numero:"))
soma = n1 + n2

print ("A soma é:", soma)

#ex002
#f: Avisa ao Python que a frase terá variáveis dentro.
#{conversão}: Diz ao Python para pegar o valor que está guardado na "gaveta" chamada conversão e colocar ali.
#:.2f: É o formatador. O 2 diz quantas casas decimais você quer, e o f vem de float (número decimal).

real = float (1)
euro = float (6.05)
real = float(input("Digite quantos reais quer investir:"))
conversão: float = real / euro
print(f"A conversão foi {conversão:.2f} euros")

#ex003 
km = float (1)
litro = float (1)
km = float(input("Quantos Km você percorreu?"))
litro = float(input("Quantos litros de combustivel você utilizou?"))
consumo = km / litro
print (f"Seu consumo médio foi de {consumo:.2f} km/l")

#ex004

print ("Olá hoje vamos calcular sua media desse bimestre com base na suas atividades")
at1 = float(1)
at2 = float(1)
at3 = float(1)
at1 = float(input("Qual foi sua nota na atividade 1?"))
at2 = float(input("Qual foi sua nota na atividade 2?"))
at3 = float(input("Qual foi sua nota na atividade 3?"))
media = (at1 + at2 + at3)/ 3
print (f"Sua média foi de {media:.2f}")
