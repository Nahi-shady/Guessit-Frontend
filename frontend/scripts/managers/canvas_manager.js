// Canvas Manager Class
export default class CanvasManager {
    constructor(wsManager) {
        this.wsManager = wsManager;
        
        this.canvas = document.getElementById("drawing-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.drawing = false;
        
        this.colorPicker = document.getElementById("color-picker");
        this.brushSizePicker = document.getElementById("brush-size");
        this.clearCanvasButton = document.getElementById('clear-canvas');
        this.lastX = 0;
        this.lastY = 0;

        this.initializeCanvas();
        this.setupEventListeners();
    }

    initializeCanvas() {
        this.resizeCanvas();
        window.addEventListener("resize", this.resizeCanvas.bind(this));
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
    }

    resizeCanvas() {
        const container = document.querySelector(".canvas-container");

        // Save current drawing data before resizing
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        const oldWidth = this.canvas.width;
        const oldHeight = this.canvas.height;

        // Set new dimensions (Maintaining 4:3 Aspect Ratio)
        this.canvas.width = container.clientWidth;
        this.canvas.height = this.canvas.width * (3 / 4);

        // Scale drawings proportionally
        const scaleX = this.canvas.width / oldWidth;
        const scaleY = this.canvas.height / oldHeight;

        this.ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
        this.ctx.putImageData(imageData, 0, 0);

        // Reset transform after scaling
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    setupEventListeners() {
        this.colorPicker.addEventListener("input", () => {
            this.ctx.strokeStyle = this.colorPicker.value;
        });
        this.brushSizePicker.addEventListener("input", () => {
            this.ctx.lineWidth = this.brushSizePicker.value;
        });

        this.clearCanvasButton.addEventListener('click', this.sendClearCanvas.bind(this));

        // Mouse events
        this.canvas.addEventListener("mousedown", this.startDrawing.bind(this));
        this.canvas.addEventListener("mousemove", this.draw.bind(this));
        this.canvas.addEventListener("mouseup", this.stopDrawing.bind(this));
        this.canvas.addEventListener("mouseout", this.stopDrawing.bind(this));

        // Touch events
        this.canvas.addEventListener("touchstart", this.startTouchDrawing.bind(this));
        this.canvas.addEventListener("touchmove", this.touchDraw.bind(this));
        this.canvas.addEventListener("touchend", this.stopDrawing.bind(this));
        this.canvas.addEventListener("touchcancel", this.stopDrawing.bind(this));
    }

    normalizeTouchEvent(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0] || e.changedTouches[0];
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
        };
    }

    startDrawing(e) {
        this.drawing = true;
        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    }

    startTouchDrawing(e) {
        e.preventDefault(); // Prevent scrolling or zooming
        const { x, y } = this.normalizeTouchEvent(e);
        this.drawing = true;
        [this.lastX, this.lastY] = [x, y];
    }

    draw(e) {
        if (!this.drawing || this.wsManager.drawer_name !== this.wsManager.playerName) return;
        
        const currentX = e.offsetX;
        const currentY = e.offsetY;
        
        const drawingData = {
            type: "drawing",
            start: { x: this.lastX, y: this.lastY },
            end: { x: currentX, y: currentY },
            color: this.ctx.strokeStyle,
            thickness: this.ctx.lineWidth,
        };
        this.wsManager.sendMessage(drawingData);

        [this.lastX, this.lastY] = [currentX, currentY];
    }

    touchDraw(e) {
        if (!this.drawing || this.wsManager.drawer_name !== this.wsManager.playerName) return;
        e.preventDefault(); // Prevent scrolling or zooming

        const { x: currentX, y: currentY } = this.normalizeTouchEvent(e);

        const drawingData = {
            type: "drawing",
            start: { x: this.lastX, y: this.lastY },
            end: { x: currentX, y: currentY },
            color: this.ctx.strokeStyle,
            thickness: this.ctx.lineWidth,
        };
        this.wsManager.sendMessage(drawingData);

        [this.lastX, this.lastY] = [currentX, currentY];
    }

    stopDrawing() {
        this.drawing = false;
        this.ctx.beginPath();
    }
    
    websocketActions(event) {
        if (event.type === "drawing") {
            this.renderIncomingDrawing(event);
        }
        else if (event.type === "clear_canvas") {
            this.eraseDrawing();
        }
    }

    sendClearCanvas() {
        if (this.wsManager.drawer_name !== this.wsManager.playerName) {
            return;
        }
        const data = { type: "clear_canvas" };
        this.wsManager.sendMessage(data);
    }

    eraseDrawing() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderIncomingDrawing(data) {
        const { start, end, color, thickness } = data;
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = thickness;
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.stroke();
    }
}

