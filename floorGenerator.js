let directionalWeights = {left:0.15,right:0.35,up:0.5}
let walls = [];

function generateWallsList(availableSidesId,x,y,w,h,thickness){ // returns a list of walls surrounding a given pos according to the available sides
    let output = [];

    if(availableSidesId[0]){ // entry to the left
        output.push([x,y,thickness,h*0.66,'wall']);
    }else{
        output.push([x,y,thickness,h,'wall']);
    }
    if(availableSidesId[1]){ // entry to the right
        output.push([x+w-thickness,y,thickness,h*0.66,'wall']);
    }else{
        output.push([x+w-thickness,y,thickness,h,'wall']);
    }
    if(availableSidesId[2]){ // entry above
        output.push([x,y,w*0.3,thickness,'wall']);
        output.push([x+w*0.7,y,w*0.3,thickness,'wall']);
    }else{
        output.push([x,y,w,thickness,'wall']);
    }
    if(availableSidesId[3]){ // entry below
        output.push([x,y+h-thickness,w*0.3,thickness,'wall']);
        output.push([x+w*0.3,y+h-thickness,w*0.4,thickness/2,'platform']);
        output.push([x+w*0.7,y+h-thickness,w*0.3,thickness,'wall']);
    }else{
        output.push([x,y+h-thickness,w,thickness,'wall']);
    }
    // left wall [x,y,thickness,h] // left door [x,y,thickness,h*0.66]
    // right wall [x+w-thickness,y,thickness,h] // right door [x+w-thickness,y,thickness,h*0.66]
    // top wall [x,y,w,thickness] // top door [x,y,w*0.4,thickness], [x+w*0.4,y,w*0.2,thickness/2,'platform'], [x+w*0.6,y,w*0.4,thickness]
    // bottom wall [x,y+h-thickness,w,thickness] // bottom door [x,y,w*0.4,thickness], [x+w*0.4,y+h-thickness,w*0.2,thickness/2,'platform'], [x+w*0.6,y+h-thickness,w*0.4,thickness]
    return output;
}

let map = [];
function addSubrooms(rooms){// loop through rooms and add subrooms
    let subrooms = [];
    let availableSides = calcAvailableSides(rooms);
    let Temprooms = rooms.slice();
    for(let i of Temprooms){
        if(i[3]!='start'&&i[3]!='end'){
            if(availableSides[i[2]][0] == 0 && random(0,1,1)){ // nothing to the left
                subrooms.push([i[0]-1,i[1],rooms.length+subrooms.length,i[2]]);
            }
            else if(availableSides[i[2]][1] == 0 && random(0,1,1)){ // nothing to the right
                subrooms.push([i[0]+1,i[1],rooms.length+subrooms.length,i[2]]);
            }
            else if(availableSides[i[2]][2] == 0 && random(0,1,1)){ // nothing above
                subrooms.push([i[0],i[1]-1,rooms.length+subrooms.length,i[2]]);
            }
            else if(availableSides[i[2]][3] == 0 && random(0,1,1)){ // nothing below
                subrooms.push([i[0],i[1]+1,rooms.length+subrooms.length,i[2]]);
            }
        }
    }
    //
    
    for(let i of subrooms){
        Temprooms.push(i);
    }
    return Temprooms;
}
function calcAvailableSides(rooms){
    let availableSides = [];
    for(let i of rooms){
        let output = [0,0,0,0]; //L R U D
        for(let j of rooms){
            if(i[0]-1 == j[0]&&i[1]==j[1]){ //left
                output[0] = 1;
            }
            if(i[0]+1 == j[0]&&i[1]==j[1]){ //right
                output[1] = 1;
            }
            if(i[0] == j[0]&&i[1]-1==j[1]){ //up
                output[2] = 1;
            }
            if(i[0] == j[0]&&i[1]+1==j[1]){ //down
                output[3] = 1;
            }
        }
        availableSides.push(output.slice());
    }
    return availableSides;
}

function generateFloor(x,y,roomSize,mainPathLength,subroomPasses){
    let rooms = [];
    let currentRoom = [0,0,0,'parent'];
    for(let i = 0; i < mainPathLength; i++){
        if(i==0){
            rooms.push([0,0,0,'start']);
        }else if(i==mainPathLength-1){
            rooms.push([currentRoom[0],currentRoom[1],currentRoom[2],'end'])
        }else{
            rooms.push(currentRoom.slice());
        }
        currentRoom[2]++;
        let loop = true;
        while(loop){
            loop = false;
            let rand = Math.random();
            if(rand<=directionalWeights.left){//left
                for(let j of rooms){
                    if(j[0]==currentRoom[0]-1){
                        loop = true;
                    }
                }
                if(!loop){currentRoom[0]-=1;}
            }else if(rand<=directionalWeights.left+directionalWeights.right){//right
                for(let j of rooms){
                    if(j[0]==currentRoom[0]+1){
                        loop = true;
                    }
                }
                if(!loop){currentRoom[0]+=1;}
            }else{//up
                for(let j of rooms){
                    if(j[1]==currentRoom[1]-1){
                        loop = true;
                    }
                }
                if(!loop){currentRoom[1]-=1;}
            }
        }
    }
    
    for(let i = 0; i < subroomPasses; i++){
        rooms = addSubrooms(rooms);
    }
        
    let itr = 0;
    for(let i of calcAvailableSides(rooms)){
        rooms[itr][4]=i;
        itr++;
    }
    
    let temp = [];
    for(let i of rooms){
        temp.push(generateWallsList(i[4],i[0]*roomSize+x,i[1]*roomSize+y,roomSize,roomSize,64));

    }

    let roomCheck = {
        shop:0,
        chest:0,
    }
    
    for(let i of rooms){
        if(i[3]=='start'){
            i[5] = 'entrance';
        }else if(i[3]=='end'){
            i[5] = 'exit';
        }else{
            if(random(0,1,true)){
                i[5] = 'platforming';
            }else{
                i[5] = 'combat';
            }
        }
    }

    let randomList = [];

    for(let i of rooms){
        if(i[5]!='entrance'&&i[5]!='exit'){
            randomList.push(i);
        }
    }

    rooms[randomList[random(0,randomList.length-1,1)][2]][5] = 'shop';

    randomList = [];
    for(let i of rooms){
        if(i[5]!='entrance'&&i[5]!='exit'&&i[5]!='shop'){
            randomList.push(i);
        }
    }
    rooms[randomList[random(0,randomList.length-1,1)][2]][5] = 'chest';



    console.log(rooms)
    map = rooms.slice();
    rooms = [];

    for(let i of temp){
        for(let j of i){
            rooms.push(j.slice());
        }
    }


    walls = rooms.slice();
}


generateFloor(0,0,2400,6,2);