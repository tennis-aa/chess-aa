import { Chess, WHITE } from "./chess.js";
import { moveTree } from "./moveTree.js";

export function loadpgn(str) {
  let chess = new Chess();
  let header = {};

  let readingKey = false;
  let betweenKeyAndValue = false;
  let readingValue = false;
  let endValue = false;
  let backslashEscape = false;

  let readingMoveNumber = false;
  let betweenMoveNumberAndMove = false;
  let readingMove = false;
  let betweenMoves = false;
  let readingComment = false;
  let readingResult = false;
  let readingAnnotation = false;

  let key = "";
  let value = "";
  let movenumberstr = "";
  let comment = "";
  let commentEndingChar;
  let annotation = "";
  let movecount = [0];
  let movestr = "";
  let initialMoveNumber = -1;
  let tree = new moveTree();
  for (let i=0; i< str.length; ++i) {
    let char = str[i]

    if (readingKey) {
      if (/\s/.test(char)) {
        if (key==="")
          continue; // ignore spaces between the square bracket and the value
        else {
          readingKey = false;
          betweenKeyAndValue = true;
        }
      }
      else {
        key += char;
      }
    }
    else if (betweenKeyAndValue) {
      if (char==='"') {
        betweenKeyAndValue = false;
        readingValue = true;
      }
      else if (/\s/.test(char)) {
        continue;
      }
      else {
        throw "improper pgn: value is not enclosed in quotes";
      }
    }
    else if (readingValue) {
      if (backslashEscape) {
        backslashEscape = false;
        if (char==='"' || char==="\\") {
          value += char;
        }
      }
      else {
        if (char==='"') {
          readingValue = false;
          endValue = true;
        }
        else {
          value += char;
        }
      }
    }
    else if (endValue) {
      if (char==="]") {
        endValue = false;
        header[key] = value;
        key = "";
        value = "";
      }
      else if (/\s/.test(char)) {
        continue;
      }
      else {
        throw "improper pgn: unclosed bracket.";
      }
    }
    else if (betweenMoves) {
      if (/[a-zA-Z]/.test(char)) {
        readingMove = true;
        --i;
      }
      else if (/[0-9]/.test(char)) {
        readingMoveNumber = true;
        --i;
      }
      else if (char==="{") {
        readingComment = true;
        commentEndingChar = "}";
      }
      else if (char===";") {
        readingComment = true;
        commentEndingChar = "\n";
      }
      else if (char==="(") {
        chess.undo();
        tree.undo();
        movecount.push(0);
        readingMoveNumber = true;
      }
      else if (char===")") {
        if (movecount.length <=1) {
          throw "improper pgn: closing parenthesis without opening parenthesis";
        }
        let count = movecount.pop();
        for (let j=0; j<count;++j) {
          chess.undo();
          tree.undo();
        }
        let move = tree.getChildMove(0);
        chess.move(move);
        tree.redo(0);
        continue;
      }
      else if (char==="*") {
        --i;
        readingResult = true;
      }
      else if (/\s/.test(char)) {
        continue;
      }
      else if (char === "$") {
        readingAnnotation = true;
        --i;
      }
      else {
        throw ("improper pgn: found an unknown character between moves");
      }

      betweenMoves = false;
    }
    else if (readingMove) {
      if (/[\s{()]/.test(char)) {
        let move = chess.move(movestr); 
        if (move) {
          tree.add(move);
          ++movecount[movecount.length - 1];
          betweenMoves = true;
          readingMove = false;
          movestr = "";
          --i;
        }
        else {
          throw ("improper pgn: invalid move " + movestr + " at " + chess.pgn());
        }
      }
      else if ("?!$".includes(char)) {
        let move = chess.move(movestr); 
        if (move) {
          tree.add(move);
          ++movecount[movecount.length - 1];
          readingAnnotation = true;
          --i;
          readingMove = false;
          movestr = "";
        }
        else {
          throw ("improper pgn: invalid move " + movestr + " at " + chess.pgn());
        }
      }
      else {
        movestr += char;
      }
    }
    else if (readingMoveNumber) {
      if (/[0-9]/.test(char)) {
        movenumberstr += char;
      }
      else if (/[a-zA-Z]/.test(char)) {
        if (movenumberstr === "") {
          // there was no move number
          readingMove = true;
          readingMoveNumber = false;
          --i;
          if (initialMoveNumber === -1)
            initialMoveNumber = 0;
        }
        else {
          throw "improper pgn: found a letter in a move number, a period may be missing.";
        }
      }
      else if (char === ".") {
        betweenMoveNumberAndMove = true;
        readingMoveNumber = false;
      }
      else if (char==="/" || char==="-") {
        movenumberstr += char;
        readingResult = true;
        readingMoveNumber = false;
      }
      else if (/\s/.test(char)) {
        continue;
      }
      else {
        throw ("improper pgn: unknown character " + char + " in movenumber " + movenumberstr)
      }
    }
    else if (betweenMoveNumberAndMove) {
      if (/\s/.test(char) || char===".") {
        continue;
      }
      else {
        if (initialMoveNumber === -1) {
          initialMoveNumber = parseInt(movenumberstr);
          if (chess.turn() === WHITE) {
            tree.halfmove = initialMoveNumber * 2 - 2;
          }
          else {
            tree.halfmove = initialMoveNumber * 2 - 1;
          }
        }
        movenumberstr = "";
        readingMove = true;
        betweenMoveNumberAndMove = false;
        --i;
      }
    } 
    else if (readingAnnotation) {
      if (/\s/.test(char) || char === ")") {
        if (tree.addAnnotation(annotation)) {
          annotation = "";
          betweenMoves = true;
          readingAnnotation = false;
          if (char === ")") --i;
        }
        else {
          throw ("improper pgn: unknown annotation " + annotation + " at " + chess.pgn());
        }
      }
      else if (/[0-9]/.test(char) || "$?!".includes(char)) 
        annotation += char;
      else {
        throw ("improper pgn: unknown annotation characters at " + chess.pgn() + " " + char + " " + annotation);
      }
    }
    else if (readingComment) {
      if (char === commentEndingChar) {
        tree.addComment(comment);
        comment = "";
        betweenMoves = true;
        readingComment = false;
      }
      else {
        comment += char;
      }
    }
    else if (readingResult) {
      movenumberstr += char;
      if (["1-0","0-1","1/2-1/2","*"].includes(movenumberstr)) {
        if (header["Result"] && movenumberstr != header["Result"]) {
          header["Result"] = movenumberstr;
          console.log("Result header and result at end of file were not consistent. Header has been switched to end of the end of file result");
        }
        break;
      }
    }
    else {
      if (/\s/.test(char)) continue;
      if (char==="[")
        readingKey = true;
      else {
        // start reading moves (or comments)
        if (char === "{") {
          readingComment = true;
          commentEndingChar = "}";
        }
        else if (char === ";") {
          readingComment = true;
          commentEndingChar = "\n";
        }
        else {
          readingMoveNumber = true;
          --i;
        }
        if (header["SetUp"] === "1") {
          if (!header["FEN"])
            throw "improper pgn: if SetUp key is 1, then a FEN key is required";
          if (!chess.load(header["FEN"]))
            throw ("improper pgn: fen string " + header["FEN"] + " is not valid.");
        }
      }
    }
  }

  if (readingKey || betweenKeyAndValue || readingValue || endValue)
    throw "improper pgn: finished reading without closing the header.";

  if (readingMove) {
    let move = chess.move(movestr); 
    if (move) {
      tree.add(move);
    }
    else {
      throw ("improper pgn: invalid move " + movestr + " at " + chess.pgn());
    }
  }

  if (readingComment && commentEndingChar === "\n") {
    tree.addComment(comment);
  }

  tree.activateAddress([]);
  return [tree,header];
}