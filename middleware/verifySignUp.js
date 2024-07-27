
const { exec } = require("child_process");
// const { user, ROLES } = require("../models");
const db = require("../model")
const ROLES = db.ROLES
const User = db.user;

const checkDuplicateUsernameOrEmail = (req, res, next) => {
    User.findOne({
        fullName: req.body.fullName
    })
        .then(user => {
            if (user) {
                res.status(400).send({
                    message: "Failed! Username is already in use!"
                });
            } else {
                User.findOne({
                    email: req.body.email
                })
                    .then(emailUser => {
                        if (emailUser) {
                            res.status(400).send({
                                message: "Failed! Email is already in use!"
                            });
                        } else {
                            // Neither username nor email is in use, proceed to next middleware
                            next();
                        }
                    })
                    .catch(err => {
                        res.status(500).send({
                            message: err.message || "Some error occurred while checking email."
                        });
                    });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while checking username."
            });
        });
};

const checkRolesExisted = (req, res, next) => {
    const roles = req.body.roles || []; // Ensure roles array exists

    if (!roles.every(role => ROLES.includes(role))) {
        return res.status(400).send({ message: `Failed! One or more roles do not exist` });
    }

    next()
}
const verifySignUp = {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted
};
module.exports = verifySignUp;