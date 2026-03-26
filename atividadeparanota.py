#ex001

ht = float(input("Horas trabalhadas no mês: "))
vh = float(input("Valor da hora trabalhada: "))
pd = float(input("Percentual de desconto: "))
sb = ht * vh
td = (pd / 100) * sb
sl = sb - td

print ("Salario bruto: ",sb)
print (f"Total do desconto salarial: {td:.2f}")
print ("Salario liquido: ",sl)


#ex002
salarioc1 = 2000
salarioc2 = 3000
salarioc3 = 4000
c1 = "Operador"
c2 = "Programador"
c3 = "Analista"
pc1 = 5/100
pc2 = 10/100
pc3 = 15/100
função = input("Digite o codigo do funcionário: ")
if função == "c1":
    print("Salario antigo", salarioc1)
    print("Reajuste salarial: 5%")
    print(f"Novo salario:  {salarioc1 *(1 + pc1):.0f}")
    print("Função: ",c1)
elif função == "c2":
    print("Salario antigo", salarioc2)
    print("Reajuste salarial: 10%")
    print(f"Novo salario:  {salarioc2 *(1 + pc2):.0f}")
    print("Função: ",c2)
elif função == "c3":
    print("Salario antigo", salarioc3)
    print("Reajuste salarial: 15%")
    print(f"Novo salario:  {salarioc3 *(1 + pc3):.0f}")
    print("Função: ",c3)









