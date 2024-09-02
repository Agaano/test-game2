import { useEffect, useRef, useState } from 'react'
import './App.css'
import { useModalAlert } from './useModal';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [Modal, call] = useModalAlert()
  // const [leftCharColor, setLeftCharColor] = useState("#f00");
  // const [rightCharColor, setRightCharColor] = useState("#0f0");
  const [started, setStarted] = useState(false)

  function drawLine(ctx: CanvasRenderingContext2D, from: {x: number, y: number}, to: {x: number, y: number}, color?: string) {
    if (!!color) ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.closePath();
  }

  type Player = {
    position: {x: number, y: number},
    name: string,
    speed: number,
    shootCooldown: number,
    shootTime: number,
    bulletSpeed: number,
    hits: number,
    color: string,
  }

  type Bullet = {
    position: {x: number, y: number},
    speed: number,
    used: boolean,
    color: string,
  }
  
  function Start(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    const playableBoardSize = {width: canvas.width - 20, height: canvas.height - 30}
    const canvasSize = {width: canvas.width, height: canvas.height}
    const radius = 10;
    const racketWidth = 30;
    const players: Player[] = [{
      position: {x: 20, y: 30},
      name: "Player1",
      speed: 5,
      shootCooldown: 10,
      shootTime: 0,
      bulletSpeed: 5,
      hits: 0,
      color: "#0f0"
    },
    {
      position: {x: canvasSize.width - 20, y: canvasSize.height - 31},
      name: "Player2",
      speed: -5,
      shootCooldown: 10,
      shootTime: 0,
      bulletSpeed: -5,
      hits: 0,
      color: "#f00"
    }]
    let player1: Player = {
      position: {x: 20, y: 30},
      name: "Player1",
      speed: 5,
      shootCooldown: 3,
      shootTime: 0,
      bulletSpeed: 5,
      hits: 0,
      color: "#0f0"
    };
    let player2: Player = {
      position: {x: canvasSize.width - 20, y: canvasSize.height - 31},
      name: "Player2",
      speed: -5,
      shootCooldown: 3,
      shootTime: 0,
      bulletSpeed: -5,
      hits: 0,
      color: "#f00"
    };
    const mousePos = {x: 0, y: 0}
    const bullets = new Map<number, Bullet>()
    

    function Step(player: Player): Player { 
      const nextPos = player.position.y + player.speed
      if ((nextPos <= 30 || nextPos  >= playableBoardSize.height)) player.speed *= -1;
      if ((nextPos + radius >= mousePos.y && nextPos - radius <= mousePos.y) &&
          (mousePos.x >= player.position.x - (radius + racketWidth / 2) && mousePos.x <= player.position.x + (radius + racketWidth / 2))  
      ) player.speed *= -1;
      player.position.y += player.speed;
      return player;
      bullets.forEach((bullet, key, map) => {
        if (bullet.speed !== player.bulletSpeed) {
          if ((bullet.position.x >= player.position.x - radius && bullet.position.x <= player.position.x + radius) &&
              (bullet.position.y >= player.position.y - radius && bullet.position.y <= player.position.y + radius) && !bullet.used
          ) {
            bullet.used = true;
            map.delete(key)
            player.hits++;
          }
        } 
      })
      return player;
    }

    function Shoot(player: Player) {
      const bullet = {
        position: {x: player.position.x, y: player.position.y},
        speed: player.bulletSpeed,
        used: false,
        color: "#fff",
      };
      bullets.set(new Date().getTime(), bullet)
      console.log(bullets)
    }

    function DrawCircle(position: {x: number, y: number}, radius: number, color: string) {
      ctx.fillStyle = color;
      ctx.beginPath()
      ctx.ellipse(position.x,position.y,radius,radius,0,0,Math.PI * 2);
      ctx.fill();
    }

    function StepBullet(bullet: Bullet, bulletKey: number) {
      const nextPos = bullet.position.x + bullet.speed;
      if ((nextPos >= canvasSize.width || nextPos <= 0)) {
        bullets.delete(bulletKey);
      }
      bullet.position.x += bullet.speed;
    }
    
    function DrawBoard() {
      drawLine(ctx, {x: 0, y: 20}, {x: canvasSize.width, y: 20}, "#fff")
      drawLine(ctx, {x: 0, y: canvasSize.height - 20}, {x: canvasSize.width, y: canvasSize.height - 20}, "#fff")
    }

    let prevTime = 0;

    function Update(time: number) {
      const deltaTime = (time - prevTime) / 1000

      ctx.clearRect(0,0,canvasSize.width, canvasSize.height)
      
      players.map((player) => {
        DrawCircle(player.position, radius, player.color)
        player.shootTime += deltaTime
        if (player.shootTime >= player.shootCooldown) {
          Shoot(player);
          player.shootTime = 0;
        }
        return Step(player)
      })
      
      DrawBoard();

      ctx.fillStyle = "#fff"
      ctx.fillRect(mousePos.x - racketWidth / 2, mousePos.y, racketWidth, 5)
      
      bullets.forEach((bullet, key) => {
        DrawCircle(bullet.position, 5, bullet.color)
        StepBullet(bullet, key);
      })
      
      ctx.fillStyle = "#fff"
      ctx.fillText(players[0].hits.toString(), 20, 20, 300)
      ctx.fillText(players[1].hits.toString(), canvasSize.width - 20, 20, 300)
      
      prevTime = time;
      
      window.requestAnimationFrame(Update);
    }
    
    canvas.onmousemove = (ev) => {
      mousePos.x = ev.offsetX;
      mousePos.y = ev.offsetY;
    }

    canvas.onmouseleave = () => {
      mousePos.x = -racketWidth;
      mousePos.y = -racketWidth;
    }

    const inputs = document.querySelectorAll('input[type="range"]');
    inputs.forEach((input: Element) => {
      (input as HTMLInputElement).addEventListener("change", (e) => {
        const [player, field] = input.id.split(":");
        if (player === "player1") 
          //@ts-ignore
        player1[field] = +e.target.value;
        if (player === "player2") 
          //@ts-ignore
        player2[field] = +e.target.value;
      })
    })
    window.requestAnimationFrame(Update);
  }

  function ConfigureAndStart(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    Start(ctx, canvas)
  }


  useEffect(() => {
    if (!!canvasRef.current && !started) {
      ConfigureAndStart(canvasRef.current)
      setStarted(true);
      console.log("!")
    }
  }, [canvasRef.current])

  return (
    <div style = {{display: "flex"}}>
      <div>
        <div className='range-end'>
          <label>Bullet Cooldown</label>
          <input step={0.1} min = {1} max = {5} value = {3} type='range' id="player1:shootCooldown"/>
        </div>
        <div className='range-end'>
          <label>Speed</label>
          <input step={0.1} min = {1} max = {10}  type='range' id="player1:speed"/>
        </div>
      </div>
      <canvas ref={canvasRef} width = {750} height={500}/>
      <div style = {{justifyContent: 'flex-start'}}>
        <div className='range-start' >
          <input step={0.1} min = {1} max = {5} value = {3} type='range' id="player2:shootCooldown"/>
          <label>Bullet Cooldown</label>
        </div>
        <div className='range-start'>
          <input step={0.1} min = {1} max = {10}  type='range' id="player2:speed"/>
          <label>Speed</label>
        </div>
      </div>
      <div>
        <button onClick = {() => {
          call("hai")
        }}/>
      </div>
      <Modal/>
    </div>
  )
}

export default App
