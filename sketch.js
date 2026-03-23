let grasses = [];
let bubbles = [];

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.style('pointer-events', 'none'); // 讓滑鼠事件穿透畫布，使後方的 iframe 可操作

  let iframe = createElement('iframe');
  iframe.attribute('src', 'https://www.et.tku.edu.tw');
  iframe.position(0, 0);
  iframe.size(windowWidth, windowHeight);
  iframe.style('border', 'none');
  iframe.style('z-index', '-1'); // 將 iframe 置於底層

  let colors = ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'];
  for (let i = 0; i < 50; i++) {
    let c = color(random(colors));
    c.setAlpha(150); // 設定透明度 (0-255)，150 為半透明
    grasses.push({
      x: random(width),
      height: random(height * 0.2, height * 0.66), // 水草的高度
      color: c, // 顏色
      thickness: random(30, 60), // 水草的粗細 (總寬度 30-60)
      swayFreq: random(0.002, 0.01), // 搖晃的頻率
      offset: random(1000) // 每個草的擺動隨機偏移
    });
  }
}

class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + random(100);
    this.r = random(5, 25);
    this.speed = random(1, 3);
    // 氣泡到達此 y 座標時會破裂
    this.popHeight = random(height * 0.1, height * 0.7);
    this.isPopping = false;
    this.popLife = 20; // 破裂動畫持續的影格數
    this.xOff = random(1000);
  }

  update() {
    if (this.isPopping) {
      this.popLife--;
    } else {
      this.y -= this.speed;
      this.x += map(noise(this.xOff + frameCount * 0.01), 0, 1, -1, 1); // 左右搖晃
      if (this.y < this.popHeight) {
        this.isPopping = true;
      }
    }
  }

  show() {
    if (this.isPopping) {
      // 破裂效果：一個擴散且淡出的圓環
      let progress = 1 - this.popLife / 20;
      let popRadius = this.r * (1 + progress);
      let popAlpha = map(this.popLife, 20, 0, 255, 0);
      noFill();
      stroke(255, popAlpha);
      strokeWeight(2);
      ellipse(this.x, this.y, popRadius);
    } else {
      // 氣泡主體 (白色, 0.5 透明度)
      fill(255, 255, 255, 255 * 0.5);
      noStroke();
      ellipse(this.x, this.y, this.r * 2);

      // 高光圓環 (白色, 0.7 透明度)
      noFill();
      stroke(255, 255, 255, 255 * 0.7);
      strokeWeight(1.5);
      ellipse(this.x, this.y, this.r * 1.2);
    }
  }

  isFinished() {
    return this.popLife < 0;
  }
}

function draw() {
  clear(); // 清除畫布，確保背景透明
  background(202, 240, 248, 51); // 設定背景顏色為 #caf0f8 且透明度為 0.2 (255 * 0.2 = 51)
  blendMode(BLEND); // 設定混合模式，讓半透明顏色能正常疊加
  noFill(); // 改為不填滿
  strokeCap(ROUND); // 設定線條端點為圓形，產生圓條狀效果

  for (let g of grasses) {
    let startX = g.x;
    let startY = height;
    let plantHeight = g.height;

    stroke(g.color); // 設定線條顏色
    strokeWeight(g.thickness); // 設定線條粗細

    beginShape();
    curveVertex(startX, startY); // 起始控制點
    curveVertex(startX, startY); // 起始點

    // 由下往上畫中心線
    for (let i = 0; i <= 20; i++) {
      let t = i / 20;
      let y = map(t, 0, 1, startY, startY - plantHeight);
      let xOff = map(noise(frameCount * g.swayFreq + t * 3 + g.offset), 0, 1, -30, 30) * t;
      curveVertex(startX + xOff, y);
    }
    
    // 結束控制點 (使用最後一個點的座標讓曲線平滑結束)
    let endT = 1;
    let endY = startY - plantHeight;
    let endXOff = map(noise(frameCount * g.swayFreq + endT * 3 + g.offset), 0, 1, -30, 30) * endT;
    curveVertex(startX + endXOff, endY);

    endShape();
  }

  // --- 氣泡 ---
  // 隨機產生新的氣泡
  if (random(1) < 0.1) {
    bubbles.push(new Bubble());
  }

  // 更新並顯示氣泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    b.update();
    b.show();
    if (b.isFinished()) {
      bubbles.splice(i, 1);
    }
  }
}
