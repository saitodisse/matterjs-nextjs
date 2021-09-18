/* eslint-disable no-console */
import React, { useEffect, useRef } from 'react'
import Matter from 'matter-js'

const {
  Engine,
  Render,
  Mouse,
  MouseConstraint,
  Runner,
  Body,
  Bodies,
  Composite,
  Composites,
  Constraint,
  World,
} = Matter

export default function Page() {
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
      Runner.stop(runnerRef.current as Matter.Runner)
      Engine.clear(engineRef.current as Matter.Engine)
      createWorld()
    }
  }, [canvas, world])

  const WIDTH = 1000
  const HEIGHT = 700

  function createWorld() {
    const engine = Engine.create()
    engineRef.current = engine
    world.current = engine.world

    console.log('Creating world!')

    // create a renderer
    const render = Render.create({
      canvas: canvas.current || undefined,
      engine,
      options: {
        width: WIDTH,
        height: HEIGHT,
        background: '#666',
        showCollisions: false,
        showVelocity: false,
        showAxes: false,
        wireframes: false,
      } as Matter.IRendererOptions,
    })

    const wallBorderWidth = 25
    const wallLength = 500

    // walls
    World.add(engine.world, [
      // celling
      // Bodies.rectangle(WIDTH / 2, HEIGHT / 4, wallLength, wallBorderWidth, { isStatic: true }),
      // ground
      Bodies.rectangle(WIDTH / 2, HEIGHT - HEIGHT / 4, wallLength * 0.7, wallBorderWidth, {
        isStatic: true,
      }),

      // ground 2
      Bodies.rectangle(WIDTH / 2, HEIGHT - 30, WIDTH * 0.9, wallBorderWidth, {
        isStatic: true,
      }),

      Bodies.rectangle(
        WIDTH / 3 + WIDTH / 3,
        HEIGHT - HEIGHT / 2,
        wallBorderWidth,
        wallLength * 0.2,
        {
          isStatic: true,
        }
      ),
      Bodies.rectangle(WIDTH / 3, HEIGHT - HEIGHT / 2, wallBorderWidth, wallLength * 0.2, {
        isStatic: true,
      }),
    ])
    const mouse = Mouse.create(render.canvas)
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: true,
        },
      } as Matter.Constraint,
    })

    World.add(engine.world, mouseConstraint)

    Matter.Events.on(mouseConstraint, 'mousedown', (event) => {
      createBalls(event.source.mouse.mousedownPosition)
    })

    function createBalls(mouseDownPosition?: Matter.IMousePoint) {
      for (let i = 0; i < 10 * Math.random(); i += 1) {
        World.add(
          engine.world,
          Bodies.circle(
            mouseDownPosition?.x || WIDTH / 2,
            mouseDownPosition?.y || HEIGHT / 2,
            30 * Math.random() + 10,
            { restitution: 0.7 }
          )
        )
      }
    }

    createBalls()

    // add all of the bodies to the world
    // Composite.add(engine.world, [boxA, boxB, ground])

    // run the renderer
    Render.run(render)

    // create runner
    const runner = Runner.create()
    runnerRef.current = runner

    // run the engine
    Runner.run(runner, engine)

    // addToGlobal()

    // function addToGlobal() {
    //   window.Engine = Engine
    //   window.Render = Render
    //   window.Mouse = Mouse
    //   window.MouseConstraint = MouseConstraint
    //   window.Runner = Runner
    //   window.Body = Body
    //   window.Bodies = Bodies
    //   window.Composite = Composite
    //   window.Composites = Composites
    //   window.Constraint = Constraint
    //   window.World = World
    //   window.runner = runner
    //   window.engine = engine
    // }
  }

  return (
    <div className='flex justify-center'>
      <canvas className='bg-gray-700' ref={canvas} />
    </div>
  )
}
