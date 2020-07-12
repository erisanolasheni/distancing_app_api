const c = require('../models/User.js');


exports.getAllUser = (callback) => {
    c.User.find((err, result) => {
        console.log(err, result)
        callback(!result, result)
    })
}


exports.getUser = (user_id, callback) => {
    c.User.findOne({
        user_id
    }, (err, res) => {

        console.log(err, res)
        callback(!res, res)
    })
}


exports.createUser = (details, callback) => {
    // creat user
    const n = c.User.create(details).then((user) => {
        callback(false, user)
    }).catch((error) => {
        if (error.code === 11000) { //error for dupes
            callback('User already created', false);
        } else {
            callback('Error occurred');
        }
    })
};

exports.updateUser = (user_id, details, callback) => {

    // delete id if present
    if (details.user_id) {
        delete details.user_id
    }
    // get id first
    c.User.findOne({
        user_id
    }, (err, res) => {
        console.log(err)
        if (res) {
            if (details.email && details.email.toLowerCase() == res.email.toLowerCase()) {
                delete details.email
            }
            c.User.findOneAndUpdate({
                user_id
            }, details, {new: true}, (err, res) => {

                console.log(err)
                console.log(details)
                if (err) {
                    callback(err);
                } else {
                    callback(false, res);
                }
            });
        } else {
            callback('User not found')
        }
    })

}

exports.removeUser = (user_id, callback) => {
    c.User.remove(user_id, (err) => {
        if (err) callback(err)
        else {
            callback(false);
        }
    })
}