let grid;

document.addEventListener("DOMContentLoaded", function(){

grid = GridStack.init({
column:12,
cellHeight:80,
float:true
});

loadLayout()

});


/* =========================
   ADD WIDGET
========================= */

function addWidget(type){

let id="chart_"+Date.now()

let node={
w:4,
h:3,
content:`
<div class="widget" data-type="${type}">

<div class="widget-header">

<h3>${type.toUpperCase()}</h3>

<div class="widget-actions">

<button onclick="openSettings(this)">⚙</button>

<button onclick="removeWidget(this)">✖</button>

</div>

</div>

<canvas id="${id}"></canvas>

</div>
`
}

let el = grid.addWidget(node)

setTimeout(()=>{
renderPreview(type,id)
},200)

}


/* =========================
   DELETE WIDGET
========================= */

function removeWidget(btn){

let item = btn.closest(".grid-stack-item")

grid.removeWidget(item)

}


/* =========================
   SETTINGS PANEL
========================= */

function openSettings(btn){

let widget = btn.closest(".widget")

let currentTitle = widget.querySelector("h3").innerText

let newTitle = prompt("Widget Title", currentTitle)

if(newTitle){

widget.querySelector("h3").innerText = newTitle

}

}


/* =========================
   SAVE DASHBOARD LAYOUT
========================= */

async function saveLayout(){

let widgets=[]

grid.engine.nodes.forEach(n=>{

let widget=n.el.querySelector(".widget")

let type=widget.dataset.type

widgets.push({

type:type,
x:n.x,
y:n.y,
w:n.w,
h:n.h

})

})

await fetch("/api/layout",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(widgets)

})

alert("Dashboard Saved")

}


/* =========================
   LOAD SAVED LAYOUT
========================= */

async function loadLayout(){

let res = await fetch("/api/layout")

let widgets = await res.json()

widgets.forEach(w=>{

let id="chart_"+Math.random()

let el = grid.addWidget({

x:w.x,
y:w.y,
w:w.w,
h:w.h,

content:`

<div class="widget" data-type="${w.type}">

<div class="widget-header">

<h3>${w.type.toUpperCase()}</h3>

<div class="widget-actions">

<button onclick="openSettings(this)">⚙</button>

<button onclick="removeWidget(this)">✖</button>

</div>

</div>

<canvas id="${id}"></canvas>

</div>

`

})

setTimeout(()=>{
renderPreview(w.type,id)
},200)

})

}


/* =========================
   CHART PREVIEW (BUILDER)
========================= */

function renderPreview(type,id){

let ctx=document.getElementById(id)

if(!ctx) return

let labels=["A","B","C","D"]

let values=[10,20,15,30]


/* BAR */

if(type==="bar"){

new Chart(ctx,{
type:'bar',
data:{
labels:labels,
datasets:[{
data:values,
backgroundColor:"#4f46e5"
}]
}
})

}


/* LINE */

if(type==="line"){

new Chart(ctx,{
type:'line',
data:{
labels:labels,
datasets:[{
data:values,
borderColor:"#22c55e"
}]
}
})

}


/* AREA */

if(type==="area"){

new Chart(ctx,{
type:'line',
data:{
labels:labels,
datasets:[{
data:values,
borderColor:"#3b82f6",
backgroundColor:"rgba(59,130,246,0.3)",
fill:true
}]
}
})

}


/* PIE */

if(type==="pie"){

new Chart(ctx,{
type:'pie',
data:{
labels:labels,
datasets:[{
data:values
}]
}
})

}


/* SCATTER */

if(type==="scatter"){

let pts=[
{x:5,y:10},
{x:10,y:20},
{x:15,y:8}
]

new Chart(ctx,{
type:'scatter',
data:{
datasets:[{
data:pts,
backgroundColor:"#f59e0b"
}]
}
})

}


/* KPI */

if(type==="kpi"){

ctx.remove()

let parent=document.getElementById(id).parentNode

parent.innerHTML+=`

<div class="kpi-preview">

TOTAL KPI

</div>

`

}


/* TABLE */

if(type==="table"){

ctx.remove()

let parent=document.getElementById(id).parentNode

parent.innerHTML+=`

<table class="preview-table">

<tr>
<th>Customer</th>
<th>Product</th>
<th>Total</th>
</tr>

<tr>
<td>John Doe</td>
<td>Fiber 1Gb</td>
<td>$120</td>
</tr>

<tr>
<td>Alice</td>
<td>5G Plan</td>
<td>$90</td>
</tr>

</table>

`

}

}
