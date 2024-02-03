class MusicPlayer{
    /**
     * 解析歌词串
     * @param {string} lrc 歌词字符串
     * @return {{time:number,lyric:string}[]}
     */
    static parseLRC(lrc){
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
            //doms.ul.appendChild(li);
            return {time,lyric,li}
        })
    }
    constructor(audioEle){
        this.ae = audioEle
    }
    /**
     * 找到当前播放位置对应的歌词下标；如无，返回-1
     * @returns {number} 歌词下标
     */
    findLyricIndex(){
        const time = this.ae.currentTime, lrcData = this.lrc;
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
    }
    addLRC(lrc){
        this.lrc = this.constructor.parseLRC(lrc);
        return this
    }
    applyLRC(ul, container){
        for(const {li} of this.lrc){
            ul.appendChild(li)
        };
        const mp = this;
        /**
         * 设置当前对应歌词li的偏移量
         */
        const setOffset = (()=>{
            let lastLi = null;
            return function(){
                const index = mp.findLyricIndex(), lrc = mp.lrc[index], li = lrc.li;
                if(lastLi === li) return;
                const ulT = doms.ul.getBoundingClientRect().top, liT = li.getBoundingClientRect().top, trans = ulT - liT + doms.container.clientHeight/2;
                li.classList.add("active");
                doms.ul.style.transform = `translateY(${trans}px)`;
                if(lastLi) lastLi.classList.remove("active");
                lastLi = li
            }
        })();
        this.ae.addEventListener("timeupdate", setOffset);
        return this
    }
    /**
     * 
     * @param {function} dealer traps the analysis of audio. AudioContext is passed to it, and the musicPlayer instance is set as this. 
     */
    trap(dealer){
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        dealer.call(this, audioContext);
        this.ae.addEventListener("play", function(){
            if(audioContext.state === "suspended"){
                audioContext.resume()
            }
        })
        return this
    }
};


const doms = {
    audio:document.getElementById("audio"),
    ul:document.querySelector(".lrc-list"),
    container:document.querySelector(".container")
};
const player = new MusicPlayer(doms.audio)
    .addLRC(lrc)
    .applyLRC(doms.ul, doms.container);
player.trap(function(context){
    const track = context.createMediaElementSource(this.ae);
    const gainNode = context.createGain();
    const stereoPannerNode = context.createStereoPanner();
    track.connect(gainNode).connect(stereoPannerNode).connect(context.destination);
    document.getElementById("input_volume").addEventListener("input", function(){
        gainNode.gain.value = this.value
    });
    document.getElementById("input_stereo").addEventListener("input", function(){
        stereoPannerNode.pan.value = this.value
    });
})