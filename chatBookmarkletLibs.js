var testEcho = function(input){
	alert('echo'+input);
};

var addChat = function(){
	if(document.getElementById('chatBookMarklet_Id')){
		alert('Chat already exist!');
		return;
	}
	var htmlToAdd = "";
	htmlToAdd+="<div id='chatBookMarklet_Id' style='font-family: Arial;position:fixed;background-color:red;bottom:0px;right:10px;width:320px;border-left:1px solid #000000;border-right:1px solid #000000;'>";
	htmlToAdd+="   <div id='chatBookMarklet_HeaderId' style='width:100%;background-color: #462343;display: inline-block;padding:5px;box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;color:#ffffff;'>";
	htmlToAdd+="      <span id='connectionIndicator' style='display: inline-block;margin-left:5px;margin-top:5px;width: 15px;height: 15px;background-color : orange;' title='connecting...'></span>";
	htmlToAdd+="      Titre_ti <span id='collapseButon' style='position: absolute;top: 0px;right: 5px;width: 15px;font-size:20px;'>-</span>";
	htmlToAdd+="   </div>";
	htmlToAdd+="   <div id='chatBookMarklet_toCollapseId' >";
	htmlToAdd+="   </div>";
	htmlToAdd+="</div>";
	
	document.body.innerHTML += htmlToAdd;	
};

var LiteEvent = (function () {
    function LiteEvent() {
        this.handlers = [];
    }
    LiteEvent.prototype.subscribe = function (handler) {
        this.handlers.push(handler);
    };
    LiteEvent.prototype.unsubscribe = function (handler) {
        this.handlers = this.handlers.filter(function (h) { return h !== handler; });
    };
    LiteEvent.prototype.raise = function (data) {
        if (this.handlers) {
            this.handlers.slice(0).forEach(function (h) { return h(data); });
        }
    };
    return LiteEvent;
})();

var FastFlickerClient = (function () {
    function FastFlickerClient(url, subject) {
        this.onReadyEvent = new LiteEvent();
        this.onMessageEvent = new LiteEvent();
        this.onErrorEvent = new LiteEvent();
        this.url = url;
        this.subject = subject;
    }
    FastFlickerClient.prototype.open = function () {
        var _this = this;
        try  {
            this.websocket = new WebSocket(this.url);
            this.websocket.onopen = function (evt) {
                _this.onOpen(evt);
            };
            this.websocket.onclose = function (evt) {
                _this.onClose(evt);
            };
            this.websocket.onmessage = function (evt) {
                _this.onMessageReceived(evt);
            };
            this.websocket.onerror = function (evt) {
                _this.onErrorReceived(evt);
            };
        } catch (error) {
            this.onErrorEvent.raise(error.toString());
        }
    };

    FastFlickerClient.prototype.onOpen = function (evt) {
        console.debug('connection open for channel ' + this.subject);
        this.websocket.send(this.subject);
        this.onReadyEvent.raise();
    };

    FastFlickerClient.prototype.onClose = function (evt) {
        console.debug('onClose for ' + this.subject);
    };

    FastFlickerClient.prototype.onMessageReceived = function (evt) {
        try  {
            var message = evt.data;
            if (message == this.subject) {
                return;
            }
            this.onMessageEvent.raise(message);
        } catch (error) {
            this.onErrorEvent.raise(evt);
        }
    };

    FastFlickerClient.prototype.onErrorReceived = function (evt) {
        if (evt.hasOwnProperty('target') && evt.target.hasOwnProperty('readyState') && evt.target.readyState == 3) {
            evt.message = "The connection is closed or couldn't be opened.";
        }
        this.onErrorEvent.raise(evt.message);
    };

    FastFlickerClient.prototype.close = function () {
        try  {
            this.websocket.close();
        } catch (error) {
            this.onErrorEvent.raise(error);
        }
    };

    FastFlickerClient.prototype.send = function (message) {
        try  {
            if (this.websocket != null) {
                this.websocket.send(message);
            }
        } catch (error) {
            this.onErrorEvent.raise(error);
        }
    };

    FastFlickerClient.prototype.onReady = function () {
        return this.onReadyEvent;
    };

    FastFlickerClient.prototype.onMessage = function () {
        return this.onMessageEvent;
    };

    FastFlickerClient.prototype.onError = function () {
        return this.onErrorEvent;
    };
    return FastFlickerClient;
})();