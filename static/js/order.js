async function submitOrder(){

let orderData = {

first_name: document.getElementById("first_name").value,
last_name: document.getElementById("last_name").value,
email: document.getElementById("email").value,
phone: document.getElementById("phone").value,
address: document.getElementById("address").value,
city: document.getElementById("city").value,
state: document.getElementById("state").value,
postal: document.getElementById("postal").value,
country: document.getElementById("country").value,
product: document.getElementById("product").value,
quantity: document.getElementById("quantity").value,
unit_price: document.getElementById("unit_price").value,
status: document.getElementById("status").value,
created_by: document.getElementById("created_by").value

}

try{

let response = await fetch("/api/orders",{

method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(orderData)

})

let result = await response.json()

alert(result.message || result.error)

loadOrders()

}catch(error){

alert("Failed to create order")

}

}