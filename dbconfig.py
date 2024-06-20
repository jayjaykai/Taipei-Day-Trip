from mysql.connector.pooling import MySQLConnectionPool
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

print("DB_HOST:", os.getenv("DB_HOST"))
print("DB_USER:", os.getenv("DB_USER"))
print("DB_PASSWORD:", os.getenv("DB_PASSWORD"))
print("DB_NAME:", os.getenv("DB_NAME"))

pool_size_str = os.getenv("POOL_SIZE")
if pool_size_str is None:
    pool_size = 5  
else:
    pool_size = int(pool_size_str)

pool = MySQLConnectionPool(
    host=os.getenv("DB_HOST"),
    database=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    pool_size=pool_size)

#程式關閉或登出後將Connection Pool關閉
def close_connection_pool():
    pool.close()

def connectMySQLserver():
    try:
        con = pool.get_connection()
        if con.is_connected():
            cursor = con.cursor()
            # print("資料庫連線成功")
            return con, cursor
        else:
            print("資料庫連線未成功")
            return None, None 
    
    except Error as e:
        print("資料庫連線失敗:", e)
        return None, None

db = connectMySQLserver
db_close = close_connection_pool