function handleHarFile(file){
    const name = file.name;
    new Promise((res) => {
        const reader = new FileReader;
        reader.onload = res;
        reader.readAsText(file)
    }).then(e=>JSON.parse(e.target.result)).then(har => {
        const list = [];
        for(const entry of har.log.entries){
            const {mimeType, text, encoding} = entry.response.content;
            if(encoding !== "base64") continue;
            if(!mimeType.match(/image\/.+/)) continue;
            list.push({
                blobURL: base64ToBlobURL(text, mimeType),
                mimeType,
                url: entry.request.url
            })
        };
        return list
    }).then(list => {
        const divImages = document.getElementById("images"),
            tcontent = document.getElementById("t_imageBox").content,
            image = tcontent.querySelector("img");
        for(const item of list){
            image.src = item.blobURL;
            const clone = document.importNode(tcontent, true);
            divImages.appendChild(clone)
        }
    })
};
function base64ToBlobURL(base64Data, mimeType) {
    const binaryString = atob(base64Data);
    const byteArrays = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        byteArrays[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([byteArrays], { type: mimeType });
    return URL.createObjectURL(blob)
};
function handleFileUpload(){
    const file = this.files[0];
    if(file){
        handleHarFile(file)
    }
};
document.getElementById("upfile").addEventListener("input", handleFileUpload);
document.getElementById("cnum").addEventListener("input", function(){
    const value = +this.value;
    const calert = document.getElementById("cnumalert");
    if(isNaN(value) || value < 1 || value > 10){
        calert.innerText = "输入值不合法!";
        return
    };
    calert.innerText = "";
    document.getElementById("images").style.setProperty("--cnum", value);
    console.log(document.getElementById("images").style)
});
document.getElementById("checkDoublesize").addEventListener("change", function(){
    const div = document.getElementById("images");
    if(this.checked){
        div.style.setProperty("--size", 2)
    }else{
        div.style.setProperty("--size", 1)
    }
})