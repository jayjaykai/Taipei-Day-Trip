import os
import json
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

# 連接 MySQL 數據庫
db = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    database=os.getenv("DB_DATABASE"),
    user=os.getenv("USER"),
    password=os.getenv("PASSWORD")
)


cursor = db.cursor()

# 讀取 JSON 資料
with open('data\\taipei-attractions.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# 過濾圖片 URL，只保留 JPG/jpg 或 PNG/png 結尾的 URL
def filter_image_urls(file_str):
    urls = file_str.split('https://')
    valid_urls = []
    for url in urls:
        if url.lower().endswith(('jpg', 'png')):
            valid_urls.append('https://' + url)
    return ','.join(valid_urls)

# 插入資料到 MySQL
for attraction in data["result"]["results"]:
    image_urls = filter_image_urls(attraction["file"])
    # print(attraction["name"])
    # print(image_urls)
    cursor.execute("""
    INSERT INTO attraction (id, name, category, description, address, transport, mrt, lat, lng, images, rate, avBegin, avEnd)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        attraction["_id"],
        attraction["name"],
        attraction["CAT"],
        attraction["description"],
        attraction["address"],
        attraction["direction"],
        attraction["MRT"],
        float(attraction["latitude"]),
        float(attraction["longitude"]),
        image_urls,
        attraction["rate"],
        attraction["avBegin"].replace("/", "-"),
        attraction["avEnd"].replace("/", "-")
    ))

db.commit()
cursor.close()
db.close()
