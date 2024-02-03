class Random{
    constructor(seed = Date.now()){
        this.seed = this.originalSeed = seed % 999_999_999;
    }
    next(){
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280
    }
};
function drawRandomTree(canvas, random){
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    ctx.translate(canvas.width / 2, canvas.height);
    ctx.scale(1, -1);
    const PI = Math.PI;
    function drawBranch(P, thickness, length, direction, type){
        if(thickness < 17 && (type === 1 && PI/2 - direction < -0.3 || type === 2 && PI/2 - direction > 0.3)){
            return
        };
        if(thickness < 8 && random.next() < 0.1){
            return
        };
        if(thickness < 3.5){
            ctx.beginPath();
            ctx.arc(P[0], P[1], 7, 0, 2*PI);
            ctx.fillStyle = random.next() < 0.2 ? "red" : "white";
            ctx.fill();
            return
        };
        const Q = [P[0] + Math.cos(direction) * length, P[1] + Math.sin(direction) * length];
        ctx.beginPath();
        ctx.moveTo(P[0], P[1]);
        ctx.lineTo(Q[0], Q[1]);
        ctx.strokeStyle = "#444";
        ctx.lineCap = "round";
        ctx.lineWidth = thickness;
        ctx.stroke();
        const newThick = thickness * (0.75 + 0.1 * random.next()),
            newLen = length * 0.85;
        const types = type === 0 ? [1, 2] : [type, type];
        drawBranch(Q, newThick, newLen, direction - PI/4*random.next(), types[0]); // 向右
        drawBranch(Q, newThick, newLen, direction + PI/4*random.next(), types[1]); // 向左
    };
    drawBranch([0, 0], 20, 100, PI / 2, 0)
};
const doms = {
    tC: document.getElementById("treeCanvas"),
    rs: document.getElementById("randomSeed"),
    rg: document.getElementById("regenerate")
}
const random = new Random( Math.round(Math.random()*1e10) );
drawRandomTree(doms.tC, random);
doms.rs.innerText = random.originalSeed;
doms.rg.addEventListener("click", function(){
    const val = +doms.rs.innerText;
    if(isNaN(val) || val < 0){
        alert("Please enter a valid seed")
    }else{
        drawRandomTree(doms.tC, new Random(val));
    }
})