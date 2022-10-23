import {BLACK, WHITE} from "./chess.js"

export class playerbox {
  constructor(main_div,chess_aa,color) {
    this.chess_aa = chess_aa;
    this.color = color;
    // console.log(color)

    this.div = document.createElement("div");
    this.playernameDiv = document.createElement("span");
    this.playermaterialDiv = document.createElement("span");
    this.div.appendChild(this.playernameDiv);
    this.div.appendChild(document.createTextNode(" "));
    this.div.appendChild(this.playermaterialDiv);
    main_div.appendChild(this.div);
    
    this.updateName();
    this.updateMaterial();

    this.chess_aa.dispatcher.addEventListener("chess-aa-movemade",this.updateMaterialHandler());
    this.chess_aa.dispatcher.addEventListener("chess-aa-moveunmade",this.updateMaterialHandler());
    this.chess_aa.dispatcher.addEventListener("chess-aa-variationremoval", this.updateMaterialHandler());
    this.chess_aa.dispatcher.addEventListener("chess-aa-newposition", this.updateNameHandler());
    this.chess_aa.dispatcher.addEventListener("chess-aa-newposition", this.updateMaterialHandler());
    this.chess_aa.dispatcher.addEventListener("chess-aa-flipboard",this.flipColorHandler());
  }

  updateName() {
    console.log(this.color)
    this.playernameDiv.textContent = this.chess_aa.header[this.color == WHITE ? "White" : "Black"];
  }

  updateNameHandler() {
    let that = this;
    return function() {
      that.updateName();
    };
  }

  updateMaterial() {
    this.playermaterialDiv.textContent = this.chess_aa.material() * (this.color == WHITE ? 1 : -1);
  }

  updateMaterialHandler() {
    let that = this;
    return function() {
      that.updateMaterial();
    };
  }

  flipColor() {
    this.color = this.color == WHITE ? BLACK : WHITE;
    this.updateName();
    this.updateMaterial();
  }

  flipColorHandler() {
    let that = this;
    return function() {
      that.flipColor()
    };
  }

}