class DataTable{
    originalData;
    data;
    target;
    numbers = new Set();
    constructor(data, target){
        this.originalData = data;
        const dn = data.map(v=>{
            const result = {}, split = v.split(" // ");
            result.template = split[0];
            result.data = {};
            split[1].split(" / ").forEach(v=>{
                const split = v.split("--"), number = split.shift();
                this.numbers.add(number);
                result.data[number] = split.map(v=>v.split("-"))
            });
            return result
        });
        this.data = dn;
        this.target = target
    }
    setProperty(element, kv){
        for(const k in kv){
            element.style.setProperty(k, kv[k])
        };
        return element
    }
    createFirstElement(template){
        const span = document.createElement("span");
        span.innerText = template;
        return span
    }
    createElement(template, number){
        const span = document.createElement("span");
        span.innerText = template
            .replace(/monYobi/g, this.constructor.monYobi[number])
            .replace(/n/g, number)
            .replace(/何/g, this.constructor.nummap[number] || number);
        return span
    }
    createToneElement(from, to, bm){
        const span = document.createElement("span");
        span.classList.add("tone");
        const l = bm.length;
        from = +from;
        to = +to;
        let right = to ? l - to : to, width = l - right - from, isBend = +!!to;
        span.innerText = bm;
        return this.setProperty(span, {
            "--right": right + "em",
            "--width": width + "em",
            "--isBend": isBend
        })
    }
    display(){
        const target = this.target;
        target.style.gridTemplateColumns = `repeat(${this.numbers.size - 1}, minmax(150px, 1fr))`;
        // 由于“何”“幾”被认为是一致的，size需要-1
        for(const x of this.data){
            const alist = {};
            for(const j of this.numbers){
                const y = x.data[j];
                if(!y){
                    const a = document.createElement("div");
                    a.dataset.standFor = j;
                    alist[j] = a;
                    target.appendChild(a);
                    continue
                };
                const front = this.createElement(x.template, j);
                const middle = this.createFirstElement(": ");
                const result = document.createElement("div");
                result.append(front, middle);
                let isFirst = true;
                for(const z of y){
                    if(!isFirst){
                        result.append(this.createFirstElement(" / "))
                    };
                    isFirst = false;
                    result.appendChild(this.createToneElement(...z))
                };
                target.appendChild(result)
            };
            target.removeChild(alist["何"] || alist["幾"])
        }
    }
};
DataTable.nummap = {
    0: "零",
    1: "一",
    2: "二",
    3: "三",
    4: "四",
    5: "五",
    6: "六",
    7: "七",
    8: "八",
    9: "九"
};
DataTable.monYobi = {
    1: "11月",
    2: "12月",
    3: "日曜日",
    4: "月曜日",
    5: "火曜日",
    6: "水曜日",
    7: "木曜日",
    8: "金曜日",
    9: "土曜日",
    何: "何曜日"
};
const data = new DataTable([
    "n // 1--1-2-いち / 2--0-1-に / 3--1-0-さん / 4--0-1-よん--0-1-し / 5--0-1-ご / 6--1-2-ろく / 7--0-1-なな--1-2-しち / 8--1-2-はち / 9--0-2-きゅう--0-1-く",
    "1n // 1--2-5-じゅういち / 2--2-4-じゅうに / 3--0-2-じゅうさん / 4--2-4-じゅうよん--2-4-じゅうし / 5--0-2-じゅうご / 6--2-5-じゅうろく / 7--2-5-じゅうしち--2-4-じゅうなな / 8--2-5-じゅうはち / 9--2-5-じゅうきゅう--0-2-じゅうく",
    "n0 // 1--0-2-じゅう / 2--0-1-にじゅう / 3--0-1-さんじゅう / 4--0-1-よんじゅう / 5--1-3-ごじゅう / 6--1-4-ろくじゅう / 7--1-2-ななじゅう / 8--1-4-はちじゅう / 9--0-2-きゅうじゅう",
    "n00 // 1--2-3-ひゃく / 2--1-4-にひゃく / 3--0-1-さんびゃく / 4--0-1-よんひゃく / 5--1-4-ごひゃく / 6--1-5-ろっぴゃく / 7--1-2-ななひゃく / 8--1-5-はっぴゃく / 9--0-2-きゅうひゃく",
    "n000 // 1--0-1-せん / 2--1-2-にせん / 3--1-3-さんぜん / 4--1-3-よんせん / 5--1-2-ごせん / 6--1-3-ろくせん / 7--1-3-ななせん / 8--1-3-はっせん / 9--2-4-きゅうせん / 10--1-3-いちまん",
    "何つ // 1--1-2-ひとつ / 2--1-3-ふたつ / 3--1-3-みっつ / 4--1-3-よっつ / 5--1-2-いつつ / 6--1-3-むっつ / 7--1-2-ななつ / 8--1-3-やっつ / 9--1-2-ここのつ / 幾--0-1-いくつ",
    "n冊 // 1--1-4-いっさつ / 2--0-1-にさつ / 3--0-1-さんさつ / 4--0-1-よんさつ / 5--0-1-ごさつ / 6--1-4-ろくさつ / 7--1-2-ななさつ / 8--1-4-はっさつ / 9--0-2-きゅうさつ / 10--2-5-じゅっさつ / 何--0-1-なんさつ",
    "n人 // 1--1-2-ひとり / 2--1-3-ふたり / 3--1-3-さんにん / 4--1-2-よにん / 5--1-2-ごにん / 6--1-2-ろくにん / 7--1-2-しちにん / 8--1-2-はちにん / 9--0-2-きゅうにん / 10--0-2-じゅうにん / 何--0-1-なんにん",
    "n時 // 1--1-2-いちじ / 2--0-1-にじ / 3--0-1-さんじ / 4--0-1-よじ / 5--0-1-ごじ / 6--1-2-ろくじ / 7--1-2-しちじ / 8--1-2-はちじ / 9--0-1-くじ / 10--0-2-じゅうじ / 何--0-1-なんじ",
    "n分 // 1--0-1-いっぷん / 2--0-1-にふん / 3--0-1-さんぷん / 4--0-1-よんぷん / 5--0-1-ごふん / 6--0-1-ろっぷん / 7--1-2-ななふん / 8--0-1-はっぷん / 9--0-2-きゅうふん / 10--0-2-じゅっぷん / 何--0-1-なんぷん",
    "n秒 // 1--1-2-いちびょう / 2--0-1-にびょう / 3--0-1-さんびょう / 4--0-1-よんびょう / 5--0-1-ごびょう / 6--1-2-ろくびょう / 7--1-2-ななびょう / 8--1-2-はちびょう / 9--0-2-きゅうびょう / 10--0-2-じゅうびょう / 何--0-1-なんびょう",
    "n月 // 1--1-4-いちがつ / 2--1-3-にがつ / 3--0-1-さんがつ / 4--1-3-しがつ / 5--0-1-ごがつ / 6--1-4-ろくがつ / 7--1-4-しちがつ / 8--1-4-はちがつ / 9--0-1-くがつ / 10--2-5-じゅうがつ / 何--0-1-なんがつ",
    "monYobi // 1--2-7-じゅういちがつ / 2--2-6-じゅうにがつ / 3--1-3-にちようび / 4--1-3-げつようび / 5--1-2-かようび / 6--1-3-すいようび / 7--1-3-もくようび / 8--1-3-きんようび / 9--1-2-どようび / 何--1-3-なんようび",
    "n回 // 1--1-3-いっかい / 2--1-2-にかい / 3--1-3-さんかい / 4--0-1-よんかい / 5--1-2-ごかい / 6--1-3-ろっかい / 7--1-2-ななかい / 8--1-3-はちかい / 9--0-2-きゅうかい / 10--2-4-じゅっかい / 何--0-1-なんかい",
    "n階 // 1--1-0-いっかい / 2--1-0-にかい / 3--1-0-さんがい / 4--1-0-よんかい / 5--1-0-ごかい / 6--1-0-ろっかい / 7--1-0-ななかい / 8--1-0-はっかい / 9--2-0-きゅうかい / 10--2-0-じゅっかい / 何--1-0-なんがい",
    "n個 // 1--0-1-いっこ / 2--0-1-にこ / 3--0-1-さんこ / 4--0-1-よんこ / 5--0-1-ごこ / 6--0-1-ろっこ / 7--1-2-ななこ / 8--0-1-はっこ / 9--0-2-きゅうこ / 10--0-2-じゅっこ / 何--0-1-なんこ",
    "n本 // 1--0-1-いっぽん / 2--0-1-にほん / 3--0-1-さんぼん / 4--0-1-よんほん / 5--1-0-ごほん / 6--0-1-ろっぽん / 7--1-2-ななほん / 8--0-1-はっぽん / 9--0-2-きゅうほん / 10--0-2-じゅっぽん / 何--0-1-なんぼん",
    "n番 // 1--1-2-いちばん / 2--0-1-にばん / 3--0-1-さんばん / 4--0-1-よんばん / 5--1-3-ごばん / 6--1-2-ろくばん / 7--1-2-ななばん / 8--1-2-はちばん / 9--0-2-きゅうばん / 10--0-2-じゅうばん / 何--0-1-なんばん",
    "n円 // 1--1-0-いちえん / 2--1-0-にえん / 3--1-0-さんえん / 4--0-1-よんえん / 5--0-1-ごえん / 6--1-0-ろくえん / 7--1-2-ななえん / 8--1-0-はちえん / 9--0-2-きゅうえん / 10--2-0-じゅうえん"
], document.getElementById("divDisplay"));
data.display();