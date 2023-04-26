import { Rect, Vec2, Color } from 'blah'

import { Play } from './play'
import { Clickable, RectView, Text } from './text'

const format_chips = (n: number) => {
  return `${n}`
}

const colors = {
  dark_button: new Color(30, 30, 30, 255),
  dark: new Color(50, 50, 50, 255),
  yellow: new Color(220, 220, 20, 255),
  blue: new Color(30, 30, 220, 255),
  red: new Color(220, 20, 20, 255),
}


type FoldButtonData = {
  on_click: () => void
}
export class FoldButton extends Play {

  get data() {
    return this._data as FoldButtonData
  }

  _init() {

    let w = 300, h = 102
    this.origin = Vec2.make(w/2, h/4)
    this.make(RectView, Vec2.zero, { w, h, color: colors.dark })
    this.make(Text, Vec2.make(w/2, h*0.2), { center: true, size: 32, text: 'Fold', color: colors.red })

    let self = this
    this.make(Clickable, Vec2.make(0, 0), {
      rect: Rect.make(0, 0, w, h),
      on_click() {
        self.data.on_click()
        self.bounce()
        return true
      }
    })
  }
}



type CallButtonData = {
  on_click: () => void
}
export class CallButton extends Play {

  get data() {
    return this._data as CallButtonData
  }

  amount_text!: Text

  _amount: number

  set amount(v: number | undefined) {
    this._amount = v
    this.amount_text.text = format_chips(v)
  }

  _init() {

    let w = 300, h = 102
    this.origin = Vec2.make(w/2, h/4)
    this.make(RectView, Vec2.zero, { w, h, color: colors.dark })
    this.make(Text, Vec2.make(w/2, h*0.2), { center: true, size: 32, text: 'Call', color: colors.blue })
    this.amount_text = this.make(Text, Vec2.make(w/2, h*0.6), { center: true, size: 32, text: '', color: colors.yellow })

    let self = this
    this.make(Clickable, Vec2.make(0, 0), {
      rect: Rect.make(0, 0, w, h),
      on_click() {
        self.data.on_click()
        self.bounce()
        return true
      }
    })
  }
}

type RaiseButtonData = {
  on_open: () => void
  on_apply: () => void
}

export class RaiseButton extends Play {

  get data() {
    return this._data as RaiseButtonData
  }

  set is_bet(v: boolean) {
    this.bet_or_raise_text.text = v ? 'Bet' : 'Raise'
  }

  amount_text!: Text
  bet_or_raise_text!: Text

  _amount: number | undefined

  set amount(v: number | undefined) {
    if (!this._amount) {
      this.bounce()
    }
    if (this._amount && !v) {
      this.bounce()
    }
    this._amount = v
    if (v) {
      this.amount_text.visible = true
      this.amount_text.text = format_chips(v)
    } else {
      this.amount_text.visible = false
    }
  }
  get amount() {
    return this._amount
  }

  get is_open() {
    return this.amount !== undefined
  }

  text!: Text

  _init() {

    let w = 300, h = 102
    this.origin = Vec2.make(w/2, h/4)
    this.make(RectView, Vec2.zero, { w, h, color: colors.dark })
    this.bet_or_raise_text = this.make(Text, Vec2.make(w/2, h*0.2), { center: true, size: 32, text: 'Bet', color: colors.yellow })
    this.amount_text = this.make(Text, Vec2.make(w/2, h*0.6), { center: true, size: 32, text: '', color: colors.yellow })

    let self = this
    this.make(Clickable, Vec2.make(0, 0), {
      rect: Rect.make(0, 0, w, h),
      on_click() {
        if (self.is_open) {
          self.data.on_apply()
        } else {
          self.data.on_open()
        }
        return true
      }
    })
  }
}


/* https://stackoverflow.com/questions/14627566/rounding-in-steps-of-20-or-x-in-javascript */
function round(number: number, increment: number, offset: number) {
    return Math.round((number - offset) / increment ) * increment + offset;
}

type RaiseSliderData = {
  on_change: (value: number) => void
}
export class RaiseSlider extends Play {

  get data() {
    return this._data as RaiseSliderData
  }

  thumb!: Play
  slider_clickable!: Clickable

  min!: number
  max!: number
  steps!: number

  _value!: number
  set value(n: number) {
    n = Math.min(this.max, Math.max(this.min, n))
    this._value = n
    this.thumb.position.x = ((n - this.min) / this.range * (450 - 30)) + 15
    this.data.on_change(n)
  }

  get value() {
    return this._value
  }

  get range() {
    return this.max - this.min
  }

  _init() {
    let w = 450, h = 10
    this.make(RectView, Vec2.make(0, 0), { w, h, color: Color.black })


    this.thumb = this.make(RectView, Vec2.make(15, 5), { w: 30, h: 30, color: Color.black })
    this.thumb.origin = Vec2.make(15, 15)
    this.thumb.rotation = Math.PI * 0.25


    let self = this
    this.slider_clickable = this.make(Clickable, Vec2.make(0, -20), {
      rect: Rect.make(0, 0, w, h + 40),
      on_drag(e: Vec2) {
        let y = e.sub(self.slider_clickable.g_position).x / w * (self.range + self.steps - 1)
        y = round(y, self.steps, 0)
        self.value = self.min + y
      },
      on_click(e: Vec2) {
        let y = e.sub(self.slider_clickable.g_position).x / w * (self.range + self.steps - 1)
        y = round(y, self.steps, 0)
        self.value = self.min + y
      }
    })
  }
}

export class RaiseAmountText extends Play {

  text!: Text

  set value(n: string) {
    this.text.text = n
  }

  _init() {

    let w = 500, h = 64
    this.make(RectView, Vec2.zero, { w, h, color: Color.black })
    this.text = this.make(Text, Vec2.make(w/2, h/9), { center: true, size: 64, text: '', color: Color.white })
  }
}



type PresetBetButtonData = {
  text: string,
  on_click: () => void
}
export class PresetBetButton extends Play {

  get data() {
    return this._data as PresetBetButtonData
  }

  text!: Text

  _init() {

    let w = 100, h = 56
    this.make(RectView, Vec2.zero, { w, h, color: colors.dark_button })
    this.text = this.make(Text, Vec2.make(w/2, h/4), { center: true, size: h*0.7, text: this.data.text, color: Color.white })

    let self = this
    this.make(Clickable, Vec2.make(0, 0), {
      rect: Rect.make(0, 0, w, h),
      on_click() {
        self.data.on_click()
        return true
      }
    })


  }
}

type PresetBetRaisesData = {
  on_pot: (n: number) => void
  on_allin: () => void
}
export class PresetBetRaises extends Play {

  get data() {
    return this._data as PresetBetRaisesData
  }

  _init() {

    let self = this
    this.make(PresetBetButton, Vec2.make(0, 0), { text: '1/4', 
              on_click() {
                self.data.on_pot(1/4)
              } 
    })
    this.make(PresetBetButton, Vec2.make(110, 0), { text: '1/2', 
              on_click() { self.data.on_pot(1/2) } })
    this.make(PresetBetButton, Vec2.make(110*2, 0), { text: '3/4',
   on_click() { self.data.on_pot(3/4) } })
    this.make(PresetBetButton, Vec2.make(110*3, 0), { text: 'Pot', 
   on_click() { self.data.on_pot(1) } })
    this.make(PresetBetButton, Vec2.make(110*4, 0), { text: 'Allin', on_click() {
      self.data.on_allin()
    } })
  }
}

type RaiseDialogData = {
  on_change: (n: number) => void
}

export class RaiseDialog extends Play {

  get data() {
    return this._data as RaiseDialogData
  }

  slider!: RaiseSlider
  amount_text!: RaiseAmountText

  _init() {

    let self = this

    let w = 600, h = 300
    this.origin = Vec2.make(w/2, h/2)
    this.make(RectView, Vec2.one, { w, h, color: Color.black })
    this.make(RectView, Vec2.zero, { w, h, color: colors.dark })
    let i = this.make(RectView, Vec2.make(w * 0.8, h), { w: 30, h: 30, color: colors.dark})
    i.origin = Vec2.make(15, 15)
    i.rotation = Math.PI * 0.25

    this.make(Clickable, Vec2.make(0, 0), {
      rect: Rect.make(0, 0, w, h),
      on_click() {
        return true
      }
    })

    this.amount_text = this.make(RaiseAmountText, Vec2.make(50, 30))

    this.slider = this.make(RaiseSlider, Vec2.make(75, 150), {
      on_change(n: number) {
        self.data.on_change(n)
        self.amount_text.value = format_chips(n)
      }
    })

    let allin = 1000
    let pot = 100
    this.slider.min = 1
    this.slider.max = allin
    this.slider.steps = 100
    this.slider.value = this.slider.min

    this.amount_text.value = format_chips(this.slider.value)

    this.make(PresetBetRaises, Vec2.make(30, 200), {
      on_pot(n: number) {
        self.slider.value = pot * n
      },
      on_allin() {
        self.slider.value = allin
      }
    })

  }

}


export class Buttons extends Play {

  raise_dialog!: RaiseDialog
  raise_button!: RaiseButton
  call_button!: CallButton


  set is_raise_dialog_open(v: boolean) {
    if (v && !this.raise_button.is_open) {
      this.raise_dialog.slider.value = this.raise_dialog.slider.min
      this.raise_dialog.visible = true
      this.raise_button.amount = this.raise_dialog.slider.min
    } else {
      if (this.raise_button.is_open) {
        this.raise_dialog.visible = false
        this.raise_button.amount = undefined
      }
    }
  }

  _init() {

    let self = this
    this.make(Clickable, Vec2.make(0, 0), {
      rect: Rect.make(0, 0, 1920, 1080),
      on_click() {
        self.is_raise_dialog_open = false
        return true
      }
    })


    this.fold_button = this.make(FoldButton, Vec2.make(1140, 990), {
      on_click() {
      }
    })



    this.call_button = this.make(CallButton, Vec2.make(1450, 990), {
      on_click() {
      }
    })



    this.raise_button = this.make(RaiseButton, Vec2.make(1760, 990), {
      on_open() {
        self.is_raise_dialog_open = true
      },
      on_apply() {
        self.is_raise_dialog_open = false
      }
    })
    this.raise_button.is_bet = true
    this.raise_dialog = this.make(RaiseDialog, Vec2.make(1600, 780), {
      on_change(n: number) {
        self.raise_button.amount = n
      }
    })
    this.raise_dialog.visible = false

    this.is_raise_dialog_open = true
  }
}
