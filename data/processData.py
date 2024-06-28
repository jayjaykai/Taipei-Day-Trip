import os
import json
import mysql.connector
from dotenv import load_dotenv

load_dotenv()
# load_dotenv('/home/ubuntu/tdt/.env')

print("DB_HOST:", os.getenv("DB_HOST"))
print("DB_USER:", os.getenv("DB_USER"))
print("DB_PASSWORD:", os.getenv("DB_PASSWORD"))
print("DB_NAME:", os.getenv("DB_NAME"))

# 連接 MySQL 數據庫
db = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    database=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD")
)


cursor = db.cursor()

json_file_path = 'data/taipei-attractions.json'
# json_file_path = '/home/ubuntu/tdt/data/taipei-attractions.json'
# 讀取 JSON 資料
with open(json_file_path, 'r', encoding='utf-8') as file:
    data = json.load(file)

# 過濾圖片 URL，只保留 JPG/jpg 或 PNG/png 結尾的 URL
def filter_image_urls(file_str):
    urls = file_str.split('https://')
    valid_urls = []
    for url in urls:
        if url.lower().endswith(('jpg', 'png')):
            file_name = url.split('/')[-1]
            valid_urls.append('https://dj5na48zn0ceq.cloudfront.net/' + file_name)
            # valid_urls.append('https://' + url)
    return ','.join(valid_urls)

# 插入資料到 MySQL
for attraction in data["result"]["results"]:
    image_urls = filter_image_urls(attraction["file"])
    # print(attraction["name"])
    # print(image_urls)
    cursor.execute("""
    INSERT INTO Attraction (id, name, category, description, address, transport, mrt, lat, lng, images, rate, avBegin, avEnd)
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