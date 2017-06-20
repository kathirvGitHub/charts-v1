const express = require('express');
const port = process.env.PORT || 3000;
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');
const axios = require('axios');
const bodyParser = require('body-parser');
const { Users } = require('./utils/users');
const { isRealString } = require('./utils/validation')

// const JDEServerURL = 'http://aisdv910.forza-solutions.com:9082' ;
const JDEServerURL = 'http://172.19.2.24:9082';

const { getJDEAvailability } = require('./JDE/jde');

const publicPath = path.join(__dirname, '../public');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', (params, callback) => {
        // console.log(params);

        if (!params) {
            return callback('Session refreshed. Please login again!');
        }

        if (!isRealString(params.user)) {
            users.removeUser(params.user);
            return callback('Empty User ID!'); 
        }

        var user = users.getUser(params.user);

        if(!user){
            return callback('User invalid/Session refreshed. Please login again!');
        }

        if (!isRealString(user.jdePassword)) {
            users.removeUser(params.user);
            return callback('Empty Password!'); 
        }

        // validate JDE login

        var jdeLoginURL = `${JDEServerURL}/jderest/tokenrequest`;
        var jdeLoginData = {
            "username": user.jdeUserID,
            "password": user.jdePassword,
            "deviceName": "nodeJSServer",
            "environment": "JDV910",
            "role": "*ALL"
        };

        axios.post(jdeLoginURL, jdeLoginData).then((response) => {
            // Logged in sucessfully
            var jdeLogoutURL = `${JDEServerURL}/jderest/tokenrequest/logout`;
            var jdeLogoutData = {
                "token": response.data.userInfo.token
            };

            axios.post(jdeLogoutURL, jdeLogoutData).then((response) => {

            });

            users.updateSocketID(params.user, socket.id);
            socket.emit('loggedIn');

        }).catch((e) => {
            console.log('Invalid User Credentials');
            users.removeUser(user.jdeUserID);
            socket.emit('invalidJDEUser');
        })       

        callback();
    });

    socket.on('getAvailabilityData', () => {
        // var itemAvailabilityData = {
        //     itemNames : ['Item Z', 'Item Y', 'Item X', 'Item W', 'Item V'],
        //     itemAvailableNos : [getRandomInt(-100, 100), getRandomInt(-100, 100), getRandomInt(-100, 100), getRandomInt(-100, 100), getRandomInt(-100, 100)]
        // };

        // socket.emit('updateAvailabilityData', itemAvailabilityData);

        // var itemAvailabilityData = {
        //     itemNames : ['Item Z', 'Item Y', 'Item X', 'Item W', 'Item V'],
        //     itemAvailableNos : [getRandomInt(-100, 100), getRandomInt(-100, 100), getRandomInt(-100, 100), getRandomInt(-100, 100), getRandomInt(-100, 100)]
        // };

        // socket.emit('updateAvailabilityData2', itemAvailabilityData);

        var user = users.getUserBySocketID(socket.id);

        if(user){
            getJDEAvailability(socket, user);
        }        

    });

    socket.on('disconnect', () => {
        users.removeUserBySocket(socket.id);
        console.log('User disconnected');
    })
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});

app.post('/chart.html', (req, res) => {
    console.log(req.body);
    // var sessionid = '12368';
    // res.sendFile(publicPath + '/chat.html');
    users.removeUser(req.body.jdeUserID);
    users.addUser(req.body.jdeUserID, req.body.jdePassword);
    res.redirect(`/chart.html?user=${req.body.jdeUserID}`);
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}