function inputfilize(element){
    const f = function(element){
        const {left,right,top,bottom} = element.getBoundingClientRect() , style = {left,width:right-left,top,height:bottom-top};
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.style.position = "absolute";
        input.style.zIndex = "999999";
        input.style.opacity = "0";
        for(const i in style){
            input.style[i] = style[i]+"px"
        };
        document.body.appendChild(input);
        return input
    };
    return new Promise((res,rej)=>{
        res(f(element))
    })
};
function showMusic(src){
    const sm = document.getElementById("showmusic") , music = document.createElement("audio") , div = document.createElement("div") , rateCtrl = document.createElement("input") , rateShow = document.createElement("span");
    while(sm.childNodes[0])sm.childNodes[0].remove();
    music.src = src;
    music.controls = "controls";
    music.style.width = "100%";
    rateCtrl.type = "range";
    rateCtrl.min = -1;
    rateCtrl.max = 1;
    rateCtrl.value = 0;
    rateCtrl.step = 0.1;
    rateCtrl.addEventListener("input", function(){
        music.playbackRate = Math.pow(10,rateCtrl.value);
        const vs = rateShow.querySelector("*[data-show]");
        vs.textContent = rateCtrl.value;
    });
    rateShow.innerHTML = `<math><msub><mn>log</mn><mn>10</mn></msub><mi>PlayRate</mi><mn>=</mn><mn data-show="show">${rateCtrl.value}</mn></math>`
    div.append(music,rateShow,rateCtrl);
    sm.appendChild(div);
    return music
};
inputfilize(document.getElementById("upload")).then(function(input){
    input.addEventListener("input",function(e){
        const fs = input.files;
        if(fs.length>0){
            showMusic(URL.createObjectURL(fs[0]))
        }
    })
});
document.getElementById("typelink").addEventListener("input",function(e){
    showMusic(this.value)
})