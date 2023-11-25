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
        const s = this.s, n = s.length, l = Math.ceil(n/2), r = ranInt(0,l-1);
        const res = new Array(n).fill(Sentence.underline);
        for(let i=1;i<n;i+=2) res[i] = s[i];
        return res.with(2*r,s[2*r])
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
            let a = p.replace(/[“”‘’\"\']/g,"").split(/[？！。；?!.;#]/).filter(v=>v.length>0);
            // # 充当强行断句符号，即原文并未断句
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
    ],
    [
        {title:"登高",author:"杜甫"},
        "风急天高猿啸哀，渚清沙白鸟飞回。无边落木萧萧下，不尽长江滚滚来。万里悲秋常作客，百年多病独登台。艰难苦恨繁霜鬓，潦倒新停浊酒杯。"
    ],
    [
        {title:"念奴娇·赤壁怀古",author:"苏轼"},
        "大江东去，浪淘尽，千古风流人物。故垒西边，人道是，三国周郎赤壁。乱石穿空，惊涛拍岸，卷起千堆雪。江山如画，一时多少豪杰。",
        "遥想公瑾当年，小乔初嫁了，雄姿英发。羽扇纶巾，谈笑间，樯橹灰飞烟灭。故国神游，多情应笑我，早生华发。人生如梦，一尊还酹江月。"
    ],
    [
        {title:"劝学",author:"荀子"},
        "君子曰：学不可以已。",
        "青，取之于蓝，而青于蓝；冰，水为之，而寒于水。木直中绳，輮以为轮，其曲中规。虽有槁暴，不复挺者，輮使之然也。故木受绳则直，金就砺则利，君子博学而日参省乎已，则知明而行无过矣。",
        "吾尝终日而思矣，不如须臾之所学也；吾尝跂而望矣，不如登高之博见也。登高而招，臂非加长也，而见者远；顺风而呼，声非加疾也，而闻者彰。假舆马者，非利足也，而致千里；假舟楫者，非能水也，而绝江河。君子生非异也，善假于物也。",
        "积土成山，风雨兴焉；积水成渊，蛟龙生焉；积善成德，而神明自得，圣心备焉。故不积跬步，无以至千里；不积小流，无以成江海。骐骥一跃，不能十步；驽马十驾，功在不舍。锲而舍之，朽木不折；锲而不舍，金石可镂。蚓无爪牙之利，筋骨之强，上食埃土，下饮黄泉，用心一也。蟹六跪而螯，非蛇鳝之穴无可寄托者，用心躁也。"
    ],
    [
        {title:"师说（第一段）",author:"韩愈"},
        "古之学者必有师。师者，所以传道受业解惑也。人非生而知之者，孰能无惑？惑而不从师，其为惑也，终不解矣。生乎吾前，其闻道也固先乎吾，吾从而师之；生乎吾后，其闻道也亦先乎吾，吾从而师之。吾师道也，夫庸知其年之先后生于吾乎？是故无贵无贱，无长无少，道之所存，师之所存也。"
    ],
    [
        {title:"赤壁赋",author:"苏轼"},
        "壬戌之秋，七月既望，苏子与客泛舟游于赤壁之下。清风徐来，水波不兴。举酒属客，诵明月之诗，歌窈窕之章。少焉，月出于东山之上，徘徊于斗牛之间。白露横江，水光接天。纵一苇之所如，凌万顷之茫然。浩浩乎如冯虚御风，而不知其所止；飘飘乎如遗世独立，羽化而登仙。",
        "于是饮酒乐甚，扣舷而歌之。歌曰：“桂棹兮兰桨，击空明兮溯流光。渺渺兮予怀，望美人兮天一方。”客有吹洞箫者，倚歌而和之。其声呜呜然，如怨如慕，如泣如诉；余音袅袅，不绝如缕。舞幽壑之潜蛟，泣孤舟之嫠妇。",
        "苏子愀然，正襟危坐而问客曰：“何为其然也？”客曰：“‘月明星稀，乌鹊南飞’，此非曹孟德之诗乎？西望夏口，东望武昌，山川相缪，郁乎苍苍，此非孟德之困于周郎者乎？方其破荆州，下江陵，顺流而东也#舳舻千里，旌旗蔽空，酾酒临江，横槊赋诗，固一世之雄也，而今安在哉？况吾与子渔樵于江渚之上，侣鱼虾而友麋鹿，驾一叶之扁舟，举匏樽以相属。寄蜉蝣于天地，渺沧海之一粟。哀吾生之须臾，羡长江之无穷。挟飞仙以遨游，抱明月而长终。知不可乎骤得，托遗响于悲风。”",
        "苏子曰：“客亦知夫水与月乎？逝者如斯，而未尝往也；盈虚者如彼，而卒莫消长也。盖将自其变者而观之，则天地曾不能以一瞬；自其不变者而观之，则物与我皆无尽也，而又何羡乎！且夫天地之间，物各有主，苟非吾之所有，虽一毫而莫取。惟江上之清风，与山间之明月，耳得之而为声，目遇之而成色，取之无禁，用之不竭。是造物者之无尽藏也，而吾与子之所共适。”",
        "客喜而笑，洗盏更酌。肴核既尽，杯盘狼籍。相与枕藉乎舟中，不知东方之既白。"
    ]
);
book.mulRanSentence(100).forEach(v=>{
    document.body.appendChild(v.HTMLElement)
});