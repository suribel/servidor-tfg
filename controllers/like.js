const Like = require('../models/like');


function getLike(req, res) {
    const publication_id = req.params.id;
    const user_id = req.user.id;

    Like.exists({ publication_id:publication_id, user_id:user_id }, (err, result) => {
        if (err) {
            res.status(500).send({ message: "Error del servidor." });
        } else {
            if (!result) {
                res.status(404).send({ message: "false" });
            } else {
                res.status(200).send({ message: result });
            }
        }
    });
}



function setLike(req, res) {
    const like = new Like();

    const publication_id = req.params.id;
    const user_id = req.user.id;

    like.publication_id = publication_id;
    like.user_id = user_id;

    like.save((err, result) => {
        if (err) {
            res.status(500).send({ message: "Error al guardar" });
        } else {
            if (!result) {
                res.status(404).send({ message: "Error al crear like" });
            } else {
                res.status(200).send({ message: result });
            }
        }
    });
}



function deleteLike(req, res) {
    const publication_id = req.params.id;
    const user_id = req.user.id;

    Like.findOneAndRemove({ publication_id, user_id }, (err, result) => {
        if (err) {
            res.status(500).send({ message: "Error del servidor." });
        } else {
            if (!result) {
                res.status(404).send({ message: "false" });
            } else {
                res.status(200).send({ message: "true" });
            }
        }
    });
}


module.exports = {
    getLike,
    setLike,
    deleteLike
};

