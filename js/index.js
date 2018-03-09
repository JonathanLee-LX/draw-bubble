var start, FRAME,
    count = 0; //记录图片是否载入，载入后a++

var canvas = document.getElementById('drawing'),
    ctx = canvas.getContext('2d'),
    // 记录帧数
    frame = document.getElementById('frame');

var WIDTH, HEIGHT;
var img1, img2;

// 气泡数量和存储气泡的数组
var num, bot, TIME = 300, intervals=0;


window.onload = init;

function init() {
    WIDTH = canvas.width, // 画布宽度
        HEIGHT = canvas.height, // 画布高度
        mouse = {
            x: WIDTH / 2,
            y: HEIGHT / 2
        };

    img1 = new Image();
    img1.src = 'img/红泡.png';
    img2 = new Image();
    img2.src = 'img/蓝泡.png';
    img1.onload = function () {
        count++;
        if (count == 2) {
            start = Date.now();
            window.requestAnimationFrame(run);
        }
    }

    img2.onload = function () {
        count++;
        if (count == 2) {
            start = Date.now();
            window.requestAnimationFrame(run);
        }

    }

    // 初始化气泡对象
    num = 10;
    bot = [];
    for (var i = 0; i < num; i++) {
        bot[i] = new Bot();
    }

    bot[num] = new Bot();
    bot[num].x = WIDTH/2;
    bot[num].y = HEIGHT/2;
    bot[num].r = 30;
    bot[num].speedx = 0;
    bot[num].speedy = 0;
    bot[num].state = 0;
    bot[num].img = img1;


    // 定义canvas中的鼠标监听事件
    canvas.onmousemove = function (e) {
        mouse.x = e.offsetX;
        mouse.y = e.offsetY;
        // 红泡重新规划目标
        // reSchedule_goal();
    }

    canvas.onmouseleave = function (e) {
        // 鼠标指针离开了canvas区域，将坐标设为负数
        mouse.x = 0;
        mouse.y = 0;
    }

}

setTimeout(showFrame, 500);

// 驱动canvas
function run() {
    for (var i = 0; i < bot.length; i++) {
        move(bot[i]);
    }
    reSchedule_goal();
    setTimeout(function () {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }, 1000 / 80);
    intervals = Date.now() - start;
    FRAME = Math.floor(1000 / intervals);
    start = Date.now();
    window.requestAnimationFrame(run);
}

function showFrame() {
    frame.innerText = FRAME;
    setTimeout(showFrame, 500);
}

// 定义气泡构造函数
function Bot() {
    this.x = (Math.random() * WIDTH); //气泡x方向位置随机值
    this.y = (Math.random() * HEIGHT); //气泡y方向位置随机值
    this.r = (Math.random() * 20) + 30; //气泡半径随机值
    this.speedx = (Math.random() * 1); //气泡x方向速度随机值
    this.speedy = (Math.random() * 1); //气泡y方向速度随机值
    //气泡移动方向，1为右下，2为右上，3为左上，4为左下
    this.state = Math.floor((Math.random() * 3)) + 1;
    this.img = img2; //载入图像，使用到两种颜色的气泡图像，img1为红色，img2为蓝色
}


//气泡绘制外围边界，方便进行碰撞检测
function draw(x, y, r) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, .3)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
}

//气泡移动
function move(bot) {
    if (bot.state == 1) { //右下
        bot.x += bot.speedx * intervals;
        bot.y += bot.speedy * intervals;
    } else if (bot.state == 2) { //右上
        bot.x += bot.speedx * intervals;
        bot.y -= bot.speedy * intervals;
    } else if (bot.state == 3) { //左上
        bot.x -= bot.speedx * intervals;
        bot.y -= bot.speedy * intervals;
    } else if (bot.state == 4) { //左下
        bot.x -= bot.speedx * intervals;
        bot.y += bot.speedy * intervals;
    } 


    if(bot.img === img1){
        // 红球不能超出边界
        if (bot.x - bot.r >= WIDTH) {
            bot.x = WIDTH;
        }
        if (bot.x + bot.r <= 0) {
            bot.x = 0;
        }
        if (bot.y - bot.r >= HEIGHT) {
            bot.y = HEIGHT;
        }
        if (bot.y + bot.r <= 0) {
            bot.y = 0;
        }
    }else{
        // //定义气泡超出边界的行为
        if (bot.x - bot.r >= WIDTH) {
            bot.x = 0;
        }
        if (bot.x + bot.r <= 0) {
            bot.x = WIDTH;
        }
        if (bot.y - bot.r >= HEIGHT) {
            bot.y = 0;
        }
        if (bot.y + bot.r <= 0) {
            bot.y = HEIGHT;
        }
    }


    blue();
    isCollision();
    // followMouse();

    draw(bot.x + bot.r, bot.y + bot.r, bot.r) //画圆圈，方便碰撞检测
    ctx.drawImage(bot.img, bot.x, bot.y, 2 * bot.r, 2 * bot.r)
}

// 获取鼠标指针的位置，并让红泡坐标跟随鼠标指针
function reSchedule_goal() {
    if (mouse.x < 0 && mouse.y < 0) {
        return;
    }
    var red = bot[bot.length - 1];
    var target = {};
    
    target.x = mouse.x - red.r;
    target.y = mouse.y - red.r;
    
    var offsetX = target.x - red.x,
    offsetY = target.y - red.y;

    var d = Math.sqrt(Math.pow(offsetX, 2)+ Math.pow(offsetY, 2));
    if(d == 0){
        red.speedx = 0;
        red.speedy = 0;
        red.state = 0;
    }

    // 目标点和当前点的角度
    var slope = Math.abs(offsetY)/Math.abs(offsetX);
    var angel = Math.atan(slope);
    
    // speed合速度,每一毫米需要走的距离
    var speed = d/TIME;
    var speedX = Math.cos(angel)*speed;
    var speedY = Math.sin(angel)*speed;
    
    red.speedx = speedX;
    red.speedy = speedY;

    if(offsetX > 0 && offsetY > 0){
        // 目标位置在右下方
        red.state = 1;
    }else if (offsetX > 0 && offsetY < 0){
        // 目标位置在右上方
        red.state = 2
    }else if(offsetX < 0 && offsetY < 0){
        // 目标位置在左上方
        red.state = 3;
    }else if(offsetX < 0 && offsetY > 0){
        // 目标位置在左下方
        red.state = 4;
    }

    if (red.x > WIDTH - 2 * red.r) {
        red.x = WIDTH - 2 * red.r;
    } else if (red.x < 0) {
        red.x = 0;
    }
    if (red.y > HEIGHT - 2 * red.r) {
        red.y = HEIGHT - 2 * red.r;
    } else if (red.y < 0) {
        red.y = 0;
    }
}

// 检测是否碰撞
function isCollision() {
    var red = bot[bot.length - 1];
    var blue, d, offset = {};
    red.center = {
        x: red.x + red.r,
        y: red.y + red.r
    }
    for (var i = 0; i < bot.length - 1; i++) {
        blue = bot[i];
        blue.center = {
            x: blue.x + blue.r,
            y: blue.y + blue.r
        }
        // 获取红泡和蓝泡之间的相对位置
        offset.x = red.center.x - blue.center.x;
        offset.y = red.center.y - blue.center.y;

        // 两个起泡圆心之间的距离
        d = Math.sqrt(Math.pow(offset.x, 2) + Math.pow(offset.y, 2));

        // 红球与蓝球相撞
        if (d < red.r + blue.r) {
            mouse.x = -1;
            mouse.y = -1;
            if (offset.x > 0 && offset.y > 0) {
                // 向左上方移动
                blue.state = 3;
                blue.x = blue.x <= (red.center.x - (Math.abs(offset.x) + blue.r)) ? blue.x : red.center.x - (
                    Math.abs(offset.x) + blue.r);
                blue.y = blue.y <= (red.center.y - (Math.abs(offset.y) + blue.r)) ? blue.y : red.center.y - (
                    Math.abs(offset.y) + blue.r);

            } else if (offset.x > 0 && offset.y < 0) {
                // 向左下方移动
                blue.state = 4;
                blue.x = blue.x <= (red.center.x - (Math.abs(offset.x) + blue.r)) ? blue.x : red.center.x - (
                    Math.abs(offset.x) + blue.r);
                blue.y = blue.y <= (red.center.y + (Math.abs(offset.y) + blue.r)) ? blue.y : red.center.y + (
                    Math.abs(offset.y) + blue.r);

            } else if (offset.x < 0 && offset.y > 0) {
                // 向右上方移动
                blue.state = 2;
                blue.x = blue.x >= (red.center.x + (Math.abs(offset.x) - blue.r)) ? blue.x : red.center.x + (
                    Math.abs(offset.x) + blue.r);
                blue.y = blue.y <= (red.center.y - (Math.abs(offset.y) + blue.r)) ? blue.y : red.center.y - (
                    Math.abs(offset.y) + blue.r);
            } else {
                // 向右下方移动
                blue.state = 1;
                blue.x = blue.x >= (red.center.x + (Math.abs(offset.x) - blue.r)) ? blue.x : red.center.x + (
                    Math.abs(offset.x) - blue.r);
                blue.y = blue.y >= (red.center.y + (Math.abs(offset.y) - blue.r)) ? blue.y : red.center.y + (
                    Math.abs(offset.y) - blue.r);
            }
        }
    }
}

function blue() {
    for (var i = 0, len = bot.length; i < len - 1; i++) {
        for (var j = i + 1; j < len - 1; j++) {
            blueCollision(bot[i], bot[j]);
        }
    }
}

function blueCollision(a, b) {
    if(!a || !b){
        return;
    }
    var offset = {};
    a.center = {
        x: a.x + a.r,
        y: a.y + a.r
    }
    b.center = {
        x: b.x + b.r,
        y: b.y + b.r
    }

    offset.x = b.center.x - a.center.x;
    offset.y = b.center.y - a.center.y;

    // 两个起泡圆心之间的距离
    d = Math.sqrt(Math.pow(offset.x, 2) + Math.pow(offset.y, 2));

    // 两个篮球已经碰撞了
    if (d < b.r + a.r) {
        if (offset.x > 0 && offset.y > 0) {
            // b球在a球的右下方, 相撞后b向右下方， a向左上方
            a.state = 3;
            b.state = 1;
        } else if (offset.x > 0 && offset.y < 0) {
            // b球在a球的右上方， 相撞后a向左下，b向右上方
            a.state = 4;
            b.state = 2;
        } else if (offset.x < 0 && offset.y < 0) {
            // b球在a球的左上方， 相撞后a向右下方， b向左上方
            a.state = 1;
            b.state = 3;
        } else if (offset.x < 0 && offset.y > 0) {
            // b球在a球的左下方， 相撞后a向右上方，b向左下方
            a.state = 2;
            b.state = 4;
        }

    }

}

