# Publicação automática no Instagram/Facebook

Quando você publica ou atualiza um imóvel pelo admin (botão **"Publicar GitHub
e Redes"**), acontecem dois passos em sequência, sozinhos, no GitHub Actions:

1. **build** — gera as páginas em `/docs` (como já acontecia antes).
2. **publish-instagram** — pega o(s) imóvel(is) que mudou(ram) nesse push e
   publica automaticamente no Instagram **@corretor_marcio_itu**: uma foto
   única se o imóvel tiver 1 foto, ou um carrossel se tiver mais de uma.

Você não precisa colar nenhum token de rede social no admin — isso roda
inteiramente no GitHub Actions, usando um token guardado nos **Secrets** do
repositório.

## Onde está o token

- **Secret:** `INSTAGRAM_ACCESS_TOKEN`
- **Onde:** Settings → Secrets and variables → Actions, no repositório
  `Marcio-itu/Imoveis-Itu-Salto-Indaiatuba`
- **Conta:** @corretor_marcio_itu (Instagram Business ID `17841455795855812`,
  ligado à página do Facebook "Imóveis Itu Salto Sorocaba", ID `111021645138305`)
- **App usado para gerar o token:** ImobMind Publisher (App ID `1324186406070600`)
- **Permissões do token:** `instagram_basic`, `instagram_content_publish`,
  `pages_show_list`, `pages_read_engagement`
- **Validade:** 60 dias a partir da data em que foi gerado

O token nunca aparece em nenhum log do GitHub Actions nem em nenhum arquivo do
repositório — ele só existe como Secret e é lido pela variável de ambiente
`INSTAGRAM_ACCESS_TOKEN` dentro do workflow.

## Como saber se expirou

Se o token expirar, a publicação vai falhar (o job `publish-instagram` fica
vermelho no GitHub Actions, mas isso **não afeta o site** — ele continua sendo
publicado normalmente). No log do job você vai ver:

```
TOKEN EXPIRADO - renovar em developers.facebook.com
```

## Como renovar o token (a cada ~60 dias)

1. Acesse [developers.facebook.com](https://developers.facebook.com) → seu
   app **ImobMind Publisher**.
2. Vá em **Graph API Explorer**, selecione o app, e gere um novo **User Token**
   com as permissões: `instagram_basic`, `instagram_content_publish`,
   `pages_show_list`, `pages_read_engagement`.
3. Troque esse token de curta duração por um de longa duração (60 dias) usando
   o endpoint `oauth/access_token` com `grant_type=fb_exchange_token` (o Graph
   API Explorer tem um botão "Extend Access Token" que faz isso por você).
4. No repositório: Settings → Secrets and variables → Actions →
   `INSTAGRAM_ACCESS_TOKEN` → **Update** → cole o novo token.
5. Pronto — não precisa mudar nada no código nem no admin.

## Testar sem publicar de verdade

```bash
node scripts/publish-social.js --slug=casa-praia-preta --dry-run
```

Isso mostra a legenda gerada e as URLs das fotos que seriam enviadas, sem
chamar a Meta Graph API.

## O que fica registrado

Depois de cada publicação bem-sucedida, o script grava
`imoveis/{slug}/social_log.json` com o `instagram_media_id`, o link do post
(`permalink`) e a data — e o próprio Actions comita esse arquivo de volta no
repositório.
