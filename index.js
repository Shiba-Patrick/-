//設定遊戲狀態:狀態1,2,3....
const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardMatchFailed: 'CardMatchFailed',
  CardMatched: 'CardMatched',
  GameFinished: 'GameFinished'
}

//宣告四色圖檔
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', //黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', //愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', //方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' //梅花
]

//MVC架構:View 視覺呈現
const view = {
  getCardContent(index) { //取得卡片正面內容
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
    <p>${number}</p>
    <img src='${symbol}'/>
    <p>${number}</p>
    `
  },
  getCardElement(index) { //取得卡片背面花樣並並設定data-set(index)
    return `
    <div data-index="${index}" class="card back"></div>`
  },
  transformNumber(number) { //宣告特殊字體函式:運用switch
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  displayCards(indexes) {//顯示52張牌
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  flipCards(...cards) {//翻牌函式:運用...展開運算子賦予多個值
    cards.map(card => {
      if (card.classList.contains('back')) {
        //如果是背面,回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))//回傳每個牌背的data-index
        return
      }
      //如果是正面,回傳正面
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  pairCards(...cards) {//擴充卡片成對的樣式:運用...展開運算子賦予多個值
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {//擷取分數節點
    document.querySelector('.score').textContent = `Score: ${score}`
  },
  renderTriedTimes(times) {//擷取嘗試次數節點
    document.querySelector('.tried').textContent = `You've tried : ${times} times`
  },
  appendWrongAnimation(...cards) {//動畫:新增點擊後的動畫並且再1秒刪除
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },
  showGameFinished() { //遊戲完成畫面
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Completed</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes}times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

//洗牌程式:導入display的rootElement
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]] //互換位置的表示法
    }
    return number
  }
}

//MVC架構:Model 資料管理
const model = {
  reveledCards: [], //存放卡片陣列
  isRevealCardsMatched() { //判斷卡片是否數字相同
    return this.reveledCards[0].dataset.index % 13 === this.reveledCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0
}

//MVC架構:controller
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {//產生52張牌
    view.displayCards(utility.getRandomNumberArray(52))
  },

  //依照遊戲狀態去執行view和model
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {  //如果不是背面則直接跳出
      return
    }
    //運用switch去判斷各種遊戲狀態的情況:第一張/第二張:配對失敗及成功
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.reveledCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break;
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes) //翻第二張牌嘗試次數+嘗試次數+1
        view.flipCards(card)
        model.reveledCards.push(card)
        //判斷是否配對成功
        if (model.isRevealCardsMatched()) {
          //配對成功
          view.renderScore(model.score += 10)//配對成功+10分
          this.currentState = GAME_STATE.CardMatched
          view.pairCards(...model.reveledCards)
          model.reveledCards = []
          //如果遊戲完成
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardMatchFailed
          view.appendWrongAnimation(...model.reveledCards) //動畫
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('reveledCards', model.reveledCards.map(card => card.dataset.index))
  },
  resetCards() {
    view.flipCards(...model.reveledCards)
    model.reveledCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

//運用controller來呼叫
controller.generateCards()

//綁定52張牌做監聽
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})
