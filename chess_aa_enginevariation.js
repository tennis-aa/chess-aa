export class enginevariation {
  constructor(main_div, chess_aa) {
    this.div = document.createElement("div");
    this.div.appendChild(document.createTextNode("Depth: "));
    this.depthSpan = document.createElement("span");
    this.depthSpan.textContent = 0;
    this.div.appendChild(this.depthSpan);
    this.variations = [];
    this.variationdivs = [];
    for (let i=0; i<chess_aa.engineMultipv; ++i) {
      this.variations.push([]);
      this.variationdivs.push(document.createElement("div"));
      this.variationdivs[i].textContent = "Variation " + (i+1);
      this.variationdivs[i].style.whiteSpace = "nowrap";
      this.variationdivs[i].style.overflow = "auto";
      this.div.appendChild(this.variationdivs[i]);
    }

    main_div.appendChild(this.div);

    this.chess_aa = chess_aa;
    chess_aa.dispatcher.addEventListener("chess-aa-engineEvaluation", this.update());
    // chess_aa.dispatcher.addEventListener("chess-aa-engineSwitchOnOff", () => false);
    chess_aa.dispatcher.addEventListener("chess-aa-movemade", this.clear());
    chess_aa.dispatcher.addEventListener("chess-aa-moveunmade", this.clear());
    chess_aa.dispatcher.addEventListener("chess-aa-newposition", this.clear());
  }

  update() {
    let that = this;
    return function(event) {
      that.depthSpan.textContent = event.detail.depth;
      let variation = that.variations[event.detail.multipv];
      variation.length = 0;
      let variationdiv = that.variationdivs[event.detail.multipv];
      variationdiv.replaceChildren();
      let text = "";
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
      if (event.detail.variation.length == 0) { //mate
        for (let i=0; i<that.variationdivs.length; ++i) {
          that.variationdivs[i].replaceChildren("#");
        }
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
}