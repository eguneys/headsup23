import { TextureFilter, TextureSampler } from 'blah'
import { Color } from 'blah'
import { App, batch } from 'blah'

import Content from './content'
import { Play } from './play'
import { Scene } from './scene'


export default class Game extends Play {

  static width = 1920
  static height = 1080

  _init() {
    batch.default_sampler = TextureSampler.make(TextureFilter.Linear)

    this.objects = []


    Content.load().then(() => {

      this.make(Scene)

    })

  }

  _draw() {
    Play.next_render_order = 0

    App.backbuffer.clear(Color.black)

    this._draw_children(batch)
  }



}