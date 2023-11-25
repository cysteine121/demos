function ranInt(f,t){
    return f+Math.floor(Math.random()*(t-f+1))
};
class RandomWithweight {
    /**按权重随机选择
     * @param {number[]|number} w 权重列表
     * @param {any[]} d 数据列表
     */
    constructor(w,d){
        if(typeof w === "number") w = new Array(w).fill(1);
        this.data = d;
        this.pre = new Array(w.length).fill(0);
        this.pre[0] = w[0];
        for (let i = 1; i < w.length; ++i){
            this.pre[i] = this.pre[i - 1] + w[i];
        };
        this.total = w.reduce((p,c)=>p+c,0);
    }
    /**随机选择一次
     * @returns {number} 选择的下标
     */
    pickIndex(){
        const x = Math.floor((Math.random() * this.total)) + 1;
        const binarySearch = (x) => {
            let low = 0, high = this.pre.length - 1;
            while (low < high) {
                const mid = Math.floor((high - low) / 2) + low;
                if (this.pre[mid] < x) {
                    low = mid + 1;
                } else {
                    high = mid;
                }
            }
            return low;
        };
        return binarySearch(x);
    }
    /**随机选择一次
     * @returns {number} 选择的下标的对应值
     */
    pickItem(){
        return this.data[this.pickIndex()]
    }
};
class Sentence{
    constructor(s){
        this.os = s;
        const a = [],pr = new Set(["：","，",":",","]);
        let stack = "";
        for(const x of s){
            if(pr.has(x)){
                a.push(stack);
                a.push(x);
                stack = ""
            }else{
                stack += x
            }
        };
        if(stack) a.push(stack);
        this.s = a
    }
    get length(){
        return this.os.length
    }
    /**获取随机挖空后的句子，格式为字符串
     * @returns {string} 挖空得到的句子
     */
    get blankedArr(){
        const l = Math.ceil(this.s.length/2), r = ranInt(0,l-1);
        return this.s.with(2*r,Sentence.underline)
    }
    get blanked(){
        return this.blankedArr.join("")
    }
    get HTMLElement(){
        const div = document.createElement("div");
        this.blankedArr.forEach((v,i) => {
            const e = document.createElement("span");
            e.innerText = v;
            if(v===Sentence.underline) e.classList.add("blanked");
            div.appendChild(e)
        });
        div.classList.add("sentence");
        div.style.setProperty("--keyans",`"${this.os}"`);
        return div
    }
};
Sentence.underline = "__________";
class Passage{
    constructor({title,author},...paragraphs){
        this.title = title;
        this.author = author;
        this.originalParagraphs = paragraphs;
        this.paragraphs = paragraphs.map(p=>{
            let a = p.replace(/[“”‘’]/g,"").split(/[？！。；?!.;]/);
            if(a.length>0&&!a.at(-1)) a.pop();
            return a.map(s=>new Sentence(s))
        });
        const pfl = this.paragraphs.flat();
        this.rww = new RandomWithweight(pfl.length,pfl)
    }
    get p_length(){
        return this.paragraphs.length
    }
    get s_length(){
        return this.paragraphs.reduce((p,c)=>p+c.length,0)
    }
    get w_AllLength(){
        return this.originalParagraphs.reduce((p,c)=>p+c.length,0)
    }
    get w_length(){
        return this.paragraphs.reduce( (p,c)=>p+c.reduce((p,c)=>p+c.length,0) , 0)
    }
    get randomSentence(){
        return this.rww.pickItem()
    }
};
class Book{
    constructor(title,...passages){
        this.title = title;
        this.passages = passages = passages.map(p=>{
            if(Array.isArray(p)) p = new Passage(...p);
            if(!p instanceof Passage) throw new TypeError("A Book must be constructed with passages");
            return p
        });
        const weights = passages.map(p=>p.s_length);
        this.rww = new RandomWithweight(weights,passages);
    }
    get randomPassage(){
        return this.rww.pickItem()
    }
    get randomSentence(){
        return this.randomPassage.randomSentence
    }
    mulRanSentence(n){
        return new Array(n).fill(0).map(v=>this.randomSentence)
    }
};
const book = new Book(
    "必修上",
    [
        {title:"短歌行",author:"曹操"},
        "对酒当歌，人生几何？譬如朝露，去日苦多。慨当以慷，忧思难忘。何以解忧，唯有杜康。青青子衿，悠悠我心。但为君故，沉吟至今。呦呦鹿鸣，食野之苹。我有嘉宾，鼓瑟吹笙。明明如月，何时可掇?忧从中来，不可断绝。越陌度阡，枉用相存。契阔谈[言燕]，心念旧恩。月明星稀，乌鹊南飞。绕树三匝，何枝可依？山不厌高，海不厌深。周公吐哺，天下归心。"
    ],
    [
        {title:"沁园春·长沙",author:"毛泽东"},
        "独立寒秋，湘江北去，橘子洲头。看万山红遍，层林尽染；漫江碧透，百舸争流。鹰击长空，鱼翔浅底，万类霜天竞自由。怅寥廓，问苍茫大地，谁主沉浮？",
        "携来百侣曾游，忆往昔峥嵘岁月稠。恰同学少年，风华正茂；书生意气，挥斥方遒。指点江山，激扬文字，粪土当年万户侯。曾记否，到中流击水，浪遏飞舟？"
    ],
    [
        {title:"梦游天姥吟留别",author:"李白"},
        "海客谈瀛洲，烟涛微茫信难求，越人语天姥，云霞明灭或可睹。天姥连天向天横，势拔五岳掩赤城。天台一万八千丈，对此欲倒东南倾。",
        "我欲因之梦吴越，一夜飞渡镜湖月。湖月照我影，送我至剡溪。谢公宿外今尚在，渌水荡漾清猿啼。脚著谢公屐，身登青云梯。半壁见海日，空中闻天鸡。千岩万转路不定，迷花倚石忽已暝。熊咆龙吟殷岩泉，栗深林兮惊层巅。云青青兮欲雨，水澹澹兮生烟。列缺霹雳，丘峦崩摧，洞天石扉，訇然中开。青冥浩荡不见底，日月照耀金银台。霓为衣兮风为马，云之君兮纷纷而来下。虎鼓瑟兮鸾回车，仙之人兮列如麻。忽魂悸以魄动，怳惊起而长嗟。惟觉时之枕席，失向来之烟霞。",
        "世间行乐亦如此，古来万事东流水。别君去兮何时还？且放白鹿青崖间，须行即骑访名山。安能摧眉折腰事权贵，使我不得开心颜！"
    ]
);
book.mulRanSentence(100).forEach(v=>{
    document.body.appendChild(v.HTMLElement)
});