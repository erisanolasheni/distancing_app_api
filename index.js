require('custom-env').env()

const express = require('express');

const multer = require('multer')

const app = express();

app.use(express.static('uploads'))

const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.mimetype.split('/')[1])
    }
})

const upload = multer({
    storage: storage
})

const {
    body,
    validationResult
} = require('express-validator');


// Use express as JSON
app.use(express.json({
    extended: true
}))

const PORT = 9000

const users_controller = require('./controllers/users');


// app.get('/', (req, res) => {
//     users_controller.getAllUser((err, result) => {
//         res.send(result);
//     });
// });


app.get('/:id', (req, res) => {
    // Find details with ID

    const {
        id
    } = req.params;

    users_controller.getUser(id, (err, result) => {
        if (err) res.status(400).send({
            status: 'error',
            details: 'User not found.'
        });
        else {
            res.send({
                status: 'success',
                details: result
            });
        }
    })
});

app.post('/upload/:user_id', [upload.single('avatar')], (req, res) => {
    const {
        user_id
    } = req.params

    const file = req.file

    if (!file) {
        res.status(400).send({
            status: 'error',
            details: 'Please upload a picture'
        });
    } else {
        users_controller.getUser(user_id, (err, result) => {
            if (err) res.status(400).send({
                status: 'error',
                details: 'User not found'
            });
            else {
                users_controller.updateUser(user_id, {
                    avatar: file.filename
                }, (err, result) => {
                    if (err) {
                        res.status(500).send({
                            status: 'error',
                            details: 'Error occurred during upload'
                        });
                    } else {
                        // update user avatars
                        if (result.avatar) {
                            fs.unlinkSync(`./uploads/${result.avatar}`);
                        }
                        res.send({
                            status: 'success',
                            details: 'Upload success'
                        });
                    }
                })
            }
        })
    }
})

app.post('/', [body('fullname').custom(value => /[a-z]+\s+?[a-z]+?/i.test(value))
    .withMessage('Please provide a valid fullname'), body('user_id').isAlphanumeric(), body('email').isEmail(), body('country').isAlphanumeric()
], (req, res) => {
    const details = req.body

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            status: 'error',
            details: errors.array()
        });
    }

    users_controller.createUser(details, (err, result) => {
        console.log(err, result, 'err');

        if (err) res.status(400).send({
            status: 'error',
            details: err
        });

        else {
            res.send({
                status: 'success',
                details: result
            });
        }
    })
})

app.put('/:id', [body('fullname').custom(value => !/\s/.test(value))
    .withMessage('No spaces are allowed in the fullname'), body('user_id').isAlphanumeric(), body('email').isEmail(), body('country').isAlphanumeric()
], (req, res) => {
    // put user details
    const {
        id
    } = req.params;
    const details = req.body

    users_controller.updateUser(
        id, details, (err, result) => {

            if (err) res.status(400).send({
                status: 'error',
                details: err
            });
            else {
                res.send({
                    status: 'success',
                    details: result
                });
            }
        })
})

app.delete('/:id', (req, res) => {
    // delete user details
    const {
        id
    } = req.params

    users_controller.removeUser({
        id
    }, (err) => {
        if (err) return res.status(400).send({
            status: 'error',
            details: 'User not removed'
        })

        else {
            res.send({
                status: 'success',
                details: 'User removed'
            });
        }
    })
});

app.listen(PORT, () => {
    console.log(`Server started on  http://localhost:${PORT}`);
});