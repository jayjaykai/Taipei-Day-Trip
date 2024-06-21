from typing import Optional, Union
from dbconfig import db
from fastapi import *
from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from jose import ExpiredSignatureError, JWTError
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
import hashlib
import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from datetime import datetime, timedelta, timezone
import requests
import json

secret_key="dfjewkjfejwfjiewfjoewjfioewjf"

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
load_dotenv()

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

# TapPay setting
TAPPAY_API_URL = os.getenv("TAPPAY_API_URL")
TAPPAY_PARTNER_KEY = os.getenv("TAPPAY_PARTNER_KEY")
TAPPAY_MERCHANT_ID = os.getenv("TAPPAY_MERCHANT_ID")

# print("TAPPAY_API_URL", os.getenv("TAPPAY_API_URL"))

# # Redis
# redis_host = os.getenv("REDIS_HOST", "localhost")
# redis_port = int(os.getenv("REDIS_PORT", 6379))
# redis_password = os.getenv("REDIS_PASSWORD", None)
# redis_client = None
# # Connect to Redis server
# def create_redis_client():
#     try:
#         client = redis.StrictRedis(host=redis_host, port=redis_port, password=redis_password, decode_responses=True)
#         client.ping()
#         print("Redis client done!")
#         return client
#     except redis.ConnectionError:
#         print("Redis is None!")
#         return None
# redis_client=create_redis_client()
# def is_redis_available():
#     global redis_client
#     if redis_client is None:
#         return False
#     try:
#         redis_client.ping()
#         return True
#     except redis.ConnectionError:
#         redis_client = None
#         return False

# JWT setting
SECRET_KEY = "sfegrehrtwerwet54h5jtyfgdfgergerg"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/user/auth")

# 自定義User資料 model
class User(BaseModel):
    email: EmailStr
    password: str
    
class SignOnInfo(BaseModel):
    name: str
    email: EmailStr
    password: str

class TokenData(BaseModel):
    userID: str
    name: str
    email: str    

class BookingData(BaseModel):
    attraction_id: int
    date: Optional[str] = None
    travel_time: str
    tour_price: int

#*** TapPay data ***
class Attraction(BaseModel):
    id: int
    name: str
    address: str
    image: str

class Trip(BaseModel):
    attraction: Attraction
    date: str
    time: str

class Contact(BaseModel):
    name: str
    email: EmailStr
    phone: str

class Order(BaseModel):
    price: int
    trip: Trip
    contact: Contact

class PaymentRequest(BaseModel):
    prime: str = Field(...)
    order: Order
#*** TapPay data ***

def hash_password(text):
    mode = hashlib.sha256()
    mode.update((text+secret_key).encode())
    return mode.hexdigest()

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_jwt_token(token: str = Depends(oauth2_scheme)) -> Union[TokenData, JSONResponse]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("userID")
        username: str = payload.get("username")
        email: str = payload.get("email")
        if user_id is None or username is None or email is None:
            return JSONResponse(
                status_code=403,
                content={"error": True, "message": "未登入系統，拒絕存取"}
            )
        return TokenData(userID=user_id, name=username, email=email)
    except ExpiredSignatureError:
        return JSONResponse(
            status_code=403,
            content={"error": True, "message": "未登入系統，拒絕存取"}
        )
    except JWTError:
        return JSONResponse(
            status_code=403,
            content={"error": True, "message": "未登入系統，拒絕存取"}
        )
    except Exception as e:
        return JSONResponse(
            # status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            # content={"error": True, "message": f"Unexpected error: {str(e)}"}
            status_code=403,
            content={"error": True, "message": "未登入系統，拒絕存取"}
        )

# def verify_jwt_token(token: str = Depends(oauth2_scheme)) -> TokenData:
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_403_FORBIDDEN,
#         detail="未登入系統，拒絕存取",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         user_id: str = payload.get("userID")
#         username: str = payload.get("username")
#         email: str = payload.get("email")
#         if user_id is None or username is None or email is None:
#             raise credentials_exception
#         return TokenData(userID=user_id, name=username, email=email)
#     except (ExpiredSignatureError, JWTError):
#         raise credentials_exception
    
@app.put("/api/user/auth")
async def login(user: User):
    con, cursor = db.connect_mysql_server()
    if cursor is not None:
        try:
            # print(user.email)
            # print(user.password)
            # print(hash_password(user.password))
            cursor.execute("select id,name,email from User where email = %s and password = %s", (user.email, hash_password(user.password)))
            data = cursor.fetchone()

            if data:
                print(f"User: {data[0]}")
                print(f"User email: {user.email}")
                access_token = create_access_token(
                    data={"userID": str(data[0]), "username": data[1], "email": data[2]}, expires_delta = timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
                )
                return {"token": access_token}
            else:
                return JSONResponse(status_code=400, content={"error": True, "message": "登入失敗，帳號或密碼錯誤或其他原因"})
        except Exception as err:
            return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
        finally:
            con.close()
    else:
        return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"error": True, "message": "Email格式有誤，請檢查輸入的格式和內容"}
    )

@app.post("/api/user")
async def signOn(user: SignOnInfo):
    con, cursor = db.connect_mysql_server()
    if cursor is not None:
        try:
            # print(user.name)
            # print(user.email)
            # print(user.password)
            cursor.execute("select name from User where email = %s", (user.email,))
            data = cursor.fetchone()
            if data:
                return JSONResponse(status_code=400, content={"error": True, "message": "註冊失敗，重複的 Email 或其他原因"})
            else:
                hashed_pwd = hash_password(user.password)
                cursor.execute("insert into User(name, email, password) values(%s, %s, %s)", (user.name, user.email, hashed_pwd))
                con.commit()
                return JSONResponse(status_code=200, content={"ok": True})
        except Exception as err:
            return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
        finally:
            con.close()
    else:
        return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})

@app.get("/api/user/auth")
async def checkUser(token_data: TokenData = Depends(verify_jwt_token)) :
    # print(token_data)
    # 判斷 token_data 是不是 JSONResponse 資料型態，如果是直接返回，如果是正常的資料繼續往下走
    if isinstance(token_data, JSONResponse):
        return token_data
    result = {
                "id": token_data.userID,
                "name": token_data.name,
                "email": token_data.email
            }

    return {"data": result}

@app.post("/api/booking")
async def bookEvent(booking_data: BookingData, token_data: TokenData = Depends(verify_jwt_token)):
    if isinstance(token_data, JSONResponse):
        return token_data
    con, cursor = db.connect_mysql_server()
    if cursor is not None:
        try: 
            cursor.execute("insert into Booking(attractionId, userId, date, timeSlot, price) values(%s, %s, %s, %s, %s)", 
                           (booking_data.attraction_id,
                            token_data.userID,
                            booking_data.date if booking_data.date else None, 
                            booking_data.travel_time, 
                            booking_data.tour_price))
            con.commit()
            return JSONResponse(status_code=200, content={"ok": True})
        except Exception as err:
            return JSONResponse(status_code=400, content={"error": True, "message": "建立失敗，輸入不正確或其他原因"})
        finally:
            con.close()
    else:
        return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
    
@app.get("/api/booking")
async def getEvent(token_data: TokenData = Depends(verify_jwt_token)):
    if isinstance(token_data, JSONResponse):
        return token_data
    con, cursor = db.connect_mysql_server()
    if cursor is not None:
        try:
            Result = [] 
            attractionResult = []
            # 先取得 Booking 內的資料
            cursor.execute("select attractionId, date, timeSlot, price from Booking where userId = %s", (token_data.userID,))
            bookingData = cursor.fetchone()
            # print(bookingData)
            if bookingData:
                cursor.fetchall()
                # 再取得 Attraction 內的資料
                cursor.execute("select id, name, address, images from Attraction where id = %s", (bookingData[0],))
                attractionData = cursor.fetchone()
                # print(attractionData)

                images = []
                urls = attractionData[3].split(',')
                for url in urls:
                    if url.lower().endswith(('jpg', 'png')):
                        images.append(url)

                if attractionData:
                    attractionResult= {
                        "id": attractionData[0],
                        "name": attractionData[1],
                        "address": attractionData[2],
                        "image": images[0]
                    }

                    Result = {
                        "attraction": attractionResult,
                        "date": bookingData[1],
                        "time": bookingData[2],
                        "price": bookingData[3]
                    }

                    # print(Result)
            return JSONResponse(status_code=200, content={"data": Result})
        except Exception as err:
            return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
        finally:
            con.close()
    else:
        return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})    

@app.delete("/api/booking")
async def deleteEvent(token_data: TokenData = Depends(verify_jwt_token)):
    if isinstance(token_data, JSONResponse):
        return token_data
    con, cursor = db.connect_mysql_server()
    if cursor is not None:
        try: 
             # 先取得 Booking 內的資料
            cursor.execute("select attractionId from Booking where userId = %s", (token_data.userID,))
            bookingData = cursor.fetchone()
            print(bookingData)
            if bookingData:
                cursor.fetchall()
                cursor.execute("delete from Booking where userId = %s and attractionId = %s", (token_data.userID, bookingData[0]))
                con.commit()
            return JSONResponse(status_code=200, content={"ok": True})
        except Exception as err:
            return JSONResponse(status_code=400, content={"error": True, "message": "建立失敗，輸入不正確或其他原因"})
        finally:
            con.close()
    else:
        return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})

@app.post("/api/orders")
async def create_order(payment_request: PaymentRequest, token_data: TokenData = Depends(verify_jwt_token)):
    if isinstance(token_data, JSONResponse):
        return token_data
    # print("payment_request", payment_request)
    try:
        # 整理支付請求資料
        contact = {
            "name": payment_request.order.contact.name,
            "email": payment_request.order.contact.email,
            "phone_number": payment_request.order.contact.phone,
        }

        payload = {
            "prime": payment_request.prime,
            "partner_key": TAPPAY_PARTNER_KEY,
            "merchant_id": TAPPAY_MERCHANT_ID,
            "amount": payment_request.order.price,
            "currency": "TWD",
            "details": "Payment testing for attraction trip",
            "cardholder": contact
        }

        headers = {
            "Content-Type": "application/json",
            "x-api-key": TAPPAY_PARTNER_KEY
        }
        response = requests.post(TAPPAY_API_URL, json=payload, headers=headers)
        # print(response.json())
        # print(response.json()['rec_trade_id'])
        # print(response.json()['status'])
        # print(response.json()['msg'])
        Result = {
            "number": response.json()['rec_trade_id'],
            "payment": {
                "status":response.json()['status'],
                "message":response.json()['msg']
            }
        }
        if response.status_code == 200:
            return JSONResponse(status_code=200, content={"data": Result})
        else:
            raise JSONResponse(status_code=400, content={"error": True, "message": "訂單建立失敗，輸入不正確或其他原因"})
    except Exception:
        return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
    
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
    con, cursor = db.connect_mysql_server()
    if cursor is not None:
       try:
            offset = page * 12
            query = "SELECT * FROM Attraction"
            params = []
            
            if keyword:
                query += " WHERE name LIKE %s OR mrt = %s"
                params.extend([f"%{keyword}%", keyword])
                
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
       except Exception as err:
            return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
       finally:
            con.close()
    else:
        return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
    
@app.get("/api/attraction/{attractionId}")
def get_attraction(attractionId: int):
    cache_key = f"attraction:{attractionId}"

    if db.is_redis_available():
        cached_result = db.redis_client.get(cache_key)
        if cached_result:
            print("Use Redis Cache!")
            # print(cached_result)
            return JSONResponse(status_code=200, content={"data": json.loads(cached_result)})
    
    con, cursor = db.connect_mysql_server()
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

            if db.is_redis_available():
                # redis_client.setex(cache_key, timedelta(minutes=10), json.dumps(result))
                db.redis_client.set(cache_key, json.dumps(result), ex=300)
            return {"data": result}
        except Exception as err:
            return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
        finally:
            con.close()
    else:
        return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
        #return {"error": True, "message": "無法連接到資料庫"}

@app.get("/api/mrts")
def get_mrts():
    con, cursor = db.connect_mysql_server()
    if cursor is not None:
        try:
            cursor.execute("SELECT mrt, count(mrt) FROM Attraction GROUP BY mrt ORDER BY count(mrt) DESC")
            rows = cursor.fetchall()
            mrts = []
            for row in rows:
                if row[0] is not None:
                    mrts.append(row[0])
            return mrts
        except Exception as err:
            return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
        finally:
            con.close()
    else:
        return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})