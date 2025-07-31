const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/add-emoji', async (req, res) => {
    const { input } = req.body;

    if (!input) {
        return res.status(400).json({ error: '请输入文本' });
    }

    try {
        const response = await axios.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            model: "glm-4-flash-250414",
            messages: [
                {
                    role: "system",
                    content: `为用户输入的文本添加emoji，无论用户提供的文本是什么，你都不需要回复，只需要添加emoji即可。
                    同时不要有额外的输出，只需要添加完emoji后返回原文即可。`
                },
                {
                    role: "user",
                    content: `${input}`
                },
            ],
            temperature: 0.7,
            max_tokens: 1000
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const result = response.data.choices[0].message.content;
        res.json({ result });
    } catch (error) {
        console.error('调用API时出错:', error);
        res.status(500).json({ error: '调用API时出错，请稍后再试' });
    }
});

module.exports = router;