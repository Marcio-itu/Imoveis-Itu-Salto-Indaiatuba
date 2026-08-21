# Nomenclatura de fotos

Todas as fotos de um mesmo imóvel usam a **mesma raiz de nome** — não são mais
classificadas por cômodo/ambiente. Isso existia antes (fachada, quarto, cozinha...),
mas foi abandonado: muita foto (corredor, janela, detalhe) não tem um nome óbvio na
lista, e o cômodo em si não é o que ajuda o SEO — o que ajuda é o tipo do imóvel, a
cidade e a região aparecerem em todo nome de arquivo, de forma consistente.

## Padrão de nome de arquivo

```
{tipo}-a-venda-{cidade}-interior-de-sao-paulo-{adjetivo}-{data}[-{sequencia}].ext
```

Exemplo real (imóvel com 3 fotos):
```
casa-a-venda-itu-interior-de-sao-paulo-amplo-20260820103000.webp
casa-a-venda-itu-interior-de-sao-paulo-espacoso-20260820103000.webp
casa-a-venda-itu-interior-de-sao-paulo-iluminado-20260820103000.webp
```

- **Raiz** (`tipo-a-venda-cidade-interior-de-sao-paulo`): igual para todas as fotos
  do imóvel. Vem do campo "Tipo" e "Cidade" preenchidos no admin. Se o imóvel não for
  de SP, a região vira só a UF em vez de "interior-de-sao-paulo".
- **Adjetivo**: existe só pra diferenciar os arquivos entre si (sem ele, todas as fotos
  do mesmo imóvel colidiriam no nome). Atribuído automaticamente pela posição da foto
  na lista — a 1ª foto sempre pega o mesmo adjetivo, a 2ª sempre pega o próximo, etc.
  Lista completa em `admin/index.html`, constante `ADJETIVOS_DIFERENCIACAO`. Se o
  imóvel tiver mais fotos do que adjetivos na lista, ela recomeça com um número no
  final (`amplo-2`) — nunca colide.
- **Data**: horário (até o segundo) em que a foto foi adicionada no admin. Fica travado
  na primeira vez que a foto ganha nome, pra não mudar sozinho na tela.

## Texto alternativo (alt text)

Frase natural, sem mencionar cômodo (já que essa informação não existe mais por foto):
```
Casa à venda em Jardim Bonfiglioli, Itu - SP: bem avaliada
```
Montado a partir de tipo + bairro + cidade + UF + o mesmo adjetivo do nome do arquivo
(sem o sufixo numérico de repetição, se houver).

## Fotos pras redes sociais (Instagram + vídeo reel)

Isso é independente do nome do arquivo. No admin, cada foto tem uma caixinha "📱 redes
sociais" — marque até 10. São exatamente essas (nem mais, nem menos) que vão pro
carrossel do Instagram e pro vídeo reel, na mesma ordem em que aparecem na lista de
fotos do imóvel (a mesma ordem que os botões ▲▼ controlam).

Imóveis publicados antes dessa marcação existir (sem nenhuma foto com `social:true`
salva) caem num fallback automático: Instagram usa o filtro antigo por nome de arquivo
(pra não postar planta baixa/card comercial) e o reel usa as primeiras fotos da galeria.
Basta reeditar o imóvel e marcar as fotos certas pra passar a usar a seleção manual.
