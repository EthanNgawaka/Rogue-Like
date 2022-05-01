const bgalpha = 1;

let gList = [];
let player = new Player();
let cameraIntensity = 2;

let lvlObjs = [];


lvlObjs.push(['gDeposit',900,1700,100,100,100,0])// type, x, y, w, h, amountOfGStored, iFrames

walls.push([200,1000,600,32,'platform',[[200,1000],[1400,1000],[1400,1600]],0, 0.02, 1, 1, [0,0]])// path, currentNode, speed, loop?, dirOfItr, oldPos

walls.push([300,800,60,900,'belt'])

function gBurst(amount,x,y){
    for(let i = 0; i < amount; i++){
        gList.push([x,y,random(-1,1)*10,random(-1,1)*25])
    }
}



function cameraUpdate(){
    Camera.x = lerp(Camera.x,Camera.target[0],0.4) + Camera.shake[0];
    Camera.y = lerp(Camera.y,Camera.target[1],0.4) + Camera.shake[1];
    Camera.target = [player.pos[0]-w/2/Camera.scale,player.pos[1]-h/2/Camera.scale];

    if(Camera.shake[2]>0){
        Camera.shake[2]--;
        Camera.shake[0] = lerp(Camera.shake[0],random(-cameraIntensity,cameraIntensity),0.5);
        Camera.shake[1] = lerp(Camera.shake[1],random(-cameraIntensity,cameraIntensity),0.5);
    }

    if(keys['KeyP']){Camera.scale+=0.01}
    if(keys['KeyO']){Camera.scale-=0.01}


}
let gW = 20;
function draw(){
    drawRect([Camera.x,Camera.y,w/Camera.scale,h/Camera.scale],'white');
    player.draw();
    for(let wall of walls){
        switch(wall[4]){
            case 'platform':
                drawRect([wall[0],wall[1],wall[2],wall[3]],'black');
                break;
            case 'wall':
                drawRect([wall[0],wall[1],wall[2],wall[3]],'black');
                break;
            case 'belt':
                drawRect([wall[0],wall[1],wall[2],wall[3]],'blue');
                break;
            case 'spike':
                drawRect([wall[0],wall[1],wall[2],wall[3]],'red');
        }
        if(wall[5]!=undefined){ // 5 path, 6 currentNode, 7 speed, 8 loop?, 9 dirOfItr, 10 lastPos
            wall[10] = [wall[0]-lerp(wall[0],wall[5][wall[6]][0],wall[7]),wall[1]-lerp(wall[1],wall[5][wall[6]][1],wall[7])];
            wall[0] = lerp(wall[0],wall[5][wall[6]][0],wall[7]);
            wall[1] = lerp(wall[1],wall[5][wall[6]][1],wall[7]);
            if(dist(wall[0],wall[1],wall[5][wall[6]][0],wall[5][wall[6]][1])<=15){
                if(wall[6]<wall[5].length-1){
                    if(wall[8]){
                        wall[6]+=wall[9]
                    }else{wall[6]++}

                }else{
                    if(wall[8]){wall[9]*=-1;wall[6]+=wall[9]}else{wall[6]=0}

                }
            }
            if(wall[6]<0){wall[6]=0;wall[9]=1;}
        }
    }
    for(let i of gList){
        let theta = Math.atan2(i[1]-player.pos[1],i[0]-player.pos[0]);
        i[2] -= Math.cos(theta)*Math.sqrt((i[0]-player.pos[0])**2 + (i[1]-player.pos[1])**2)/450
        i[3] -= Math.sin(theta)*Math.sqrt((i[0]-player.pos[0])**2 + (i[1]-player.pos[1])**2)/450 -0.4
        
        drawRect([i[0],i[1],gW,gW],'black',1,'yellow');
        i[0]+=i[2];
        for(let j of walls){
            if(AABBCollision([i[0],i[1],gW,gW],j)){
                i[0] -= i[2];
                i[2] *= -0.5;
            }
        }
        i[1]+=i[3];
        for(let j of walls){
            if(AABBCollision([i[0],i[1],gW,gW],j)){
                i[1] -= i[3];
                i[3] *= -0.5;
            }
        }
        for(let j of gList){
            if(i[0]!=j[0]&&i[1]!=j[1]){
                let theta = Math.atan2(i[1]-j[1],i[0]-j[0]);
                if(Math.sqrt((i[0]-j[0])**2 + (i[1]-j[1])**2)<=80){
                    i[2] += (0.1*Math.cos(theta))/Math.sqrt((i[0]-j[0])**2 + (i[1]-j[1])**2)**2;
                    i[3] += (0.1*Math.sin(theta))/Math.sqrt((i[0]-j[0])**2 + (i[1]-j[1])**2)**2;
                }
            }
        }
        if(AABBCollision([i[0],i[1],gW,gW],player.rect)){
            gList = arrayRemove(gList,i);
            player.g++;
        }
    }
    for(let i of lvlObjs){ // type, x, y, w, h, amountOfGStored, iFrames
        switch(i[0]){
            case 'gDeposit':
                drawRect([i[1],i[2],i[3],i[4]],'black',1,'yellow');
                if(i[6]<=0&&player.atkTimer>0&&AABBCollision(player.atkHB,[i[1],i[2],i[3],i[4]])){
                    i[5]-=10;
                    i[6] = 20;
                    gBurst(10,i[1]+i[3]/2,i[2]);
                    if(i[5]<=0){
                        lvlObjs = arrayRemove(lvlObjs,i);
                    }
                    if(player.heldItem[0]=='sword'){
                        player.vel[1] = - 10
                        if(player.pos[0]+player.w/2>=i[1]+i[3]/2){player.vel[0]=5}else{player.vel[0]=-5}
                    }
                    Camera.shake[2] = 10;
                    cameraIntensity = 15;
                    
                }
                if(i[6]>0){
                    i[6]--
                    if(player.heldItem[0]=='sword'){if(player.pos[0]+player.w/2>=i[1]+i[3]/2){player.vel[0]+=2}else{player.vel[0]-=2}}
                }
                break;
        }
    }
    dB.draw();
}

function update(){
    player.update(lvlObjs);
    dB.update();
}

function main(){
    update();
    draw();
    cameraUpdate();



}

setInterval(main,1000/60);