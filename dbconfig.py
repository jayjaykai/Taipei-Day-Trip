from mysql.connector.pooling import MySQLConnectionPool
from mysql.connector import Error
import os
from dotenv import load_dotenv
import redis

load_dotenv()

class DBConfig:
    def __init__(self):
        self.pool = None
        self.redis_client = None

    def initialize_mysql_pool(self):
        print("DB_HOST:", os.getenv("DB_HOST"))
        print("DB_USER:", os.getenv("DB_USER"))
        print("DB_PASSWORD:", os.getenv("DB_PASSWORD"))
        print("DB_NAME:", os.getenv("DB_NAME"))

        pool_size_str = os.getenv("POOL_SIZE")
        pool_size = 5 if pool_size_str is None else int(pool_size_str)

        self.pool = MySQLConnectionPool(
            host=os.getenv("DB_HOST"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            pool_size=pool_size
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

    def create_redis_client(self):
        redis_host = os.getenv("REDIS_HOST", "localhost")
        redis_port = int(os.getenv("REDIS_PORT", 6379))
        redis_password = os.getenv("REDIS_PASSWORD", None)

        try:
            client = redis.StrictRedis(
                host=redis_host,
                port=redis_port,
                password=redis_password,
                decode_responses=True
            )
            client.ping()
            print("Redis client done!")
            self.redis_client = client
        except redis.ConnectionError:
            print("Redis is None!")
            self.redis_client = None

    def is_redis_available(self):
        if self.redis_client is None:
            self.initialize_redis_client()
        if self.redis_client is None:
            return False
        try:
            self.redis_client.ping()
            return True
        except redis.ConnectionError:
            self.redis_client = None
            return False

db = DBConfig()
