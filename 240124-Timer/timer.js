class Timer{
    #title;
    #inputHandler;
    #interval;
    titleInput = document.createElement("input");
    constructor(title = "anonoymous"){
        this.begin = +new Date();
        this.paused = false;
        this.pauseDuration = 0;
        this.lastSecondResult = 0;
        this.eventFuncs = new Set();
        this.#interval = window.setInterval(function(){
            const s_result = Math.floor(this.query()/1000);
            if(s_result === this.lastSecondResult) return;
            this.lastSecondResult = s_result;
            for(const f of this.eventFuncs){
                this.execUpdateFunc(f)
            };
        }.bind(this), 100);
        const input = this.titleInput, timer = this;
        input.value = title;
        input.disabled = true;
        const ipFc = this.#inputHandler = function(){
            timer.#title = this.value
        };
        input.addEventListener("input", ipFc);
        this.#title = title
    }
    set title(title){
        this.#title = title;
        this.titleInput.value = title
    }
    get title(){
        return this.#title
    }
    /**
     * 查询计时器的时间
     * @returns {number} 时间
     */
    query(){
        const current = this.paused ? this.pauseTime : +new Date();
        return current - this.begin - this.pauseDuration
    }
    /**
     * 将计时器或倒计时的查询时间转为时/分/秒/毫秒的对象形式
     * @returns {Object} 分割的时间
     */
    splitQuery(){
        const _ms = this.query(), ms = _ms%1000, _s = (_ms-ms)/1000, s = _s%60, _m = (_s-s)/60, m = _m%60, h = (_m-m)/60;
        return {_ms, ms, _s, s, _m, m, h}
    }
    pause(){
        if(this.paused){
            return
        };
        this.paused = true;
        this.pauseTime = +new Date()
    }
    resume(){
        if(!this.paused){
            return
        };
        this.paused = false;
        const current = +new Date();
        this.pauseDuration += current - this.pauseTime;
        this.pauseTime = undefined
    }
    /**
     * 添加秒数更新后的回调
     * @param {function} f 回调将传入两个参数, 一个是剩余时间(秒), 另一个是函数cancel, 调用后将添加的回调移除.
     */
    onUpdate(f){
        this.eventFuncs.add(f);
        this.execUpdateFunc(f)
    }
    execUpdateFunc(f){
        f.call( this, Math.round(this.query()/1000), ()=>{this.eventFuncs.delete(f)} )
    }
    /**
     * 将清除本计时器所注册的事件、创建的元素和计时函数. 在需要删除本计时器时应当调用, 以防占用内存.
     */
    remove(){
        this.titleInput.removeEventListener("input", this.#inputHandler);
        this.titleInput.remove();
        window.clearInterval(this.#interval)
    }
};
class CountDown extends Timer{
    /**
     * 新建倒计时实例, 以计时器为基础, 继承计时器的方法和属性.
     * @param {number} countDownTime 倒计时时间(以毫秒计)
     */
    constructor(countDownTime){
        super();
        this.countDownTime = countDownTime
    }
    /**
     * 查询倒计时剩余时间. 重写了Timer的query方法.
     * @returns {number} 剩余时间. 如果已经结束, 将得到负数时间.
     */
    query(){
        const leftTime = this.countDownTime - super.query();
        return leftTime
    }
};