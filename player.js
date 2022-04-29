
class Player{
    constructor(){
        this.pos = [100,0];
        this.vel = [0,0];
        this.w = 150;
        this.h = 340;
        this.drawW = this.w;
        this.drawH = this.h;
        this.xOff = 0;
        this.yOff = 0;
        this.grav = 0.46;
        this.frozen = 0;
        this.controls = {
            left:"ArrowLeft",
            right:"ArrowRight",
            up:"ArrowUp",
            down:"ArrowDown",            
            jump:"KeyZ",
            atk:"KeyX",
            interact:"ArrowUp",
            dash:"KeyC"
        }
        this.speed = 2.4;
        this.grounded = 0;
        this.jump = -14;
        this.jumpPressed = 0;
        this.jumpTimer =0;
        this.jumpBuffer = 10;
        this.coyoteTime = 10;
        this.canRoll = 1;
        this.drag = 0.8;
        this.onBelt = 0;
        this.wallJump = 0;
        this.heldItem = ['sword',10,0,0.2]; // type, damage, atkSpeed (decreases atkSpeed by 0-100% and decreases cooldown by 0-100%), critChance (0-100%)
        this.atkButtonDown = 0;
        this.atkTimer = 0;
        this.rect = [0,0,0,0]
        this.atkPresets = {
            'sword':[5,9],
            'bow':[0,0],
            'hammer':[20,10],

        }
        this.lifetime = 0;
        this.cooldown = 0;
        this.atkHB = [0,0,0,0];
        this.timerMax = 0;
        this.fuel = 100;
        this.sprite = new spriteSheet('Untitled.png',150,340,10,this.pos[0],this.pos[1],this.w,this.h);
        this.sprite.addState('right',1,5);
        this.sprite.addState('jump',2,5);
        this.sprite.addState('stationary',3,5);
        this.sprite.addState('roll',4,5);
        this.sprite.addState('left',5,5);
        this.sprite.addState('walljumpLeft',6,5);
        this.sprite.addState('walljumpRight',7,5);

        this.rollTimer = 0;
        this.rollPressed = 0;
        this.g = 0;
        this.dir = [0,0];
    }
    attackHandling(){
        if(keys[this.controls.atk]&&!this.atkButtonDown&&this.atkTimer<=0&&this.cooldown<=0&&!this.wallJump&&this.rollTimer<=0){
            if(this.heldItem[0]!='bow'&&this.heldItem[0]!='book'){
                this.atkTimer = this.atkPresets[this.heldItem[0]][0] - this.atkPresets[this.heldItem[0]][0]*this.heldItem[2];
            }else{
                this.atkTimer = 60;
                this.timerMax = 60;
                this.lifetime = 0;

            }
        }
        if(keys[this.controls.atk]){this.atkButtonDown=1;}else{this.atkButtonDown=0;}

        if(keys[this.controls.left]){this.dir[0] = -1}
        if(keys[this.controls.right]){this.dir[0] = 1}
        if(keys[this.controls.up]){this.dir[1] = -1}
        if(keys[this.controls.down]){this.dir[1] = 1}
        


        this.speed = 2;
        if(this.atkTimer>0){
            switch(this.heldItem[0]){
                case 'book':
                    if(keys[this.controls.atk]&&this.fuel>0){
                        if(this.dir[0]==-1){
                            this.atkHB = [this.pos[0]-this.w*4,this.pos[1]-40,this.w*4,this.h+80];
                        }else{
                            this.atkHB = [this.pos[0]+this.w,this.pos[1]-40,this.w*4,this.h+80];
                        }
                        this.vel[1] = -this.grav+1;
                        this.vel[0] = this.dir[0]*(-5 + random(-4,7));
                        this.fuel-=1.5;
                    }else{
                        this.atkTimer = 0;
                    }
                    break;
                case 'sword':
                    Camera.shake[2] = 3;
                    cameraIntensity = 5;
                    if(this.dir[0]==-1){
                        this.atkHB = [this.pos[0]-230,this.pos[1]+this.h/2-40,230,100];
                    }else{
                        this.atkHB = [this.pos[0]+this.w,this.pos[1]+this.h/2-40,230,100];
                    }
                    if(this.grounded<=0){this.vel[1] = -this.grav + random(-2,2)};
                    this.atkTimer--;
                    if(this.atkTimer <= 0){
                        this.cooldown = this.atkPresets[this.heldItem[0]][1] - this.atkPresets[this.heldItem[0]][1]*this.heldItem[2];
                    }
                    break;
                case 'hammer':
                    Camera.shake[2] = 5;
                    cameraIntensity = 10;
                    if(this.dir[0]==-1){
                        this.atkHB = [this.pos[0]-200,this.pos[1],200,this.h];
                    }else{
                        this.atkHB = [this.pos[0]+this.w,this.pos[1],200,this.h];
                    }
                    if(this.atkTimer>=10){
                        this.vel[1] = - 15;
                        this.vel[0] = this.dir[0] * 20;
                        this.drawW = this.w*0.7;
                        this.drawH = this.h*1.3;
                    }else{
                        this.vel[1] = 30;
                        this.vel[0] = this.dir[0] * 5;
                    }
                    this.atkTimer--;
                    if(this.atkTimer <= 0){
                        this.cooldown = this.atkPresets[this.heldItem[0]][1] - this.atkPresets[this.heldItem[0]][1]*this.heldItem[2];
                    }
                    break;
                case 'bow':
                    if(keys[this.controls.atk]&&this.atkTimer==this.timerMax){
                        this.atkTimer+=50
                        this.atkHB = [this.pos[0],this.pos[1]+this.h/2,this.w,30];
                        this.arrowDir =this.dir[0];
                        this.speed = 0;
                        if(this.atkTimer>=200){
                            this.atkTimer = 200;
                        }
                        this.timerMax = this.atkTimer;
                    }else{
                        this.atkHB[0] += this.arrowDir * (this.atkTimer/4);
                        this.atkTimer--;
                        this.lifetime++;
                        if(this.lifetime>=80){
                            this.atkTimer = 0;
                        }
                    }
            }




            
        }        
        if(this.cooldown>0){
            this.cooldown--;
        }
        if(this.fuel <= 100&&this.atkTimer<=0){
            this.fuel++;
        }

        
    }
    input(){
        if(keys[this.controls.interact]&&!this.interactKeyPressed){
            this.interact = 1;
        }else{
            this.interact = 0;
        }
        if(keys[this.controls.interact]){this.interactKeyPressed=1;}else{this.interactKeyPressed=0;}
        if(!this.frozen){
            if(keys[this.controls.left]){this.vel[0]-=this.speed;}
            if(keys[this.controls.right]){this.vel[0]+=this.speed;}
            if(keys[this.controls.jump]&&!this.jumpPressed){
                this.jumptimer = this.jumpBuffer;
            }
            if(keys[this.controls.dash]&&!this.rollPressed&&this.rollTimer<=0&&this.canRoll){
                this.rollTimer = 40;
                this.canRoll = 0;
    
            }
            if(this.rollTimer>0&&!this.wallJump){
                this.rollTimer--;
                this.vel[0] = this.dir[0] * 20;
                if(this.rollTimer==39){
                    this.vel[1] = -40;
                }
            }
            if(this.jumptimer>0){
                this.jumptimer --;
                if(this.grounded > 0 || this.wallJump){
                    this.drawH = this.h*1.45;
                    this.drawW = this.w*0.55;
                    this.vel[1]=this.jump;
                    this.grounded = 0;
                    this.jumptimer = 0;
                    if(this.wallJump){
                        this.vel[0]*=-2
                        this.vel[1] = -15;
                    }
                }
            }
        }
        
        if(this.vel[1]<0&&!this.onBelt&&!keys[this.controls.jump]){this.vel[1]*=0.7}
        if(this.vel[1]>0){this.grav = 0.8}else{this.grav=0.56}
        if(keys[this.controls.jump]){this.jumpPressed = 1;}else{this.jumpPressed = 0;}
        if(keys[this.controls.dash]){this.rollPressed = 1;}else{this.rollPressed = 0;}
    }
    draw(){
        this.drawW = lerp(this.drawW,this.w*1.7,0.3);
        this.drawH = lerp(this.drawH,this.h,0.3);

        if(this.wallJump){
            if(sign(this.vel[0])==-1){
                this.sprite.state = 'walljumpLeft';
            }else{
                this.sprite.state = 'walljumpRight';
            }
        }else if(this.rollTimer>0){
            this.sprite.state = 'roll';
        }else if(this.grounded<=0){
            this.sprite.state = 'jump';
        }else if(keys[this.controls.right]){
            this.sprite.state = 'right';
        }else if(keys[this.controls.left]){
            this.sprite.state = 'left';
        }
        else{
            this.sprite.state = 'stationary';
        }

        this.sprite.frameCalc(1);

        this.sprite.draww = this.drawW;
        this.sprite.drawh = this.drawH;
        this.xoff = (this.w-this.drawW)/2;
        this.yoff = this.h - this.drawH;
        this.sprite.x = this.pos[0]+this.xoff;
        this.sprite.y = this.pos[1]+this.yoff;
        this.sprite.draw();
        drawRect([this.pos[0]+this.xoff,this.pos[1]+this.yoff,this.drawW,this.drawH],'red',0,0,1);
        //drawRect(this.pos[0],this.pos[1],this.w,this.h,'blue',0,0,1);
        if(this.atkTimer>0){drawRect([this.atkHB[0],this.atkHB[1],this.atkHB[2],this.atkHB[3]],'blue',0);}
        if(this.heldItem[0]=='book'){
            drawRect([this.pos[0],this.pos[1]-40,this.w*(this.fuel/100),15],'black',1,'green');
        }

        showText('G: '+this.g,this.pos[0],this.pos[1]-50,50)


        let mapSize = 30;
        for(let i of map){
            drawRect([(i[0]*mapSize+Camera.x)+100/Camera.scale,(i[1]*mapSize+Camera.y)+100/Camera.scale,mapSize,mapSize],'black',0);
            switch(i[5]){
                case 'entrance':
                    drawRect([(i[0]*mapSize+Camera.x)+100/Camera.scale,(i[1]*mapSize+Camera.y)+100/Camera.scale,mapSize,mapSize],'green',1,'green');
                    break;
                case 'exit':
                    drawRect([(i[0]*mapSize+Camera.x)+100/Camera.scale,(i[1]*mapSize+Camera.y)+100/Camera.scale,mapSize,mapSize],'green',1,'green');
                    break;
                case 'platforming':
                    drawRect([(i[0]*mapSize+Camera.x)+100/Camera.scale,(i[1]*mapSize+Camera.y)+100/Camera.scale,mapSize,mapSize],'blue',1,'blue');
                    break;
                case 'combat':
                    drawRect([(i[0]*mapSize+Camera.x)+100/Camera.scale,(i[1]*mapSize+Camera.y)+100/Camera.scale,mapSize,mapSize],'red',1,'red');
                    break;
                case 'shop':
                    drawRect([(i[0]*mapSize+Camera.x)+100/Camera.scale,(i[1]*mapSize+Camera.y)+100/Camera.scale,mapSize,mapSize],'yellow',1,'yellow');
                    break;
                case 'chest':
                    drawRect([(i[0]*mapSize+Camera.x)+100/Camera.scale,(i[1]*mapSize+Camera.y)+100/Camera.scale,mapSize,mapSize],'brown',1,'brown');
            }

        }
        //drawRect([(100/Camera.scale+this.rect[0]/mapSize/2+Camera.x-this.w/mapSize/2),(100/Camera.scale+this.rect[1]/mapSize/2+Camera.y-this.h/mapSize/2),this.rect[2]/mapSize,this.rect[3]/mapSize],'black')
        


    }
    physics(){
        if(Math.abs(this.vel[1])>30){
            this.vel[1] = (Math.abs(this.vel[1])/this.vel[1]) * 30;
            
        }
        if(this.vel[1]>29){
            this.drawW = lerp(this.drawW,this.w*0.4,0.3);
            this.drawH = lerp(this.drawH,this.h*1.6,0.3);
        }
        this.vel[1]+=this.grav;
        this.vel[0]*=this.drag;

        if(this.onBelt > 0){this.onBelt--}else{this.onBelt=0}
        this.wallJump = 0;
        this.pos[0]+=this.vel[0];
        this.rect = [this.pos[0],this.pos[1],this.w,this.h];
        for(let wall of walls){
            if(AABBCollision([wall[0],wall[1],wall[2],wall[3],this.pos[0]],this.rect)){
                this.wallJump = 1;
                this.rollTimer = 0;
                this.canRoll = 1;
                switch(wall[4]){
                    case 'wall':
                        if(this.vel[1]>0){
                            this.vel[1] = lerp(this.vel[1],1,0.2);
                        }
                        if(this.pos[0]<=wall[0] && this.pos[0]+this.w>=wall[0]){
                            this.pos[0] = wall[0] - this.w;
                            this.vel[0] = 0;
                            if(this.grounded<=0){
                                if(this.pos[1]+this.h>=wall[1]){
                                    this.vel[0]=10;
                                }else{
                                    this.vel[0]=0;
                                }
                            }
                        }
                        if(this.pos[0]<=wall[0]+wall[2] && this.pos[0]+this.w>=wall[0]+wall[2]){
                            this.pos[0] = wall[0] + wall[2];
                            this.vel[0] = 0;
                            if(this.grounded<=0){
                                if(this.pos[1]+this.h>=wall[1]){
                                    this.vel[0]=-10;
                                }else{
                                    this.vel[0]=0;
                                }
                            }
        
                        }
                        break;
                    case 'belt':
                        this.onBelt = 20;
                        if(this.vel[1]>2){this.vel[1]-=5}else{this.vel[1]-=1}
                        if(this.pos[0]<=wall[0] && this.pos[0]+this.w>=wall[0]){
                            this.pos[0] = wall[0] - this.w;
                            if(this.grounded<=0){
                                if(this.pos[1]+this.h>=wall[1]){
                                    this.vel[0]=10;
                                }else{
                                    this.vel[0]=0;
                                }
                            }
                        }
                        if(this.pos[0]<=wall[0]+wall[2] && this.pos[0]+this.w>=wall[0]+wall[2]){
                            this.pos[0] = wall[0] + wall[2];
                            if(this.pos[1]+this.h>=wall[1]){
                                this.vel[0]=-10;
                            }else{
                                this.vel[0]=0;
                            }
                        }
                        break;
                    case 'spike':
                        //take dmg
                        
                }
            }
        }

        this.pos[1]+=this.vel[1];
        this.rect = [this.pos[0],this.pos[1],this.w,this.h];
        for(let wall of walls){
            if(AABBCollision([wall[0],wall[1],wall[2],wall[3]],this.rect)){
                this.canRoll = 1;
                switch(wall[4]){
                    case 'platform':
                        if(this.pos[1]<=wall[1] && this.pos[1]+this.h>=wall[1]){
                            this.pos[1] = wall[1] - this.h;
                            if(!this.grounded){
                                this.drawW = this.w*1.45;
                                this.drawH = this.h*0.55;
                                if(Math.abs(this.vel[1])>=10){
                                    Camera.shake[2] = 10;
                                    cameraIntensity = Math.abs(this.vel[1])/4;
                                }
                            }
                            this.vel[1] = 0;

                            this.grounded = this.coyoteTime;
                        }
                        if(this.pos[1]<=wall[1]+wall[3] && this.pos[1]+this.h>=wall[1]+wall[3]){
                            this.pos[1] = wall[1] + wall[3];
                            this.vel[1] = 0;
                        }
                        break;
                    case 'wall':
                        if(this.pos[1]<=wall[1] && this.pos[1]+this.h>=wall[1]){
                            this.pos[1] = wall[1] - this.h;
                            if(!this.grounded){
                                this.drawW = this.w*1.45;
                                this.drawH = this.h*0.55;
                                if(Math.abs(this.vel[1])>=10){
                                    Camera.shake[2] = 10;
                                    cameraIntensity = Math.abs(this.vel[1])/4;
                                }
                            }
                            this.vel[1] = 0;

                            this.grounded = this.coyoteTime;
                        }
                        if(this.pos[1]<=wall[1]+wall[3] && this.pos[1]+this.h>=wall[1]+wall[3]){
                            this.pos[1] = wall[1] + wall[3];
                            this.vel[1] = 0;
                        }
                        break;
                    case 'belt':
                        if(this.pos[1]<=wall[1] && this.pos[1]+this.h>=wall[1]){
                            this.pos[1] = wall[1] - this.h;
                            if(!this.grounded){
                                this.drawW = this.w*1.45;
                                this.drawH = this.h*0.55;
                                if(Math.abs(this.vel[1])>=10){
                                    Camera.shake[2] = 10;
                                    cameraIntensity = Math.abs(this.vel[1])/4;
                                }

                            }
                            this.vel[1] = 0;

                            this.grounded = this.coyoteTime;
                        }
                        if(this.pos[1]<=wall[1]+wall[3] && this.pos[1]+this.h>=wall[1]+wall[3]){
                            this.pos[1] = wall[1] + wall[3];
                            this.vel[1] = 0;
                        }
                        break;
                    case 'spike':
                        //take dmg
                        
                }
            }
        }
        if(this.grounded>0){
            this.grounded--;
        }


    }
    update(objs){
        this.input();
        this.attackHandling();
        this.physics();
        this.rect = [this.pos[0],this.pos[1],this.w,this.h];

    }
}
