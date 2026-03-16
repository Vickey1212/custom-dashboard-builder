import sqlite3

conn = sqlite3.connect('../database.db')
c = conn.cursor()

c.execute('''

CREATE TABLE IF NOT EXISTS customer_orders (
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

''')

c.execute('''

CREATE TABLE IF NOT EXISTS dashboard_widgets (
id INTEGER PRIMARY KEY AUTOINCREMENT,
widget_type TEXT,
config TEXT,
pos_x INTEGER,
pos_y INTEGER,
width INTEGER,
height INTEGER

)

''')

conn.commit()
conn.close()

print("Database created successfully")