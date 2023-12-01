function random(min,max){
    return Math.floor(Math.random()*(max-min)+min)
};
const domData = (()=>{
    const getStyles=function(selector){
        const dom = document.querySelector(selector),sty = getComputedStyle(dom);
        const width = parseFloat(sty.width), height = parseFloat(sty.height), top = parseFloat(sty.top), left = parseFloat(sty.left);
        return {dom, width, height, top, left, clientHeight:dom.clientHeight, clientWidth:dom.clientWidth, clientTop:dom.clientTop, clientLeft:dom.clientLeft}
    };
    return {
        getStyles,
        game:getStyles(".game"),
        sky:getStyles(".game .sky"),
        land:getStyles(".game .land"),
        bird:getStyles(".game .bird"),
        board:getStyles(".game .board")
    } //目前认为这些数值初始化后不再改变
})();
class Rectangle{
    constructor(width,height,left,top,vx,vy,dom){
        this.initialParams = {width,height,left,top,vx,vy,dom};
        [this.width,this.height,this.left,this.top,this.vx,this.vy,this.dom]=[width,height,left,top,vx,vy,dom];
        this.render()
    }
    reset(){
        const {width,height,left,top,vx,vy,dom} = this.initialParams;
        [this.width,this.height,this.left,this.top,this.vx,this.vy,this.dom]=[width,height,left,top,vx,vy,dom];
        this.render()
    }
    render(){
        const dom = this.dom;
        dom.style.width = this.width + "px";
        dom.style.height = this.height + "px";
        dom.style.left = this.left + "px";
        dom.style.top = this.top + "px";
    }
    move(duration){
        const sx = this.vx * duration, sy = this.vy * duration;
        const newLeft = this.left + sx, newTop = this.top + sy;
        [this.left, this.top] = [newLeft, newTop];
        this.render();
        if(this.onMove) this.onMove();
    }
    get positionRange(){
        return [this.top,this.top+this.height,this.left,this.left+this.width]
    }
};
class Sky extends Rectangle {
    constructor(){
        const {dom,width,height} = domData.sky;
        super(width,height,0,0,-50,0,dom);
        [this.skyWidth, this.skyHeight] = [width,height];
    }
    onMove(){
        this.left %= (this.skyWidth/2)
    }
};
class Land extends Rectangle {
    constructor(){
        const {dom,width,height,top} = domData.land;
        super(width,height,0,top,-100,0,dom);
        [this.landWidth, this.landHeight] = [width,height];
    }
    onMove(){
        this.left %= (this.landWidth/2)
    }
};
class Bird extends Rectangle {
    constructor(){
        const {dom,width,height,left,top} = domData.bird;
        super(width,height,left,top,0,0,dom);
        this.g = 1500; // 加速度单位: px/s^2
        this.ymax = domData.game.clientHeight - domData.land.clientHeight - height;
        this.swingStatus = 0;
        this.swingTimer = null
    }
    move(duration){
        super.move(duration);
        this.vy += duration*this.g
    }
    onMove(){
        if(this.top < 0){
            this.top = 0;
            this.vy = 0
        }else if(this.top > this.ymax){
            this.top = this.ymax;
            this.vy = 0
        }
    }
    jump(){
        this.vy = -450
    }
    render(){
        super.render();
        this.dom.className = `bird swing${this.swingStatus}`
    }
    startSwing(){
        if(this.swingTimer)return;
        this.swingTimer = setInterval(()=>{
            this.swingStatus++;
            this.swingStatus %= 3
        },300);
        this.render()
    }
    stopSwing(){
        clearInterval(this.swingTimer);
        this.swingTimer = null
    }
};
class Pipe extends Rectangle {
    constructor(height, top, speed, dom){
        super(50,height,domData.game.clientWidth,top,speed,0,dom)
    }
    omMove(){
        if(this.left+this.width<0){
            this.dom.remove()
        }
    }
};
class PipePare{
    spaceHeight = 150;
    minHeight = 80;
    maxHeight = domData.land.top - this.minHeight - this.spaceHeight;
    constructor(speed){
        const upHeight = random(this.minHeight,this.maxHeight),
            downHeight = domData.land.top - upHeight - this.spaceHeight,
            downTop = domData.land.top - downHeight,
            upDom = document.createElement("div"),
            downDom = document.createElement("div");
        domData.game.dom.append(upDom,downDom);
        upDom.className = "pipe up";
        downDom.className = "pipe down";
        this.upPipe = new Pipe(upHeight,0,speed,upDom);
        this.downPipe = new Pipe(downHeight,downTop,speed,downDom);
    }
    move(duration){
        this.upPipe.move(duration);
        this.downPipe.move(duration)
    }
    reset(){
        this.upPipe.reset();
        this.downPipe.reset();
    }
    removeDom(){
        this.upPipe.dom.remove();
        this.downPipe.dom.remove();
    }
    get useLess(){
        return this.upPipe.left + this.upPipe.width < 0
    }
    get safeRange(){
        return [this.upPipe.height,this.downPipe.top,this.upPipe.left,this.upPipe.left+this.upPipe.width]
    }
};
class PPProducer{
    pairs=[];
    timer=null;
    tick=3000;
    constructor(speed){this.speed = speed}
    startProduce(){
        if(this.timer) return;
        this.timer = setInterval(function(){
            this.pairs.push(new PipePare(this.speed));
            for (let i = 0; i < this.pairs.length; i++) {
                const pair = this.pairs[i];
                if(pair.useLess){
                    pair.removeDom();
                    this.pairs.splice(i,1);
                    i--
                }
            }
        }.bind(this),this.tick);
    }
    stopProduce(){
        clearInterval(this.timer);
        this.timer = null
    }
    reset(){
        for(const p of this){
            p.removeDom()
        };
        this.pairs = [];
    }
    *[Symbol.iterator](){
        for(const p of this.pairs){
            yield p
        }
    }
};
class Game{
    #frameFunc = null;
    #events = null;
    collisionAllowed = 20;
    constructor(sky,land,bird,ppp){
        const [{dom},board] = [domData.game, domData.board.dom];
        [this.sky,this.land,this.bird,this.ppp,this.dom,this.board] = [sky,land,bird,ppp,dom,board];
    }
    startBackground(){
        this.ppp.startProduce();
        this.bird.startSwing();
        if(this.#frameFunc)return this;
        this.#frameFunc = function(){
            if(this.isGameOver){
                this.stopBackground();
                this.showBoard(".over")
            };
            if(!this.#frameFunc) return;
            const nowdate = new Date(), delta = (nowdate - this.#frameFunc.time) / 1000;
            this.#frameFunc.time = nowdate;
            this.sky.move(delta);
            this.land.move(delta);
            this.bird.move(delta);
            for(const pair of this.ppp)pair.move(delta);
            requestAnimationFrame(this.#frameFunc)
        }.bind(this);
        this.#frameFunc.time = new Date();
        requestAnimationFrame(this.#frameFunc);
        return this
    }
    get isBgEnabled(){
        return !!this.#frameFunc
    }
    stopBackground(){
        this.ppp.stopProduce();
        this.bird.stopSwing();
        this.#frameFunc = null;
        return this
    }
    bindEvents(){
        if(this.#events)return this;
        const jump = function(){
            if(!this.isBgEnabled)return;
            this.bird.jump()
        }.bind(this), pause = function(e){
            e.preventDefault();
            if(this.isBgEnabled){
                this.stopBackground()
            }else{
                this.startBackground()
            }
        }.bind(this), restart = function(e){
            this.restart();
            this.hideBoard(".over")
        }.bind(this);
        this.#events = {jump,pause,restart};
        this.dom.addEventListener("click",jump);
        document.addEventListener("keydown",function(e){
            if(e.code === "Space") pause(e)
        });
        document.querySelector("button.restart").addEventListener("click",restart);
        return this
    }
    restart(){
        this.sky.reset();
        this.bird.reset();
        this.land.reset();
        this.ppp.reset();
        this.startBackground()
    }
    showBoard(c){
        const board = this.board, e = board.querySelector(c);
        e.style.display = "block";
        return this
    }
    hideBoard(c){
        const board = this.board, e = board.querySelector(c);
        e.style.display = "none";
        return this
    }
    get isGameOver(){
        const [bur,bdr,blr,brr] = this.bird.positionRange , m = this.collisionAllowed;
        for(const pair of this.ppp){
            const [pur,pdr,plr,prr] = pair.safeRange;
            if(brr>plr+m && blr<prr-m && ( bur<pur-m || bdr>pdr+m )){
                return true
            }
        };
        return false
    }
};
const game = new Game(new Sky(), new Land(), new Bird(), new PPProducer(-100));
game.startBackground().bindEvents();