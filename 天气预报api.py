import requests
import json
import sys
import io

# 设置标准输出编码为 UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def get_weather(city):
    url = "https://60s-cf.viki.moe/v2/weather/forecast"
    params = {"query": city}
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()  # 如果请求失败，抛出 HTTPError
        data = response.json()
        # 格式化并打印 JSON 数据
        print(json.dumps(data, indent=4, ensure_ascii=False))
    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")
    except json.JSONDecodeError:
        print("无法解析 JSON 响应")

if __name__ == "__main__":
    get_weather("福清")