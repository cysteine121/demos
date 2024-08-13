const ea = document.getElementById("egArticle");
(()=>{
    function ad(){
        const it = window.setInterval(()=>{
            const t0 = new Date();
            debugger;
            const t1 = new Date();
            const delta = t1 - t0;
            if(delta > 5000){
                console.log(delta);
                window.clearInterval(it);
                ea.innerText = "连续断点时间超过5秒, 任务失败, 请刷新重新尝试复制"
            }
        }, 1000)
    };
    try{
        ad()
    }catch(err){}
})();