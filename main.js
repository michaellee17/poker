class Deck {
  constructor() {
    this.suits = ["hearts", "diamonds", "clubs", "spades"];
    this.ranks = [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
      "A",
    ];
    this.deck = [];
    this.createDeck();
    this.shuffleDeck();
  }

  //建立牌組
  createDeck() {
    for (let suit of this.suits) {
      for (let rank of this.ranks) {
        this.deck.push({
          suit: suit,
          rank: rank,
        });
      }
    }
  }
  //洗牌 fisher-yates shuffle
  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }
}

let deck = new Deck();

//靜態玩家資訊 名稱 桌上座位 抓碼
class StaticPlayers {
  constructor() {
    this.playerInfo = [];
    this.count = 0;
    // this.createPlayer(name,seat,chip)
  }

  createPlayer(name, seat, chip) {
    let obj = {
      name: name,
      seat: seat,
      chip: chip,
    };
    this.playerInfo.push(obj);
    this.count++;
  }
}
let Players = new StaticPlayers();
Players.createPlayer("彈頭", 1, 1000);
Players.createPlayer("小多", 2, 1000);
Players.createPlayer("祥哥", 3, 1000);
Players.createPlayer("志豪", 4, 1000);
Players.createPlayer("時雨", 5, 1000);
Players.createPlayer("車仔", 6, 1000);
Players.createPlayer("牛哥", 7, 1000);

//動態玩家資訊 牌局位置 牌組
class DynamicPlayers {
  constructor(players, deck) {
    this.deck = deck;
    this.players = players;
    this.chooseButton();
    this.startButtonSeat = 0;
    this.flop = [];
  }
  //抽button
  async chooseButton() {
    let deckSize = 52;
    let randomIndexes = [];
    let cardValues = {
      A: 14,
      K: 13,
      Q: 12,
      J: 11,
      10: 10,
      9: 9,
      8: 8,
      7: 7,
      6: 6,
      5: 5,
      4: 4,
      3: 3,
      2: 2,
    };
    let allPlayers = [...this.players.playerInfo];
    //每人抽卡
    while (randomIndexes.length < this.players.playerInfo.length) {
      let randomIndex = Math.floor(Math.random() * deckSize);
      if (!randomIndexes.includes(randomIndex)) {
        randomIndexes.push(randomIndex);
      }
    }

    //抽卡並算出牌的大小
    this.players.playerInfo.forEach((player, index) => {
      player.selectedIndex = randomIndexes[index];
      player.card = this.deck.deck[randomIndexes[index]].rank;
      player.cardValue = cardValues[player.card];
    });

    //算出最大的牌以及最大牌的人數
    let maxCardValue = Math.max(
      ...this.players.playerInfo.map((player) => player.cardValue)
    );
    let maxCardPlayers = this.players.playerInfo.filter(
      (player) => player.cardValue === maxCardValue
    );

    //若多人最大則再重抽
    if (maxCardPlayers.length > 1) {
      this.players.playerInfo = maxCardPlayers;
      this.chooseButton();
    } else {
      this.startButtonSeat = maxCardPlayers[0].seat;
      this.players.playerInfo = allPlayers.map((player) => {
        //去除抽button時所需的所有資訊 後面用不到
        let {
          card,
          selectedIndex,
          cardValue,
          ...playerWithoutCardAndSelectedIndex
        } = player;
        return playerWithoutCardAndSelectedIndex;
      });
      //異步處理 等待發完玩家的牌再發公牌
      await this.getCardByPosition();
      this.getflop();
    }
  }

  //依據button位置分配牌
  async getCardByPosition() {
    let positions = [];
    switch (this.players.count) {
      case 2:
        positions = ["BUTTON", "SB"];
        break;
      case 3:
        positions = ["BUTTON", "SB", "BB"];
        break;
      case 4:
        positions = ["BUTTON", "SB", "BB", "UTG"];
        break;
      case 5:
        positions = ["BUTTON", "SB", "BB", "UTG", "MP"];
        break;
      case 6:
        positions = ["BUTTON", "SB", "BB", "UTG", "MP", "CO"];
        break;
      case 7:
        positions = ["BUTTON", "SB", "BB", "UTG", "MP", "HJ", "CO"];
        break;
      case 8:
        positions = ["BUTTON", "SB", "BB", "UTG", "UTG+1", "MP", "HJ", "CO"];
        break;
      default:
        break;
    }
    for (let i = 0; i < positions.length; i++) {
      let player = this.players.playerInfo.find(
        (player) =>
          player.seat ===
          ((this.startButtonSeat + i - 1) % this.players.count) + 1
      );
      if (player) {
        player.position = positions[i];
        player.card = [this.deck.deck[i], this.deck.deck[i + positions.length]];
      } else {
        console.error(
          `No player found at seat ${
            ((this.startButtonSeat + i - 1) % this.players.count) + 1
          }`
        );
      }
    }
  }

  //發公牌
  getflop() {
    this.flop = [
      this.deck.deck[this.players.count * 2 + 1],
      this.deck.deck[this.players.count * 2 + 2],
      this.deck.deck[this.players.count * 2 + 3],
      this.deck.deck[this.players.count * 2 + 5],
      this.deck.deck[this.players.count * 2 + 7],
    ];
    console.log("this.flop", this.flop);
  }
}
let Dynamic = new DynamicPlayers(Players, deck);
