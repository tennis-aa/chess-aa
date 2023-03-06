import {BLACK, WHITE} from "./chess.js"

export class enginebar {
  constructor(main_div, chess_aa, chess_aa_engine) {
    this.chess_aa_engine = chess_aa_engine;
    this.chess_aa = chess_aa;

    this.div = document.createElement("div");
    this.div.style.position = "relative";
    this.div.style.width = "100%";
    this.div.style.height = "100%";
    this.div.style.border = "1px solid black";

    this.black = document.createElement("div");
    this.black.style.position = "absolute";
    this.black.style.top = "0%";
    this.black.style.height = "50%";
    this.black.style.width = "100%";
    this.black.style.backgroundColor = "black";
    this.black.style.display = "flex";
    this.black.style.alignItems = "flex-end";
    this.black.style.justifyContent = "center";
    this.black.style.color = "white";
    this.black.textContent = "";

    this.white = document.createElement("div");
    this.white.style.position = "absolute";
    this.white.style.bottom = "0%";
    this.white.style.height = "50%"
    this.white.style.width = "100%"
    this.white.style.backgroundColor = "white";
    this.white.style.display = "flex";
    this.white.style.justifyContent = "center";
    this.white.style.color = "black";
    this.white.textContent = "";

    this.div.appendChild(this.black);
    this.div.appendChild(this.white);
    main_div.appendChild(this.div);

    this.on = false;

    this.chess_aa_engine.dispatcher.addEventListener("chess-aa-engineEvaluation", this.update());
    this.chess_aa_engine.dispatcher.addEventListener("chess-aa-engineSwitchOnOff", this.switchOnOff());
    this.chess_aa.dispatcher.addEventListener("chess-aa-flipboard",this.flip());
  }

  update() {
    let that = this;
    return function(event) {
      if (!that.on) {
        return;
      }
      if (event.detail.multipv > 0){
        return;
      }
      if (event.detail.depth < 10 && event.detail.depth > 0) {
        return;
      }
      let whiteShare;
      let scoreType = event.detail.scoreType;
      let score = event.detail.score;
      if (event.detail.turn == BLACK){
        score = -score;
      }

      if (scoreType == "cp") {
        if (score > 0) {
          whiteShare = Math.min(50 + score/10, 100);
          that.black.textContent = "";
          that.white.textContent = (score/100).toFixed(1);
        }
        else {
          whiteShare = Math.max(50 + score/10, 0);
          that.black.textContent = (-score/100).toFixed(1);
          that.white.textContent = "";
        }
      }
      else if (scoreType == "mate") {
        if (score == 0) {
          if (event.detail.turn == BLACK) {
            whiteShare = 100;
            that.black.textContent = "";
            that.white.textContent = "1-0";
          }
          else {
            whiteShare = 0;
            that.black.textContent = "0-1";
            that.white.textContent = "";
          }
        }
        else if (score > 0) {
          whiteShare = 100;
          that.black.textContent = "";
          that.white.textContent = "M" + score;
        }
        else {
          whiteShare = 0;
          that.black.textContent = "M" + (-score);
          that.white.textContent = "";
        }
      }
      else if (scoreType == "draw") {
        whiteShare = 50;
        that.black.textContent = "1/2";
        that.white.textContent = "1/2";
      }

      that.black.style.height = "" + (100-whiteShare) + "%";
      that.white.style.height = "" + (whiteShare) + "%";
    }
  }

  switchOnOff() {
    let that = this;
    return function (event) {
      if (event.detail.on) {
        that.on = true;
      }
      else {
        that.on = false;
        that.black.style.height = "" + 50 + "%";
        that.white.style.height = "" + 50 + "%";
        that.black.textContent = "";
        that.white.textContent = "";
      }
    };
  }

  flip() {
    let that = this;
    return function(event) {
      if (event.detail.whiteDown) {
        that.black.style.top = "0%";
        that.black.style.bottom = "";
        that.black.style.alignItems = "flex-end";

        that.white.style.top = "";
        that.white.style.bottom = "0%";
        that.white.style.alignItems = "flex-start";
      }
      else {
        that.black.style.top = "";
        that.black.style.bottom = "0%";
        that.black.style.alignItems = "flex-start";

        that.white.style.top = "0%";
        that.white.style.bottom = "";
        that.white.style.alignItems = "flex-end";
      }
    }
  }
}