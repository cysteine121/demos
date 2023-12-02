const doms = {
    audio:document.getElementById("audio"),
    ul:document.querySelector(".lrc-list"),
    container:document.querySelector(".container")
};
/**
 * 解析歌词串
 * @param {string} lrc 歌词字符串
 * @return {{time:number,lyric:string}[]}
 */
function parseLRC(lrc){
    return lrc.split("\n").map(v=>{
        let time = 0, lyric = "", isTime = true, stack = "";
        for(const i in v){
            if(i === "0") continue;
            const x = v[i];
            if(isTime){
                if(x === "]"){
                    time += +stack;
                    isTime = false
                }else if(x === ":"){
                    time += (+stack)*60;
                    stack = ""
                }else{
                    stack += x
                }
            }else{
               lyric += x 
            }
        };
        const li = document.createElement("li");
        li.innerText = lyric;
        doms.ul.appendChild(li);
        return {time,lyric,li}
    })
};
const lrcData = parseLRC(lrc);
/**
 * 找到当前播放位置对应的歌词下标；如无，返回-1
 * @returns {number} 歌词下标
 */
function findLyricIndex(){
    const time = doms.audio.currentTime;
    let lo = 0, hi = lrcData.length-1;
    while(lo<=hi){
        const mid = Math.floor((lo+hi) / 2);
        const x = lrcData[mid].time;
        if(time<x){
            hi = mid-1
        }else if(time>x){
            lo = mid+1
        }else{
            return mid
        }
    };
    return hi
};
/**
 * 设置当前对应歌词li的偏移量
 */
const setOffset = (()=>{
    let lastLi = null;
    return function(){
        const index = findLyricIndex(), lrc = lrcData[index], li = lrc.li;
        if(lastLi === li) return;
        const ulT = doms.ul.getBoundingClientRect().top, liT = li.getBoundingClientRect().top, trans = ulT - liT + doms.container.clientHeight/2;
        li.classList.add("active");
        doms.ul.style.transform = `translateY(${trans}px)`;
        if(lastLi) lastLi.classList.remove("active");
        lastLi = li
    }
})();
doms.audio.addEventListener("timeupdate",setOffset);