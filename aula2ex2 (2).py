#"elabore um progama que converta euro em reais e mostre o resultado dentro do terminal"
#declarei as variaveis e seu tipo, após isso utilizei o input para fazer o processo de entrada de dados 
#após isso declarei uma outra variavel que é responsavel por pegar os dados e multiplicar as duas variaveis que citei acima, sendo o processo de processamento desse codigo
#e por fim a saida onde utilizei o print juntamente com a f para que eu podesse utilizar apenas 2 decimais nesse codigo, apos isso menciono a conversão para mostrar o resultado.



real = float (1)
euro = float (6.05)
real = float(input("Digite quantos euros quer investir:"))
conversão: float = real * euro
print(f"você pode comprar {conversão:.2f} reais")