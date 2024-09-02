import { useEffect, useRef, useState } from "react"
import { Bullet, GameData, Player } from "./App";

export default (props: {gameData: GameData, setGameData: React.Dispatch<React.SetStateAction<GameData>>}) => {
    const propsRef = useRef(props);
    const {gameData, setGameData} = propsRef.current;
    const [ctx, setCTX] = useState<CanvasRenderingContext2D | null>(null);
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
    const mousePos = {x: 0, y: 0};
    let prevTime = 0;

    function DrawCircle(x: number, y: number, radius: number, color?: string) {
        if (!ctx || !canvas) return;
        if (!!color) ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x,y, radius, radius, 0, 0, Math.PI * 2)
        ctx.fill();
        ctx.closePath();
    }

    function DrawLine(fromX: number, fromY: number, toX: number, toY: number, color?: string) {
        if (!ctx || !canvas) return;
        if (!!color) ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(fromX,fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        ctx.closePath();
    }

    function DrawGrid() {
        if (!ctx || !canvas) return;
        DrawLine(0, 10, canvas.width, 10, "white")
        DrawLine(0, canvas.height - 10, canvas.width, canvas.height - 10, "white")
    }

    function Shoot(player: Player) {
        gameData.bullets.set(new Date().getTime() + player.bulletSpeed, {
            x: player.x,
            y: player.y,
            speed: player.bulletSpeed,
            color: player.color,
            hit: false
        })
    }

    function StepBullet(bullet: Bullet, bulletKey: number) {
        const nextPos = bullet.x + bullet.speed;
        if ((nextPos >= gameData.gameboardSize.width || nextPos <= 0)) {
            gameData.bullets.delete(bulletKey);
        }
        bullet.x += bullet.speed;
        return bullet;
    }

    function StepPlayer(player: Player) {
        const nextY = player.y + player.speed;

        const gonnaHitWall = nextY >= gameData.gameboardSize.height - (10 + gameData.playerRadius) || nextY <= 10 + gameData.playerRadius;
        const gonnaHitRacketY = (nextY + gameData.playerRadius >= mousePos.y && nextY - gameData.playerRadius <= mousePos.y)
        const gonnaHitRacketX = (mousePos.x >= player.x - (gameData.playerRadius + gameData.racketWidth / 2) && mousePos.x <= player.x + (gameData.playerRadius + gameData.racketWidth / 2))
        
        if (gonnaHitWall || (gonnaHitRacketX && gonnaHitRacketY)) 
            player.speed *= -1;

        gameData.bullets.forEach((bullet, key) => {
            if (bullet.speed !== player.bulletSpeed) {
              if ((bullet.x >= player.x - gameData.playerRadius && bullet.x <= player.x + gameData.playerRadius) &&
                  (bullet.y >= player.y - gameData.playerRadius && bullet.y <= player.y + gameData.playerRadius) && !bullet.hit
              ) {
                bullet.hit = true;
                player.hits++;
                gameData.bullets.delete(key)
              }
            } 
        })
        
        player.y += player.speed;
        return player;
    }

    function Render(time: number) {
        if (!ctx || !canvas) return;
        ctx.clearRect(0,0, canvas.width, canvas.height);
        const deltaTime = (time - prevTime) / 1000;
        
        DrawGrid()
        
        ctx.fillStyle = "#fff"
        ctx.fillText(gameData.players[0].name ?? "", 50, 50, 300)
        const players = [...gameData.players]
        players.map((player) => {
            DrawCircle(player.x, player.y, gameData.playerRadius, player.color)

            if (player.shootTime >= player.shootCooldown) {
                Shoot(player);
                player.shootTime = 0;
            } else {
                player.shootTime += deltaTime;
            }

            StepPlayer(player);
        })

        // setGameData(prev => {
        //     return {...prev, players: [...players]};
        // })

        gameData.bullets.forEach((bullet, bulletKey) => {
            DrawCircle(bullet.x, bullet.y, 5, bullet.color)
            StepBullet(bullet, bulletKey);
        })

        ctx.fillStyle = "#fff"
        ctx.fillRect(mousePos.x - gameData.racketWidth / 2, mousePos.y, gameData.racketWidth, 3)
        setGameData(prev => ({...prev}))
        prevTime = time;
        window.requestAnimationFrame(Render);
    }

    useEffect(() => {
        propsRef.current = props
    })

    return (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        setCTX(ctx);
        setCanvas(canvas);
        Shoot(gameData.players[0])
        canvas.addEventListener("mousemove", (e) => {
            mousePos.x = e.offsetX;
            mousePos.y = e.offsetY;
        })
        canvas.addEventListener("mouseleave", () => {
            mousePos.x = -gameData.racketWidth;
            mousePos.y = -gameData.racketWidth;
        })
        window.requestAnimationFrame(Render)
    }
}
