export class moveTree {
  constructor(move = null, halfmove = 0) {
    this.root = move ? {...move}: null;
    this.children = [];
    this.activeBranch = -1;
    this.halfmove = halfmove;
    this.comment = [];
  }

  add(move) {
    if (this.activeBranch == -1) {
      let moveAdded = false;
      for (let i=0; i<this.children.length; i++) {
        let child = this.children[i];
        if (this.moveEqual(move,child.root)){
          child.activeBranch = -1;
          this.activeBranch = i;
          moveAdded = true;
          break;
        }
      }
      if (!moveAdded){
        this.children.push( new moveTree(move, this.halfmove + 1) );
        this.activeBranch = this.children.length - 1;
      }
      return !moveAdded;
    }
    else {
      return this.children[this.activeBranch].add(move);
    }
  }

  undo() {
    if (this.activeBranch == -1) {
      return true;
    }
    else {
      if (this.children[this.activeBranch].undo()) {
        this.activeBranch = -1;
      }
      return false;
    }
  }

  redo(branch = 0) {
    if (this.activeBranch == -1) {
      if (branch < this.children.length){
        return this.children[branch].root;
      }
      else {
        return null;
      }
    }
    else {
      return this.children[this.activeBranch].redo(branch);
    }
  }

  clear() {
    this.children.length = 0;
    this.activeBranch = -1
    this.root = null;
    this.comment.length = 0;
  }

  addAt(move,address) {
    if (address.length == 0) {
      let moveAdded = false;
      for (let i=0; i<this.children.length; i++) {
        let child = this.children[i];
        if (this.moveEqual(move,child.root)){
          moveAdded = true;
          break;
        }
      }
      if (!moveAdded){
        this.children.push( new moveTree(move, this.halfmove + 1) );
      }
      return !moveAdded;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return false;
    }
    else {
      return this.children[address[0]].addAt(move,address.slice(1));
    }
  }

  remove() {
    if (this.activeBranch == -1) {
      return true;
    }
    else {
      if (this.children[this.activeBranch].remove()) {
        this.activeBranch = -1;
        this.children.splice(address[0],1);
      }
      return false;
    }
  }

  removeAt(address) {
    if (address.length == 1 && address[0] < this.children.length) {
      this.children.splice(address[0],1);
      if (this.activeBranch == address[0]) {
        this.activeBranch = -1;
      }
      else if (this.activeBranch > address[0]) {
        --this.activeBranch
      }
      return true;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return false;
    }
    else {
      return this.children[address[0]].removeAt(address.slice(1));
    }
  }

  address() {
    if (this.activeBranch == -1) {
      return [];
    }
    else {
      let a = this.children[this.activeBranch].address();
      a.unshift(this.activeBranch);
      return a;
    }
  }

  activeMoves() {
    let result;
    if (this.activeBranch == -1) {
      result = [];
    }
    else {
      result = this.children[this.activeBranch].activeMoves();
    }
    if (this.root) {
      result.unshift(this.root);
    }
    return result;
  }

  activeMove() {
    if (this.activeBranch == -1) {
      return this.root;
    }
    else {
      return this.children[this.activeBranch].activeMove();
    }
  }

  moveAt(address) {
    if (address.length == 0) {
      return this.root;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return null;
    }
    else {
      return this.children[address[0]].moveAt(address.slice(1));
    }
  }
  
  activeHalfmove() {
    if (this.activeBranch == -1) {
      return this.halfmove;
    }
    else {
      return this.children[this.activeBranch].activeHalfmove();
    }
  }

  activateAddress(address) {
    if (address.length == 0) {
      this.activeBranch = -1;
      return true;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return false;
    }
    else {
      if (this.children[address[0]].activateAddress(address.slice(1))) {
        this.activeBranch = address[0];
        return true;
      }
      else
        return false;
    }
  }

  addressExists(address) {
    if (address.length==0) {
      return true;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return false;
    }
    else {
      return this.children[address[0]].addressExists(address.slice(1));
    }
  }

  numberOfBranches() {
    if (this.activeBranch == -1) {
      return this.children.length;
    }
    else {
      return this.children[this.activeBranch].numberOfBranches();
    }
  }

  numberOfBranchesAt(address) {
    if (address.length == 0) {
      return this.children.length;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return null;
    }
    else {
      return this.children[address[0]].numberOfBranchesAt(address.slice(1));
    }
  }

  level() {
    if (this.activeBranch == -1) {
      return 0;
    }
    else if (this.activeBranch == 0) {
      return this.children[this.activeBranch].level();
    }
    else {
      return 1 + this.children[this.activeBranch].level();
    }
  }

  levelAt(address) {
    if (address.length == 0) {
      return 0;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return null;
    }
    else if (address[0] == 0) {
      return this.children[address[0]].levelAt(address.slice(1));
    }
    else {
      let x = this.children[address[0]].levelAt(address.slice(1));
      if (x == null)
        return null
      else
        return 1 + x;
    }
  }

  copy() {
    let copy = new moveTree(this.root, this.halfmove);
    copy.activeBranch = this.activeBranch;
    for (let i=0; i<this.children.length; ++i) {
      copy.children.push(this.children[i].copy());
    }
    return copy;
  }

  toString() {
    let result = "";
    if (this.children.length>0) {
      result += this.children[0].root.san + " ";
    }
    for (let i=1; i < this.children.length; i++) {
      result += "(";
      result += this.children[i].root.san + " " + this.children[i].toString();
      result += ") ";
    }
    if (this.children.length>0) {
      result += this.children[0].toString();
    }
    return result;
  }

  toPGN() {
    let result = "";
    if (this.children.length>0) {
      if (this.children[0].halfmove % 2 == 1) {
        result += (this.children[0].halfmove+1)/2 + ". ";
      }
      result += this.children[0].root.san + " ";
    }
    for (let i=1; i < this.children.length; i++) {
      result += "(";
      if (this.children[i].halfmove % 2 == 1) {
        result += (this.children[i].halfmove+1)/2 + ". ";
      }
      else {
        result += this.children[i].halfmove/2 + "... ";
      }
      result += this.children[i].root.san + " " 
      result += this.children[i].toPGN();
      result = result.slice(0,result.length-1);
      result += ") ";
    }
    if (this.children.length>0) {
      if (this.children.length>1 && this.children[0].children.length>0 && this.children[0].halfmove % 2 == 1) {
        result += (this.children[0].halfmove+1)/2 + "... ";
      }
      result += this.children[0].toPGN();
    }
    return result;
  }

  toPGNMain(withcomments=false) {
    let result = "";
    if (this.children.length>0) {
      if (this.children[0].halfmove % 2 == 1) {
        result += (this.children[0].halfmove+1)/2 + ". ";
      }
      result += this.children[0].root.san + " ";
      if (withcomments){
        for (let i=0; i<this.children[0].comment.length; ++i) {
        result += "{" + this.children[0].comment[i] + "} ";
        }
      }
      result += this.children[0].toPGNMain(withcomments);
    }
    return result;
  }

  addComment(s) {
    if (this.activeBranch == -1) {
      this.comment.push(s);
    }
    else {
      this.children[this.activeBranch].addComment(s);
    }
  }

  deleteComment(index) {
    if (this.activeBranch == -1) {
      if (index == null) {
        index = this.comment.length-1;
      }
      if (this.comment.length > index) {
        this.comment.splice(index,1);
      }
    }
    else {
      this.children[this.activeBranch].deleteComment(index);
    }
  }

  deleteAllComments() {
    if (this.activeBranch == -1) {
        this.comment.length = 0;
    }
    else {
      this.children[this.activeBranch].deleteAllComments();
    }
  }

  getComment(index=0) {
    if (this.activeBranch == -1) {
      if (this.comment.length > index) {
        return this.comment[index];
      }
    }
    else {
      return this.children[this.activeBranch].getComment(index);
    }
  }

  getComments() {
    if (this.activeBranch == -1) {
        return this.comment.slice();
    }
    else {
      return this.children[this.activeBranch].getComments();
    }
  }

  addCommentAt(s,address) {
    if (address.length == 0) {
      this.comment.push(s);
      return true;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return false;
    }
    else {
      return this.children[address[0]].addCommentAt(s,address.slice(1));
    }
  }

  deleteCommentAt(address,index) {
    if (address.length == 0) {
      if (index == null) {
        index = this.comment.length-1;
      }
      if (index < this.comment.length) {
        this.comment.splice(index,1);
        return true;
      }
      else {
        return false;
      }
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return false;
    }
    else {
      return this.children[address[0]].deleteCommentAt(address.slice(1),index);
    }
  }

  deleteAllCommentsAt(address) {
    if (address.length == 0) {
        this.comment.length = 0;
        return true;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return false;
    }
    else {
      return this.children[address[0]].deleteAllCommentsAt(address.slice(1));
    }
  }

  getCommentAt(address,index=0) {
    if (address.length == 0) {
      if (index < this.comment.length) {
        return this.comment[index];
      }
      else
        return null;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return null;
    }
    else {
      return this.children[address[0]].getCommentAt(address.slice(1),index);
    }
  }

  getCommentsAt(address) {
    if (address.length == 0) {
        return this.comment.slice();
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return null;
    }
    else {
      return this.children[address[0]].getCommentsAt(address.slice(1));
    }
  }

  clearComments() {
    this.comment.length = 0;
    for (let i=0; i<this.children.length; ++i) {
      this.children[i].clearComments();
    }
  }

  moveEqual(m1,m2) {
    return m1.from == m2.from && m1.to == m2.to &&
        m1.color == m2.color && m1.piece == m2.piece &&
        m1.promotion == m2.promotion;
  }
}