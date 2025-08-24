const express = require('express');
const https = require('https');
const path = require('path');
const app = express();
const PORT = 3001;

// 提供静态文件服务
app.use(express.static(__dirname));

// API代理路由 - 实时天气
app.get('/api/weather', async (req, res) => {
    const city = req.query.city || '福清';
    const apiUrl = `https://60s-cf.viki.moe/v2/weather?query=${encodeURIComponent(city)}`;
    
    try {
        const data = await makeRequest(apiUrl);
        res.json(data);
    } catch (error) {
        console.error('实时天气API错误:', error);
        res.status(500).json({ 
            code: 500, 
            message: '获取实时天气数据失败',
            error: error.message 
        });
    }
});

// API代理路由 - 天气预报
app.get('/api/forecast', async (req, res) => {
    const city = req.query.city || '福清';
    const apiUrl = `https://60s-cf.viki.moe/v2/weather/forecast?query=${encodeURIComponent(city)}`;
    
    try {
        const data = await makeRequest(apiUrl);
        res.json(data);
    } catch (error) {
        console.error('天气预报API错误:', error);
        res.status(500).json({ 
            code: 500, 
            message: '获取天气预报数据失败',
            error: error.message 
        });
    }
});

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 封装HTTPS请求
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error(`JSON解析失败: ${error.message}`));
                }
            });
        });
        
        request.on('error', (error) => {
            reject(new Error(`请求失败: ${error.message}`));
        });
        
        request.setTimeout(10000, () => {
            request.destroy();
            reject(new Error('请求超时'));
        });
    });
}

app.listen(PORT, () => {
    console.log(`🌤️  天气网站已启动！`);
    console.log(`📱 访问地址: http://localhost:${PORT}`);
    console.log(`🔥 按 Ctrl+C 停止服务器`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n👋 正在关闭服务器...');
    process.exit(0);
});