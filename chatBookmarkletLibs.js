var testEcho = function(input){
	alert('echo'+input);
};

var addChat = function(){
	if(document.getElementById('chatBookMarklet_Id')){
		alert('Chat already exist!');
		return;
	}
	var htmlToAdd = "";
	htmlToAdd+="<style>.chat-bubble{position:relative;display:inline-block;width:80%;min-height:25px;padding:5px;background:#fff;-webkit-border-radius:10px;-moz-border-radius:10px;border-radius:10px;margin-top:10px;font-size:14px;color:#000}bubble-header{width:100%;display:inline-block;font-size:17px}.chat-bubble,.sent{margin-right:10px;margin-left:10px}.chat-bubble:after{content:'';position:absolute;border-style:solid;border-color:transparent #fff;display:block;width:0;z-index:1;top:17px}.chat-bubble,.sent:after{border-width:5px 5px 5px 0;left:-5px}.chat-bubble,.received:after{border-width:5px 0 5px 5px;right:-5px}</style>";
	
	htmlToAdd+="<div id='chatBookMarklet_Id' style='font-family: Arial;position:fixed;bottom:0px;right:10px;width:320px;border-left:1px solid #000000;border-right:1px solid #000000;'>";
	htmlToAdd+="   <div id='chatBookMarklet_HeaderId' style='width:100%;background-color: #462343;display: inline-block;padding:5px;box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;color:#ffffff;'>";
	htmlToAdd+="      <span id='connectionIndicator' style='display: inline-block;margin-left:5px;margin-top:5px;width: 15px;height: 15px;background-color : orange;' title='connecting...'></span>";
	htmlToAdd+="      Titre_ti <span id='collapseButon' style='position: absolute;top: 0px;right: 5px;width: 15px;font-size:20px;'>-</span>";
	htmlToAdd+="   </div>";
	htmlToAdd+="   <div id='chatBookMarklet_toCollapseId' >";
	htmlToAdd+="      <div id='chatBookMarklet_bodyId' style='width:90%;background-color:#efefef;padding: 1% 5%;display: inline-block;'>";
	htmlToAdd+="         <div class='chat-bubble'> Welcome in Chatons!";
	htmlToAdd+="         </div>";
	htmlToAdd+="      </div>";
	htmlToAdd+="      <div id='chatBookMarklet_footerId' style='width:100%;padding:10px 5%;box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;'>";
	htmlToAdd+="         <form action='' onsubmit='return false' autocomplete='off' >";
	htmlToAdd+="            <input id='toSend' type='' style='width:80%;' />";
	htmlToAdd+="            <button onClick='doSend()' value='notUsed' style='background-color: #462343;-moz-border-radius:6px;-webkit-border-radius:6px;border-radius:6px;border:1px solid #7f3b7c;display:inline-block;cursor:pointer;color:#ffffff;font-family:arial;font-size:12px;padding:5px 8px;text-decoration:none;'>Send</button>";	
	htmlToAdd+="         </form>";	
	htmlToAdd+="      </div>";
	htmlToAdd+="   </div>";
	htmlToAdd+="</div>";	
	document.body.innerHTML += htmlToAdd;
	
	var onSuccess = function(url){
		var subject = location.hostname;
		console.log("Chat ready, fastFlicker url ="+url+" subject="+subject);

		fastFlicker = new FastFlickerClient(url, subject);
		fastFlicker.onMessage().subscribe(function (message) {
			addBubble(message,"received");
		});
		fastFlicker.onError().subscribe(function (a) {
			console.log('currentComponent.header = "Error, see console logs"');
			changeIndicator('red', 'errors');
		});
		fastFlicker.onReady().subscribe(function () {
			console.log("fastFlicker ready");
			changeIndicator('green', 'connected');
		});

		fastFlicker.open();
	};
	
	var onError = function(url){
		console.log('error');
	};
	
	getFastFlickerUrl(onSuccess, onError);
	
	var btn = document.getElementById("collapseButon");
	btn.onclick = function(){
		var section = document.getElementById("chatBookMarklet_toCollapseId");
		if(section.style.display === 'none'){
			section.style.display = '';
		}
		else{
			section.style.display = 'none';
		}
	}	
};

var getFastFlickerUrl = function(onSuccess, onError) {
	var url = "http://www.olivettom.com/hb/index.php?get=FastFlicker";	
	var xhr = createCORSRequest('GET', url);
	if (!xhr) {
		alert('CORS not supported');
		return;
	}
	xhr.onload = function() {
		var text = xhr.responseText.trim();
		console.debug('Response from CORS request to ' + url + ': ' + text);
		onSuccess("ws://"+text+"/");
	};

	xhr.onerror = function() {
		onError();
	};
	xhr.send();
};

function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    xhr = null;
  }
  return xhr;
}

var doSend = function() {
	var toSendInput = document.getElementById("toSend");
    var message = toSendInput.value;
    if(message != "") {
		addBubble(message,"sent");
        this.fastFlicker.send(message);
		toSendInput.value = '';
    }
};
var addBubble = function(message, classToSet) {
	var bodyElement = document.getElementById("chatBookMarklet_bodyId");
    var newdiv = document.createElement('div');
	newdiv.setAttribute('class', 'chat-bubble '+classToSet);
	newdiv.innerHTML = message;
	bodyElement.appendChild(newdiv);
};

var changeIndicator = function(newColor,newTooltip){
	var indicator = document.getElementById("connectionIndicator");
	indicator.style.backgroundColor = newColor;
	indicator.title = newTooltip;
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