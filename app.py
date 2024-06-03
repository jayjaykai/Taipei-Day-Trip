from typing import Optional
from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
from mysql.connector.pooling import MySQLConnectionPool
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.mount("/home/ubuntu/tdt/static", StaticFiles(directory="static"), name="static")
# load_dotenv()
load_dotenv('/home/ubuntu/tdt/.env')
# 設定可存取資源的來源端點
origins = [
    "http://127.0.0.1:8000",
    "http://localhost:8000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # 允許所有HTTP方法
    allow_headers=["*"],  # 允許所有HTTP headers
)


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

#*** Static Pages (Never Modify Code in this Block) ***
@app.get("/", include_in_schema=False)
async def index(request: Request):
	return FileResponse("./static/index.html", media_type="text/html")
@app.get("/attraction/{id}", include_in_schema=False)
async def attraction(request: Request, id: int):
	return FileResponse("./static/attraction.html", media_type="text/html")
@app.get("/booking", include_in_schema=False)
async def booking(request: Request):
	return FileResponse("./static/booking.html", media_type="text/html")
@app.get("/thankyou", include_in_schema=False)
async def thankyou(request: Request):
	return FileResponse("./static/thankyou.html", media_type="text/html")
#*** Static Pages (Never Modify Code in this Block) ***

@app.get("/api/attractions")
def get_attractions(page: int = 0, keyword: Optional[str] = Query(None)):
    con, cursor = connectMySQLserver()
    if cursor is not None:
       try:
            offset = page * 12
            query = "SELECT * FROM Attraction"
            params = []
            
            if keyword:
                query += " WHERE name LIKE %s OR mrt = %s"
                params.extend([f"{keyword}%", keyword])
                
            query += " LIMIT %s OFFSET %s"
            params.extend([12, offset])
            
            print(query)
            cursor.execute(query, tuple(params))
            attractions = cursor.fetchall()
            
            if not attractions:
                return {"nextPage": None, "data": []}
            
            if len(attractions) == 12:
                next_page = page + 1
            else:
                next_page = None
            
            result = []
            for attraction in attractions:
                images = []
                id, name, category, description, address, direction, mrt, latitude, longitude, image_urls, rate, avBegin, avEnd = attraction
                if image_urls:
                    urls = image_urls.split(',')
                    for url in urls:
                        if url.lower().endswith(('jpg', 'png')):
                            images.append(url)
                else:
                    images = []

                result.append({
                    "id": id,
                    "name": name,
                    "category": category,
                    "description": description,
                    "address": address,
                    "transport": direction,
                    "mrt": mrt,
                    "lat": latitude,
                    "lng": longitude,
                    "images": images
                })
            
            return {"nextPage": next_page, "data": result}
       except mysql.connector.Error as err:
            return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
       finally:
            con.close()
    else:
        return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
    
@app.get("/api/attraction/{attractionId}")
def get_attraction(attractionId: int):
    con, cursor = connectMySQLserver()
    if cursor is not None:
        try:
            cursor.execute("SELECT * FROM Attraction WHERE id = %s", (attractionId,))
            attraction = cursor.fetchone()
            
            if not attraction:
                return JSONResponse(status_code=400, content={"error": True, "message": "景點編號不正確"})
                #return {"error": True,"message": "景點編號不正確"}

            id, name, category, description, address, direction, mrt, latitude, longitude, image_urls, rate, avBegin, avEnd = attraction
            result = []
            if image_urls:
                images = []
                urls = image_urls.split(',')
                for url in urls:
                    if url.lower().endswith(('jpg', 'png')):
                        images.append(url)
            else:
                images = []

            result = {
                "id": id,
                "name": name,
                "category": category,
                "description": description,
                "address": address,
                "transport": direction,
                "mrt": mrt,
                "lat": latitude,
                "lng": longitude,
                "images": images
            }

            return {"data": result}
        except mysql.connector.Error as err:
            return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
        finally:
            con.close()
    else:
        return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
        #return {"error": True, "message": "無法連接到資料庫"}

@app.get("/api/mrts")
def get_mrts():
    con, cursor = connectMySQLserver()
    if cursor is not None:
        try:
            cursor.execute("SELECT mrt, count(mrt) FROM Attraction GROUP BY mrt ORDER BY count(mrt) DESC")
            rows = cursor.fetchall()
            mrts = []
            for row in rows:
                if row[0] is not None:
                    mrts.append(row[0])
            return mrts
        except mysql.connector.Error as err:
            return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
        finally:
            con.close()
    else:
        return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
    
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