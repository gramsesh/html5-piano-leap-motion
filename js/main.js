var WHITE_KEY_WIDTH = 90;
var BLACK_KEY_WIDTH = 48;
var BLACK_KEY_HEIGHT = 322;
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var whiteKey = new Image();
whiteKey.src = "imgs/piano_key.PNG";
var whiteKeyPressed = new Image();
whiteKeyPressed.src = "imgs/piano_key_pressed.png";
var blackKey = new Image();
blackKey.src = "imgs/black_key.PNG";
var blackKeyPressed = new Image();
blackKeyPressed.src = "imgs/black_key_pressed.png";

// key data
var keys = new Array();
keys[0] = {x:90*0,keyType:'white',sound:'1A'};
keys[1] = {x:90*1,keyType:'white',sound:'1B'};
keys[2] = {x:90*2,keyType:'white',sound:'2C'};
keys[3] = {x:90*3,keyType:'white',sound:'2D'};
keys[4] = {x:90*4,keyType:'white',sound:'2E'};
keys[5] = {x:90*5,keyType:'white',sound:'2F'};
keys[6] = {x:90*6,keyType:'white',sound:'2G'};
keys[7] = {x:90*7,keyType:'white',sound:'2A'};
keys[8] = {x:90*8,keyType:'white',sound:'2B'};
keys[9] = {x:90*9,keyType:'white',sound:'3C'};
keys[10] = {x:90*10,keyType:'white',sound:'3D'};
keys[11] = {x:90*11,keyType:'white',sound:'3E'};
keys[12] = {x:90*12,keyType:'white',sound:'3F'};
keys[13] = {x:90*13,keyType:'white',sound:'3G'};
keys[14] = {x:90*14,keyType:'white',sound:'3A'};
keys[15] = {x:90*15,keyType:'white',sound:'3B'};
keys[16] = {x:90*16,keyType:'white',sound:'4C'};
keys[17] = {x:90*1-24,keyType:'black',sound:'1As'};
keys[18] = {x:90*3-24,keyType:'black',sound:'2Cs'};
keys[19] = {x:90*4-24,keyType:'black',sound:'2Ds'};
keys[20] = {x:90*6-24,keyType:'black',sound:'2Fs'};
keys[21] = {x:90*7-24,keyType:'black',sound:'2Gs'};
keys[22] = {x:90*8-24,keyType:'black',sound:'2As'};
keys[23] = {x:90*10-24,keyType:'black',sound:'3Cs'};
keys[24] = {x:90*11-24,keyType:'black',sound:'3Ds'};
keys[25] = {x:90*13-24,keyType:'black',sound:'3Fs'};
keys[26] = {x:90*14-24,keyType:'black',sound:'3Gs'};
keys[27] = {x:90*15-24,keyType:'black',sound:'3As'};

var channel_max = 32;										// number of channels
var audiochannels = new Array();
for (a=0;a<channel_max;a++) {									// prepare the channels
	audiochannels[a] = new Array();
	audiochannels[a]['channel'] = new Audio();						// create a new audio object
	audiochannels[a]['finished'] = -1;							// expected end time for this channel
	audiochannels[a]['keyvalue'] = '';
}

//PLAY SOUND
function play_multi_sound(s) {
	for (a=0;a <audiochannels.length; a++) {
		thistime = new Date();
		if (audiochannels[a]['finished'] < thistime.getTime()) {
			try {
				audiochannels[a]['finished'] = thistime.getTime() + document.getElementById(s).duration*1000;
				audiochannels[a]['channel'] = document.getElementById(s);
				audiochannels[a]['channel'].currentTime = 0;
				audiochannels[a]['channel'].volume=1;
				audiochannels[a]['channel'].play();
				audiochannels[a]['keyvalue'] = s;

			} catch(v) {
				console.log(v.message);
			}
			break;
		}
	}
}

function stop_multi_sound(s, sender) {
	for (a=0;a <audiochannels.length; a++) {
		if (audiochannels[a]['keyvalue'] == s) {			// is this channel finished?
			try {
				audiochannels[a]['channel'] = document.getElementById(s);
				if(sender != undefined && sender == 'mouse') {
					setTimeout ("audiochannels[a]['channel'].pause()", 2500 );
					setTimeout ("audiochannels[a]['channel'].currentTime = 0", 2500 );
				} else {
					setTimeout ("audiochannels[a]['channel'].pause()", 2500 );
					setTimeout ("audiochannels[a]['channel'].currentTime = 0", 2500 );
				}
			} catch(v) {
				console.log(v.message);
			}
			break;
		}
	}
}

function leapToCanvas(pos) {
	var h = -pos[1]+canvas.height + 100;
	h = h < 100 ? 100 : h;
	return [(pos[0]*4)+canvas.width/2, h];
}
var device_connected = false;
var controller = new Leap.Controller( { enableGestures: true } );
controller.addStep( function( frame ) {
	for ( var g = 0; g < frame.gestures.length; g++ ) {
		var gesture = frame.gestures[g];
		controller.emit( gesture.type, gesture, frame );
	}
	return frame; // Return frame data unmodified
});
controller.on( 'frame', function( frame ) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle="#FF0000";
	for(var a = 0; a < keys.length; a++) {
		var key = keys[a];
		if(key.keyType == 'white') {
			ctx.drawImage(key.pressed ? whiteKeyPressed : whiteKey, key.x, 0, WHITE_KEY_WIDTH, 456);
		} else {
			ctx.drawImage(key.pressed ? blackKeyPressed : blackKey, key.x, 0, BLACK_KEY_WIDTH, 300);
		}
	}
	var pointablesMap = frame.pointablesMap;
	for (var i in pointablesMap) {
		var pointable = pointablesMap[i];
		var pos = pointable.tipPosition;
		pos = leapToCanvas(pos);
		ctx.beginPath();
		ctx.arc(pos[0], pos[1], 20, 0, 2*Math.PI, false);
		ctx.fillStyle = 'grey';
		ctx.fill();
	}
});
controller.on( 'keyTap', function( keyTap, frame ) {
	for(var g = keys.length-1; g >= 0; g--) {
		var key = keys[g];
		var pos = leapToCanvas(keyTap.position);
		if(		(key.keyType == 'white' && (pos[0] > key.x && pos[0] < key.x+WHITE_KEY_WIDTH))
			||	(key.keyType == 'black' && (pos[0] > key.x && pos[0] < key.x+BLACK_KEY_WIDTH && pos[1] <= BLACK_KEY_HEIGHT))) {
			play_multi_sound('tone-' + key.sound);
			activeKey = g;
			key.pressed = true;
			window.setTimeout(function(){
				key.pressed = false;
			}, 100);
			return;
		}
	}
});
controller.connect();