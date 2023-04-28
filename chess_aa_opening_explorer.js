export class openingexplorer {
  constructor(main_div, chess_aa) {
    this.div = document.createElement("div");
    this.div.textContent = "Powered by the ";
    let lichessLink = document.createElement("a");
    lichessLink.textContent = "lichess opening explorer";
    lichessLink.setAttribute("href","https://lichess.org/blog/Vs0xMTAAAD4We4Ey/opening-explorer");
    this.div.appendChild(lichessLink);
    this.div.append(" masters database.");

    this.openingName = document.createElement("div");

    this.outcomes = document.createElement("div");
    let lab = document.createElement("span");
    lab.textContent = "white: ";
    this.outcomes.appendChild(lab);
    this.whitewon = document.createElement("span");
    this.whitewon.textContent = "-"
    this.outcomes.appendChild(this.whitewon);
    lab = document.createElement("span");
    lab.textContent = "; draws: ";
    this.outcomes.appendChild(lab);
    this.draws = document.createElement("span");
    this.draws.textContent = "-"
    this.outcomes.appendChild(this.draws);
    lab = document.createElement("span");
    lab.textContent = "; black: ";
    this.outcomes.appendChild(lab);
    this.blackwon = document.createElement("span");
    this.blackwon.textContent = "-";
    this.outcomes.appendChild(this.blackwon);

    this.commonMoves = document.createElement("div");

    this.topGames = document.createElement("div");
    this.topGames.textContent = "Notable games:";
    this.nTopGames = 10;
    for (let i=0; i<this.nTopGames; ++i) {
      this.topGames.appendChild(document.createElement("div"))
      this.topGames.children[i].style.cursor = "pointer";
    }
    this.topGameMoves = document.createElement("div");
    this.topGameMoves.oncontextmenu = function (e) {
      e.target.replaceChildren();
      return false;
    };

    this.div.appendChild(this.openingName);
    this.div.appendChild(this.outcomes);
    this.div.appendChild(this.commonMoves);
    this.div.appendChild(document.createElement("hr"));
    this.div.appendChild(this.topGameMoves);
    this.div.appendChild(this.topGames);

    main_div.appendChild(this.div);
    this.chess_aa = chess_aa;
    this.on = false;

    chess_aa.dispatcher.addEventListener("chess-aa-movemade", this.get_lichess_opening_explorer_data_handler());
    chess_aa.dispatcher.addEventListener("chess-aa-moveunmade", this.get_lichess_opening_explorer_data_handler());
    chess_aa.dispatcher.addEventListener("chess-aa-newposition", this.get_lichess_opening_explorer_data_handler());
  }

  get_lichess_opening_explorer_data(event) {
    if (this.on) {
      fetch("https://explorer.lichess.ovh/masters?fen=" + event.detail.fen
      ).then((response) => response.json()
      ).then((x) => {
        // console.log(x)
        if (x.opening){
          this.openingName.textContent = x.opening.name;
        }
        else {
          this.openingName.textContent = "";
        }
        this.whitewon.textContent = x.white;
        this.draws.textContent = x.draws;
        this.blackwon.textContent = x.black;
        if (x.moves) {
          let moves = "";
          for (let move of x.moves) {
            moves += move.san + " ";
          }
          this.commonMoves.textContent = "Common moves: " + moves;
        }
        for (let i=0; i<this.nTopGames; ++i) {
          let div = this.topGames.children[i];
          if (x.topGames.length > i) {
            let game = x.topGames[i]
            div.textContent = game.white.name + " (" + game.white.rating + ")" + " vs. " + game.black.name + " (" + game.black.rating + ")" +
                " [" + game.month + "]: " + game.uci + " (" + (game.winner ? game.winner : "draw") + ")";
            let that = this;
            div.onclick = function(event) {
              let url = "https://lichess.org/game/export/" + game.id;
              fetch(url,{headers:{"accept": "application/json"}}
              ).then((response) => response.json()
              ).then((y) => {
                that.topGameMoves.textContent = game.white.name + " (" + game.white.rating + ")" + " vs. " + game.black.name + " (" + game.black.rating + ")" +
                " [" + game.month + "]: ";
                that.topGameMoves.textContent += y.moves;
              })
            }
          }
          else {
            div.textContent = "";
            div.onclick = null;
          }
        }
      });
    }
  }

  get_lichess_opening_explorer_data_handler() {
    let that = this;
    return function(event) {
      that.get_lichess_opening_explorer_data(event);
    };
  }

  switch(on) {
    if (on) {
      this.on = true;
    }
    else {
      this.on = false;
      this.openingName.replaceChildren();
      this.whitewon.textContent = "-";
      this.draws.textContent = "-";
      this.blackwon.textContent = "-";
      this.commonMoves.replaceChildren();
      this.topGameMoves.replaceChildren();
      for (let div of this.topGames.children) {
        div.replaceChildren();
      }
    }
  }
}