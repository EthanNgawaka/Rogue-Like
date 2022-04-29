/*
A small, simple javascript library for game making, currently dosent support sound.
has drawing functions for most shapes and input handing
*/
var canvas = document.getElementById("main");
canvas.setAttribute('draggable', false);
var entirePage = document.getElementById("wholePage");
var h = canvas.height;
var w = canvas.width;
var scale = 1;
var c = canvas.getContext("2d"); //c means context
document.addEventListener('contextmenu', event => event.preventDefault());

//Mouse Stuff//
var mouse={x:0,y:0,button:{left:false, middle:false, right:false}};
canvas.addEventListener('mousemove', function(evt) {
    mouse.x = getMouseX(canvas, evt);
    mouse.y = getMouseY(canvas, evt);
}, false);
function getMouseX(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return evt.clientX - rect.left
}
function getMouseY(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return evt.clientY - rect.top
}
document.addEventListener('mousedown', function(event){
	if (event.button == 0){
        mouse.button.left = true;
    }
    if (event.button == 1){
        mouse.button.middle = true;
    }
    if (event.button == 2){
        mouse.button.right = true;
    }
});
document.addEventListener('mouseup', function(event){
	if (event.button == 0){
        mouse.button.left = false;
    }
    if (event.button == 1){
        mouse.button.middle = false;
    }
    if (event.button == 2){
        mouse.button.right = false;
    }
});
//----------//

/*
The keys system currently works by adding any key pressed into the keys object
the key is the key name and the value is a bool of if it is pressed
*/
var keys = {} // {pressed: false, held: false}

var pressedAnyKey = false;
document.addEventListener('keydown', function(event) {
		current_key = event.code;
		keys[current_key] = true;
		pressedAnyKey = true;
	}
);
document.addEventListener('keyup', function(event) {
		current_key = event.code;
		keys[current_key] = false;
	}
);


function collidePoint(point, rect){
	if(point[0] > rect[0] && point[0] < rect[0] + rect[2] && point[1] > rect[1] && point[1] < rect[1] + rect[3]){
		return true;
	}else{
		return false;
	}
}

function collideRect(rect1, rect2){
	if(rect1[0] > rect2[0] + rect2[2] || rect1[0] + rect1[2] < rect2[0] || rect1[1] > rect2[1] + rect2[3] || rect1[1] - rect1[3] < rect2[1]){
		return false;
	}else{
		return true;
	}
}

function blendCols(col1, col2, per){
	var R = col1[0] + (col2[0] - col1[0])*per;
	var G = col1[1] + (col2[1] - col1[1])*per;
	var B = col1[2] + (col2[2] - col1[2])*per;
	return [R, G, B];
}


function midPoint(point1, point2, per){
	var x = point1[0] + (point2[0] - point1[0])*per;
	var y = point1[1] + (point2[1] - point1[1])*per;
	return [x, y];
}

function drawRotatedRect(X, Y, W, H, colour, rotation){
	c.save();
	c.translate(X, Y);
	c.rotate(rotation);
	c.fillStyle = colour;
	c.beginPath();
	c.rect(-W/2,-H/2, W, H);
	c.fill();
	c.restore();
}


String.prototype.visualLength = function() // https://blog.mastykarz.nl/measuring-the-length-of-a-string-in-pixels-using-javascript/
{
    var ruler = document.getElementById('ruler');
    ruler.innerHTML = this;
    return ruler.offsetWidth;
}



function showText(text, X, Y, Size, colour = "rgb(0, 0, 0)",align='center', bold = false, stroke = false){
	c.beginPath();
	if(bold === true){
		c.font = "bold "+Size*Camera.scale+"px Arial";
	}
	else{
		c.font = Size*Camera.scale+"px Arial"
	}
	c.textAlign = align;
	if(stroke === false){
		c.fillStyle=colour;
		c.fillText(text, (X-Camera.x)*Camera.scale, (Y-Camera.y)*Camera.scale);
	}
	if(stroke === true){
		c.lineWidth = Size/25;
		c.strokeStyle = colour;
		c.strokeText(text, X, Y)
	}
}

function onScreen(X, Y, size){
	if(X+size > 0 && X-size < canvas.width && Y+size > 0 && Y-size < canvas.width){
		return true;
	} else{
		return false;
	}
}

function roundRect(x, y, width, height, radius = 5) { // stolen
	/*
	creates the path for a rectangle with rounded corners
	*/
	if (typeof radius === 'number') {
		radius = {tl: radius, tr: radius, br: radius, bl: radius};
	}
	c.moveTo(x + radius.tl, y);
	c.lineTo(x + width - radius.tr, y);
	c.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	c.lineTo(x + width, y + height - radius.br);
	c.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	c.lineTo(x + radius.bl, y + height);
	c.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	c.lineTo(x, y + radius.tl);
	c.quadraticCurveTo(x, y, x + radius.tl, y);
	c.closePath();
}
function roundedLine(startPos, endPos, width, colour){
	c.beginPath();
	c.strokeStyle = colour;
	c.lineWidth = width;
	c.moveTo(startPos[0], startPos[1]);
	c.lineTo(endPos[0], endPos[1]);
	c.stroke();

	c.beginPath();
	c.fillStyle = colour;
	c.arc(startPos[0], startPos[1], width/2, 0, Math.PI*2);
	c.fill();

	c.beginPath();
	c.arc(endPos[0], endPos[1], width/2, 0, Math.PI*2);
	c.fill();
}

function drawCorners(rect){
	c.beginPath();
	c.moveTo(rect[0]+rect[2]*0.1, rect[1]); //top left right
	c.lineTo(rect[0], rect[1]); //top left
	c.lineTo(rect[0], rect[1]+rect[3]*0.1); //top left bottom
	c.stroke();

	c.beginPath();
	c.moveTo(rect[0], rect[1]+rect[3]*0.9); //bottom left top
	c.lineTo(rect[0], rect[1]+rect[3]); // bottom left
	c.lineTo(rect[0]+rect[2]*0.1, rect[1]+rect[3]); //bottom left right
	c.stroke();

	c.beginPath();
	c.moveTo(rect[0]+rect[2]*0.9, rect[1]+rect[3]); //bottom right left
	c.lineTo(rect[0]+rect[2], rect[1]+rect[3]); //botom right
	c.lineTo(rect[0]+rect[2], rect[1]+rect[3]*0.9); //bottom right top
	c.stroke();

	c.beginPath();
	c.moveTo(rect[0]+rect[2], rect[1]+rect[3]*0.1); //top right bottom
	c.lineTo(rect[0]+rect[2], rect[1]); //top right
	c.lineTo(rect[0]+rect[2]*0.9, rect[1]); //top right left
	c.stroke();
}

function scaleNumber(n, x1, x2, z1, z2, clip = false){
	var range1 = x2-x1;
	var range2 = z2-z1;
	var ratio = (n - x1) / range1
    var result = ratio * range2 + z1
    if(clip === true){
    	return clip(result, z1, z2);
    }else{
    	return result;
    }
}

function dist(X1, Y1, X2, Y2){
	return (Math.hypot(X2-X1, Y2-Y1));
}

function dist3d(x1, y1, z1, x2, y2, z2){
	return Math.sqrt((x2-x1)**2 + (y2-y1)**2 + (z2-z1)**2);
}

function createArray(fill, size){
	var temp_array = [];
	for(var i = 0; i<size; i+=1){
		temp_array.push(fill);
	}
	return temp_array
}

function createNdArray(fill, sizes){
	var temp_array = []
	if(sizes.length === 2){
		for(var i = 0; i<sizes[0]; i+=1){
			temp_array.push(createArray(fill, sizes[0]));
		}
		return temp_array
	}else{
		for(var i = 0; i<sizes[0]; i+=1){
			temp_array.push(createNdArray(fill, sizes.slice(1, sizes.length)));
		}
	}
	return temp_array
}


function round(num, places = 0){
	return Math.round(num*(10**places))/(10**places)
}

function random(min, max, round = false){
	if(round === false){
		return Math.random()*(max-min)+min;
	}else{
		return Math.round(Math.random()*(max-min)+min);
	}
}

function clip(n, min, max){
	return Math.min(Math.max(n, min), max);
}

function roundList(list, places = 0){
	var newList = []
	for(var i = 0; i < list.length; i+=1){
		newList.push(round(list[i], places))
	}
	return newList
}

function dist2line(x, y, line){
	var x1 = line[0];
	var y1 = line[1];
	var x2 = line[2];
	var y2 = line[3];
	var vx = x1 - x;
	var vy = y1 - y;
	var ux = x2 - x1;
	var uy = y2 - y1;

	var length = ux * ux + uy * uy;
	var det = (-vx * ux) + (-vy * uy);
	if(det < 0){
    	return Math.sqrt((x1 - x)**2 + (y1 - y)**2);
	}
    if(det > length){
    	return Math.sqrt((x2 - x)**2 + (y2 - y)**2);
    }
    det = ux * vy - uy * vx
    return Math.sqrt(det**2 / length)
}

function drawGlow(X, Y, size, brightness, col=[255, 255, 255]){
	//probrobly could go in renderer but its usefull to have in other projects
	c.beginPath();
	var glow = c.createRadialGradient(X, Y, 0, X, Y, size);
	glow.addColorStop(0, "rgba("+col[0]+", "+col[1]+","+col[2]+","+brightness+")")
	glow.addColorStop(1, "rgba("+255+", "+255+","+255+", 0)")
	c.fillStyle = glow;
	c.fillRect(X-size, Y-size, size*2, size*2);
}

function guassianRandom(min, max, amount = 2){
	var total = 0
	for(var i = 0; i < amount; i += 1){
		total += random(min,max);
	}
	return total/Math.floor(amount)
}

function lerp(v0, v1, t) {
    return v0*(1-t)+v1*t
}

function shuffle(arra1) { // https://www.w3resource.com/javascript-exercises/javascript-array-exercise-17.php
    let ctr = arra1.length;
    let temp;
    let index;

    // While there are elements in the array
    while (ctr > 0) {
		// Pick a random index
        index = Math.floor(Math.random() * ctr);
		// Decrease ctr by 1
        ctr--;
		// And swap the last element with it
        temp = arra1[ctr];
        arra1[ctr] = arra1[index];
        arra1[index] = temp;
    }
    return arra1;
}

//Image Stuff//
class image{
	constructor(imageLocation){
		this.img = new Image();
		this.img.src=imageLocation;
	}	

	drawImg(X,Y,W,H, alpha){
		c.save();
		c.imageSmoothingEnabled = false;
        c.webkitImageSmoothingEnabled = false;
        c.mozImageSmoothingEnabled = false;
		c.globalAlpha = alpha;
		c.drawImage(this.img, X*scale,Y*scale, W*scale,H*scale);
		c.globalAlpha = 1;
		c.restore();
	}

	drawRotatedImg(X, Y, W, H, alpha, rotation, rotateAroundX = 0, rotateAroundY = 0){
		c.save();
		c.translate(X+W/2-Camera.x, Y+H/2-Camera.y);
		c.rotate(rotation);
		this.drawImg(-W/2,-H/2, W, H, alpha);
		c.restore();
	}
}
class spriteSheet{
    constructor(src,wofsprite,hofsprite,animationTimer,x,y,w,h){
        this.img = new Image();
        this.img.src = src;
        this.w = wofsprite;
        this.h = hofsprite;
        this.sheetW = this.img.width;
        this.sheetH = this.img.height;
        this.fps = animationTimer;
        this.sheetX = 0;
        this.sheetY = 0;
        this.x = x;
        this.y = y;
		this.flipped = 0;
        this.states = {};
        this.state = "";
        this.timer = 0;
        this.draww = w;
        this.drawh = h;
    }
    draw(alpha = 1){
        c.save();
        c.imageSmoothingEnabled = false;
        c.webkitImageSmoothingEnabled = false;
        c.mozImageSmoothingEnabled = false;
        if(this.sheetX > this.states[this.state][1]*this.w-this.w){
            this.sheetX = 0;
		}
		c.globalAlpha = alpha;

		c.drawImage(this.img,this.sheetX,this.states[this.state][0],this.w,this.h,(this.x-Camera.x)*Camera.scale,(this.y-Camera.y)*Camera.scale,this.draww*Camera.scale,this.drawh*Camera.scale);
        c.restore();
    }
    addState(statename,correspondingLine,numofframes){
        this.states[statename] = [correspondingLine*this.h-this.h,numofframes];
        this.state = statename;
    }
    frameCalc(startingframe){
        this.timer++;
        if (this.timer > this.fps){
            this.timer = 0;
            this.sheetX+=this.w;

            if(this.sheetX >= this.states[this.state][1]*this.w){
				this.sheetX = startingframe*this.w-this.w;
            }
        }
    }
}
//Ethan's Stuff//
function arrayRemove(arr, value) { //Idk I just like this
    return arr.filter(function(ele){
        return ele != value;
    });
}
function drawLine(x1,y1,x2,y2,col){ //Drawing shit I like
    c.beginPath();
    c.strokeStyle = col;
    c.moveTo((x1-Camera.x),(y1-Camera.y));
    c.lineTo((x2-Camera.x),(y2-Camera.y));
    c.stroke();
}
function drawRect(rect,col,fill=1,fillcolor=0,alpha=1){
	if(fillcolor == 0){
		fillcolor = col;
	}
	let x = rect[0];
	let y = rect[1];
	let w = rect[2];
	let h = rect[3];
    c.save();
    c.strokeStyle = col;
    c.globalAlpha = alpha;
    c.beginPath();
    c.rect((x-Camera.x)*Camera.scale,(y-Camera.y)*Camera.scale,w*Camera.scale,h*Camera.scale);
    if (fill){
        c.fillStyle = fillcolor;
        c.fill();
    }
    c.stroke();
    c.restore();
}
function drawCircle(x,y,r,col,fill,fillcolor,alpha){
    c.save();
    c.strokeStyle = col;
    c.globalAlpha = alpha;
    c.beginPath();
    c.arc(x*scale,y*scale,r*scale,0,360,false);
    if (fill){
        c.fillStyle = fillcolor;
        c.fill();
    }
    c.stroke();
    c.closePath();
    c.restore();
}
function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4){ //returns [x,y] of intersection, if there is no intersection then return false
	var den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
	if(den == 0){return false}
	var t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
	var u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
	if(t >= 0 && t <= 1 && u >= 0 && u<=1){
		x = x1 + t * (x2 - x1);
		y = y1 + t * (y2 - y1);
		return [x,y];
	}else{
		return false;
	}
}
//https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript/14853974//
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

function sign(number){ //returns -1 or 1 depending on the given numbers sign
	return Math.abs(number)/number
}
function AABBCollision(rect1, rect2){
    if (rect1[0] < rect2[0] + rect2[2] && rect1[0] + rect1[2] > rect2[0] && rect1[1] < rect2[1] + rect2[3] && rect1[1] + rect1[3] > rect2[1]){
        return true;
    }else{
        return false;
    }
        
}
var Camera = {
	x:0,
	y:0,
	scale:0.4,
	target : [0,0],
	shake: [0,0,0]
}