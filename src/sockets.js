const Chat = require('./models/Chat');

// sockets from the server
module.exports = (io) => {
    let users = {};

    //client connected to the web server
    io.on('connection', async socket => {
        console.log('new user connected');
        //look for msgs in db (historial) ALL THIS HAPPENS BEFORE THE USER ENTERS TO THE CHAT
        let messages = await Chat.find({}).sort({created_at: -1}).limit(8);
        //send to the client all the msgs stored in the db
        socket.emit('load msgs', messages);

        socket.on('new user', (data, cb) => {
            if (data in users) {
                cb(false);
            } else {
                cb(true);
                socket.nickname = data;
                // every user that log in, is going to have all the info of the socket(id,username)
                users[socket.nickname] = socket;
                //send usernames to the client
                updateNicknames()
            }
        });

        // listen from the client the event "send message"
        socket.on('send message', async (data, cb) => {
            // /w joe asjdnska
            var msg = data.trim();
            if(msg.substr(0, 3) === '/w ') {
                msg = msg.substr(3);
                const index = msg.indexOf(' ');
                if(index != -1) {
                    var name = msg.substr(0, index);
                    var msg = msg.substr(index + 1);
                    if(name in users) {
                        // send private message to  the nickname received from the socket
                        users[name].emit('whisper', {
                            msg,
                            nick: socket.nickname
                        });
                    } else {
                        // send an error through the callback in method "send message"
                        cb('Error! Please enter a valid user.');
                    }
                } else {
                    cb('Error! Please enter your message!');
                }
            } else {
                //save messages in db
                var newMsg = new Chat({
                    msg,
                    nick: socket.nickname
                });
                await newMsg.save();

                //not a private message
                //server send the data to all the sockets connected
                io.sockets.emit('new message', {
                    msg: data,
                    nick: socket.nickname
                });
            }
        });

        socket.on('disconnect', data => {
            if(!socket.nickname) return;
            delete users[socket.nickname];
            updateNicknames()
        });

        function updateNicknames() {
            io.sockets.emit('usernames', Object.keys(users));
        }
    });
}