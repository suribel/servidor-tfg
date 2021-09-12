const Follow = require('../models/follow');


function isFollower(req, res) {
    const user_id = req.params.id;
    const follower = req.user.id;

    Follow.exists({ follower:follower, user_id:user_id }, (err, result) => {
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

function setFollower(req, res) {
    const follow = new Follow();

    const user_id = req.params.id;
    const follower = req.user.id;

    follow.follower = follower;
    follow.user_id = user_id;

    follow.save((err, result) => {
        if (err) {
            res.status(500).send({ message: "Error al guardar" });
        } else {
            if (!result) {
                res.status(404).send({ message: "Error al crear Follow" });
            } else {
                res.status(200).send({ message: result });
            }
        }
    });
}

function deleteFollower(req, res) {
    const user_id = req.params.id;
    const follower = req.user.id;

    Follow.findOneAndRemove({ follower, user_id }, (err, result) => {
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



function countFollowers(req, res) {
    const user_id = req.params.id;

    Follow.countDocuments({ user_id }, (err, result) => {
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


module.exports = {
    isFollower,
    setFollower,
    deleteFollower,
    countFollowers,
};

