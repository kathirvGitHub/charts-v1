class Users {
    constructor(){
        this.users = [];
    }

    addUser(jdeUserID, jdePassword, jdeAppUserID, socketID){
        var user = {
            jdeUserID,
            jdePassword,
            jdeAppUserID,
            socketID
        };
        this.users.push(user);
        console.log('Adduser', user);
        return user;
    }

    getUser(jdeUserID){
        var usersByID = this.users.filter((user) => {
            return user.jdeAppUserID === jdeUserID;
        });
        console.log('getUser', usersByID);
        return usersByID[0];
    }

    getUserBySocketID(socketID){
        var usersBySocketID = this.users.filter((user) => {
            return user.socketID === socketID;
        });
        console.log('getUserBySocketID', usersBySocketID);
        return usersBySocketID[0];
    }

    removeUser(jdeUserID){
        var removedUser = this.getUser(jdeUserID);
        var usersOtherIDs = this.users.filter((user) => {
            return user.jdeAppUserID !== jdeUserID;
        });
        this.users = usersOtherIDs;
        console.log('removeUser', removedUser);
        return removedUser;
    }    

    removeUserBySocket(socketID){
        var usersOtherIDs = this.users.filter((user) => {
            return user.socketID !== socketID;
        });
        this.users = usersOtherIDs;
        console.log('removeUserBySocket', usersOtherIDs);
    }

    updateSocketID(jdeUserID, socketID){
        var removedUser = this.removeUser(jdeUserID);
        removedUser.socketID = socketID;
        this.addUser(removedUser.jdeUserID, removedUser.jdePassword, removedUser.jdeAppUserID, removedUser.socketID);
        console.log('updateSocketID', removedUser);
    }

}

module.exports = {Users};