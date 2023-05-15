import {BLACK, WHITE} from "./chess.js"

export class enginevariation {
  constructor(main_div, chess_aa_engine) {
    this.div = document.createElement("div");
    this.div.appendChild(document.createTextNode("Depth: "));
    this.depthSpan = document.createElement("span");
    this.depthSpan.textContent = 0;
    this.div.appendChild(this.depthSpan);
    this.variationdivs = [];
    for (let i=0; i<1; ++i) {
      this.variationdivs.push(document.createElement("div"));
      this.variationdivs[i].classList.add("chess-aa-engine-variationdiv");
      this.variationdivs[i].textContent = "Variation " + (i+1);
      this.variationdivs[i].style.whiteSpace = "nowrap";
      this.variationdivs[i].style.overflowX = "scroll";
      this.variationdivs[i].style.scrollbarWidth = "thin";
      this.div.appendChild(this.variationdivs[i]);
    }
    // To modify scrollbar in chromium (https://stackoverflow.com/a/8051488/12510953)
    let sheet = document.head.appendChild(document.createElement("style")).sheet;
    sheet.insertRule(".chess-aa-engine-variationdiv::-webkit-scrollbar {height:5px}");
    sheet.insertRule(".chess-aa-engine-variationdiv::-webkit-scrollbar-track {background-color:whitesmoke}");
    sheet.insertRule(".chess-aa-engine-variationdiv::-webkit-scrollbar-thumb {background-color:gainsboro}");

    main_div.appendChild(this.div);

    this.chess_aa = chess_aa_engine.chess_aa;
    this.chess_aa_engine = chess_aa_engine;
    chess_aa_engine.dispatcher.addEventListener("chess-aa-engineEvaluation", this.update());
    chess_aa_engine.dispatcher.addEventListener("chess-aa-engineSetoption", this.updateMultiPV());
    // chess_aa_engine.dispatcher.addEventListener("chess-aa-engineSwitchOnOff", () => false);
    this.chess_aa.dispatcher.addEventListener("chess-aa-movemade", this.clear());
    this.chess_aa.dispatcher.addEventListener("chess-aa-moveunmade", this.clear());
    this.chess_aa.dispatcher.addEventListener("chess-aa-newposition", this.clear());
  }

  update() {
    let that = this;
    return function(event) {
      that.depthSpan.textContent = event.detail.depth;
      if (event.detail.variation.length == 0) { // mate or draw
        for (let i=0; i<that.variationdivs.length; ++i) {
          that.variationdivs[i].replaceChildren("#");
        }
        return;
      }

      let variation = [];
      let variationdiv = that.variationdivs[event.detail.multipv];
      variationdiv.replaceChildren();
      let score = event.detail.score * (event.detail.turn == WHITE ? 1 : -1);
      let scorespan = document.createElement("span");
      scorespan.style.fontWeight = "bold";
      if (event.detail.scoreType == "cp") {
        scorespan.textContent = "" + (score/100) + ": ";
      }
      else if (event.detail.scoreType == "mate") {
        scorespan.textContent = "M" + score + ": ";
      }
      variationdiv.appendChild(scorespan);
      for (let i=0; i<event.detail.variation.length; ++i) {
        let span = document.createElement("span");
        span.style.cursor = "pointer";
        let san = event.detail.variation[i].san;
        variation.push(san);
        span.textContent = san + " ";
        span.setAttribute("data-movenumber",i);
        variationdiv.appendChild(span);
        span.onclick = function() {
          let n = parseInt(span.getAttribute("data-movenumber"));
          that.chess_aa.addVariation(variation.slice(0,n+1));
          that.chess_aa.focus();
        };
      }
    };
  }

  clear() {
    let that = this;
    return function() {
      for (let i=0; i<that.variationdivs.length; ++i) {
        that.variationdivs[i].replaceChildren("Variation " + (i+1));
      }
    };
  }

  updateMultiPV() {
    let that = this;
    return function(event) {
      if (event.detail.name == "MultiPV") {
        for (let i=that.variationdivs.length-1; i>=0; --i) {
          that.variationdivs[i].remove();
        }
        that.variationdivs = [];
        for (let i=0; i<event.detail.value; ++i) {
          that.variationdivs.push(document.createElement("div"));
          that.variationdivs[i].classList.add("chess-aa-engine-variationdiv");
          that.variationdivs[i].textContent = "Variation " + (i+1);
          that.variationdivs[i].style.whiteSpace = "nowrap";
          that.variationdivs[i].style.overflowX = "scroll";
          that.variationdivs[i].style.scrollbarWidth = "thin";
          that.div.appendChild(that.variationdivs[i]);
        }
      }
    }
  }
}