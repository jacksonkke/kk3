window.onload = function() {
    const canvas = document.getElementById('artCanvas');
    const context = canvas.getContext('2d');
    const shapes = [];
    const maxScale = 8; // 设置最大缩放比例
    const scaleSpeed = 0.005; // 调整此值以减慢动画速度
    const rotationSpeed = 0.00005; // 调整此值以减慢旋转速度
    const maxShapes = 50; // 最大图形数
    let shapeCount = 0;
  
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        draw();
    }
  
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
  
    function createIrregularShape(isWhite) {
        const points = [];
        const numPoints = Math.floor(Math.random() * 5) + 5; // 生成5到10个点
        const xOffset = Math.random() * canvas.width;
        const yOffset = Math.random() * canvas.height;
        const rotationRadius = Math.random() * 50 + 50; // 随机旋转半径
        const moveX = (Math.random() - 0.5) * 0.2; // 随机移动速度
        const moveY = (Math.random() - 0.5) * 0.2; // 随机移动速度
        const rotationDirection = Math.random() > 0.5 ? 1 : -1; // 随机旋转方向
        for (let i = 0; i < numPoints; i++) {
            points.push({
                x: Math.random() * canvas.width / 5 + xOffset,
                y: Math.random() * canvas.height / 5 + yOffset
            });
        }
        const fillColor = isWhite ? '#FFFFFF' : '#' + Math.floor(Math.random() * 16777215).toString(16);
        const pattern = isWhite ? null : createRandomPattern(fillColor);
        const angle = Math.random() * Math.PI * 2;
        return { points, fillColor, pattern, scale: 0, xOffset, yOffset, angle, rotationRadius, moveX, moveY, rotationDirection, alpha: 1, isWhite };
    }
  
    function createRandomPattern(fillColor) {
        const patternCanvas = document.createElement('canvas');
        const patternContext = patternCanvas.getContext('2d');
        patternCanvas.width = 20;
        patternCanvas.height = 20;
  
        const patterns = [
            () => {
                patternContext.fillStyle = fillColor;
                patternContext.fillRect(0, 0, 20, 20);
                patternContext.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
                patternContext.beginPath();
                patternContext.arc(10, 10, 5, 0, Math.PI * 2, true);
                patternContext.fill();
            },
            () => {
                patternContext.fillStyle = fillColor;
                patternContext.fillRect(0, 0, 20, 20);
                patternContext.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
                for (let i = 0; i < 20; i += 5) {
                    patternContext.fillRect(i, 0, 2, 20);
                }
            },
            () => {
                patternContext.fillStyle = fillColor;
                patternContext.fillRect(0, 0, 20, 20);
                patternContext.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
                for (let i = 0; i < 20; i += 5) {
                    patternContext.fillRect(0, i, 20, 2);
                }
            },
            () => {
                patternContext.fillStyle = fillColor;
                patternContext.fillRect(0, 0, 20, 20);
                patternContext.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
                for (let i = 0; i < 20; i += 5) {
                    patternContext.beginPath();
                    patternContext.arc(i, 10, 2, 0, Math.PI * 2, true);
                    patternContext.fill();
                }
            }
        ];
  
        const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
        randomPattern();
  
        return context.createPattern(patternCanvas, 'repeat');
    }
  
    function drawIrregularShape(shape) {
        context.fillStyle = shape.isWhite ? shape.fillColor : shape.pattern;
        context.globalAlpha = shape.alpha;
        context.beginPath();
        context.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
            context.lineTo(shape.points[i].x, shape.points[i].y);
        }
        context.closePath();
        context.fill();
    }
  
    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
  
        const currentTime = Date.now();
        shapes.forEach(shape => {
            context.save();
            const centroid = getCentroid(shape.points);
            shape.angle += rotationSpeed * shape.rotationDirection; // 缓慢旋转
            shape.xOffset += shape.moveX; // 缓慢移动
            shape.yOffset += shape.moveY; // 缂慢移动
            context.translate(shape.xOffset + Math.cos(shape.angle) * shape.rotationRadius, shape.yOffset + Math.sin(shape.angle) * shape.rotationRadius);
            context.rotate(shape.angle);
            context.scale(shape.scale, shape.scale);
            context.translate(-centroid.x, -centroid.y);
            drawIrregularShape(shape);
            context.restore();
  
            if (shape.scale < maxScale) {
                shape.scale += shape.scaleSpeed;
            } else if (shapes.length > maxShapes) {
                shape.alpha -= 0.01;
                if (shape.alpha <= 0) {
                    shapes.shift();
                }
            }
        });
  
        // 控制图形生成速度
        if (shapes.length === 0 || (currentTime - shapes[shapes.length - 1].startTime >= 4000)) {
            const isWhite = shapeCount % 4 === 3; // 每4个图形有一个白色图形
            const newShape = createIrregularShape(isWhite);
            newShape.startTime = currentTime;
            newShape.scaleSpeed = scaleSpeed;
            shapes.push(newShape);
            shapeCount++;
        }
  
        requestAnimationFrame(draw);
    }
  
    function getCentroid(points) {
        let x = 0, y = 0;
        points.forEach(point => {
            x += point.x;
            y += point.y;
        });
        return { x: x / points.length, y: y / points.length };
    }
  
    function drawShape(shape) {
        context.fillStyle = shape.isWhite ? shape.fillColor : shape.pattern;
        context.globalAlpha = shape.alpha;
        context.beginPath();
        if (shape.type === 'irregular') {
            context.moveTo(shape.points[0].x, shape.points[0].y);
            for (let i = 1; i < shape.points.length; i++) {
                context.lineTo(shape.points[i].x, shape.points[i].y);
            }
        } else if (shape.type === 'circle') {
            context.arc(0, 0, shape.radius, 0, Math.PI * 2, true);
        } else if (shape.type === 'star') {
            let angle = Math.PI / shape.spikes;
            for (let i = 0; i < 2 * shape.spikes; i++) {
                let r = (i % 2 === 0) ? shape.outerRadius : shape.innerRadius;
                context.lineTo(Math.cos(i * angle) * r, Math.sin(i * angle) * r);
            }
        } else if (shape.type === 'ellipse') {
            context.ellipse(0, 0, shape.radiusX, shape.radiusY, 0, 0, Math.PI * 2);
        } else if (shape.type === 'heart') {
            context.moveTo(0, -shape.size / 2);
            context.bezierCurveTo(shape.size / 2, -shape.size / 2, shape.size / 2, shape.size / 4, 0, shape.size);
            context.bezierCurveTo(-shape.size / 2, shape.size / 4, -shape.size / 2, -shape.size / 2, 0, -shape.size / 2);
        }
        context.closePath();
        context.fill();
    }
  
    draw();
  };