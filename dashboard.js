const API_KEY = "4c3d763d4352b33ddf90b27b9a9f69d9";

const BASE_URL1 = "https://api.openweathermap.org/data/2.5/weather";
const BASE_URL2 = "https://api.openweathermap.org/data/2.5/forecast";
const BASE_URL3 = "https://api.openweathermap.org/data/2.5/air_pollution";

function dateFormat(timestamp){
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
}
function formatTime(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}
async function getWeather() {
    const city = document.getElementsByClassName("inputfeild")[0].value;
    if (!city) return alert("Please enter a city!");
    document.getElementById("mainContentParentDiv").style.display = "none"; 
    document.getElementById("loader").style.display = "block";
    // current data fetch
    const url1 = `${BASE_URL1}?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        let response = await fetch(url1);
        if (!response.ok) {
            document.getElementById("loader").style.display = "none";
            document.getElementById("mainContentParentDiv").style.display = "flex"; 
            document.getElementById("cityName").innerText = "City not found!";
            document.getElementById("cityTemp").innerText = "";
            document.getElementById("cityDescription").innerText = "";
            document.getElementById("weatherIcon").src = ""; 
            document.getElementById("sunrise_time").innerText = "";
            document.getElementById("sunset_time").innerText = "";
            document.getElementById("AQI_heading").innerText = "";
            document.getElementById("AQI_desc").innerText = "";
        return;
        }


        let data = await response.json();
        setTimeout(async () => {
            document.getElementById("loader").style.display = "none";
            document.getElementById("mainContentParentDiv").style.display = "flex"; 
            let lat = data.coord.lat;
            let lon = data.coord.lon;
            let response_city_name = data.name;
            let response_country_name = data.sys.country;
            let response_temp = data.main.temp;
            let response_sky_desc = data.weather[0].description;
            let sunrise = formatTime(data.sys.sunrise);
            let sunset = formatTime(data.sys.sunset);
            let iconCode = data.weather[0].icon;
            let iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
            document.getElementById("weatherIcon").src = iconUrl; 
            document.getElementById("cityName").innerHTML = `${response_city_name}, ${response_country_name} `;
            document.getElementById("cityTemp").innerHTML = `${response_temp} &deg; C`;
            document.getElementById("cityDescription").innerText = response_sky_desc;
            document.getElementById("sunrise_time").innerText = sunrise;
            document.getElementById("sunset_time").innerText = sunset;
            let now = new Date();
            let todayDate = now.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
            let todayTime = now.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
        
            document.getElementById("tdate").innerText = todayDate;
            document.getElementById("ttime").innerText = todayTime;
            // forecast data fetch
            let url2 = `${BASE_URL2}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
            let forecast_response = await fetch(url2);
            let forecast_data = await forecast_response.json();
            let noonforecasts = forecast_data.list.filter(item => item.dt_txt.includes("12:00:00"));
            
            for (let i = 1; i <= 4; i++) {
                let forecast = noonforecasts[i];
                let dateObj = new Date(forecast.dt_txt);
                document.getElementById(`day_temp_${i}`).innerHTML = `${forecast.main.temp}&deg;C`;
                document.getElementById(`day_name_${i}`).innerText = dateObj.toLocaleDateString("en-US", { weekday: "long" });
                document.getElementById(`date_${i}`).innerText = dateObj.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).replace(",", "");
                let iconCode = forecast.weather[0].icon;
                let iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
                document.getElementById(`day_icon_${i}`).src = iconUrl;
            }
            //AQI data fetch
            let url3 = `${BASE_URL3}?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
            let aqi_response = await fetch(url3);
            let aqi_data = await aqi_response.json();
            let aqiIndex = aqi_data.list[0].main.aqi;
            function getAQIText(aqiIndex) {
                if (aqiIndex === 1) return "Good";
                if (aqiIndex === 2) return "Fair";
                if (aqiIndex === 3) return "Moderate";
                if (aqiIndex === 4) return "Poor";
                if (aqiIndex === 5) return "Very Poor";
                return "Unknown";
                }
                document.getElementById("AQI_heading").innerHTML = ` Air Quality Index (AQI) : ${aqiIndex} `;
                document.getElementById("AQI_desc").innerHTML = getAQIText(aqiIndex);
        }, 1000);

    } catch (err) {
        console.error("Error fetching weather:", err);
        document.getElementById("loader").style.display = "none";
    }
}
