const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/distance_app_users', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


exports.User = mongoose.model('User', {
    user_id: {
        type: String,
        unique: true,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    country: String,
    avatar: String
});