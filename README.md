# My Player

Player de música em HTML, CSS e JavaScript.

## Como rodar com Docker

```bash
docker compose up -d --build
```

Acesse:

```txt
http://localhost:8080
```

## Como adicionar músicas

Edite o arquivo `musicas.json` e adicione novos itens mantendo o padrão:

```json
{
  "title": "Nome da música",
  "artist": "Artista",
  "album": "Álbum",
  "src": "assets/musicas/arquivo.mp3",
  "cover": "assets/capas/capa.png"
}
```

Depois coloque o arquivo `.mp3` em `assets/musicas/` e a capa em `assets/capas/`.
