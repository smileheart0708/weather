class WeatherApp {
    constructor() {
        this.currentCity = '福清';
        this.initializeElements();
        this.bindEvents();
        this.loadWeatherData();
    }

    initializeElements() {
        this.elements = {
            // 搜索相关
            cityInput: document.getElementById('cityInput'),
            searchBtn: document.getElementById('searchBtn'),
            
            // 当前天气
            cityName: document.getElementById('cityName'),
            updateTime: document.getElementById('updateTime'),
            currentTemp: document.getElementById('currentTemp'),
            feelsLike: document.getElementById('feelsLike'),
            weatherDesc: document.getElementById('weatherDesc'),
            weatherIconMain: document.getElementById('weatherIconMain'),
            
            // 详细信息
            humidity: document.getElementById('humidity'),
            windDirection: document.getElementById('windDirection'),
            visibility: document.getElementById('visibility'),
            pressure: document.getElementById('pressure'),
            
            // 空气质量
            aqiValue: document.getElementById('aqiValue'),
            aqiLabel: document.getElementById('aqiLabel'),
            pm25Value: document.getElementById('pm25Value'),
            
            // 生活指数
            clothingLevel: document.getElementById('clothingLevel'),
            clothingDesc: document.getElementById('clothingDesc'),
            umbrellaLevel: document.getElementById('umbrellaLevel'),
            umbrellaDesc: document.getElementById('umbrellaDesc'),
            uvLevel: document.getElementById('uvLevel'),
            uvDesc: document.getElementById('uvDesc'),
            sportLevel: document.getElementById('sportLevel'),
            sportDesc: document.getElementById('sportDesc'),
            carWashLevel: document.getElementById('carWashLevel'),
            carWashDesc: document.getElementById('carWashDesc'),
            travelLevel: document.getElementById('travelLevel'),
            travelDesc: document.getElementById('travelDesc'),
            
            // 预报
            forecastGrid: document.getElementById('forecastGrid'),
            
            // 加载动画
            loadingSpinner: document.getElementById('loadingSpinner')
        };
    }

    bindEvents() {
        this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
        this.elements.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
    }

    handleSearch() {
        const city = this.elements.cityInput.value.trim();
        if (city) {
            this.currentCity = city;
            this.loadWeatherData();
        }
    }

    showLoading() {
        this.elements.loadingSpinner.classList.remove('hidden');
    }

    hideLoading() {
        this.elements.loadingSpinner.classList.add('hidden');
    }

    async loadWeatherData() {
        this.showLoading();
        
        try {
            // 并发调用两个API
            const [realtimeData, forecastData] = await Promise.all([
                this.fetchRealtimeWeather(),
                this.fetchForecastWeather()
            ]);

            if (realtimeData && realtimeData.code === 200) {
                this.updateRealtimeWeather(realtimeData.data);
                this.updateBackground(realtimeData.data.realtime.weather);
            }

            if (forecastData && forecastData.code === 200) {
                this.updateForecast(forecastData.data);
            }
        } catch (error) {
            console.error('获取天气数据失败:', error);
            this.showError('获取天气数据失败，请检查网络连接');
        } finally {
            this.hideLoading();
        }
    }

    async fetchRealtimeWeather() {
        const url = `https://60s-cf.viki.moe/v2/weather?query=${encodeURIComponent(this.currentCity)}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('实时天气API调用失败:', error);
            // 如果直接调用失败，尝试使用本地代理
            return this.fetchWithProxy('/api/weather', { city: this.currentCity });
        }
    }

    async fetchForecastWeather() {
        const url = `https://60s-cf.viki.moe/v2/weather/forecast?query=${encodeURIComponent(this.currentCity)}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('天气预报API调用失败:', error);
            // 如果直接调用失败，尝试使用本地代理
            return this.fetchWithProxy('/api/forecast', { city: this.currentCity });
        }
    }

    async fetchWithProxy(endpoint, params) {
        try {
            const response = await fetch(`${endpoint}?${new URLSearchParams(params)}`);
            if (!response.ok) {
                throw new Error(`Proxy API failed: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('代理API调用失败:', error);
            return null;
        }
    }

    updateRealtimeWeather(data) {
        const { location, realtime } = data;
        
        // 更新位置信息
        this.elements.cityName.textContent = location.formatted;
        this.elements.updateTime.textContent = `更新时间：${realtime.updated_at}`;
        
        // 更新温度信息
        const temp = realtime.temperature === 999 ? '--' : `${realtime.temperature}`;
        this.elements.currentTemp.textContent = temp + '°';
        this.elements.feelsLike.textContent = `体感温度：${realtime.temperature_feels_like}°`;
        this.elements.weatherDesc.textContent = realtime.weather;
        
        // 更新天气图标
        this.updateWeatherIcon(realtime.weather_code || realtime.weather);
        
        // 更新详细信息
        this.elements.humidity.textContent = `${realtime.humidity}%`;
        this.elements.windDirection.textContent = realtime.wind_direction;
        this.elements.visibility.textContent = `${realtime.visibility}km`;
        this.elements.pressure.textContent = `${realtime.pressure}hPa`;
        
        // 更新空气质量
        this.elements.aqiValue.textContent = realtime.aqi;
        this.elements.aqiLabel.textContent = this.getAQILabel(realtime.aqi);
        this.elements.pm25Value.textContent = realtime.pm25;
        
        // 更新生活指数
        if (realtime.life_index) {
            const lifeIndex = realtime.life_index;
            
            if (lifeIndex.clothing) {
                this.elements.clothingLevel.textContent = lifeIndex.clothing.level;
                this.elements.clothingDesc.textContent = lifeIndex.clothing.desc;
            }
            
            if (lifeIndex.umbrella) {
                this.elements.umbrellaLevel.textContent = lifeIndex.umbrella.level;
                this.elements.umbrellaDesc.textContent = lifeIndex.umbrella.desc;
            }
            
            if (lifeIndex.uv) {
                this.elements.uvLevel.textContent = lifeIndex.uv.level;
                this.elements.uvDesc.textContent = lifeIndex.uv.desc;
            }
            
            if (lifeIndex.sport) {
                this.elements.sportLevel.textContent = lifeIndex.sport.level;
                this.elements.sportDesc.textContent = lifeIndex.sport.desc;
            }
            
            if (lifeIndex.car_wash) {
                this.elements.carWashLevel.textContent = lifeIndex.car_wash.level;
                this.elements.carWashDesc.textContent = lifeIndex.car_wash.desc;
            }
            
            if (lifeIndex.travel) {
                this.elements.travelLevel.textContent = lifeIndex.travel.level;
                this.elements.travelDesc.textContent = lifeIndex.travel.desc;
            }
        }
    }

    updateForecast(data) {
        if (!data.forecast || !Array.isArray(data.forecast)) {
            console.error('预报数据格式错误');
            return;
        }

        this.elements.forecastGrid.innerHTML = '';
        
        data.forecast.forEach(day => {
            const forecastItem = this.createForecastItem(day);
            this.elements.forecastGrid.appendChild(forecastItem);
        });
    }

    createForecastItem(dayData) {
        const div = document.createElement('div');
        div.className = 'forecast-item';
        
        div.innerHTML = `
            <div class="forecast-date">${dayData.date_desc}</div>
            <div class="forecast-weather">
                ${dayData.weather_day}${dayData.weather_day !== dayData.weather_night ? ' 转 ' + dayData.weather_night : ''}
            </div>
            <div class="forecast-temps">
                <span class="high-temp">${dayData.temperature_high}°</span>
                <span class="low-temp">${dayData.temperature_low}°</span>
            </div>
            <div class="forecast-details">
                <div>风向：${dayData.wind_direction_day}</div>
                <div>风力：${dayData.wind_strength_day}</div>
                <div>湿度：${dayData.humidity}%</div>
                ${dayData.rainfall ? `<div>降水：${dayData.rainfall}mm</div>` : ''}
            </div>
        `;
        
        return div;
    }

    updateWeatherIcon(weatherCode) {
        let iconClass = 'fas fa-cloud';
        
        if (typeof weatherCode === 'string') {
            const weather = weatherCode.toLowerCase();
            if (weather.includes('晴')) {
                iconClass = 'fas fa-sun';
            } else if (weather.includes('雨')) {
                iconClass = 'fas fa-cloud-rain';
            } else if (weather.includes('雪')) {
                iconClass = 'fas fa-snowflake';
            } else if (weather.includes('雷')) {
                iconClass = 'fas fa-bolt';
            } else if (weather.includes('雾') || weather.includes('霾')) {
                iconClass = 'fas fa-smog';
            }
        } else {
            // 处理数字天气代码
            switch (weatherCode) {
                case '00':
                case '0':
                    iconClass = 'fas fa-sun';
                    break;
                case '01':
                case '1':
                    iconClass = 'fas fa-cloud-sun';
                    break;
                case '02':
                case '2':
                case '03':
                case '3':
                    iconClass = 'fas fa-cloud';
                    break;
                case '04':
                case '4':
                case '07':
                case '7':
                    iconClass = 'fas fa-cloud-rain';
                    break;
                case '08':
                case '8':
                    iconClass = 'fas fa-bolt';
                    break;
                case '13':
                case '14':
                case '15':
                    iconClass = 'fas fa-snowflake';
                    break;
                case '18':
                    iconClass = 'fas fa-smog';
                    break;
                default:
                    iconClass = 'fas fa-cloud';
            }
        }
        
        this.elements.weatherIconMain.className = iconClass;
    }

    updateBackground(weather) {
        const body = document.body;
        
        // 移除所有天气class
        body.classList.remove('sunny', 'cloudy', 'rainy', 'snowy', 'foggy', 'thunder');
        
        const weatherLower = weather.toLowerCase();
        
        if (weatherLower.includes('晴')) {
            body.classList.add('sunny');
        } else if (weatherLower.includes('雨') || weatherLower.includes('shower')) {
            body.classList.add('rainy');
        } else if (weatherLower.includes('雪')) {
            body.classList.add('snowy');
        } else if (weatherLower.includes('雷')) {
            body.classList.add('thunder');
        } else if (weatherLower.includes('雾') || weatherLower.includes('霾')) {
            body.classList.add('foggy');
        } else if (weatherLower.includes('云') || weatherLower.includes('阴')) {
            body.classList.add('cloudy');
        } else {
            body.classList.add('cloudy'); // 默认
        }
    }

    getAQILabel(aqi) {
        if (aqi <= 50) return '优';
        if (aqi <= 100) return '良';
        if (aqi <= 150) return '轻度污染';
        if (aqi <= 200) return '中度污染';
        if (aqi <= 300) return '重度污染';
        return '严重污染';
    }

    showError(message) {
        // 创建错误提示
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 0, 0, 0.8);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // 3秒后自动消失
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.weatherApp = new WeatherApp();
});