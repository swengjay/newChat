// sockets from the client
$(function() {
    const socket = io();
    
    //obtaining dom elements from the interface
    const $messageForm = $('#message-form');
    const $messageBox = $('#message');
    const $chat = $('#chat');

    //obtaining dom elements from the interface nicknameForm
    const $nickForm = $('#nickForm');
    const $nickname = $('#nickname');
    const $nickError = $('#nickError');

    const $users = $('#usernames');

    $nickForm.submit(e => {
        e.preventDefault();
        socket.emit('new user', $nickname.val(), (data) => {
            if(data) {
                $('#nickWrap').hide();
                $('#containerWrap').show();
            } else {
                $nickError.html(`
                    <div class="alert alert-danger">
                        That username already exists.
                    </div>
                `);
            }
            $nickname.val('');
        });
    });

    // events
    $messageForm.submit(e => {
        e.preventDefault();
        //send value from the client
        if(!$messageBox.val()) {
            
        } else {
            // if theres a message then it send it to the server
            socket.emit('send message', $messageBox.val(), data => {
                // server emits an error through the callback
                $chat.append(`<p class="error">${data}</p>`);
            });
        }
        $messageBox.val('');
    });

    $('input[name="message"]').keypress(function () {
        if ($(this).val()) {
            $("button[name='submit']").removeAttr('disabled');
        }
    });

    //listen for new message on the server
    socket.on('new message',(data) => {
        var formattedTime = moment(message.createdAt).format('h:mm a');
        $chat.append(`<b>${data.nick}</b><span class="timeColor">  ${formattedTime}</span></br><span>${data.msg}</span></br></br>`);
        scrollToBottom();
    });

    socket.on('usernames', data => {
        let html = '';
        for(let i = 0;i < data.length; i++) {
            html += `<p><i class=" fas fa-user"></i> ${data[i]}</p>`;
        }
        $users.html(html);
    });

    socket.on('whisper', data => {
        displayMessage(data);
    });

    socket.on('load msgs', msgs => {
        for(let i = 0; i < msgs.length; i++) {
            displayMessage(msgs[i]);
        }
    });

    function displayMessage(data) {
        $chat.append(`<p class="whisper"><b>${data.nick}:</b> ${data.msg}</p>`);
    }

    function scrollToBottom() {
        // selector
        var messages = $('#card-header');
        var newMessage = messages.children('li:last-child');
        // heights
        var clientHeight = messages.prop('clientHeight');
        var scrollTop = messages.prop('scrollTop');
        var scrollHeight = messages.prop('scrollHeight');
        var newMessageHeight = newMessage.innerHeight();
        var lastMessageHeight = newMessage.prev().innerHeight();

        if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
            messages.scrollTop(scrollHeight);
        }
    }

});