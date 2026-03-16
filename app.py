from flask import Flask, render_template, request, redirect, url_for, jsonify
import sqlite3
import json

app = Flask(__name__)

DATABASE = "database.db"


# -----------------------------
# DATABASE CONNECTION
# -----------------------------

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


# -----------------------------
# INITIALIZE DATABASE
# -----------------------------

def init_db():

    conn = get_db()
    c = conn.cursor()

    # Customer Orders Table
    c.execute("""
        CREATE TABLE IF NOT EXISTS customer_orders(

        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        postal TEXT,
        country TEXT,
        product TEXT,
        quantity INTEGER,
        unit_price REAL,
        total_amount REAL,
        status TEXT,
        created_by TEXT,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP

        )
        """)

    # Dashboard Widgets Layout
    c.execute("""
    CREATE TABLE IF NOT EXISTS dashboard_widgets(

        id INTEGER PRIMARY KEY AUTOINCREMENT,
        widget_type TEXT,
        config TEXT

    )
    """)

    conn.commit()
    conn.close()


init_db()


# -----------------------------
# PAGES
# -----------------------------

@app.route("/")
def dashboard():
    return render_template("dashboard.html")


@app.route("/builder")
def builder():
    return render_template("builder.html")


@app.route("/orders")
def orders():

    conn = get_db()
    orders = conn.execute(
        "SELECT * FROM customer_orders ORDER BY id DESC"
    ).fetchall()
    conn.close()

    return render_template("orders.html", orders=orders)


# -----------------------------
# CREATE ORDER
# -----------------------------

@app.route("/create-order", methods=["GET", "POST"])
def create_order():

    if request.method == "POST":

        quantity = int(request.form["quantity"])
        unit_price = float(request.form["unit_price"])
        total = quantity * unit_price

        conn = get_db()

        conn.execute("""
        INSERT INTO customer_orders

        (first_name,last_name,email,phone,address,city,state,postal,country,
        product,quantity,unit_price,total_amount,status,created_by)

        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)

        """, (

            request.form["first_name"],
            request.form["last_name"],
            request.form["email"],
            request.form["phone"],
            request.form["address"],
            request.form["city"],
            request.form["state"],
            request.form["postal"],
            request.form["country"],
            request.form["product"],
            quantity,
            unit_price,
            total,
            request.form["status"],
            request.form["created_by"]

        ))

        conn.commit()
        conn.close()

        return redirect("/orders")

    return render_template("create_order.html")


# -----------------------------
# DELETE ORDER
# -----------------------------

@app.route("/delete-order/<int:id>")
def delete_order(id):

    conn = get_db()
    conn.execute(
        "DELETE FROM customer_orders WHERE id=?",
        (id,)
    )

    conn.commit()
    conn.close()

    return redirect("/orders")


# -----------------------------
# EDIT ORDER
# -----------------------------

@app.route("/edit-order/<int:id>", methods=["GET", "POST"])
def edit_order(id):

    conn = get_db()

    if request.method == "POST":

        quantity = int(request.form["quantity"])
        unit_price = float(request.form["unit_price"])
        total = quantity * unit_price

        conn.execute("""

        UPDATE customer_orders

        SET first_name=?,
            last_name=?,
            email=?,
            phone=?,
            address=?,
            city=?,
            state=?,
            postal=?,
            country=?,
            product=?,
            quantity=?,
            unit_price=?,
            total_amount=?,
            status=?,
            created_by=?

        WHERE id=?

        """, (

            request.form["first_name"],
            request.form["last_name"],
            request.form["email"],
            request.form["phone"],
            request.form["address"],
            request.form["city"],
            request.form["state"],
            request.form["postal"],
            request.form["country"],
            request.form["product"],
            quantity,
            unit_price,
            total,
            request.form["status"],
            request.form["created_by"],
            id

        ))

        conn.commit()
        conn.close()

        return redirect("/orders")

    order = conn.execute(
        "SELECT * FROM customer_orders WHERE id=?",
        (id,)
    ).fetchone()

    conn.close()

    return render_template("edit_order.html", order=order)


# -----------------------------
# API - GET ORDERS
# -----------------------------

@app.route("/api/orders")
def api_orders():

    date_range = request.args.get("range","all")

    conn = get_db()

    if date_range == "today":

        rows = conn.execute("""

        SELECT * FROM customer_orders
        WHERE DATE(order_date)=DATE('now')

        """).fetchall()

    elif date_range == "7":

        rows = conn.execute("""

        SELECT * FROM customer_orders
        WHERE order_date >= DATE('now','-7 day')

        """).fetchall()

    elif date_range == "30":

        rows = conn.execute("""

        SELECT * FROM customer_orders
        WHERE order_date >= DATE('now','-30 day')

        """).fetchall()

    elif date_range == "90":

        rows = conn.execute("""

        SELECT * FROM customer_orders
        WHERE order_date >= DATE('now','-90 day')

        """).fetchall()

    else:

        rows = conn.execute(
        "SELECT * FROM customer_orders"
        ).fetchall()

    conn.close()

    return jsonify([dict(r) for r in rows])

# -----------------------------
# SAVE DASHBOARD LAYOUT
# -----------------------------

@app.route("/api/layout", methods=["POST"])
def save_layout():

    layout = request.json

    conn = get_db()
    c = conn.cursor()

    c.execute("DELETE FROM dashboard_widgets")

    for w in layout:

        c.execute(
            "INSERT INTO dashboard_widgets(widget_type,config) VALUES (?,?)",
            (w["type"], json.dumps(w))
        )

    conn.commit()
    conn.close()

    return jsonify({"status": "saved"})


# -----------------------------
# LOAD DASHBOARD LAYOUT
# -----------------------------

@app.route("/api/layout")
def load_layout():

    conn = get_db()
    c = conn.cursor()

    rows = c.execute(
        "SELECT * FROM dashboard_widgets"
    ).fetchall()

    conn.close()

    data = []

    for r in rows:
        data.append(json.loads(r["config"]))

    return jsonify(data)


# -----------------------------
# RUN APP
# -----------------------------

if __name__ == "__main__":
    app.run(debug=True)