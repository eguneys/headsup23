import { Rect, Vec2, Color } from 'blah'

import { Play } from './play'
import { Clickable, RectView, Text } from './text'
import { Dests } from 'lheadsup'

const format_chips = (n: number) => {
  return `${n}`
}

const colors = {
  dark_button: Color.hex(0x222222),
  dark: Color.hex(0x353535),
  yellow: Color.hex(0xaaaa22),
  blue: Color.hex(0x2323da),
  red: Color.hex(0xaa2323),
}


type CheckButtonData = {
  on_click: () => void
}
export class CheckButton extends Play {

  get data() {
    return this._data as CheckButtonData
  }

  _init() {

    let w = 300, h = 102
    this.origin = Vec2.make(w/2, h/4)
    this.make(RectView, Vec2.zero, { w, h, color: colors.dark })
    this.make(Text, Vec2.make(w/2, h*0.2), { center: true, size: 32, text: 'Check', color: colors.blue })

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


type AllinButtonData = {
  on_click: () => void
}
export class AllinButton extends Play {

  get data() {
    return this._data as AllinButtonData
  }

  amount_text!: Text

  _amount!: number

  set amount(v: number) {
    this._amount = v
    this.amount_text.text = format_chips(v)
  }

  _init() {

    let w = 300, h = 102
    this.origin = Vec2.make(w/2, h/4)
    this.make(RectView, Vec2.zero, { w, h, color: colors.dark })
    this.make(Text, Vec2.make(w/2, h*0.2), { center: true, size: 32, text: 'Allin', color: colors.yellow })
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


type CallButtonData = {
  on_click: () => void
}
export class CallButton extends Play {

  get data() {
    return this._data as CallButtonData
  }

  amount_text!: Text

  _amount!: number

  set amount(v: number) {
    this._amount = v
    this.amount_text.text = format_chips(v)
  }

  _init() {

    let w = 300, h = 102
    this.origin = Vec2.make(w/2, h/4)
    this.make(RectView, Vec2.zero, { w, h, color: colors.dark })
    this.make(Text, Vec2.make(w/2, h*0.2), { center: true, size: 32, text: 'Call', color: colors.blue })
    this.amount_text = this.make(Text, Vec2.make(w/2, h*0.6), { center: true, size: 32, text: '', color: colors.blue })

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
  on_apply: (raise: number) => void
}

export class RaiseButton extends Play {

  get data() {
    return this._data as RaiseButtonData
  }

  set is_bet(v: boolean) {
    this.bet_or_raise_text.text = v ? 'Bet' : 'Raise to'
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
          self.data.on_apply(self.amount!)
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
  on_min: () => void
  on_pot: (n: number) => void
  on_allin: () => void
}
export class PresetBetRaises extends Play {

  get data() {
    return this._data as PresetBetRaisesData
  }

  set is_min_enabled(v: boolean) {
    this.min_button.visible = v
    this.quarter_button.visible = !this.min_button.visible
  }

  quarter_button!: PresetBetButton
  min_button!: PresetBetButton

  _init() {

    let self = this
    this.min_button = this.make(PresetBetButton, Vec2.make(0, 0), { text: 'Min', 
              on_click() {
                self.data.on_min()
              } 
    })

    this.quarter_button = this.make(PresetBetButton, Vec2.make(0, 0), { text: '1/4', 
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

  preset_raises!: PresetBetRaises


  allin_amount!: number
  pot_amount!: number

  set_config(big_blind: number, min: number, allin: number, pot: number) {

    this.allin_amount = allin
    this.pot_amount = pot

    this.slider.min = min
    this.slider.max = allin
    this.slider.steps = big_blind
    this.slider.value = this.slider.min
    this.amount_text.value = format_chips(this.slider.value)
  }

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

    this.preset_raises = this.make(PresetBetRaises, Vec2.make(30, 200), {
      on_min() {
        self.slider.value = self.slider.min
      },
      on_pot(n: number) {
        self.slider.value = self.pot_amount * n
      },
      on_allin() {
        self.slider.value = self.allin_amount
      }
    })

  }

}

type ButtonsData = {
  on_action: (v: string, raise?: number) => void
}

export class Buttons extends Play {

  get data() {
    return this._data as ButtonsData
  }

  raise_dialog!: RaiseDialog
  raise_button!: RaiseButton
  call_button!: CallButton
  fold_button!: FoldButton
  check_button!: CheckButton
  allin_button!: AllinButton

  match_amount!: number


  set_fen(fen: string | undefined, big_blind: number, pot: number) {

    if (!fen) {
      this.visible = false
      return
    }
    this.visible = true

    let dests = Dests.from_fen(fen)

    this.fold_button.visible = !!dests.fold
    this.check_button.visible = !!dests.check

    if (dests.call) {
      this.call_button.visible = true
      this.call_button.amount = dests.call
    } else {
      this.call_button.visible = false
    }

    if (dests.raise) {
      let [match, min, max] = dests.raise
      this.raise_button.visible = true

      this.match_amount = match
      if (match === 0) {
        this.raise_button.is_bet = true

        this.raise_dialog.set_config(big_blind, min, max, pot)
        this.raise_dialog.preset_raises.is_min_enabled = false
      } else {
        this.raise_button.is_bet = false
        // Raise Options
        this.raise_dialog.set_config(big_blind, min + match, max, pot)
        this.raise_dialog.preset_raises.is_min_enabled = true
      }
      this.allin_button.visible = false
    } else {
      this.raise_button.visible = false
      if (dests.allin) {
        this.allin_button.visible = true
        this.allin_button.amount = dests.allin
      } else {
        this.allin_button.visible = false
      }
    }
    

    this.is_raise_dialog_open = false
  }

  set is_raise_dialog_open(v: boolean) {
    if (v) {
      this.raise_dialog.visible = true
      if (!this.raise_button.is_open) {
        this.raise_dialog.slider.value = this.raise_dialog.slider.min
        this.raise_button.amount = this.raise_dialog.slider.min
      }
    } else {
      this.raise_dialog.visible = false
      if (this.raise_button.is_open) {
        this.raise_button.amount = undefined
      }
    }
  }

  _init() {

    const on_action = (v: string, raise_to?: number) => {
      if (raise_to) {
        let raise = raise_to - this.match_amount
        this.data.on_action(`raise-${raise}`)
      } else {
        this.data.on_action(v)
      }
    }

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
        on_action('fold')
      }
    })


    this.check_button = this.make(CheckButton, Vec2.make(1450, 990), {
      on_click() {
        on_action('check')
      }
    })

    this.call_button = this.make(CallButton, Vec2.make(1450, 990), {
      on_click() {
        on_action('call')
      }
    })


    this.allin_button = this.make(AllinButton, Vec2.make(1760, 990), {
      on_click() {
        on_action('allin')
      }
    })



    this.raise_button = this.make(RaiseButton, Vec2.make(1760, 990), {
      on_open() {
        self.is_raise_dialog_open = true
      },
      on_apply(raise: number) {
        //self.is_raise_dialog_open = false
        on_action('raise', raise)
        self.raise_button.bounce()
      }
    })
    this.raise_button.is_bet = true
    this.raise_dialog = this.make(RaiseDialog, Vec2.make(1600, 780), {
      on_change(n: number) {
        self.raise_button.amount = n
      }
    })
  }
}
