import { Mat3x2, Color, Rect, Vec2, Batch } from 'blah'
import { PovHighlight, HandPov, Hi } from 'lheadsup'

import Game from './game'
import { Play } from './play'
import { Anim } from './anim'

export type Suit = string
export type Rank = string

const suit_long: Record<Suit, string> = { 's': 'spades', 'd': 'diamonds', 'h': 'hearts', 'c': 'clubs' }
const rank_long: Record<Rank, string> = { 'A': 'a', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', 'T': 't', 'J': 'j', 'Q': 'q', 'K': 'k' }

const hand_rank_long: Record<string, string> = {
  'high': 'High Card',
  'quad': 'Quads',
  'full': 'Full House',
  'set': 'Set',
  'pair2': 'Two Pair',
  'sflush': 'Straight Flush',
  'pair': 'One Pair',
  'straight': 'Straight',
  'flush': 'Flush'
}

const hand_tests = [
  [`Qh Qd 8s 8d 6c 6s 2h 3s 2s`,`pair2 Q 8 6`],
  [`Kc Kh 2s 9h 3d 6c 7d 3s 2s`,`pair K 9 7 6`],
  [`9c 3s 2c Ts 7h Kd 5d 6h Qh`, `high K T 9 7 5`],
  [`Qd Qh Qc Qs 5d 2c 8s 2s 3s`, `quad Q`],
  [`Kc Kh Ks Jd Jc 6h 7s 2s 3s`,`full K J`],
  [`7c 7s 7h Kd Jh 8s 3d 2s 3s`,`set 7 K J`],
  [`Qh Qd 8s 8d 6c 4s 2h 3s 2s`,`pair2 Q 8 6`],
  [`8h 9h Th Jh Qh 7d 2c 2s 3s`,`sflush Q`],
  [`5c 6d 7s 8h 9h Qc 2d 2s 3s`,`straight 9`],
  [`Ah 2h 5h 8h Kh 7s Jc 3s 2s`,`flush A`],
  [`Ah 2d 3c 4s 5h 8c Qd 2s 3s`,`straight 5`],
  [`Tc Jh Qd Ks Ah 4c 7d 3s 2s`,`straight A`]
]


export class SuitRankDecoration extends Play {

  rank!: Anim
  suit!: Anim
  lsuit!: Anim

  _card!: string

  get card() {
    return this._card
  }

  set card(card: string) {
    this._card = card
    let [rank, suit] = card.split('')
    this.rank.play_now(rank_long[rank])
    this.suit.play_now(suit_long[suit])
    this.lsuit.play_now(suit_long[suit])
  }

  _init() {
    this.rank = this.make(Anim, Vec2.make(140, 42), { name: 'rank' })
    this.rank.origin = Vec2.make(32, 32)

    this.suit = this.make(Anim, Vec2.make(38, 42), { name: 'suit' })
    this.suit.origin = Vec2.make(32, 32)

    this.lsuit = this.make(Anim, Vec2.make(88, 148), { name: 'suit' })
    this.lsuit.origin = Vec2.make(32, 32)
    this.lsuit.scale = Vec2.make(2, 2)
  }
}


export class Card extends Play {

  base_y!: number

  decoration!: SuitRankDecoration
  anim!: Anim
  shade!: RectView

  _init() {

    this.anim = this.make(Anim, Vec2.zero, { name: 'card' })
    this.anim.origin = Vec2.make(88, 120)
    this.anim.play_now('back_idle')
    this.anim.visible = false

    this.decoration = this.make(SuitRankDecoration, Vec2.make(-80, -120))
    this.decoration.visible = false
    this.base_y = this.position.y


    this.shade = this.make(RectView, Vec2.make(-88, -120), {
      w: 200,
      h: 240,
      color: new Color(0, 0, 0, 120)
    })
    this.shade.visible = false
  }

  *elevate_win(hi: Hi) {
    if (hi === 's') {
      this.shade.visible = true
    }

    if (hi === 'h') {
      this.base_y = this.position.y
      yield* this.tween_gen([0, 30], (v) => {
        this.position.y = this.base_y - v
      }, 200)
    }
  }

  *show_back() {
    this._tweens = []
    this.shade.visible = false
    this.decoration.visible = false
    this.anim.visible = true
    this.position.y = this.base_y
    yield* this.anim.play_now_single('back_idle')
  }


  *flip_front(card: string) {
    this._tweens = []
    this.shade.visible = false
    this.decoration.visible = false
    this.anim.visible = true
    this.position.y = this.base_y
    yield* this.anim.play_now_single('back_flip')
    yield* this.anim.play_now_single('idle')

    this.decoration.card = card
    this.decoration.visible = true
  }


  hide() {
    this._tweens = []
    this.shade.visible = false
    this.anim.visible = false
    this.position.y = this.base_y
    this.decoration.visible = false
  }
}


export class MiddleCards extends Play {

  pov?: HandPov

  river!: Card
  turn!: Card
  flop!: [Card, Card, Card]
  hs!: [Card, Card]
  os!: [Card, Card]

  showdown_title!: ShowdownTitle

  set fen(fen: string) {

    if (this.coroutines.length > 0) {
      this.coroutines.length = 0
      this.pov = undefined
    }
    this.routine(this.set_fen(fen))
  }


  *set_fen(fen: string) {
    let { pov } = this

    let new_pov = fen === '' ? undefined : HandPov.from_fen(fen)

    this.pov = new_pov

    let self = this


    function *show_pov(new_pov: HandPov) {
      if (new_pov.opponent) {
        yield self.show_opponent(new_pov.opponent)
      } else {
        yield self.show_opponent_back()
      }
      yield self.show_hand(new_pov.hand)
      yield self.show_flop(new_pov.flop)
      yield self.show_turn(new_pov.turn)
      yield self.show_river(new_pov.river)
      yield* self.wait_for(1000)
    }

    function *hide_pov() {
      yield self.show_hand(undefined)
      yield self.show_flop(undefined)
      yield self.show_turn(undefined)
      yield self.show_river(undefined)
      yield* self.show_opponent(undefined)
    }

    function *show_middle(pov: HandPov, new_pov: HandPov) {

      if (!pov.opponent && new_pov.opponent) {
        yield* self.show_opponent(new_pov.opponent)
      }

      if (!pov.flop && new_pov.flop) {
        yield* self.wait_for(2000)
        yield* self.show_flop(new_pov.flop)
      }

      if (!pov.turn && new_pov.turn) {
        yield* self.wait_for(2000)
        yield* self.show_turn(new_pov.turn)
      }

      if (!pov.river && new_pov.river) {
        yield* self.wait_for(2000)
        yield* self.show_river(new_pov.river)
      }
    }

    function *showdown_title(new_pov: HandPov) {
      let { highlight, my_hand_rank, op_hand_rank } = new_pov

      let hand_rank = highlight.hand_win ? my_hand_rank! : op_hand_rank!
      yield self.showdown_title.set_fen(hand_rank.fen!)

      yield self.highlight_cards(highlight)

      yield* self.wait_for(2000)
    }

    yield* self.showdown_title.set_fen('')
    if (!new_pov) {
      yield* hide_pov()
    } else if (!pov) {
      yield* show_pov(new_pov)
      yield* showdown_title(new_pov)
    } else if (!new_pov.fen.startsWith(pov.fen)) {
      yield* show_pov(new_pov)
      yield* showdown_title(new_pov)
    } else {
      yield* show_middle(pov, new_pov)
      yield* showdown_title(new_pov)
    }
  }

  _init() {

    let m_x = 200
    let m_y = 570
    this.flop = [
      this.make(Card, Vec2.make(m_x, m_y)),
      this.make(Card, Vec2.make(m_x + 190, m_y)),
      this.make(Card, Vec2.make(m_x + 190 * 2, m_y))
    ]
    
    this.turn = this.make(Card, Vec2.make(m_x + 190 * 3, m_y))
    this.river = this.make(Card, Vec2.make(m_x + 190 * 4, m_y))



    let h_x = 800
    let h_y = 900
    this.hs = [
      this.make(Card, Vec2.make(h_x, h_y)),
      this.make(Card, Vec2.make(h_x + 140, h_y))
    ]
    this.hs[0].rotation = - Math.PI * 0.1
    this.hs[1].rotation = Math.PI * 0.1


    let o_x = 800
    let o_y = 200
    this.os = [
      this.make(Card, Vec2.make(o_x, o_y)),
      this.make(Card, Vec2.make(o_x + 190, o_y))
    ]


    this.showdown_title = this.make(ShowdownTitle, Vec2.make(150, 340))
  }

  *highlight_cards(highlight: PovHighlight) {

    yield this.hs[0].elevate_win(highlight.hand[0])
    yield this.hs[1].elevate_win(highlight.hand[1])
    yield this.os[0].elevate_win(highlight.opponent[0])
    yield this.os[1].elevate_win(highlight.opponent[0])
    yield this.flop[0].elevate_win(highlight.flop[0])
    yield this.flop[1].elevate_win(highlight.flop[1])
    yield this.flop[2].elevate_win(highlight.flop[2])
    yield this.turn.elevate_win(highlight.turn)
    yield this.river.elevate_win(highlight.river)
  }

  *show_hand(hand?: [string, string]) {
    if (!hand) {
      this.hs[0].hide()
      this.hs[1].hide()
    } else {
      yield this.hs[0].flip_front(hand[0])
      yield* this.hs[1].flip_front(hand[1])
    }
  }

  *show_opponent(hand?: [string, string]) {
    if (!hand) {
      this.os[0].hide()
      this.os[1].hide()
    } else {
      yield this.os[0].flip_front(hand[0])
      yield* this.os[1].flip_front(hand[1])
    }
  }

  *show_opponent_back() {
    yield this.os[0].show_back()
    yield* this.os[1].show_back()
  }


  *show_flop(flop?: [string, string, string]) {
    if (!flop) {
      this.flop[0].hide()
      this.flop[1].hide()
      this.flop[2].hide()
    } else {
      yield this.flop[0].flip_front(flop[0])
      yield this.flop[1].flip_front(flop[1])
      yield* this.flop[2].flip_front(flop[2])
    }
  }

  *show_turn(turn?: string) {
    if (!turn) {
      this.turn.hide()
    } else {
      yield* this.turn.flip_front(turn)
    }
  }

  *show_river(river?: string) {
    if (!river) {
      this.river.hide()
    } else {
      yield* this.river.flip_front(river)
    }
  }
}

export class ShowdownTitle extends Play {

  bg!: RectView
  text!: Text

  *set_fen(fen: string) {

    if (fen === '') {
      this.bg.visible = false
      this.text.visible = false
      return
    }

    let [name, ...kicks] = fen.split(' ')

    let kickers = kicks.join(' ')

    this.bg.visible = true


    this.text.text = `${hand_rank_long[name]}     ${kickers}`

    yield* this.wait_for(400)
    this.text.visible = true
  }

  _init() {

    this.bg = this.make(RectView, Vec2.make(0, 0), {
      w: 890,
      h: 80,
      color: Color.white
    })

    this.text = this.make(Text, Vec2.make(10, 16), { size: 64, text: 'High Card 9 8 7', color: Color.black })

    this.bg.visible = false
    this.text.visible = false
  }
}

export class Scene extends Play {

  m_cards!: MiddleCards

  _init() {

    this.make(Background)
    this.m_cards = this.make(MiddleCards)


    //this.m_cards.fen = 'Ah Ts'
    //this.m_cards.fen = 'Ah Ts Qs 2h 3c'
    //this.m_cards.fen = 'Ah Ts Qs 2h 3c Th'
    //this.m_cards.fen = 'Ah Ts Qs 2h 3c Th Js'
    this.m_cards.fen = 'Ah Ts Qs 2h 3c Th Js 2d 3d'
    //setTimeout(() => this.m_cards.fen = 'Ah Ts Qs 2h 3c', 1000)
    //setTimeout(() => this.m_cards.fen = 'Ah Ts Qs 2h 3c Th Js', 4000)
    //setTimeout(() => this.m_cards.fen = 'Ah Ts Qs 2h 3c Th Js 2d 3d', 9000)


    let n = 1000
    for (let hand of hand_tests) {
      setTimeout(() => {
        this.m_cards.fen = hand[0]
      }, n)
      n += 5000
    }
  }

  _draw(batch: Batch) {

    this._draw_children(batch)
    batch.render()
    batch.clear()
  }
}



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
    batch.rect(Rect.make(this.position.x, this.position.y, this.data.w, this.data.h), this.color)
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

