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
    /**获取随机挖空后的句子(数组式)
     * @returns {string[]} 挖空得到的句子
     */
    get blankedArr(){
        const s = this.s, n = s.length, l = Math.ceil(n/2), r = ranInt(0,l-1);
        const res = new Array(n).fill(Sentence.underline);
        for(let i=1;i<n;i+=2) res[i] = s[i];
        return res.with(2*r,s[2*r])
    }
    /**获取随机挖空后的句子(字符串式)
     * @returns {string} 挖空得到的句子
     */
    get blanked(){
        return this.blankedArr.join("")
    }
    HTMLElement({before,after}={}){
        const div = document.createElement("div");
        if(before)div.appendChild(before);
        this.blankedArr.forEach((v,i) => {
            const e = document.createElement("span");
            e.innerText = v;
            if(v===Sentence.underline) e.classList.add("blanked");
            div.appendChild(e)
        });
        div.classList.add("sentence");
        div.style.setProperty("--keyans",`"${this.os}"`);
        if(after)div.appendChild(after);
        return div
    }
};
Sentence.underline = "__________";
class Passage{
    #paragraphs;
    constructor({title,author},...paragraphs){
        this.title = title;
        this.author = author;
        this.originalParagraphs = paragraphs;
        const para = this.#paragraphs = paragraphs.map(p=>{
            let a = p.replace(/[“”‘’\"\']/g,"").split(/[？！。；?!.;#]/).filter(v=>v.length>0);
            // # 充当强行断句符号，即原文并未断句
            return a.map(s=>new Sentence(s))
        });
        const pfl = this.#paragraphs.flat();
        this.rww = new RandomWithweight(pfl.length,pfl);
        this.p_length = para.length;
        this.s_length = para.reduce((p,c)=>p+c.length,0)
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
    get s_length(){
        return this.passages.reduce((p,c)=>p+c.s_length,0);
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
class IDGenerator{
    constructor(mapper = (i)=>"id"+i, basic = 0){
        this.mapper = mapper;
        this.basic = basic
    }
    get next(){
        this.basic++;
        return this.mapper(this.basic)
    }
};
class Message{
    /**初始化一个弹窗消息
     * @param {string|HTMLElement} msg 显示的消息
     * @param {function} callback 用户关闭消息后执行的函数
     */
    constructor(msg,callback=()=>{}){
        if(!typeof msg instanceof HTMLElement){
            const m = msg;
            msg = document.createElement("div");
            msg.innerText = m
        };
        this.msg = msg;
        this.callback = callback
    }
    bindEvent(element,type="click"){
        if(this.event)return;
        const fn = function(){
            if(this.closeEv)return;
            const e = document.createElement("div") , close = document.createElement("button");
            e.className = "messageBox";
            close.innerText = "Close";
            e.appendChild(close);
            e.appendChild(this.msg);
            const bf = function(){
                const {close,fn} = this.closeEv;
                close.removeEventListener("click",fn);
                this.closeEv = null;
                this.showing.remove();
                this.showing = null
            }.bind(this);
            this.closeEv = {close,fn:bf};
            close.addEventListener("click",bf);
            this.showing = e;
            document.body.appendChild(e);
        }.bind(this);
        this.event={element,type,fn};
        element.addEventListener(type,fn);
    }
    unbind(){
        const {element,type,fn} = this.event;
        element.removeEventListener(type,fn);
        this.event = null
    }
};
const books = [
    new Book(
        "必修上",
        [
            {title:"短歌行",author:"曹操"},
            "对酒当歌，人生几何？","譬如朝露，去日苦多。","慨当以慷，忧思难忘。","何以解忧，唯有杜康。","青青子衿，悠悠我心。","但为君故，沉吟至今。","呦呦鹿鸣，食野之苹。","我有嘉宾，鼓瑟吹笙。","明明如月，何时可掇?","忧从中来，不可断绝。","越陌度阡，枉用相存。","契阔谈讌，心念旧恩。","月明星稀，乌鹊南飞。","绕树三匝，何枝可依？","山不厌高，海不厌深。","周公吐哺，天下归心。"
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
    ),
    new Book(
        "必修下",
        [
            {title:"子路、曾皙、冉有、公西华侍坐",author:"《论语》"},
            "子路、曾皙、冉有、公西华侍坐。",
            "子曰：“以吾一日长乎尔，毋吾以也。居则曰：‘不吾知也。’如或知尔，则何以哉？”",
            "子路率尔而对曰：“千乘之国，摄乎大国之间，加之以师旅，因之以饥馑；由也为之，比及三年，可使有勇，且知方也。”",
            "夫子哂之。",
            "“求！尔何如？”",
            "对曰：“方六七十，如五六十，求也为之，比及三年，可使足民。如其礼乐，以俟君子。”",
            "“赤！尔何如？”",
            "对曰：“非曰能之，愿学焉。宗庙之事，如会同，端章甫，愿为小相焉。”",
            "“点！尔何如？”",
            "鼓瑟希，铿尔，舍瑟而作，对曰：“异乎三子者之撰。”",
            "子曰：“何伤乎？亦各言其志也。”",
            "曰：“莫春者，春服既成，冠者五六人，童子六七人，浴乎沂，风乎舞雩，咏而归。”",
            "夫子喟然叹曰：“吾与点也！”",
            "三子者出，曾皙后。曾皙曰：“夫三子者之言何如？”",
            "子曰：“亦各言其志也已矣。”",
            "曰：“夫子何哂由也？”",
            "曰：“为国以礼，其言不让，是故哂之。”",
            "“唯求则非邦也与？”",
            "“安见方六七十如五六十而非邦也者？”",
            "“唯赤则非邦也与？”",
            "“宗庙会同，非诸侯而何？赤也为之小，孰能为之大？”"
        ],
        [
            {title:"阿房宫赋",author:"杜牧"},
            "六王毕，四海一，蜀山兀，阿房出。覆压三百余里，隔离天日。骊山北构而西折，直走咸阳。二川溶溶，流入宫墙。五步一楼，十步一阁；廊腰缦回，檐牙高啄；各抱地势，钩心斗角。盘盘焉，囷囷焉，蜂房水涡，矗不知其几千万落。长桥卧波，未云何龙？复道行空，不霁何虹？高低冥迷，不知西东。歌台暖响，春光融融；舞殿冷袖，风雨凄凄。一日之内，一宫之间，而气候不齐。",
            "妃嫔媵嫱，王子皇孙，辞楼下殿，辇来于秦。朝歌夜弦，为秦宫人。明星荧荧，开妆镜也；绿云扰扰，梳晓鬟也；渭流涨腻，弃脂水也；烟斜雾横，焚椒兰也。雷霆乍惊，宫车过也；辘辘远听，杳不知其所之也。一肌一容，尽态极妍，缦立远视，而望幸焉。有不见者三十六年。燕赵之收藏，韩魏之经营，齐楚之精英，几世几年，剽掠其人，倚叠如山。一旦不能有，输来其间。鼎铛玉石，金块珠砾，弃掷逦迤，秦人视之，亦不甚惜。",
            "嗟乎！一人之心，千万人之心也。秦爱纷奢，人亦念其家。奈何取之尽锱铢，用之如泥沙？使负栋之柱，多于南亩之农夫；架梁之椽，多于机上之工女；钉头磷磷，多于在庾之粟粒；瓦缝参差，多于周身之帛缕；直栏横槛，多于九土之城郭；管弦呕哑，多于市人之言语。使天下之人，不敢言而敢怒。独夫之心，日益骄固。戍卒叫，函谷举，楚人一炬，可怜焦土！",
            "呜呼！灭六国者六国也，非秦也；族秦者秦也，非天下也。嗟乎！使六国各爱其人，则足以拒秦；使秦复爱六国之人，则递三世可至万世而为君，谁得而族灭也？秦人不暇自哀，而后人哀之；后人哀之而不鉴之，亦使后人而复哀后人也。"
        ],
        [
            {title:"六国论",author:"苏洵"},
            "六国破灭，非兵不利，战不善，弊在赂秦。赂秦而力亏，破灭之道也。或曰：六国互丧，率赂秦耶？曰：不赂者以赂者丧。盖失强援，不能独完。故曰：弊在赂秦也。",
            "秦以攻取之外，小则获邑，大则得城。较秦之所得，与战胜而得者，其实百倍；诸侯之所亡，与战败而亡者，其实亦百倍。则秦之所大欲，诸侯之所大患，固不在战矣。思厥先祖父，暴霜露，斩荆棘，以有尺寸之地。子孙视之不甚惜，举以予人，如弃草芥。今日割五城，明日割十城，然后得一夕安寝。起视四境，而秦兵又至矣。然则诸侯之地有限，暴秦之欲无厌，奉之弥繁，侵之愈急。故不战而强弱胜负已判矣。至于颠覆，理固宜然。古人云：“以地事秦，犹抱薪救火，薪不尽，火不灭。”此言得之。",
            "齐人未尝赂秦，终继五国迁灭，何哉？与嬴而不助五国也。五国既丧，齐亦不免矣。燕赵之君，始有远略，能守其土，义不赂秦。是故燕虽小国而后亡，斯用兵之效也。至丹以荆卿为计，始速祸焉。赵尝五战于秦，二败而三胜。后秦击赵者再，李牧连却之。洎牧以谗诛，邯郸为郡，惜其用武而不终也。且燕赵处秦革灭殆尽之际，可谓智力孤危，战败而亡，诚不得已。向使三国各爱其地，齐人勿附于秦，刺客不行，良将犹在#则胜负之数，存亡之理，当与秦相较，或未易量。",
            "呜呼！以赂秦之地封天下之谋臣，以事秦之心礼天下之奇才，并力西向，则吾恐秦人食之不得下咽也。悲夫！有如此之势，而为秦人积威之所劫，日削月割，以趋于亡。为国者无使为积威之所劫哉！",
            "夫六国与秦皆诸侯，其势弱于秦，而犹有可以不赂而胜之之势。苟以天下之大，下而从六国破亡之故事，是又在六国下矣。"
        ]
    )
];
(()=>{
    const idgen = new IDGenerator(i=>"checkbox_id_"+i,0) , boxes = [] , sel = document.getElementById("select_book");
    books.forEach(b=>{
        const e = document.createElement("div"), desc = document.createElement("label"), box = document.createElement("input");
        const id = idgen.next;
        e.style.display = "inline-block";
        desc.innerText = b.title;
        desc.setAttribute("for",id);
        box.type = "checkbox";
        box.setAttribute("id",id);
        box.tar = b;
        e.appendChild(desc);
        e.appendChild(box);
        sel.appendChild(e);
        boxes.push(box)
    });
    const btn = document.createElement("button");
    btn.innerText = "生成上下句填空";
    btn.addEventListener("click",function(){
        const b = [];
        for(const x of boxes){
            if(x.checked){
                b.push(x.tar)
            }
        };
        if(b.length === 0) b.push(books[0]);
        generateBlanks(100,true,...b)
    });
    sel.appendChild(btn);
})();
let msgs = [];
function generateBlanks(n,isBookWeighted,...books){
    msgs.forEach(m=>{
        m.unbind()
    });
    msgs = [];
    const main = document.getElementById("main");
    while(main.firstChild){
        main.firstChild.remove()
    };
    rww = new RandomWithweight(books.map(isBookWeighted ? b=>b.s_length : b=>1),books);
    let anger = 0;
    for(let i=1;i<=n;i++){
        const book = rww.pickItem() , psg = book.randomPassage , snt = psg.randomSentence;
        if(snt.s.length < 2 || (Array.prototype.at.call(snt.s[0],-1)==="曰"&&snt.s[0].length<4)){
            if(anger >= n) throw RangeError("The script is angry because no valid data is available");
            i--;
            anger++;
            continue
        };
        anger = 0;
        const before = document.createElement("span"),e = snt.HTMLElement({before});
        before.innerText = i + ". ";
        const art=document.createElement("article"),title=document.createElement("h3"),p=document.createElement("p"),author = document.createElement("header");
        title.innerText = psg.title;
        p.innerHTML = psg.originalParagraphs.join("<br><br>");
        author.innerText = psg.author;
        art.append(title,author,p);
        const msg = new Message(art);
        msg.bindEvent(before,"click");
        msgs.push(msg)
        main.appendChild(e)
    }
};