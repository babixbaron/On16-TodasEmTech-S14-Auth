const Colaboradoras = require('../models/colaboradorasModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const SECRET = process.env.SECRET

const create = (req, res) => {
    const senhaComHash = bcrypt.hashSync(req.body.senha, 10) //  para criptografar a senha do body    
    req.body.senha = senhaComHash // atualiza a senha para senha com hash

    // com as linhas de código acima as senhas passadas no postman são transformadas em senhas codificadas
    
    const colaboradora = new Colaboradoras(req.body)
    colaboradora.save(function(err) {
        if (err) {
            res.status(500).send({ message: err.message })
        }
        res.status(201).send(colaboradora)
    })
}

const getAll = (req, res) => {
    Colaboradoras.find(function (err, colaboradoras) {
        if (err) {
            res.status(500).send({ message: err.message })
        }

        res.status(200).send(colaboradoras)
    })
}

const deleteById = async (req, res) => {

    try {
        const { id } = req.params   
        await Colaboradoras.findByIdAndDelete(id)
        const message = `A colaboradora com id: ${id} foi removida do banco.`
        res.status(200).json({ message })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message})
    }

}


const login = (req, res) => {

    Colaboradoras.findOne({ email: req.body.email }, function (error, colaboradora) {

        if (error) {
            return res.status(500).send({ message: error.message })
        }

        if(!colaboradora) {
            return res.status(404).send(`Não existe a colaboradora com o email: ${req.body.email}.`)
        }

        // req.body.senha (senha sem hash)
        // colaboradora.senha (senha com hash)

        const senhaValida = bcrypt.compareSync(req.body.senha, colaboradora.senha) // faz a comparação entre senhas

        if (!senhaValida) {
            return res.status(403).send(`Senha inválida`)
        }
        
        const token = jwt.sign({ email: req.body.email }, SECRET) // geração do token
        return res.status(200).send(token)

    })
}



module.exports = {
    create,
    getAll,
    deleteById,
    login
}