const doms = {
    newer: document.getElementById("btn_new_timer"),
    clearer: document.getElementById("btn_clear_timer"),
    container: document.getElementById("timer_container"),
    createButton: function(text, className){
        const button = document.createElement("button");
        button.textContent = text;
        button.classList.add(className);
        return button
    }
};
doms.newer.addEventListener("click", function(){
    let timer = new Timer("计时器"), cb = doms.createButton;
    let tdoms = {
        title: timer.titleInput,
        rename: cb("重命名", "operation"),
        pause: cb("暂停", "operation"),
        time: document.createElement("span"),
        delete: cb("删除", "delete"),
        li: document.createElement("li")
    };
    // !!!!! !!!!! 有待解决的问题：此段代码执行环境位于函数内，经测试，声明的变量不能被垃圾回收
    let dev = {
        e:new Set(),
        rename: null, // 临时寄存用, 下同
        renameI: null,
        deleteT: null,
        deleteF: null,
        _add: function(target, ...args){
            target.addEventListener(...args)
        },
        _rmv: function(target, ...args){
            target.removeEventListener(...args)
        },
        add: function(target, type, callback){
            this._add(target, type, callback);
            this.e.add({target, type, callback})
        },
        remove: function(filter){
            for(const x of this.e){
                if(filter(x)){
                    const {target, type, callback} = x;
                    this.e.delete(x);
                    this._rmv(target, type, callback)
                }
            }
        }
    };
    for(const e of Object.values(tdoms)){
        if(e !== tdoms.li){
            tdoms.li.appendChild(e)
        }
    };
    doms.container.appendChild(tdoms.li);
    timer.onUpdate(function(){
        const {h, m, s} = this.splitQuery();
        tdoms.time.innerText = `已进行时间: ${h} 小时 ${m} 分 ${s} 秒`
    });
    dev.add(tdoms.pause, "click", function(){
        data[0];
        if(timer.paused){
            this.textContent = "暂停";
            timer.resume()
        }else{
            this.textContent = "恢复";
            timer.pause()
        }
    });
    dev.add(tdoms.rename, "click", function(e){
        if(dev.rename){
            dev._rmv(...dev.rename);
            dev._rmv(...dev.renameI)
        };
        tdoms.title.disabled = false;
        tdoms.title.focus();
        dev.rename = [document, "click", function(e){
            tdoms.title.disabled = true;
            dev._rmv(...dev.rename);
            dev._rmv(...dev.renameI);
            dev.rename = dev.renameI = null
        }];
        dev.renameI = [tdoms.title, "click", e=>{e.stopPropagation()}];
        dev._add(...dev.rename);
        dev._add(...dev.renameI);
        e.stopPropagation()
    });
    dev.add(tdoms.delete, "click", function(){
        const dialog = document.getElementById("page_delete_btn_dialog");
        dialog.showModal();
        const close = ()=>{
            dev._rmv(...dev.deleteT);
            dev._rmv(...dev.deleteF);
            dev.deleteT = dev.deleteF = null;
            dialog.close()
        };
        dev.deleteT = [dialog.querySelector("[data-for=true]"), "click", function(){
            close();
            timer.remove();
            dev.remove(_=>true);
            for(const i in tdoms){
                tdoms[i].remove()
            };
            tdoms = dev = timer = null;
        }];
        dev.deleteF = [dialog.querySelector("[data-for=false]"), "click", close];
        dev._add(...dev.deleteT);
        dev._add(...dev.deleteF)
    })
});