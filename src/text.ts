import { Mat3x2, Color, Rect, Vec2, Batch } from 'blah'

import Game from './game'
import { Play } from './play'
import { DragEvent, EventPosition } from './input'

type RectData = {
  w: number,
  h: number,
  color?: Color
}

export class RectView extends Play {

  get data() {
    return this._data as RectData
  }

  _color!: Color
  set color(c: Color) {
    this._color = c
  }
  get color() {
    return this._color
  }

  set height(h: number) {
    this.data.h = h
  }

  _init() {
    this.color = this.data.color ?? Color.white
  }

  _draw(batch: Batch) {

    let scale = Vec2.one
    batch.push_matrix(Mat3x2.create_transform(this.position, this.origin, scale, this.rotation))
    batch.rect(Rect.make(0, 0, this.data.w, this.data.h), this.color)
    batch.pop_matrix()
  }
}

export class Background extends Play {
  _init() {

    this.make(RectView, Vec2.make(0, 0), {
      w: Game.width,
      h: Game.height,
      color: Color.hex(0x222222)
    })
  }
}




type TextData = {
  size?: number,
  text: string,
  center?: true,
  color?: Color
  rotation?: number
}

export class Text extends Play {

  get data() {
    return this._data as TextData
  }

  get justify() {
    return this.data.center ? Vec2.make(0, 0) : Vec2.zero
  }

  get color() {
    return this._color
  }

  _color!: Color
  set color(color: Color) {
    this._color = color
  }

  get text() {
    return this.data.text
  }

  set text(text: string) {
    this.data.text = text
  }

  _size!: number
  get size() {
    return this._size
  }

  set size(size: number) {
    this._size = size
  }

  get width() {
    return this.font.width_of(this.text) / this.font.size * this.size
  }

  get height() {
    return this.font.height_of(this.text) / this.font.size * this.size
  } 

  _init() {
    this.color = this.data.color ?? Color.white
    this._size = this.data.size ?? 128
    this.rotation = this.data.rotation ?? 0
    this.origin = this.data.center ? Vec2.make(this.width / 2, 0) : Vec2.zero
  }

  _draw(batch: Batch) {
    batch.push_matrix(Mat3x2.create_transform(this.position, this.origin, Vec2.one, this.rotation))

    this.g_position = Vec2.transform(Vec2.zero, batch.m_matrix)
    batch.str_j(this.font, this.text, Vec2.zero, this.justify, this.size, this.color)
    batch.pop_matrix()
  }
}



type ClickableData = {
  abs?: true,
  debug?: true,
  rect: Rect,
  on_hover?: () => boolean,
  on_hover_end?: () => void,
  on_click_begin?: () => boolean,
  on_click?: () => boolean,
  on_drag_begin?: (e: Vec2) => boolean,
  on_drag_end?: (e: Vec2) => void,
  on_drag?: (e: Vec2) => boolean,
  on_drop?: (e: Vec2) => void,
  on_up?: (e: Vec2, right: boolean) => void,
  on_wheel?: (d: number) => void
}

export class Clickable extends Play {

  get data() {
    return this._data as ClickableData
  }

  get width() {
    return this._scaled_rect.w
  }

  get height() {
    return this._scaled_rect.h
  }

  _scaled_rect!: Rect

  get _rect() {
    return this.data.abs ? 
      Rect.make(this.position.x, this.position.y, this.width, this.height)
      : this._scaled_rect
  }

  get rect() {
    let { p_scissor } = this
    if (p_scissor) {
      return this._rect.overlaps_rect(p_scissor)
    } else {
      return this._rect
    }
  }

  _init() {

    this._scaled_rect = this.data.rect
    let _dragging = false
    let _hovering = false
    let self = this
    this.unbindable_input({
      on_click_begin(_e: EventPosition, right: boolean) {
        if (right) {
          return false
        }
        if (!self.p_visible) {
          return false
        }
        let e = _e.mul(Game.v_screen)
        let point = Rect.make(e.x - 4, e.y - 4, 8, 8)
        let rect = self.rect
        if (rect.overlaps(point)) {
          return self.data.on_click_begin?.() ?? false
        }
        return false
      },
      on_drag(d: DragEvent, d0?: DragEvent) {
        if (d._right) {
          return false
        }
        if (!self.p_visible) {
          return false
        }
        if (_dragging) {
          let m = d.m!.mul(Game.v_screen)
          return self.data.on_drag?.(m) ?? false
        }

        if (d.m && (!d0 || !d0.m)) {
          let e = d.e.mul(Game.v_screen)
          let point = Rect.make(e.x - 4, e.y - 4, 8, 8)
          let rect = self.rect
          if (rect.overlaps(point)) {
            _dragging = true
            return self.data.on_drag_begin?.(e) ?? false
          } else {
            return false
          }
        }
        return false
      },
      on_up(e: Vec2, right: boolean, m?: Vec2) {
        if (right) {
          return false
        }
        if (!self.p_visible) {
          return false
        }
        let _e = e.mul(Game.v_screen)

        if (_dragging) {
          _dragging = false
          self.data.on_drag_end?.(_e)
        } 

        self.data.on_up?.(e, right)

        if (m) {

          let _m = m.mul(Game.v_screen)
          let point = Rect.make(_m.x - 4, _m.y - 4, 8, 8)
          let rect = self.rect
          if (rect.overlaps(point)) {
            self.data.on_drop?.(m)
          }
        }


        return false
      },
      on_hover(_e: EventPosition) {
        if (!self.data.on_hover) {
          return false
        }
        if (!self.p_visible) {
          return false
        }
        let e = _e.mul(Game.v_screen)
        let point = Rect.make(e.x - 4, e.y - 4, 8, 8)
        let rect = self.rect
        if (rect.overlaps(point)) {
          if (!_hovering) {
            _hovering = true
            return self.data.on_hover?.() ?? false
          }
        } else {
          if (_hovering) {
            _hovering = false
            self.data.on_hover_end?.()
          }
        }
        return _hovering
      },
      on_hover_clear() {
        if (!self.data.on_hover_end) {
          return false
        }
        if (_hovering) {
          _hovering = false
          return self.data.on_hover_end?.()
        }
        if (!self.p_visible) {
          return false
        }
        return false
      },
      on_click(_e: EventPosition, _right: boolean) {
        if (!self.p_visible) {
          return false
        }
        let e = _e.mul(Game.v_screen)
        let point = Rect.make(e.x - 4, e.y - 4, 8, 8)
        let rect = self.rect
        if (rect.overlaps(point)) {
          return self.data.on_click?.() ?? false
        }
        return false
      },
      on_wheel(d: number, _e: EventPosition) {
        if (!self.p_visible) {
          return false
        }
        let e = _e.mul(Game.v_screen)
        let point = Rect.make(e.x - 4, e.y - 4, 8, 8)
        let rect = self.rect
        if (rect.overlaps(point)) {
          return self.data.on_wheel?.(d) ?? false
        }
        return false
      }
    })
  }

  _draw(batch: Batch) {
    batch.push_matrix(Mat3x2.create_translation(this.position))
    this.g_position = Vec2.transform(Vec2.zero, batch.m_matrix)
    this._scaled_rect = Rect.transform(this.data.rect, batch.m_matrix)
    if (this.data.debug) {
      batch.rect(Rect.make(0, 0, this.width, this.height), Color.hex(0x00ff00))
    }
    batch.pop_matrix()
  }

}
