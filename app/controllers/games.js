const { EpicFreeGames } = require("epic-free-games")

let dados = []

class Games {
    show(req, res) {

        // Coletando os parâmetros da requisição
        const requisicao = req.query
        let reload = false

        if (requisicao.reload)
            reload = true

        if (dados.length < 1 || reload) { // Se reload for definido, força o update
            const epicFreeGames = new EpicFreeGames({ country: 'BR', locale: 'pt-BR', includeAll: true })

            epicFreeGames.getGames().then(data => {
                dados = data.currentGames

                retorna_games(res)
            })
                .catch(() => {
                    return res.json({ status: "404" })
                })
        } else
            retorna_games(res)
    }
}

function retorna_games(res) {

    try {
        let array_games = []

        dados.forEach(jogo => {

            let thumbnail_game = jogo.keyImages[0].url

            let tipo_conteudo = jogo.categories[0]["path"] === "bundles" ? "bundles" : "p"
            const url_game = `https://store.epicgames.com/pt-BR/${tipo_conteudo}/${jogo.urlSlug}`

            let preco = `${jogo.price.totalPrice.originalPrice}`

            if (preco.length > 2) // Formatando o preço
                preco = parseFloat(preco.substr(0, preco.length - 2) + "." + preco.substr(preco.length - 2, preco.length))

            array_games.push({
                nome: jogo.title,
                preco: preco,
                descricao: jogo.description,
                thumbnail: thumbnail_game,
                link: url_game,
                inicia: formata_data(jogo.promotions.promotionalOffers[0].promotionalOffers[0].startDate.slice(5, 10)),
                expira: formata_data(jogo.promotions.promotionalOffers[0].promotionalOffers[0].endDate.slice(5, 10))
            })
        })

        return res.json(array_games)
    } catch (err) {
        return res.json({ status: 501 })
    }
}

function formata_data(data) {
    return `${data.slice(3, 5)}/${data.slice(0, 2)}`
}

module.exports = new Games()