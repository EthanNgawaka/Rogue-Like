class DialogueBox{
    constructor(rect,listOfTexts){
        this.rect = rect;
        this.texts = listOfTexts;
        this.currentText = '';
        this.textItr = 0;
        this.numberOfInteractions = 0;
        this.displayText = [];
        this.textTimer = 0;
        this.bubble;
        this.tempBubbleTimer = 0;
        this.x = 0;
        this.y = 0;
        this.tmr = 0;


    }
    draw(){
        drawRect(this.rect,'red',0);
        if(AABBCollision(this.rect,player.rect)){
            drawRect(this.rect,'blue',1,'blue',0.5);
        }
        if(this.textTimer>0){
            drawRect(this.bubble,'black',1,'white');
            for(let i of this.displayText){
                showText(i[0],i[1],i[2],70);
            }
        }


    }
    update(){
       if(AABBCollision(this.rect,player.rect)&&player.interact&&this.textTimer<=0){
            player.frozen = 1;
            this.currentText = this.texts;
            this.textTimer = this.currentText.length;
            this.bubble = [this.rect[0]-this.rect[2]*1.5,this.rect[1]-this.rect[3]*2.5,this.rect[2]*4,this.rect[3]*2]
            this.x = -40;
            this.y = -70;
       }
        if(this.textTimer>1){   
            this.tmr++;
            if(this.tmr>=5){
                this.tmr = 0;
                this.displayText.push([this.currentText[this.currentText.length-this.textTimer],this.bubble[0]-this.x,this.bubble[1]-this.y])
                this.textTimer--;
                this.x -= 35;
                if(this.x <= -this.bubble[2]){
                    this.x=-40;
                    this.y-=60;
                }
            }
            if(this.textTimer<=this.currentText.length*0.95&&player.interact){
                while (this.textTimer>1){
                    this.displayText.push([this.currentText[this.currentText.length-this.textTimer],this.bubble[0]-this.x,this.bubble[1]-this.y])
                    this.textTimer--;
                    this.x -= 35;
                    if(this.x <= -this.bubble[2]){
                        this.x=-40;
                        this.y-=60;
                    }
                    this.tmr = 0;
                }

            }
            
        }else{
            if(this.displayText.length != this.currentText.length){
                    this.displayText.push([this.currentText[this.currentText.length-1],this.bubble[0]-this.x,this.bubble[1]-this.y])
            }
            if(player.interact){
                this.textTimer = 0;
                player.frozen = 0;
                this.displayText = [];
                this.bubble = [0,0,0,0];
            }
        }
    }
}

let dB = new DialogueBox([500,1600,200,200],'This is the text that should appear.');
