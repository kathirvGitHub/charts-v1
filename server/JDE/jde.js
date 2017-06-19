const axios = require('axios');
const socketIO = require('socket.io');

getJDEAvailability = (socket, user) => {

    var itemAvailabilityData = {
        itemNames: [],
        itemAvailableNos: []
    }

    var jdeLoginURL = 'http://aisdv910.forza-solutions.com:9082/jderest/tokenrequest';
    var jdeLoginData = {
        "username": user.jdeUserID,
        "password": user.jdePassword,
        "deviceName": "nodeJSServer",
        "environment": "JDV910",
        "role": "*ALL"
    };

    var jdeLogoutURL = 'http://aisdv910.forza-solutions.com:9082/jderest/tokenrequest/logout';
    var jdeFormServiceURL = 'http://aisdv910.forza-solutions.com:9082/jderest/formservice';

    var token = null;

    axios.post(jdeLoginURL, jdeLoginData).then((response) => {
        console.log("Token :", response.data.userInfo.token);
        token = response.data.userInfo.token;
        var jdeFormServiceData = {
            "token": response.data.userInfo.token,
            "role": "*ALL",
            "environment": "JDV910",
            "deviceName": "nodeJSServer",
            "formName": "P55K0005_W55K0005B"
        };
        return axios.post(jdeFormServiceURL, jdeFormServiceData);
    }).then((response) => {
        // populate the availability array appropriately.
        // console.log("start to populated the array");

        response.data.fs_P55K0005_W55K0005B.data.gridData.rowset.forEach((gridLine) => {
            // console.log(gridLine.s2ndItemNumber_22.value, gridLine.mnQuantityAvailable_23.internalValue);
            itemAvailabilityData.itemNames.push(gridLine.s2ndItemNumber_22.value);
            itemAvailabilityData.itemAvailableNos.push(gridLine.mnQuantityAvailable_23.internalValue);

            // console.log('Inside the for each', itemAvailabilityData);

        });
        // console.log('Going to emit the data', itemAvailabilityData);
        //Finally emit socket with the data
        socket.emit('updateAvailabilityData', itemAvailabilityData);

        // Then release the token which just got created
        var jdeLogoutData = {
            "token": token
        };

        axios.post(jdeLogoutURL, jdeLogoutData).then((response) => {

        });
    }).catch((e) => {        
    });    
}

module.exports = { getJDEAvailability };