let widgets=[]

function addWidget(type){

let title = prompt("Widget Title")

widgets.push({
type:type,
config:{title:title},
w:4,
h:3
})

render()

}

function render(){

let canvas=document.getElementById("canvas")
canvas.innerHTML=""

widgets.forEach(w=>{

let div=document.createElement("div")
div.className="widget"

div.innerHTML=`<h3>${w.config.title}</h3>${w.type}`

canvas.appendChild(div)

})

}

async function saveDashboard(){

await fetch("/api/widgets",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(widgets)
})

alert("Dashboard Saved")

}