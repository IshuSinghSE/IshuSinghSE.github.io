window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d', {
        willReadFrequently: true,
    });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //Additional Elements
    const downloadBtn = document.getElementById('download')


    class Particle {
        constructor(effect, x, y, color) {
            this.effect = effect
            this.x =  Math.random() * this.effect.canvasWidth
            this.y =  0
            this.color = color
            this.originX = x
            this.originY = y
            this.size = this.effect.gap
            this.dx = 0
            this.dy = 0
            this.vx = 0
            this.vy = 0
            this.force = 0
            this.angle = 0
            this.distance = 0
            this.fast = true
            if (this.fast) {
                this.friction = 0.9
                this.ease = 0.2
            } else {
                this.friction = Math.random() * 0.6 + 0.15
                this.ease = Math.random() * 0.1 + 0.005
            }
        }
        draw() {
            // this.effect.context.fillStyle = this.color;
            this.effect.context.fillRect(this.x, this.y, this.size, this.size);

        }
        update() {
            this.dx = this.effect.mouse.x - this.x
            this.dy = this.effect.mouse.y - this.y
            this.distance = Math.hypot(this.dy, this.dx)
            this.force = -this.effect.mouse.radius / this.distance

            if (this.distance < this.effect.mouse.radius) {
                this.angle = Math.atan2(this.dy, this.dx)
                this.vx += this.force * Math.cos(this.angle)
                this.vy += this.force * Math.sin(this.angle)
            }

            this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease
            this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease
        }
    }

    class Effect {
        constructor(context, canvasWidth, canvasHeight) {
            this.context = context;
            this.canvasWidth = canvasWidth;
            this.canvasHeight = canvasHeight;
            this.textX = this.canvasWidth / 2;
            this.textY = this.canvasHeight / 2;
            this.fontSize = 100;
            this.lineHeight = this.fontSize * 1.1;
            this.maxTextWidth = this.canvasWidth * 0.8;
            this.textInput = document.getElementById('textInput')


            this.textInput.addEventListener('input', (e) => {
                //delay for the input text
                clearTimeout(this.textInput._timer)
                this.textInput._timer = setTimeout(() => {
                    if (e.key !== ' ') {
                        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
                        this.wrapText(e.target.value);
                    }
                }, 1000);
            })

            // Particle Effect
            this.particles = []
            this.gap = 3
            this.mouse = {
                radius: 100,
                x: 0,
                y: 0
            }

            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.x;
                this.mouse.y = e.y;
            })

        }
        wrapText(text) {
            // canvas setting
            const gradient = this.context.createLinearGradient(0, 0, this.canvasWidth, this.canvasHeight)
            gradient.addColorStop(0.3, 'deeppink')
            gradient.addColorStop(0.5, 'orange')
            gradient.addColorStop(0.7, 'aquamarine')
            this.context.fillStyle = gradient;
            this.context.strokeStyle = 'white'
            this.context.textAlign = 'center'
            this.context.textBaseline = 'center'
            this.context.font = this.fontSize + 'px Helvetica';
            this.context.letterSpacing = '7px';

            //Additional arguments
            this.context.lineWidth = 0.3;
            this.context.lineCap = 'round';

            //break multiline
            let lineArray = [];
            //remove all extra spaces from the array
            let words = text.split(' ').filter(word => word.trim().length > 0);;

            let line = '';
            let lineCounter = 0;

            for (let i = 0; i < words.length; i++) {
                let textLine = line + words[i] + ' ';
                if (this.context.measureText(text).width > this.maxTextWidth) {
                    line = words[i] + ' ';
                    lineCounter++;
                } else {
                    line = textLine;
                }
                lineArray[lineCounter] = line;
            }
            let textHeight = this.lineHeight * lineCounter;

            this.textY = this.canvasHeight / 2 - textHeight / 2;
            lineArray.forEach((el, index) => {
                this.context.fillText(el, this.textX, this.textY + (index * this.lineHeight))
                this.context.strokeText(el, this.textX, this.textY + (index * this.lineHeight))
            })

            this.convertToParticles()

        }
        convertToParticles() {
            this.particles = []
            const pixels = this.context.getImageData(0, 0, this.canvasWidth, this.canvasHeight).data
            this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

            for (let y = 0; y < this.canvasHeight; y += this.gap) {
                for (let x = 0; x < this.canvasWidth; x += this.gap) {
                    const index = (y * this.canvasWidth + x) * 4
                    const alpha = pixels[index + 3]
                    if (alpha > 0) {
                        const red = pixels[index]
                        const green = pixels[index + 1]
                        const blue = pixels[index + 2]
                        const color = 'rgb(' + red + ',' + green + ',' + blue + ')';
                        this.particles.push(new Particle(this, x, y, color));
                    }
                }
            }

        }
        render() {
            this.particles.forEach(particle => {
                particle.update()
                particle.draw()
            });
        }
        resize(width, height) {
            this.canvasWidth = width;
            this.canvasHeight = height;
            this.textX = this.canvasWidth / 2;
            this.textY = this.canvasHeight / 2;
            this.maxTextWidth = this.canvasWidth * 0.7;
            
        }
    }

    const effect = new Effect(ctx, canvas.width, canvas.height)
    effect.wrapText(effect.textInput.value);
    effect.render();

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        effect.render()
        requestAnimationFrame(animate)

    }
    animate()

    window.addEventListener('resize', function () {

        clearTimeout(window._timer)
        window._timer = setTimeout(() => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            effect.resize(canvas.width, canvas.height)
            effect.wrapText(effect.textInput.value);
        }, 300);


    })

    downloadBtn.addEventListener('click', function (e) {
        // e.preventDefault()
        downloadBtn.download = effect.textInput.value + '.png'
        downloadBtn.href = canvas.toDataURL("image/png")
    })
});