import { useEffect, useRef, useState } from 'react'
import './App.css'
import useGameLogic from './useGameLogic'
export type Player = {
  x: number,
  y: number,
  name: string,
  speed: number,
  shootCooldown: number,
  shootTime: number,
  bulletSpeed: number,
  hits: number,
  color: string
}

export type Bullet = {
  x: number,
  y: number,
  speed: number,
  hit: boolean,
  color: string,
}

export type GameData = {
  gameboardSize: {width: number, height: number},
  players: Player[],
  bullets: Map<number, Bullet>,
  playerRadius: number,
  racketWidth: number,
}

function App() {
  const gameboardSize = {width: 750, height: 500}
  const playerRadius = 10

  const [gameData, setGameData] = useState<GameData>({
    players: [{
      x: 20,
      y: 10 + playerRadius,
      name: "Player1", 
      speed: 5,
      shootCooldown: 0.1,
      shootTime: 0,
      bulletSpeed: 5,
      hits: 0,
      color: "#ff0000",
    },{
      x: gameboardSize.width - 20,
      y: gameboardSize.height - (10 + playerRadius),
      name: "Player2", 
      speed: -5,
      shootCooldown: 5,
      shootTime: 0,
      bulletSpeed: -5,
      hits: 0,
      color: "#00ff00",
    }],
    bullets: new Map(),
    gameboardSize,
    playerRadius,
    racketWidth: 30
  });

  const ref = useRef<HTMLCanvasElement | null>(null);
  const GameStart = useGameLogic({gameData, setGameData});

  function Start() {
    if (!ref.current) return;
    const canvas = ref.current;
    const ctx = ref.current.getContext("2d");
    if (!ctx) throw Error("Не 2D контекст!")
    GameStart(ctx, canvas)
  }

  useEffect(() => {
    Start()
  }, [ref.current])

  useEffect(() => {

  }, [gameData.players[0]])

  return (
    <>
      <div className='player leftPlayer'>
        <h3>Player1</h3>
        <span>Got Hit:</span>
        <span>{gameData.players[0].hits}</span>
        <br/>
        <span>Speed:</span>
        <input type = "range" min = {2} max = {10} step = {0.5} value = {Math.abs(gameData.players[0].speed)} onChange={(e) => {
            setGameData(prev => {
              prev.players[0].speed = +e.target.value;
              return {...prev};
            })
          }}/>
        <br/>
        <span>ShootRate:</span>
        <input type = "range" min = {0.5} max = {5} step = {0.5} value = {gameData.players[0].shootCooldown} onChange={(e) => {
            setGameData(prev => {
              prev.players[0].shootCooldown = +e.target.value;
              return {...prev};
            })
          }}/>
        <input type = "color" value = {gameData.players[0].color} onChange={(e) => {
            setGameData(prev => {
              prev.players[0].color = e.target.value;
              return {...prev}
            })
          }}/>
      </div>
      <canvas ref={ref} width={gameData.gameboardSize.width} height={gameData.gameboardSize.height}/>
      <div className='player rightPlayer'>
        <h3>Player2</h3>
        <span>Got Hit:</span>
        <span>{gameData.players[1].hits}</span>
        <br/>
        <span>Speed:</span>
        <input type = "range" min = {2} max = {10} step = {0.5} value = {Math.abs(gameData.players[1].speed)} onChange={(e) => {
            setGameData(prev => {
              prev.players[1].speed = +e.target.value;
              return {...prev};
            })
          }}/>
        <br/>
        <span>ShootRate:</span>
        <input type = "range" min = {0.5} max = {5} step = {0.5} value = {gameData.players[1].shootCooldown} onChange={(e) => {
            setGameData(prev => {
              prev.players[1].shootCooldown = +e.target.value;
              return {...prev};
            })
          }}/>
        <input type = "color" value = {gameData.players[1].color} onChange={(e) => {
            setGameData(prev => {
              prev.players[1].color = e.target.value;
              return {...prev}
            })
          }}/>
      </div>
    </>
  )
}

export default App
