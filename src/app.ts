import { App, batch } from 'blah'
import Game from './game'

export const app = (element: HTMLElement) => {


  let game = new Game()

  App.run({
    name: 'headsup23',
    width: 1920,
    height: 1080,
    on_startup() {
      game.init()
    },
    on_update() {
      game.update()
    },
    on_render() {
      game.draw(batch)
    }
  })

  if (App.canvas) {
    element.appendChild(App.canvas)
  }
}
