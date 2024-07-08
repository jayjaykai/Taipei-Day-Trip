from mysql.connector.pooling import MySQLConnectionPool
from mysql.connector import Error
import os
from dotenv import load_dotenv
import redis

load_dotenv()

class DBConfig:
    def __init__(self):
        self.pool = None
        # self.redis_client = None

    def initialize_mysql_pool(self):
        print("DB_HOST:", os.getenv("DB_HOST"))
        print("DB_USER:", os.getenv("DB_USER"))
        print("DB_PASSWORD:", os.getenv("DB_PASSWORD"))
        print("DB_NAME:", os.getenv("DB_NAME"))

        pool_size_str = os.getenv("POOL_SIZE")
        pool_size = 5 if pool_size_str is None else int(pool_size_str)

        self.pool = MySQLConnectionPool(
            pool_size=pool_size,
            host=os.getenv("DB_HOST"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            port=3306
        )

    def close_connection_pool(self):
        if self.pool:
            self.pool.close()

    def connect_mysql_server(self):
        if self.pool is None:
            self.initialize_mysql_pool()
        try:
            con = self.pool.get_connection()
            if con.is_connected():
                cursor = con.cursor()
                return con, cursor
            else:
                print("資料庫連線未成功")
                return None, None
        except Error as e:
            print("資料庫連線失敗:", e)
            return None, None

db = DBConfig()
