from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import httpx
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = "4c3d763d4352b33ddf90b27b9a9f69d9";
BASE_URL1 = "https://api.openweathermap.org/data/2.5/weather";
BASE_URL2 = "https://api.openweathermap.org/data/2.5/forecast";
BASE_URL3 = "https://api.openweathermap.org/data/2.5/air_pollution";

static_dir = os.path.join(os.path.dirname(__file__), "..", "static")

app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Root route → serve index.html
@app.get("/")
async def serve_index():
    return FileResponse(os.path.join("static", "index.html"))


@app.get("/weather_current/{city}")
async def get_current_weather(city: str):
    params = {
        "q": city,
        "appid": API_KEY,
        "units": "metric"  
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(BASE_URL1, params=params)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f"Error from OpenWeather: {response.text}")
    api_data = response.json()
    return api_data

# url2 = `${BASE_URL2}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
@app.get("/weather_forecast/{lon}/{lat}")
async def get_forecast(lon : str, lat : str):
    params = {
        "lat" : lat,
        "lon" : lon,
        "appid" : API_KEY,
        "units" : "metric"
    }
    async with httpx.AsyncClient() as client:
        forecast_response = await client.get(BASE_URL2, params=params)
    forecast_data = forecast_response.json()
    return forecast_data

#let url3 = `${BASE_URL3}?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
@app.get("/aqi_data/{lon}/{lat}")
async def get_aqi_data(lon : str, lat : str):
    params = {
        "lat" : lat,
        "lon" : lon,
        "appid" : API_KEY,
        "units" : "metric"
    }
    async with httpx.AsyncClient() as client:
        aqi_response = await client.get(BASE_URL3, params=params)
    aqi_data = aqi_response.json()

    return aqi_data