/* eslint-disable no-console */
import React, { useEffect, useRef } from 'react'
import Matter from 'matter-js'
import { getRandom } from '../../utils/getRandom'
import router from 'next/router'
import _ from 'lodash'
import Loading from '../Loading/Loading'

const { Bodies, Engine, Events, Mouse, MouseConstraint, Render, Runner, World } = Matter

declare global {
  interface Window {
    engine: Matter.Engine
    runner: Matter.Runner
  }
}

export function Chances({ wScreen, hScreen }: { wScreen: number; hScreen: number }) {
  const canvas = useRef(null)
  const world = useRef<Matter.World>()
  const engineRef = useRef<Matter.Engine>()
  const runnerRef = useRef<Matter.Runner>()

  useEffect(() => {
    if (runnerRef.current) {
      Runner.stop(runnerRef.current as Matter.Runner)
      Engine.clear(engineRef.current as Matter.Engine)
    }

    createWorld()

    return () => {
      console.log('clear')
      Runner.stop(runnerRef.current as Matter.Runner)
      Engine.clear(engineRef.current as Matter.Engine)
      router.reload()
    }
  }, [canvas, world])

  function createWorld() {
    if (!wScreen || !hScreen) {
      console.error({ wScreen, hScreen })
      return
    }
    const engine = Engine.create()
    engineRef.current = engine
    world.current = engine.world

    console.log('createWorld')

    // create a renderer
    const render = Render.create({
      canvas: canvas.current || undefined,
      engine,
      options: {
        width: wScreen,
        height: hScreen,
        background: '#666',
        showCollisions: false,
        showVelocity: false,
        showAxes: false,
        wireframes: false,
      } as Matter.IRendererOptions,
    }) as Matter.Render & { mouse: any }

    const FLOORS_LEVELS = Math.ceil(hScreen / 50)
    const FLOORS_COUNT = Math.abs(wScreen / 68)

    console.log('--  FLOORS_LEVELS: ', FLOORS_LEVELS)
    console.log('--  FLOORS_COUNT: ', FLOORS_COUNT)

    const floors: Matter.Body[] = []

    for (let yIndex = 0; yIndex < FLOORS_LEVELS; yIndex += 1) {
      for (let xIndex = 0; xIndex < FLOORS_COUNT; xIndex += 1) {
        const xOffset = yIndex % 2 === 0 ? wScreen / FLOORS_COUNT / 2 : 0
        const x = (wScreen / FLOORS_COUNT) * xIndex + xOffset
        const y = (hScreen / 11) * (yIndex + 4)
        const w = 10

        const rect = Bodies.circle(x, y, w, {
          isStatic: true,
          render: {
            fillStyle: '#444',
            strokeStyle: '#333',
            lineWidth: 3,
          },
        })

        floors.push(rect)
      }
    }

    // walls
    World.add(engine.world, [...floors])

    // MOUSE
    const mouse = Mouse.create(render.canvas)
    render.mouse = mouse
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.5,
        render: {
          visible: true,
        },
      } as Matter.Constraint,
    })

    World.add(engine.world, mouseConstraint)

    let mouseIsDragging = false
    let setIntervalId: NodeJS.Timer

    Matter.Events.on(mouseConstraint, 'startdrag', () => {
      mouseIsDragging = true
    })
    Matter.Events.on(mouseConstraint, 'enddrag', () => {
      mouseIsDragging = false
    })
    Matter.Events.on(mouseConstraint, 'mousedown', (ev) => {
      if (mouseIsDragging === false) {
        setIntervalId = setInterval(() => {
          createBalls(ev.source.mouse.position)
        }, (1000 / 60) * 3)
      }
    })
    Matter.Events.on(mouseConstraint, 'mouseup', () => {
      clearInterval(setIntervalId)
    })

    //
    //
    // After Update
    //
    //
    Events.on(engine, 'afterUpdate', (ev) => {
      // const time = engine.timing.timestamp
      // objectsCountSet(ev.source.world.bodies.length)

      ev.source.world.bodies.forEach((b) => {
        if (b.position.x > wScreen || b.position.x < 0 || b.position.y > hScreen) {
          console.log('World.remove', b.id)
          World.remove(engine.world, b)
        }
      })
      // fpsSet(Math.abs(runner.fps))
    })

    function createBalls(positionXY?: Matter.IMousePoint) {
      if (!wScreen || !hScreen) {
        console.error({ wScreen, hScreen })
        return
      }

      if (!positionXY) {
        return
      }

      World.add(
        engine.world,
        Bodies.circle(
          positionXY.x + getRandom(15) || wScreen / 2,
          positionXY.y + getRandom(15) || hScreen / 2,
          12,
          { restitution: 0.7 }
        )
      )
    }

    createBalls()

    Render.run(render)

    // create runner
    const runner = Runner.create() as Matter.Runner & {
      correction: number
      counterTimestamp: number
      delta: number
      // deltaHistory: number
      deltaMax: number
      deltaMin: number
      deltaSampleSize: number
      enabled: boolean
      fps: number
      frameCounter: number
      frameRequestId: number
      isFixed: boolean
      timePrev: number
      timeScalePrev: number
    }
    runnerRef.current = runner
    // run the engine
    Runner.run(runner, engine)

    // add To Global
    window.Matter = Matter
    window.engine = engine
    window.runner = runner
  }

  if (!wScreen) {
    return <Loading />
  }

  return <canvas className='w-screen h-screen bg-gray-700' ref={canvas} />
}
