// public/script.js

// Canvas 初始化
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

// Emoji 粒子类
class Emoji {
  constructor(emojiChar) {
    this.x = Math.random() * width;
    this.y = -30;
    this.size = 32;
    this.emoji = emojiChar;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 1) * 5;
    this.gravity = 0.2;
    this.bounce = 0.5;
    this.birthTime = Date.now();
    this.lifespan = 30000; // 30秒
    this.fadeDuration = 2000;
  }

  update() {
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;

    // 底部碰撞
    if (this.y + this.size > height) {
      this.y = height - this.size;
      this.vy *= -this.bounce;
      if (Math.abs(this.vy) < 0.5) {
        this.vy = 0;
      }
    }

    // 左右边界反弹
    if (this.x < 0 || this.x + this.size > width) {
      this.vx *= -1;
      this.x = Math.max(0, Math.min(this.x, width - this.size));
    }
  }

  draw(ctx) {
    const age = Date.now() - this.birthTime;
    let opacity = 1;

    if (age > this.lifespan - this.fadeDuration) {
      const fadeProgress = (this.lifespan - age) / this.fadeDuration;
      opacity = Math.max(0, fadeProgress);
    }

    ctx.globalAlpha = opacity;
    ctx.font = this.size + "px serif";
    ctx.fillText(this.emoji, this.x, this.y);
    ctx.globalAlpha = 1;
  }

  isExpired() {
    return Date.now() - this.birthTime > this.lifespan;
  }
}

// 粒子数组
const particles = [];

// 提取文本中所有 emoji
function extractEmojis(text) {
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
  return text.match(emojiRegex) || [];
}

// 动画循环
function animate() {
  ctx.clearRect(0, 0, width, height);

  // 清理过期粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].isExpired()) {
      particles.splice(i, 1);
    }
  }

  // 更新并绘制所有粒子
  for (const p of particles) {
    p.update();
    p.draw(ctx);
  }

  requestAnimationFrame(animate);
}

// 启动动画
animate();

// 添加 emoji 按钮点击事件
async function addEmoji() {
  const userInput = document.getElementById('userInput').value;
  if (!userInput) return;

  // 立即显示正在生成中的提示
  const resultElement = document.getElementById('result');
  resultElement.value = '正在生成中...';
  resultElement.style.color = '#999999'; // 设置为淡灰色

  try {
    const response = await fetch('/api/add-emoji', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: userInput })
    });

    if (!response.ok) throw new Error('网络响应异常');

    const data = await response.json();
    const resultText = data.result;
    
    // 生成完成后，显示结果并恢复默认颜色
    resultElement.value = resultText;
    resultElement.style.color = ''; // 恢复默认颜色

    const allEmojis = extractEmojis(resultText);
    let selectedEmojis = [];

    if (allEmojis.length <= 5) {
      // 每种出现3次
      for (const emoji of allEmojis) {
        for (let i = 0; i < 3; i++) {
          selectedEmojis.push(emoji);
        }
      }
    } else {
      // 随机选5个不同 emoji
      const unique = [...new Set(allEmojis)];
      const shuffled = unique.sort(() => 0.5 - Math.random());
      const picked = shuffled.slice(0, 5);
      for (const emoji of picked) {
        for (let i = 0; i < 3; i++) {
          selectedEmojis.push(emoji);
        }
      }
    }

    // 添加粒子
    for (const emoji of selectedEmojis) {
      particles.push(new Emoji(emoji));
    }

  } catch (error) {
    console.error('调用API时出错:', error);
    // 出错时也恢复默认颜色
    resultElement.value = '调用API时出错，请稍后再试';
    resultElement.style.color = ''; // 恢复默认颜色
  }
}

// 复制到剪贴板
function copyToClipboard() {
  const resultTextarea = document.getElementById('result');  
  // 获取复制按钮元素
  const copyButton = document.querySelector('.copy-button');
  
  // 如果当前已经是"复制完成"状态，则不执行任何操作
  if (copyButton.textContent === '复制完成') {
    return;
  }

  navigator.clipboard.writeText(resultTextarea.value)
    .then(() => {
      // 保存原始按钮文字
      const originalText = copyButton.textContent;
      
      // 修改按钮文字为"复制完成"
      copyButton.textContent = '复制完成';
      copyButton.style.backgroundColor = '#28a745'; 
      
      // 3秒后恢复原始文字
      setTimeout(() => {
        copyButton.textContent = originalText;
        copyButton.style.backgroundColor = '#007bff';
      }, 3000);
    })
    .catch(err => {
      console.error('无法复制文本: ', err);
    });
}
