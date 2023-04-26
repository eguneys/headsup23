import { Rect, Vec2, Color } from 'blah'

import { Play } from './play'
import { Clickable, RectView, Text } from './text'

const colors = {
  dark: new Color(50, 50, 50, 255),
  yellow: new Color(220, 220, 20, 255)
}

type RaiseButtonData = {
  on_raise: () => void
  on_apply: () => void
}

export class RaiseButton extends Play {

  get data() {
    return this._data as RaiseButtonData
  }


  is_open!: boolean
  text!: Text

  _init() {
    this.is_open = false

    let w = 140, h = 56
    this.origin = Vec2.make(w/2, h/2)
    this.make(RectView, Vec2.zero, { w, h, color: colors.dark })
    this.text = this.make(Text, Vec2.make(w/2, h/3), { center: true, size: 32, text: 'Raise', color: colors.yellow })

    let self = this
    this.make(Clickable, Vec2.make(0, 0), {
      rect: Rect.make(0, 0, 120, 56),
      on_click() {
        self.bounce()
        if (self.is_open) {
          self.data.on_apply()
        } else {
          self.data.on_raise()
        }
        return true
      }
    })
  }

  set_apply() {
    this.text.text = 'Apply'
    this.is_open = true
  }

  set_raise() {
    this.text.text = 'Raise'
    this.is_open = false
  }
}

export class RaiseDialog extends Play {

  _init() {

    let w = 600, h = 300
    this.origin = Vec2.make(w/2, h/2)
    this.make(RectView, Vec2.one, { w, h, color: Color.black })
    this.make(RectView, Vec2.zero, { w, h, color: colors.dark })
    let i = this.make(RectView, Vec2.make(w * 0.8, h), { w: 30, h: 30, color: colors.dark})
    i.origin = Vec2.make(15, 15)
    i.rotation = Math.PI * 0.25


    let self = this
    this.make(Clickable, Vec2.make(0, 0), {
      rect: Rect.make(0, 0, w, h),
      on_click() {
        return true
      }
    })

  }

}


export class Buttons extends Play {

  raise_dialog!: RaiseDialog
  raise_button!: RaiseButton

  _init() {
    this.raise_dialog = this.make(RaiseDialog, Vec2.make(1600, 800))
    this.raise_dialog.visible = false

    let self = this
    this.raise_button = this.make(RaiseButton, Vec2.make(1780, 1000), {
      on_raise() {
        self.raise_dialog.visible = true
        self.raise_button.set_apply()
      },
      on_apply() {
        self.raise_dialog.visible = false
        self.raise_button.set_raise()
      }
    })

    this.make(Clickable, Vec2.make(0, 0), {
      rect: Rect.make(0, 0, 1920, 1080),
      on_click() {
        self.raise_dialog.visible = false
        self.raise_button.set_raise()
      }
    })

  }
}
