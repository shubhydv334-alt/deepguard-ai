import React, { useEffect, useRef } from 'react'

export default function ParticleCanvas() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let animationId
        let particles = []
        let mouse = { x: null, y: null }

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener('resize', resize)

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX
            mouse.y = e.clientY
        })

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width
                this.y = Math.random() * canvas.height
                this.size = Math.random() * 2 + 0.5
                this.speedX = (Math.random() - 0.5) * 0.6
                this.speedY = (Math.random() - 0.5) * 0.6
                this.opacity = Math.random() * 0.25 + 0.05
                const colors = ['197,248,42', '79,70,229', '255,255,255'] // Lime, Indigo, White
                this.color = colors[Math.floor(Math.random() * colors.length)]
            }

            update() {
                this.x += this.speedX
                this.y += this.speedY

                if (this.x > canvas.width) this.x = 0
                if (this.x < 0) this.x = canvas.width
                if (this.y > canvas.height) this.y = 0
                if (this.y < 0) this.y = canvas.height

                if (mouse.x !== null) {
                    const dx = mouse.x - this.x
                    const dy = mouse.y - this.y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < 120) {
                        this.x -= dx * 0.008
                        this.y -= dy * 0.008
                    }
                }
            }

            draw() {
                ctx.beginPath()
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(${this.color},${this.opacity})`
                ctx.fill()
            }
        }

        const particleCount = Math.min(120, Math.floor(window.innerWidth / 12))
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle())
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < 140) {
                        const opacity = (1 - dist / 140) * 0.06
                        ctx.beginPath()
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.strokeStyle = `rgba(79,70,229,${opacity})`
                        ctx.lineWidth = 0.4
                        ctx.stroke()
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            particles.forEach(p => {
                p.update()
                p.draw()
            })
            drawConnections()
            animationId = requestAnimationFrame(animate)
        }
        animate()

        return () => {
            cancelAnimationFrame(animationId)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
            }}
        />
    )
}
