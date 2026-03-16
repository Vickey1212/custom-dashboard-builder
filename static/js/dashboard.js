let grid;

document.addEventListener("DOMContentLoaded", function(){

grid = GridStack.init({
column:12,
cellHeight:80,
float:true
})

document.getElementById("dateFilter").addEventListener("change",loadDashboard)

loadDashboard()

})


async function loadDashboard(){

grid.removeAll()

let layout = await (await fetch("/api/layout")).json()

let range = document.getElementById("dateFilter").value

let orders = await (await fetch(`/api/orders?range=${range}`)).json()


/* FILTER VALUES */

let product = document.getElementById("productFilter").value
let status = document.getElementById("statusFilter").value
let amount = document.getElementById("amountFilter").value


/* APPLY FILTER */

let filtered = orders.filter(o=>{

if(product && o.product!==product) return false

if(status && o.status!==status) return false

if(amount && o.total_amount < amount) return false

return true

})


/* PRODUCT DROPDOWN UPDATE */

let products=[...new Set(orders.map(o=>o.product))]

let productSelect=document.getElementById("productFilter")

productSelect.innerHTML=`<option value="">All Products</option>`

products.forEach(p=>{
productSelect.innerHTML+=`<option value="${p}">${p}</option>`
})


/* RENDER WIDGETS */

layout.forEach((w,i)=>{

let id="chart"+i

grid.addWidget({

x:w.x,
y:w.y,
w:w.w,
h:w.h,

content:`

<div class="widget">

<h3>${w.type.toUpperCase()}</h3>

<canvas id="${id}"></canvas>

</div>

`

})

renderWidget(w.type,id,filtered)

})

}



function renderWidget(type,id,orders){

let canvas=document.getElementById(id)

if(!canvas) return

let parent=canvas.parentNode


/* KPI */

if(type==="kpi"){

canvas.remove()

let revenue=0

orders.forEach(o=>revenue+=o.total_amount)

parent.innerHTML+=`

<div class="kpi-card">

<div>Total Orders</div>
<div class="kpi-number">${orders.length}</div>

<div>Total Revenue</div>
<div class="kpi-number">$${revenue}</div>

</div>

`

return

}


/* DATA PREP */

let labels=[]
let values=[]

orders.forEach(o=>{
labels.push(o.product)
values.push(o.total_amount)
})


/* BAR */

if(type==="bar"){

new Chart(canvas,{
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

new Chart(canvas,{
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


/* PIE */

if(type==="pie"){

let counts={}

orders.forEach(o=>{
counts[o.status]=(counts[o.status]||0)+1
})

new Chart(canvas,{
type:'pie',
data:{
labels:Object.keys(counts),
datasets:[{
data:Object.values(counts)
}]
}
})

}


/* SCATTER */

if(type==="scatter"){

let pts=[]

orders.forEach(o=>{
pts.push({x:o.quantity,y:o.total_amount})
})

new Chart(canvas,{
type:'scatter',
data:{
datasets:[{
data:pts,
backgroundColor:"#f59e0b"
}]
}
})

}


/* TABLE */

if(type==="table"){

canvas.remove()

let html=`

<table class="data-table">

<thead>

<tr>

<th>Customer</th>
<th>Product</th>
<th>Quantity</th>
<th>Total</th>
<th>Status</th>

</tr>

</thead>

<tbody>

`

orders.forEach(o=>{

html+=`

<tr>

<td>${o.first_name} ${o.last_name}</td>
<td>${o.product}</td>
<td>${o.quantity}</td>
<td>$${o.total_amount}</td>
<td>${o.status}</td>

</tr>

`

})

html+=`</tbody></table>`

parent.innerHTML+=html

}

}