export class tablebase {
  constructor(main_div, chess_aa) {
    this.div = document.createElement("div");
    this.div.textContent = "Powered by the ";
    let lichessLink = document.createElement("a");
    lichessLink.textContent = "lichess Syzygy tablebases";
    lichessLink.setAttribute("href","https://lichess.org/blog/W3WeMyQAACQAdfAL/7-piece-syzygy-tablebases-are-complete");
    this.div.appendChild(lichessLink);

    this.outcomes = document.createElement("div");

    this.bestMove = document.createElement("div");

    this.div.appendChild(this.outcomes);
    this.div.appendChild(this.bestMove);

    main_div.appendChild(this.div);
    this.chess_aa = chess_aa;
    this.on = false;

    chess_aa.dispatcher.addEventListener("chess-aa-movemade", this.get_lichess_tablebase_data_handler());
    chess_aa.dispatcher.addEventListener("chess-aa-moveunmade", this.get_lichess_tablebase_data_handler());
    chess_aa.dispatcher.addEventListener("chess-aa-newposition", this.get_lichess_tablebase_data_handler());
  }

  get_lichess_tablebase_data(event) {
    if (this.on) {
      fetch("https://tablebase.lichess.ovh/standard?fen=" + event.detail.fen
      ).then((response) => response.json()
      ).then((x) => {
        if (x.category == "unknown") {
          this.outcomes.replaceChildren();
          this.bestMove.replaceChildren();
        }
        else {
          this.outcomes.textContent = x.category;
          this.bestMove.textContent = x.moves.length > 0 ? ("Best move: " + x.moves[0].san) : "";
        }
      });
    }
  }

  get_lichess_tablebase_data_handler() {
    let that = this;
    return function(event) {
      that.get_lichess_tablebase_data(event);
    };
  }

  switch(on) {
    if (on) {
      this.on = true;
    }
    else {
      this.on = false;
      this.outcomes.replaceChildren();
      this.bestMove.replaceChildren();
    }
  }
}