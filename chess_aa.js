import { Chess, BLACK, WHITE, PAWN, BISHOP, KNIGHT, ROOK, QUEEN, KING } from "./chess.js";
import { moveTree } from "./moveTree.js";
import { loadpgn } from "./loadpgn.js";

export class chess_aa {
  constructor(main_div,mode="analysis") {

    // Constants
    this.whitePawnSVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PHBhdGggZD0iTTIyLjUgOWMtMi4yMSAwLTQgMS43OS00IDQgMCAuODkuMjkgMS43MS43OCAyLjM4QzE3LjMzIDE2LjUgMTYgMTguNTkgMTYgMjFjMCAyLjAzLjk0IDMuODQgMi40MSA1LjAzLTMgMS4wNi03LjQxIDUuNTUtNy40MSAxMy40N2gyM2MwLTcuOTItNC40MS0xMi40MS03LjQxLTEzLjQ3IDEuNDctMS4xOSAyLjQxLTMgMi40MS01LjAzIDAtMi40MS0xLjMzLTQuNS0zLjI4LTUuNjIuNDktLjY3Ljc4LTEuNDkuNzgtMi4zOCAwLTIuMjEtMS43OS00LTQtNHoiIGZpbGw9IiNmZmYiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==";
    this.whiteBishopSVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxnIGZpbGw9IiNmZmYiIHN0cm9rZS1saW5lY2FwPSJidXR0Ij48cGF0aCBkPSJNOSAzNmMzLjM5LS45NyAxMC4xMS40MyAxMy41LTIgMy4zOSAyLjQzIDEwLjExIDEuMDMgMTMuNSAyIDAgMCAxLjY1LjU0IDMgMi0uNjguOTctMS42NS45OS0zIC41LTMuMzktLjk3LTEwLjExLjQ2LTEzLjUtMS0zLjM5IDEuNDYtMTAuMTEuMDMtMTMuNSAxLTEuMzU0LjQ5LTIuMzIzLjQ3LTMtLjUgMS4zNTQtMS45NCAzLTIgMy0yeiIvPjxwYXRoIGQ9Ik0xNSAzMmMyLjUgMi41IDEyLjUgMi41IDE1IDAgLjUtMS41IDAtMiAwLTIgMC0yLjUtMi41LTQtMi41LTQgNS41LTEuNSA2LTExLjUtNS0xNS41LTExIDQtMTAuNSAxNC01IDE1LjUgMCAwLTIuNSAxLjUtMi41IDQgMCAwLS41LjUgMCAyeiIvPjxwYXRoIGQ9Ik0yNSA4YTIuNSAyLjUgMCAxIDEtNSAwIDIuNSAyLjUgMCAxIDEgNSAweiIvPjwvZz48cGF0aCBkPSJNMTcuNSAyNmgxME0xNSAzMGgxNW0tNy41LTE0LjV2NU0yMCAxOGg1IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIi8+PC9nPjwvc3ZnPg==";
    this.whiteKnightSVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMiAxMGMxMC41IDEgMTYuNSA4IDE2IDI5SDE1YzAtOSAxMC02LjUgOC0yMSIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0yNCAxOGMuMzggMi45MS01LjU1IDcuMzctOCA5LTMgMi0yLjgyIDQuMzQtNSA0LTEuMDQyLS45NCAxLjQxLTMuMDQgMC0zLTEgMCAuMTkgMS4yMy0xIDItMSAwLTQuMDAzIDEtNC00IDAtMiA2LTEyIDYtMTJzMS44OS0xLjkgMi0zLjVjLS43My0uOTk0LS41LTItLjUtMyAxLTEgMyAyLjUgMyAyLjVoMnMuNzgtMS45OTIgMi41LTNjMSAwIDEgMyAxIDMiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNOS41IDI1LjVhLjUuNSAwIDEgMS0xIDAgLjUuNSAwIDEgMSAxIDB6bTUuNDMzLTkuNzVhLjUgMS41IDMwIDEgMS0uODY2LS41LjUgMS41IDMwIDEgMSAuODY2LjV6IiBmaWxsPSIjMDAwIi8+PC9nPjwvc3ZnPg==";
    this.whiteRookSVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PGcgZmlsbD0iI2ZmZiIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik05IDM5aDI3di0zSDl2M3ptMy0zdi00aDIxdjRIMTJ6bS0xLTIyVjloNHYyaDVWOWg1djJoNVY5aDR2NSIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiLz48cGF0aCBkPSJNMzQgMTRsLTMgM0gxNGwtMy0zIi8+PHBhdGggZD0iTTMxIDE3djEyLjVIMTRWMTciIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIi8+PHBhdGggZD0iTTMxIDI5LjVsMS41IDIuNWgtMjBsMS41LTIuNSIvPjxwYXRoIGQ9Ik0xMSAxNGgyMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIvPjwvZz48L3N2Zz4=";
    this.whiteQueenSVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PGcgZmlsbD0iI2ZmZiIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik04IDEyYTIgMiAwIDEgMS00IDAgMiAyIDAgMSAxIDQgMHptMTYuNS00LjVhMiAyIDAgMSAxLTQgMCAyIDIgMCAxIDEgNCAwek00MSAxMmEyIDIgMCAxIDEtNCAwIDIgMiAwIDEgMSA0IDB6TTE2IDguNWEyIDIgMCAxIDEtNCAwIDIgMiAwIDEgMSA0IDB6TTMzIDlhMiAyIDAgMSAxLTQgMCAyIDIgMCAxIDEgNCAweiIvPjxwYXRoIGQ9Ik05IDI2YzguNS0xLjUgMjEtMS41IDI3IDBsMi0xMi03IDExVjExbC01LjUgMTMuNS0zLTE1LTMgMTUtNS41LTE0VjI1TDcgMTRsMiAxMnoiIHN0cm9rZS1saW5lY2FwPSJidXR0Ii8+PHBhdGggZD0iTTkgMjZjMCAyIDEuNSAyIDIuNSA0IDEgMS41IDEgMSAuNSAzLjUtMS41IDEtMS41IDIuNS0xLjUgMi41LTEuNSAxLjUuNSAyLjUuNSAyLjUgNi41IDEgMTYuNSAxIDIzIDAgMCAwIDEuNS0xIDAtMi41IDAgMCAuNS0xLjUtMS0yLjUtLjUtMi41LS41LTIgLjUtMy41IDEtMiAyLjUtMiAyLjUtNC04LjUtMS41LTE4LjUtMS41LTI3IDB6IiBzdHJva2UtbGluZWNhcD0iYnV0dCIvPjxwYXRoIGQ9Ik0xMS41IDMwYzMuNS0xIDE4LjUtMSAyMiAwTTEyIDMzLjVjNi0xIDE1LTEgMjEgMCIgZmlsbD0ibm9uZSIvPjwvZz48L3N2Zz4=";
    this.whiteKingSVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMi41IDExLjYzVjZNMjAgOGg1IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIi8+PHBhdGggZD0iTTIyLjUgMjVzNC41LTcuNSAzLTEwLjVjMCAwLTEtMi41LTMtMi41cy0zIDIuNS0zIDIuNWMtMS41IDMgMyAxMC41IDMgMTAuNSIgZmlsbD0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiLz48cGF0aCBkPSJNMTEuNSAzN2M1LjUgMy41IDE1LjUgMy41IDIxIDB2LTdzOS00LjUgNi0xMC41Yy00LTYuNS0xMy41LTMuNS0xNiA0VjI3di0zLjVjLTMuNS03LjUtMTMtMTAuNS0xNi00LTMgNiA1IDEwIDUgMTBWMzd6IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTExLjUgMzBjNS41LTMgMTUuNS0zIDIxIDBtLTIxIDMuNWM1LjUtMyAxNS41LTMgMjEgMG0tMjEgMy41YzUuNS0zIDE1LjUtMyAyMSAwIi8+PC9nPjwvc3ZnPg==";
    this.blackPawnSVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PHBhdGggZD0iTTIyLjUgOWMtMi4yMSAwLTQgMS43OS00IDQgMCAuODkuMjkgMS43MS43OCAyLjM4QzE3LjMzIDE2LjUgMTYgMTguNTkgMTYgMjFjMCAyLjAzLjk0IDMuODQgMi40MSA1LjAzLTMgMS4wNi03LjQxIDUuNTUtNy40MSAxMy40N2gyM2MwLTcuOTItNC40MS0xMi40MS03LjQxLTEzLjQ3IDEuNDctMS4xOSAyLjQxLTMgMi40MS01LjAzIDAtMi40MS0xLjMzLTQuNS0zLjI4LTUuNjIuNDktLjY3Ljc4LTEuNDkuNzgtMi4zOCAwLTIuMjEtMS43OS00LTQtNHoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==";
    this.blackBishopSVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxnIGZpbGw9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJidXR0Ij48cGF0aCBkPSJNOSAzNmMzLjM5LS45NyAxMC4xMS40MyAxMy41LTIgMy4zOSAyLjQzIDEwLjExIDEuMDMgMTMuNSAyIDAgMCAxLjY1LjU0IDMgMi0uNjguOTctMS42NS45OS0zIC41LTMuMzktLjk3LTEwLjExLjQ2LTEzLjUtMS0zLjM5IDEuNDYtMTAuMTEuMDMtMTMuNSAxLTEuMzU0LjQ5LTIuMzIzLjQ3LTMtLjUgMS4zNTQtMS45NCAzLTIgMy0yeiIvPjxwYXRoIGQ9Ik0xNSAzMmMyLjUgMi41IDEyLjUgMi41IDE1IDAgLjUtMS41IDAtMiAwLTIgMC0yLjUtMi41LTQtMi41LTQgNS41LTEuNSA2LTExLjUtNS0xNS41LTExIDQtMTAuNSAxNC01IDE1LjUgMCAwLTIuNSAxLjUtMi41IDQgMCAwLS41LjUgMCAyeiIvPjxwYXRoIGQ9Ik0yNSA4YTIuNSAyLjUgMCAxIDEtNSAwIDIuNSAyLjUgMCAxIDEgNSAweiIvPjwvZz48cGF0aCBkPSJNMTcuNSAyNmgxME0xNSAzMGgxNW0tNy41LTE0LjV2NU0yMCAxOGg1IiBzdHJva2U9IiNlY2VjZWMiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiLz48L2c+PC9zdmc+";
    this.blackKnightSVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMiAxMGMxMC41IDEgMTYuNSA4IDE2IDI5SDE1YzAtOSAxMC02LjUgOC0yMSIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik0yNCAxOGMuMzggMi45MS01LjU1IDcuMzctOCA5LTMgMi0yLjgyIDQuMzQtNSA0LTEuMDQyLS45NCAxLjQxLTMuMDQgMC0zLTEgMCAuMTkgMS4yMy0xIDItMSAwLTQuMDAzIDEtNC00IDAtMiA2LTEyIDYtMTJzMS44OS0xLjkgMi0zLjVjLS43My0uOTk0LS41LTItLjUtMyAxLTEgMyAyLjUgMyAyLjVoMnMuNzgtMS45OTIgMi41LTNjMSAwIDEgMyAxIDMiIGZpbGw9IiMwMDAiLz48cGF0aCBkPSJNOS41IDI1LjVhLjUuNSAwIDEgMS0xIDAgLjUuNSAwIDEgMSAxIDB6bTUuNDMzLTkuNzVhLjUgMS41IDMwIDEgMS0uODY2LS41LjUgMS41IDMwIDEgMSAuODY2LjV6IiBmaWxsPSIjZWNlY2VjIiBzdHJva2U9IiNlY2VjZWMiLz48cGF0aCBkPSJNMjQuNTUgMTAuNGwtLjQ1IDEuNDUuNS4xNWMzLjE1IDEgNS42NSAyLjQ5IDcuOSA2Ljc1UzM1Ljc1IDI5LjA2IDM1LjI1IDM5bC0uMDUuNWgyLjI1bC4wNS0uNWMuNS0xMC4wNi0uODgtMTYuODUtMy4yNS0yMS4zNC0yLjM3LTQuNDktNS43OS02LjY0LTkuMTktNy4xNmwtLjUxLS4xeiIgZmlsbD0iI2VjZWNlYyIgc3Ryb2tlPSJub25lIi8+PC9nPjwvc3ZnPg==";
    this.blackRookSVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PGcgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik05IDM5aDI3di0zSDl2M3ptMy41LTdsMS41LTIuNWgxN2wxLjUgMi41aC0yMHptLS41IDR2LTRoMjF2NEgxMnoiIHN0cm9rZS1saW5lY2FwPSJidXR0Ii8+PHBhdGggZD0iTTE0IDI5LjV2LTEzaDE3djEzSDE0eiIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiLz48cGF0aCBkPSJNMTQgMTYuNUwxMSAxNGgyM2wtMyAyLjVIMTR6TTExIDE0VjloNHYyaDVWOWg1djJoNVY5aDR2NUgxMXoiIHN0cm9rZS1saW5lY2FwPSJidXR0Ii8+PHBhdGggZD0iTTEyIDM1LjVoMjFtLTIwLTRoMTltLTE4LTJoMTdtLTE3LTEzaDE3TTExIDE0aDIzIiBmaWxsPSJub25lIiBzdHJva2U9IiNlY2VjZWMiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIvPjwvZz48L3N2Zz4="
    this.blackQueenSVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PGcgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxnIHN0cm9rZT0ibm9uZSI+PGNpcmNsZSBjeD0iNiIgY3k9IjEyIiByPSIyLjc1Ii8+PGNpcmNsZSBjeD0iMTQiIGN5PSI5IiByPSIyLjc1Ii8+PGNpcmNsZSBjeD0iMjIuNSIgY3k9IjgiIHI9IjIuNzUiLz48Y2lyY2xlIGN4PSIzMSIgY3k9IjkiIHI9IjIuNzUiLz48Y2lyY2xlIGN4PSIzOSIgY3k9IjEyIiByPSIyLjc1Ii8+PC9nPjxwYXRoIGQ9Ik05IDI2YzguNS0xLjUgMjEtMS41IDI3IDBsMi41LTEyLjVMMzEgMjVsLS4zLTE0LjEtNS4yIDEzLjYtMy0xNC41LTMgMTQuNS01LjItMTMuNkwxNCAyNSA2LjUgMTMuNSA5IDI2eiIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiLz48cGF0aCBkPSJNOSAyNmMwIDIgMS41IDIgMi41IDQgMSAxLjUgMSAxIC41IDMuNS0xLjUgMS0xLjUgMi41LTEuNSAyLjUtMS41IDEuNS41IDIuNS41IDIuNSA2LjUgMSAxNi41IDEgMjMgMCAwIDAgMS41LTEgMC0yLjUgMCAwIC41LTEuNS0xLTIuNS0uNS0yLjUtLjUtMiAuNS0zLjUgMS0yIDIuNS0yIDIuNS00LTguNS0xLjUtMTguNS0xLjUtMjcgMHoiIHN0cm9rZS1saW5lY2FwPSJidXR0Ii8+PHBhdGggZD0iTTExIDM4LjVhMzUgMzUgMSAwIDAgMjMgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiLz48cGF0aCBkPSJNMTEgMjlhMzUgMzUgMSAwIDEgMjMgMG0tMjEuNSAyLjVoMjBtLTIxIDNhMzUgMzUgMSAwIDAgMjIgMG0tMjMgM2EzNSAzNSAxIDAgMCAyNCAwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlY2VjZWMiLz48L2c+PC9zdmc+";
    this.blackKingSVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMi41IDExLjYzVjYiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiLz48cGF0aCBkPSJNMjIuNSAyNXM0LjUtNy41IDMtMTAuNWMwIDAtMS0yLjUtMy0yLjVzLTMgMi41LTMgMi41Yy0xLjUgMyAzIDEwLjUgMyAxMC41IiBmaWxsPSIjMDAwIiBzdHJva2UtbGluZWNhcD0iYnV0dCIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIvPjxwYXRoIGQ9Ik0xMS41IDM3YzUuNSAzLjUgMTUuNSAzLjUgMjEgMHYtN3M5LTQuNSA2LTEwLjVjLTQtNi41LTEzLjUtMy41LTE2IDRWMjd2LTMuNWMtMy41LTcuNS0xMy0xMC41LTE2LTQtMyA2IDUgMTAgNSAxMFYzN3oiIGZpbGw9IiMwMDAiLz48cGF0aCBkPSJNMjAgOGg1IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIi8+PHBhdGggZD0iTTMyIDI5LjVzOC41LTQgNi4wMy05LjY1QzM0LjE1IDE0IDI1IDE4IDIyLjUgMjQuNWwuMDEgMi4xLS4wMS0yLjFDMjAgMTggOS45MDYgMTQgNi45OTcgMTkuODVjLTIuNDk3IDUuNjUgNC44NTMgOSA0Ljg1MyA5IiBzdHJva2U9IiNlY2VjZWMiLz48cGF0aCBkPSJNMTEuNSAzMGM1LjUtMyAxNS41LTMgMjEgMG0tMjEgMy41YzUuNS0zIDE1LjUtMyAyMSAwbS0yMSAzLjVjNS41LTMgMTUuNS0zIDIxIDAiIHN0cm9rZT0iI2VjZWNlYyIvPjwvZz48L3N2Zz4="

    this.squareNames = [
      "a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8",
      "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7",
      "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6",
      "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5",
      "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4",
      "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3",
      "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2",
      "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"
    ];

    this.squareNamesMapWhite = {
      a8:   0, b8:   1, c8:   2, d8:   3, e8:   4, f8:   5, g8:   6, h8:   7,
      a7:   8, b7:   9, c7:  10, d7:  11, e7:  12, f7:  13, g7:  14, h7:  15,
      a6:  16, b6:  17, c6:  18, d6:  19, e6:  20, f6:  21, g6:  22, h6:  23,
      a5:  24, b5:  25, c5:  26, d5:  27, e5:  28, f5:  29, g5:  30, h5:  31,
      a4:  32, b4:  33, c4:  34, d4:  35, e4:  36, f4:  37, g4:  38, h4:  39,
      a3:  40, b3:  41, c3:  42, d3:  43, e3:  44, f3:  45, g3:  46, h3:  47,
      a2:  48, b2:  49, c2:  50, d2:  51, e2:  52, f2:  53, g2:  54, h2:  55,
      a1:  56, b1:  57, c1:  58, d1:  59, e1:  60, f1:  61, g1:  62, h1:  63
    };
    this.squareNamesMapBlack = {
      h1:   0, g1:   1, f1:   2, e1:   3, d1:   4, c1:   5, b1:   6, a1:   7,
      h2:   8, g2:   9, f2:  10, e2:  11, d2:  12, c2:  13, b2:  14, a2:  15,
      h3:  16, g3:  17, f3:  18, e3:  19, d3:  20, c3:  21, b3:  22, a3:  23,
      h4:  24, g4:  25, f4:  26, e4:  27, d4:  28, c4:  29, b4:  30, a4:  31,
      h5:  32, g5:  33, f5:  34, e5:  35, d5:  36, c5:  37, b5:  38, a5:  39,
      h6:  40, g6:  41, f6:  42, e6:  43, d6:  44, c6:  45, b6:  46, a6:  47,
      h7:  48, g7:  49, f7:  50, e7:  51, d7:  52, c7:  53, b7:  54, a7:  55,
      h8:  56, g8:  57, f8:  58, e8:  59, d8:  60, c8:  61, b8:  62, a8:  63
    };

    // for flipping the board
    this.whiteDown = true;
    this.squareNamesMap = this.squareNamesMapWhite;

    this.DEFAULTFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    // logic library
    this.chess = new Chess();

    // Additional logic components
    this.startFen = this.DEFAULTFEN;
    this.variations = new moveTree();
    this.header = {};
    this.startingPieceCount = {};
    this.startingPieceCount[WHITE + PAWN] = 8;
    this.startingPieceCount[BLACK + PAWN] = 8;
    this.startingPieceCount[WHITE + QUEEN] = 1;
    this.startingPieceCount[BLACK + QUEEN] = 1;
    this.startingPieceCount[WHITE + BISHOP] = 2;
    this.startingPieceCount[BLACK + BISHOP] = 2;
    this.startingPieceCount[WHITE + KNIGHT] = 2;
    this.startingPieceCount[BLACK + KNIGHT] = 2;
    this.startingPieceCount[WHITE + ROOK] = 2;
    this.startingPieceCount[BLACK + ROOK] = 2;
    this.startingPieceCount[WHITE + KING] = 1;
    this.startingPieceCount[BLACK + KING] = 1;

    this.pieceCount = {...this.startingPieceCount};
    
    this.pieceValue = {};
    this.pieceValue[WHITE + PAWN] = 1;
    this.pieceValue[BLACK + PAWN] = -1;
    this.pieceValue[WHITE + QUEEN] = 9;
    this.pieceValue[BLACK + QUEEN] = -9;
    this.pieceValue[WHITE + BISHOP] = 3;
    this.pieceValue[BLACK + BISHOP] = -3;
    this.pieceValue[WHITE + KNIGHT] = 3;
    this.pieceValue[BLACK + KNIGHT] = -3;
    this.pieceValue[WHITE + ROOK] = 5;
    this.pieceValue[BLACK + ROOK] = -5;
    this.pieceValue[WHITE + KING] = 100;
    this.pieceValue[BLACK + KING] = -100;

    //Colors
    this.defaultColors = {
      whiteSquareColor: "#d3ba90",
      blackSquareColor : "#7c522e",
      selectedPieceColor : "#4DAF4A",
      availableMovesColor : "#4DAF4A",
      inCheckColor : "#C73030",
      lastMoveFromColor : "#cca45c",
      lastMoveToColor : "#cca45c",
      highlightedSquareColor1 : "#FB8072",
      highlightedSquareColor2 : "#80B1D3",
      highlightedSquareColor3 : "#B3DE69",
      highlightedSquareColor4 : "#FFFFB3",
      arrowColor : "#30c67c",
      squarenameColor : "#000000"
    }

    this.whiteSquareColor = this.defaultColors.whiteSquareColor;
    this.blackSquareColor = this.defaultColors.blackSquareColor;
    this.selectedPieceColor = this.defaultColors.selectedPieceColor;
    this.availableMovesColor = this.defaultColors.availableMovesColor;
    this.inCheckColor = this.defaultColors.inCheckColor;
    this.lastMoveFromColor = this.defaultColors.lastMoveFromColor;
    this.lastMoveToColor = this.defaultColors.lastMoveToColor;
    this.highlightedSquareColor1 = this.defaultColors.highlightedSquareColor1;
    this.highlightedSquareColor2 = this.defaultColors.highlightedSquareColor2;
    this.highlightedSquareColor3 = this.defaultColors.highlightedSquareColor3;
    this.highlightedSquareColor4 = this.defaultColors.highlightedSquareColor4;
    this.arrowColor = this.defaultColors.arrowColor;
    this.squarenameColor = this.defaultColors.squarenameColor;

    // Graphical components
    this.container = document.createElement("div");
    this.container.style.position = "relative";
    this.container.style.aspectRatio = "1/1";
    this.container.style.height = "fit-content";
    this.container.style.userSelect = "none";
    this.container.tabIndex = "0"; // make the div focusable
    this.container.style.outline = "none"; // do not show outline when focused
    this.container.onkeydown = this.keyboardCommands();
    this.container.oncontextmenu = () => false;

    this.chessboard = document.createElement("div");
    this.chessboard.style.height = "100%";
    this.chessboard.onmousedown = this.draw();

    this.bottomSVG = this.createBottomSVG();
    this.topSVG = this.createTopSVG();

    this.highlightedSquares = new Array(64).fill(null);
    this.arrows = [];

    // Event dispatcher
    this.dispatcher = document.createElement("div");

    // initialize
    this.loadFEN(this.startFen);

    this.container.appendChild(this.bottomSVG);
    this.container.appendChild(this.chessboard);
    this.container.appendChild(this.topSVG);
    main_div.appendChild(this.container);

    // piece animation
    this.animationDuration = 100; //ms

    //audio
    this.audioContext = new AudioContext();
    this.piecemoveAudio = new Audio(new URL("mixkit-modern-click-box-check-1120_trim.wav", import.meta.url));
    const track = this.audioContext.createMediaElementSource(this.piecemoveAudio);
    track.connect(this.audioContext.destination);
    this.soundOn = false;

    // Settings
    this.showAvailableMoves = true;

    if (mode == "play") {
      this.mode = "play";
      this.player = WHITE;
      this.moveRequested = false;
    }
    else if (mode == "analysis") {
      this.mode = "analysis";
    }
    else {
      console.log("mode " + mode + " undefined. Default is analysis.");
      this.mode = "analysis";
    }
  }

  rankIndex(i) { return 7 - Math.floor(i/8); }
  rankName(i) { return (this.rankIndex(i) + 1).toString(); }
  fileIndex(i) { return i%8; }
  fileName(i) { return "abcdefgh"[this.fileIndex(i)]; }
  isPromotion(flag) {
    return ["p","pn","np","pc","cp"].includes(flag);
  }

  pieceSVGsrc(color,type){
    switch(color + type){
      case WHITE + PAWN:
        return this.whitePawnSVG;
      case WHITE + BISHOP:
        return this.whiteBishopSVG;
      case WHITE + KNIGHT:
        return this.whiteKnightSVG;
      case WHITE + ROOK:
        return this.whiteRookSVG;
      case WHITE + QUEEN:
        return this.whiteQueenSVG;
      case WHITE + KING:
        return this.whiteKingSVG;
      case BLACK + PAWN:
        return this.blackPawnSVG;
      case BLACK + BISHOP:
        return this.blackBishopSVG;
      case BLACK + KNIGHT:
        return this.blackKnightSVG;
      case BLACK + ROOK:
        return this.blackRookSVG;
      case BLACK + QUEEN:
        return this.blackQueenSVG;
      case BLACK + KING:
        return this.blackKingSVG;
    }
  }

  newPiece(piece,square) {
    if (!piece) return;
    let img = document.createElement("img");
    img.className = "chess-aa-piece";
    img.style.position = "absolute";
    img.style.top = "0";
    img.style.left = "0";
    img.style.width = "12.5%";
    img.style.zIndex = "1";
    img.style.cursor = "grab";
    let x = (square % 8) * 100;
    let y = Math.floor(square/8) * 100;
    img.style.transform = "translate(" + x + "% ," + y + "%)";
    img.dataset.square = square;
    img.src = this.pieceSVGsrc(piece.color, piece.type);
    img.addEventListener("mousedown", this.drag(), false);
    img.addEventListener("touchstart", this.drag(), false);
    img.ondragstart = () => false;
    this.chessboard.appendChild(img);
  }

  movePiece(source,target) {
    let img = this.chessboard.querySelector('[data-square="' + source + '"]');
    if (img) {
      let x = (target % 8) * 100;
      let y = Math.floor(target/8) * 100;
      img.style.transform = "translate(" + x + "% ," + y + "%)";
      img.dataset.square = target;
    }
  }

  loadFEN(fen = this.DEFAULTFEN, quiet=false) {
    if (fen == "") {
      fen = this.DEFAULTFEN
    }
    if (!this.chess.load(fen)){
      console.log("bad fen string");
      return false;
    }
    this.clearAnnotations();
    this.startFen = fen;
    this.resetPieceCount();
    let pieces = this.chessboard.querySelectorAll("[data-square]");
    for (let i = pieces.length-1; i>=0; i--){
      let piece = pieces[i];
      piece.remove();
    }
    for (let i = 0; i < 64; i++){
      this.newPiece(this.chess.get(this.squareNames[i]), i)
    }

    this.variations.clear();
    if (!quiet) { // skip the following block when loading a pgn
      if (this.startFen == this.DEFAULTFEN)
        this.header = {};
      else
        this.header = {FEN: this.startFen, SetUp: "1"};
      let event = new CustomEvent("chess-aa-newposition", { detail: {fen: this.startFen} });
      this.dispatcher.dispatchEvent(event);
    }

    if (this.mode == "play" && this.player != this.chess.turn()) {
      this.requestMove();
    }

    return true;
  }

  printFEN() {
    return this.chess.fen();
  }

  loadPGN(pgnstring) {
    let tree;
    let header;
    try {
      [tree,header] = loadpgn(pgnstring);
    }
    catch (err) {
      console.log(err);
      return;
    }

    if (header["SetUp"] == "1") {
      this.loadFEN(header["FEN"],true);
    }
    else {
      this.loadFEN(this.DEFAULTFEN,true);
    }
    this.header = header;
    this.variations = tree;

    if (this.mode == "play") {
      this.variations.prune()
      this.gotoAddress(this.variations.addressLastMain());
    }

    let event = new CustomEvent("chess-aa-newposition", { detail: {fen: this.startFen} });
    this.dispatcher.dispatchEvent(event);
  }

  printPGNheader() {
    // the seven tag roster should be printed in order
    let output = "";
    let roster = ["Event","Site","Date","Round","White","Black","Result"];
    let defaults = ["?","?","????.??.??","?","?","?","*"]
    for (let i=0; i<roster.length;++i) {
        output += '[' + roster[i] + ' "' + (this.header[roster[i]] || defaults[i]) + '"]\n';
    }
    for (let [key,value] of Object.entries(this.header)) {
      if (roster.includes(key)) continue;
      output += '[' + key + ' "' + value + '"]\n';
    }
    output += "\n";
    return output;
  }

  printPGN(skipheader=true) {
    let output = "";
    if (!skipheader) {
      output += this.printPGNheader();
    }
    output += this.variations.toPGN();
    output += this.header["Result"] || "*";
    return output;
  }

  printPGNMain(skipheader=true,withcomments=true) {
    let output = "";
    if (!skipheader) {
      output += this.printPGNheader();
    }
    output += this.variations.toPGNMain(withcomments);
    output += this.header["Result"] || "*";
    return output;
  }

  possibleMove(source,target){
    let availableMoves = this.chess.moves({ verbose: true, square: this.squareNames[source] });
    for (let i = 0; i < availableMoves.length; i++) {
      let move = availableMoves[i];
      if (move.to == this.squareNames[target]){
        return move;
      }
    }
    return null;
  }

  async displayMove(source,target,animate) {
    this.movePiece(source,target);
    if (animate && this.animationDuration > 0) {
      let img = this.chessboard.querySelector('[data-square="' + target + '"]');
      let xstart = (source % 8) * 100;
      let xend = (target % 8) * 100;
      let ystart = Math.floor(source/8) * 100;
      let yend = Math.floor(target/8) * 100;
      img.style.transform = "translate(" + xstart + "%, " + ystart + "%)";
      let start;
      let that = this;
      function step(timestamp) {
        if (start === undefined) start = timestamp;
        let elapsed = timestamp - start;
        if (elapsed < that.animationDuration) {
          img.style.transform = "translate(" + (xstart + (xend - xstart)*elapsed/that.animationDuration) + "%, " +
                  (ystart + (yend - ystart)*(elapsed)/that.animationDuration) + "%)";
          window.requestAnimationFrame(step);
        }
        else {
          img.style.transform = "translate(" + xend + "%, " + yend + "%)";
          if (that.soundOn) that.piecemoveAudio.play();
          promiseResolve();
        }
      }
      let promiseResolve;
      await new Promise(resolve => {
        promiseResolve = resolve;
        window.requestAnimationFrame(step);
      });
    }
  }

  makeMove(move,animate=false,forceNewVariation=false,branch=null) {
    if (!move) return false;
    move = this.chess.move(move);
    if (!move) return false;

    if (move.captured) {
      --this.pieceCount[this.chess.turn() + move.captured]
    }
    let source = this.squareNamesMap[move.from];
    let target =  this.squareNamesMap[move.to];
    let imageSource = this.chessboard.querySelector('[data-square="' + source + '"]');

    let rookSource;
    let rookTarget;
    let imageTarget;
    switch(move.flags){
      case "n": break;
      case "b": break;
      case "e":
        let ep_square;
        if ((this.chess.turn() == WHITE && this.whiteDown) || (this.chess.turn() == BLACK && !this.whiteDown))
          ep_square = target - 8;
        else
          ep_square = target + 8;
        let ep_image = this.chessboard.querySelector('[data-square="' + ep_square + '"]');
        this.chessboard.removeChild(ep_image);
        break;
      case "k":
        if (this.chess.turn() == BLACK) {
          rookSource = this.squareNamesMap["h1"];
          rookTarget = this.squareNamesMap["f1"];
        } 
        else {
          rookSource = this.squareNamesMap["h8"];
          rookTarget = this.squareNamesMap["f8"];
        }
        this.movePiece(rookSource, rookTarget);
        break;
      case "q":
        if (this.chess.turn() == BLACK) {
          rookSource = this.squareNamesMap["a1"];
          rookTarget = this.squareNamesMap["d1"];
        } 
        else {
          rookSource = this.squareNamesMap["a8"];
          rookTarget = this.squareNamesMap["d8"];
        }
        this.movePiece(rookSource, rookTarget);
        break;
      case "pc":
      case "cp":
        imageTarget = this.chessboard.querySelector('[data-square="' + target + '"]');
        this.chessboard.removeChild(imageTarget);
        // Continue to promotion
      case "p":
      case "np":
      case "pn":
        imageSource.src = this.pieceSVGsrc(this.chess.turn() == WHITE ? BLACK : WHITE, move.promotion);
        break;
      case "c":
        imageTarget = this.chessboard.querySelector('[data-square="' + target + '"]');
        this.chessboard.removeChild(imageTarget);
        break;
    }

    let children = this.variations.getChildren();
    let moveAlreadyMade = false;
    if (branch == null) {
      for (let i=0; i<children.length; i++) {
        let child = children[i];
        if (this.moveEqual(move,child.move)){
          moveAlreadyMade = true;
          branch = i;
          break;
        }
      }
    }
    else {
      if (this.moveEqual(move,children[branch].move)) {
        moveAlreadyMade = true;
      }
      else {
        console.log("error making move at specified branch: the move at the branch and the move provided are not the same. A new branch will be created for the move.");
      }
    }
    if (moveAlreadyMade && !forceNewVariation) {
      this.variations.redo(branch);
    }
    else {
      this.variations.add(move);
    }
    this.clearAnnotations();

    let address = this.variations.address();
    let fen = this.chess.fen();

    // display move
    this.displayMove(source,target,animate);

    let event = new CustomEvent("chess-aa-movemade", { detail: { move:move, address:address, fen:fen } });
    this.dispatcher.dispatchEvent(event);

    // Ask engine for a move
    if (this.mode == "play" && this.player != this.chess.turn()) {
      this.requestMove();
    }

    return true;
  }

  moveEqual(m1,m2) {
    return m1.from == m2.from && m1.to == m2.to &&
        m1.color == m2.color && m1.piece == m2.piece &&
        m1.promotion == m2.promotion;
  }

  requestMove() {
    let event = new CustomEvent("chess-aa-enginemoverequest", { detail: { fen: this.chess.fen() } });
    this.dispatcher.dispatchEvent(event);
    this.moveRequested = true;
  }

  suggestMove(move) {
    if (this.mode == "play" && this.moveRequested) {
      if (this.makeMove(move,true))
        this.moveRequested = false;
    }
  }

  unmakeMove(animate=false) {
    let move = this.chess.undo()
    if (move) {
      if (move.captured) {
        ++this.pieceCount[(this.chess.turn() == WHITE ? BLACK : WHITE) + move.captured]
      }
      this.variations.undo();
      this.clearAnnotations();

      let address = this.variations.address();
      let fen = this.chess.fen();

      let source = this.squareNamesMap[move.from];
      let target = this.squareNamesMap[move.to];
      let img = this.chessboard.querySelector('[data-square="' + target + '"]');

      let rookSource;
      let rookTarget;
      switch(move.flags) {
        case "n": break;
        case "b": break;
        case "e":
          let ep_square;
          if ((this.chess.turn() == WHITE && this.whiteDown) || (this.chess.turn() == BLACK && !this.whiteDown))
            ep_square = target + 8;
          else
            ep_square = target - 8;
          this.newPiece(this.chess.get(this.squareNames[ep_square]), ep_square);
          break;
        case "k":
          if (this.chess.turn() == WHITE) {
            rookTarget = this.squareNamesMap["h1"];
            rookSource = this.squareNamesMap["f1"];
          } 
          else {
            rookTarget = this.squareNamesMap["h8"];
            rookSource = this.squareNamesMap["f8"];
          }
          this.movePiece(rookSource,rookTarget);
          break;
        case "q":
          if (this.chess.turn() == WHITE) {
            rookTarget = this.squareNamesMap["a1"];
            rookSource = this.squareNamesMap["d1"];
          } 
          else {
            rookTarget = this.squareNamesMap["a8"];
            rookSource = this.squareNamesMap["d8"];
          }
          this.movePiece(rookSource,rookTarget);
          break;
        case "pc":
        case "cp":
        case "p":
        case "np":
        case "pn":
          if (this.chess.turn() == WHITE) {
            img.src = this.whitePawnSVG;
          }
          else {
            img.src = this.blackPawnSVG;
          }
      }
      // display move
      this.displayMove(target, source, animate);
      this.newPiece(this.chess.get(this.squareNames[target]), target);
      let event = new CustomEvent("chess-aa-moveunmade", { detail: { move:move, address:address, fen:fen } });
      this.dispatcher.dispatchEvent(event);
    }
  }

  resetPieceCount() {
    let pieces = [WHITE + PAWN, BLACK + PAWN,WHITE + QUEEN,BLACK + QUEEN,WHITE + BISHOP,BLACK + BISHOP,WHITE + KNIGHT,BLACK + KNIGHT,WHITE + ROOK,BLACK + ROOK,WHITE + KING,BLACK + KING];
    for (let i=0; i<pieces.length; ++i) {
      this.pieceCount[pieces[i]] = 0;
    }

    let board = this.chess.board();
    for (let row=0; row<8; ++row) {
      for (let file=0; file<8; ++file) {
        let piece;
        if (board[row][file])
          piece = board[row][file].color + board[row][file].type;
        else
          continue;

        ++this.pieceCount[piece];
      }
    }
  }

  material() {
    let pieces = [WHITE + PAWN, BLACK + PAWN,WHITE + QUEEN,BLACK + QUEEN,WHITE + BISHOP,BLACK + BISHOP,WHITE + KNIGHT,BLACK + KNIGHT,WHITE + ROOK,BLACK + ROOK];
    let material = 0;
    for (let i=0; i<pieces.length; ++i) {
      material += this.pieceCount[pieces[i]] * this.pieceValue[pieces[i]];
    }
    return material;
  }

  gotoAddress(address) {
    let currentAddress = this.variations.address();
    let commonNode = -1;
    // find common nodes in the movetree
    for (let i=0; i<currentAddress.length; ++i) {
      if (currentAddress[i] == address[i]) {
        ++commonNode;
      }
      else {
        break;
      }
    }

    // animate the moves only if the number of moves is small
    let animate;
    if ((currentAddress.length - commonNode) + (address.length - commonNode) < 20 ) {
      animate = true;
    }
    else {
      animate = false;
      if (this.soundOn) this.piecemoveAudio.play();
    }

    // unmake moves that are not common
    for (let i=currentAddress.length-1; i>commonNode; --i) {
      this.unmakeMove(animate);
    }

    // make moves after common node
    for (let i=commonNode+1; i<address.length; ++i) {
      let move = this.variations.moveAtBranch(address[i]);
      this.makeMove(move,animate,false,address[i]);
    }
  }

  removeVariationAtAddress(address) {
    if (this.variations.addressExists(address)) {

      // if we remove a move from the branch where we are standing, we need to unmake moves to the common parent node 
      let currentAddress = this.variations.address();
      if (currentAddress.length >= address.length && address.every(function(value, index) { return value === currentAddress[index]})) {
        let len = currentAddress.length - address.length + 1;
        for (let i=0; i<len; ++i) {
          this.unmakeMove();
        }
      }
      // otherwise, we just remove the branch
      this.variations.removeAt(address);

      let event = new CustomEvent("chess-aa-variationremoval", { detail: {address: address} });
      this.dispatcher.dispatchEvent(event);

      return true;
    }
    return false;
  }

  addVariation(moves) {
    let movesmade = 0;
    for (let i=0; i<moves.length; ++i) {
      if (this.makeMove(moves[i],false,true))
        ++movesmade;
      else
        break;
    }
    if (movesmade > 0)
      for (let i=0; i<movesmade-1; ++i) {
        this.unmakeMove();
      }
  }

  addCommentAt(s, address) {
    this.variations.addCommentAt(s,address);
    let event = new CustomEvent("chess-aa-addedcomment",{detail:{comment: s, address: address}});
    this.dispatcher.dispatchEvent(event);
  }

  addComment(s) {
    this.variations.addComment(s);
    let event = new CustomEvent("chess-aa-addedcomment",{detail:{comment: s, address: this.variations.address()}});
    this.dispatcher.dispatchEvent(event);
  }

  deleteCommentAt(address,index) {
    this.variations.deleteComment(address,index);
    let event = new CustomEvent("chess-aa-deletedcomment",{detail:{address: address, index: index}});
    this.dispatcher.dispatchEvent(event);
  }

  deleteComment(index) {
    this.variations.deleteComment(index);
    let event = new CustomEvent("chess-aa-deletedcomment",{detail:{address: this.variations.address(), index: index}});
    this.dispatcher.dispatchEvent(event);
  }

  clearComments() {
    this.variations.clearComments();
    let event = new Event("chess-aa-clearcomments");
    this.dispatcher.dispatchEvent(event);
  }

  getComment(index=0) {
    return this.variations.getComment(index);
  }

  getComments() {
    return this.variations.getComments();
  }

  drag() {
    let that = this;
    return function(event) {
      let img = event.currentTarget;
      if (event.button == 0 || event.targetTouches) {
        that.clearAnnotations();
        if (that.chess.game_over() || (that.mode == "play" && that.player != that.chess.turn())) {
          return;
        }
        let source = img.dataset.square;
        that.cellAnnotations(source,"selectedPiece");

        if(that.showAvailableMoves) {
          let availableMoves = that.chess.moves({verbose: true, square: that.squareNames[source]})
          for (let i=0; i<availableMoves.length; i++) {
            let move = availableMoves[i];
            that.cellAnnotations(that.squareNamesMap[move.to],"availableMoves")
          }
        }

        img.style.zIndex = 1000;
        img.style.cursor = "grabbing";

        // moves the img at (clientX, clientY) coordinates
        // taking initial shifts into account
        let rect = img.parentElement.getBoundingClientRect();
        function moveAt(clientX, clientY) {
          let x = clientX - rect.left - img.offsetWidth / 2 + 'px';
          let y = clientY - rect.top - img.offsetHeight / 2 + 'px';
          img.style.transform = "translate(" + x + ", " + y + ")";
        }

        let left = event.clientX || event.targetTouches[0].clientX;
        let top = event.clientY || event.targetTouches[0].clientY;
        moveAt(left, top);

        function onMouseMove(event) {
          left = event.clientX || event.targetTouches[0].clientX;
          top = event.clientY || event.targetTouches[0].clientY;
          moveAt(left, top);
          event.preventDefault(); // prevent scrolling on touchscreens
        }

        // move the img on mousemove
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('touchmove', onMouseMove, {passive: false});

        // drop the img, remove unneeded handlers
        function release(event) {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener("touchmove", onMouseMove);
          img.removeEventListener("mouseup", release);
          img.removeEventListener("touchend", release);
          img.style.zIndex = "1";
          img.style.cursor = "grab";

          let target = Math.floor((left-rect.left)/that.chessboard.offsetWidth*8) + Math.floor((top-rect.top)/that.chessboard.offsetHeight*8)*8;

          let move = that.possibleMove(source,target);
          if (move && that.isPromotion(move.flags)){
            that.selectPromotionPiece(move, img);
          }
          else {
            if (move) {
              that.makeMove(move);
              if (that.soundOn) that.piecemoveAudio.play();
            }
            else
              that.movePiece(source,source);
            that.clearAnnotations();
          }
        }

        img.addEventListener("mouseup", release, false);
        img.addEventListener("touchend", release, false);
      }
    };
  }

  selectPromotionPiece(move, img) {
    let that = this;
    let source = this.squareNamesMap[move.from];
    let target = this.squareNamesMap[move.to];
    let div = document.createElement("div");
    div.style.backgroundColor = "#d3d3d3";
    div.style.position = "absolute";
    div.style.zIndex = "1001";
    div.style.margin = "0";
    div.style.width = "12.5%";
    div.style.height = "50%";
    div.style.cursor = "pointer";
    div.style.left = ((target % 8)*100/8) + "%";
    if (target < 8) { //queening on top of screen 
      div.style.top = "0";
    }
    else { //queening on bottom of screen 
      div.style.top = "50%";
    }
    this.chessboard.appendChild(div);
    function closeDiv(event) {
      document.removeEventListener("mousedown",closeDiv);
      let rect = div.getBoundingClientRect();
      let isInDiv=(rect.top <= event.clientY && event.clientY <= rect.top + rect.height
        && rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
      if (!isInDiv) {
        that.movePiece(source,source);
        div.remove();
      }
    }
    document.addEventListener("mousedown",closeDiv);

    function clickPiece(piece) {
      return function() {
        document.removeEventListener("mousedown",closeDiv);
        move.promotion = piece;
        let move2 = that.chess.move(move);
        that.chess.undo();
        that.makeMove(move2);
        that.clearAnnotations();
        div.remove();
        that.container.focus();
        if (that.soundOn) that.piecemoveAudio.play();
      }
    };

    let pieces = [QUEEN, KNIGHT, ROOK, BISHOP];
    if (target>55) { // queening on bottom of screen
      pieces.reverse();
    }
    for (let i=0; i<pieces.length; i++) {
      let but = document.createElement("div");
      but.style.padding = "0";
      but.style.width = "100%";
      but.style.aspectRatio = "1/1";
      let image = document.createElement("img");
      image.src = this.pieceSVGsrc(this.chess.turn(), pieces[i]);
      image.style.width = "100%";
      image.style.display = "block";
      but.appendChild(image);
      div.appendChild(but);
      but.onclick = clickPiece(pieces[i]);
    }
  }

  draw() {
    let that = this;
    return function(event) {
      if (event.button == 2) {
        let rect = that.chessboard.getBoundingClientRect();
        let source = Math.floor((event.clientX-rect.left)/that.chessboard.offsetWidth*8) + Math.floor((event.clientY-rect.top)/that.chessboard.offsetHeight*8)*8;

        let release = function(e) {
          let x = Math.floor((e.clientX-rect.left)/that.chessboard.offsetWidth*8);
          let y = Math.floor((e.clientY-rect.top)/that.chessboard.offsetHeight*8);
          let target;
          if (x >= 0 && x < 8 && y >= 0 && y < 8) {
            target = y * 8 + x;
            if (target == source) {
              if (e.ctrlKey)
                that.highlightSVG(target,that.highlightedSquareColor2);
              else if (e.altKey)
                that.highlightSVG(target,that.highlightedSquareColor3);
              else if (e.shiftKey)
                that.highlightSVG(target,that.highlightedSquareColor4);
              else
                that.highlightSVG(target,that.highlightedSquareColor1);
            }
            else
              that.arrowSVG(source,target);
          }
          document.removeEventListener("mouseup",release);
        }
        document.addEventListener("mouseup",release);
      }
    };
  }

  createBottomSVG() {
    let svgns = "http://www.w3.org/2000/svg";
    let svg = document.createElementNS(svgns,"svg");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.pointerEvents = "none";
    svg.setAttribute("height", "100%");
    svg.setAttribute("apect-ratio", "1/1");
    svg.setAttribute("viewBox", "0 0 8 8");

    for (let i=0; i<8; ++i) {
      for (let j=0; j<8; ++j) {
        let path = document.createElementNS(svgns, "rect");
        path.setAttribute("x", i);
        path.setAttribute("y", j);
        path.setAttribute("width", 1);
        path.setAttribute("height", 1);
        path.style.strokeWidth = "0";
        if ((i+j) % 2 == 0) {
          path.style.fill = this.whiteSquareColor;
          path.dataset.color = "white";
        }
        else {
          path.style.fill = this.blackSquareColor;
          path.dataset.color = "black";
        }
        svg.appendChild(path);
      }
    }
    return svg;
  }

  createTopSVG() {
    let svgns = "http://www.w3.org/2000/svg";
    let svg = document.createElementNS(svgns,"svg");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.opacity = "0.6";
    svg.style.zIndex = "2";
    svg.style.pointerEvents = "none";
    svg.setAttribute("height", "100%");
    svg.setAttribute("apect-ratio", "1/1");
    svg.setAttribute("viewBox", "0 0 8 8");

    let defs = document.createElementNS(svgns,"defs");
    let markerdef = document.createElementNS(svgns,"marker");
    let markerPath = document.createElementNS(svgns, "path");
    markerdef.id = "arrowhead";
    markerdef.setAttribute("markerWidth", "4");
    markerdef.setAttribute("markerHeight", "8");
    markerdef.setAttribute("refX", "2.05");
    markerdef.setAttribute("refY", "2.01");
    markerdef.setAttribute("orient", "auto");
    markerPath.setAttribute("d","M0,0 V4 L3,2 Z");
    markerPath.style.fill = this.arrowColor;

    markerdef.appendChild(markerPath);
    defs.appendChild(markerdef)
    svg.appendChild(defs);

    for (let i=0; i<8; ++i) {
      let rank = document.createElementNS(svgns, "text");
      rank.setAttribute("x", 0);
      rank.setAttribute("y", i+0.25);
      rank.setAttribute("font-size","2%");
      rank.style.fill = this.squarenameColor;
      rank.style.fontFamily = "sans-serif";
      rank.textContent = 8-i;
      rank.classList.add("chess-aa-rankname");
      svg.appendChild(rank);

      let file = document.createElementNS(svgns, "text");
      file.setAttribute("x", i+0.82);
      file.setAttribute("y", 7.93);
      file.setAttribute("font-size","2%");
      file.style.fill = this.squarenameColor;
      file.style.fontFamily = "sans-serif";
      file.textContent = "abcdefgh"[i];
      file.classList.add("chess-aa-filename");
      svg.appendChild(file);
    }

    return svg;
  }

  arrowSVG(i,j) {
    // delete existing arrow
    for (let k=0; k<this.arrows.length; k++) {
      let x = this.arrows[k];
      if (x.source == i && x.target == j) {
        x.svg.remove();
        this.arrows.splice(k,1);
        return;
      }
    }

    let sourcerank = Math.floor(i/8);
    let sourcefile = i % 8;
    let targetrank = Math.floor(j/8);
    let targetfile = j % 8;
    
    let svgns = "http://www.w3.org/2000/svg";
    let path = document.createElementNS(svgns, "line");
    // path.setAttribute("d", "M30,150 L100,50");
    path.setAttribute("x1", sourcefile + 0.5);
    path.setAttribute("y1", sourcerank + 0.5);
    path.setAttribute("x2", targetfile + 0.5);
    path.setAttribute("y2", targetrank + 0.5);
    path.style.stroke = this.arrowColor;
    path.style.strokeWidth = "0.15";
    path.style.fill = "none";
    path.setAttribute("marker-end","url(#arrowhead)");
    this.topSVG.appendChild(path);

    this.arrows.push({source: i, target: j, svg: path});
  }

  highlightSVG(i,color) {
    // delete existing highlights
    let x = this.highlightedSquares[i];
    if (x) {
      x.remove();
      this.highlightedSquares[i] = null;
      return;
    }

    let sourcerank = Math.floor(i/8);
    let sourcefile = i % 8;
    
    let svgns = "http://www.w3.org/2000/svg";
    let path = document.createElementNS(svgns, "rect");
    path.setAttribute("x", sourcefile);
    path.setAttribute("y", sourcerank);
    path.setAttribute("width", 1);
    path.setAttribute("height", 1);
    path.style.strokeWidth = "0";
    path.style.fill = color;
    path.style.opacity = 0.8;
    this.bottomSVG.appendChild(path);

    this.highlightedSquares[i] = path;
  }

  cellAnnotations(i, type) {
    let sourcerank = Math.floor(i/8);
    let sourcefile = i % 8;
    
    let svgns = "http://www.w3.org/2000/svg";
    let path = document.createElementNS(svgns, "rect");
    path.setAttribute("x", sourcefile);
    path.setAttribute("y", sourcerank);
    path.setAttribute("width", 1);
    path.setAttribute("height", 1);
    path.classList.add("chess-aa-cellannotations");
    path.style.opacity = 0.7;
    switch (type) {
      case "lastMoveFrom":
        path.style.strokeWidth = "0";
        path.style.fill = this.lastMoveFromColor;
        break;
      case "lastMoveTo":
        path.style.strokeWidth = "0";
        path.style.fill = this.lastMoveToColor;
        break;
      case "selectedPiece":
        path.style.strokeWidth = "0";
        path.style.fill = this.selectedPieceColor;
        break;
      case "inCheck":
        path.style.strokeWidth = "0";
        path.style.fill = this.inCheckColor;
        break;
      case "availableMoves":
        path.style.opacity = "1";
        path.style.strokeWidth = "0.05";
        path.style.stroke = this.availableMovesColor;
        path.style.fill = "none";
        break;
      default:
        console.log("unknown cell annotation type:",type);
    }
    this.bottomSVG.appendChild(path);
  }

  updateColors(config) {
    this.selectedPieceColor = config.selectedPieceColor || this.selectedPieceColor;
    this.availableMovesColor = config.availableMovesColor || this.availableMovesColor;
    this.inCheckColor = config.inCheckColor || this.inCheckColor;
    this.lastMoveFromColor = config.lastMoveFromColor || this.lastMoveFromColor;
    this.lastMoveToColor = config.lastMoveToColor || this.lastMoveToColor;
    this.highlightedSquareColor1 = config.highlightedSquareColor1 || this.highlightedSquareColor1;
    this.highlightedSquareColor2 = config.highlightedSquareColor2 || this.highlightedSquareColor2;
    this.highlightedSquareColor3 = config.highlightedSquareColor3 || this.highlightedSquareColor3;
    this.highlightedSquareColor4 = config.highlightedSquareColor4 || this.highlightedSquareColor4;
    this.clearAnnotations();

    if (config.whiteSquareColor || config.blackSquareColor) {
      this.whiteSquareColor = config.whiteSquareColor || this.whiteSquareColor;
      this.blackSquareColor = config.blackSquareColor || this.blackSquareColor;
      let x = this.bottomSVG.querySelectorAll('[data-color="white"]');
      let y = this.bottomSVG.querySelectorAll('[data-color="black"]');
      for (let i=0; i<x.length; ++i) {
        x[i].style.fill = this.whiteSquareColor;
        y[i].style.fill = this.blackSquareColor;
      }
    }
    if (config.arrowColor) {
      this.arrowColor = config.arrowColor;
      // update color of arrow heads
      this.topSVG.querySelector("defs")
              .querySelector("marker")
              .querySelector("path")
              .style.fill = this.arrowColor;
    }
    if (config.squarenameColor) {
      this.squarenameColor = config.squarenameColor;
      // update color of file and rank names
      let x = this.topSVG.getElementsByClassName("chess-aa-rankname");
      let y = this.topSVG.getElementsByClassName("chess-aa-filename");
      for (let i=0; i<x.length; ++i) {
        x[i].style.fill = this.squarenameColor;
        y[i].style.fill = this.squarenameColor;
      }
    }
  }

  resetColors() {
    this.updateColors(this.defaultColors);
  }

  clearAnnotations() {
    for (let i=this.arrows.length-1; i>=0; i--) {
      this.arrows[i].svg.remove();
      this.arrows.splice(i,1);
    }

    for (let i=0; i < this.highlightedSquares.length; ++i) {
      if (this.highlightedSquares[i]) {
        this.highlightedSquares[i].remove();
        this.highlightedSquares[i] = null;
      }
    }

    let annotations = this.bottomSVG.getElementsByClassName("chess-aa-cellannotations");
    for (let i=annotations.length-1; i>=0; --i) {
      annotations[i].remove();
    }

    let move = this.chess.undo();
    if (move) {
      this.chess.move(move);
      this.cellAnnotations(this.squareNamesMap[move.from],"lastMoveFrom");
      this.cellAnnotations(this.squareNamesMap[move.to],"lastMoveTo");
    }

    if (this.chess.in_check()) {
      for (let i=0; i<64; i++) {
        let piece = this.chess.get(this.squareNames[i]);
        let color = this.chess.turn();
        if (piece && piece.type == KING && piece.color == color) {
          this.cellAnnotations(i,"inCheck");
        }
      }
    }
  }

  flipBoard() {
    if (this.mode == "play") {
      if (this.chess.history().length != 0) {
        // Only allow flipping the board when the game has not started
        return;
      }
      this.player = this.whiteDown ? BLACK : WHITE;
      if (this.player == BLACK) {
        this.requestMove();
      }
    }
    this.whiteDown = !this.whiteDown;

    // Flip ranks and files
    let ranks = this.topSVG.getElementsByClassName("chess-aa-rankname")
    let files = this.topSVG.getElementsByClassName("chess-aa-filename")
    for (let i=0; i<ranks.length; ++i) {
      ranks[i].textContent = this.whiteDown ? 8-i : i+1;
      files[i].textContent = "abcdefgh"[(this.whiteDown ? i : 7-i)];
    }

    this.squareNames.reverse();

    if (!this.whiteDown) {
      this.squareNamesMap = this.squareNamesMapBlack;
    }
    else {
      this.squareNamesMap = this.squareNamesMapWhite;
    }

    // flipping the pieces
    // Placing pieces on top of each other does not allow movePiece to know which piece to select
    // To avoid the conflicts, we first change the data-square of all pieces to a place outside the board
    // and then we actually move them to the correct square 
    let pieces = this.chessboard.querySelectorAll("[data-square]");
    let squares = new Array(pieces.length);
    for (let i=0; i<pieces.length; ++i) {
      squares[i] = pieces[i].dataset.square;
      pieces[i].dataset.square = 64 + squares[i];
    }
    for (let i=0; i<pieces.length; ++i) {
      this.movePiece(64+squares[i],63-squares[i]);
    }

    let oldarrows = this.arrows;
    this.arrows = new Array();
    for (let i=0; i<oldarrows.length; ++i) {
      oldarrows[i].svg.remove();
      this.arrowSVG(63 - oldarrows[i].source, 63 - oldarrows[i].target);
    }

    let cellannotations = this.bottomSVG.getElementsByClassName("chess-aa-cellannotations");
    for (let i=0; i<cellannotations.length; ++i) {
      cellannotations[i].setAttribute("x", 7-cellannotations[i].getAttribute("x"));
      cellannotations[i].setAttribute("y", 7-cellannotations[i].getAttribute("y"));
    }

    let hs = this.highlightedSquares.slice();
    for (let i=0; i<hs.length; ++i) {
      if (hs[i]) {
        hs[i].setAttribute("x", 7-hs[i].getAttribute("x"));
        hs[i].setAttribute("y", 7-hs[i].getAttribute("y"));
        this.highlightedSquares[63-i] = hs[i];
      }
      else {
        this.highlightedSquares[63-i] = null
      }
    }

    let event = new CustomEvent("chess-aa-flipboard",{detail:{whiteDown: this.whiteDown}});
    this.dispatcher.dispatchEvent(event);
  }

  keyboardCommands() {
    let that = this;
    return function (event) {
      if (that.mode == "play") {
        if (event.code == "ArrowLeft") {
          let address = that.variations.address();
          if (that.player == that.chess.turn() && address.length > 1) {
            that.removeVariationAtAddress(address.slice(0,address.length - 1));
          }
          else if (address.length > 0) {
            that.removeVariationAtAddress(address);
            that.moveRequested = false;
          }
          return false;
        }
      }
      else {
        if (event.code == "ArrowLeft") {
          that.unmakeMove(true);
          return false;
        }
        else if (event.code == "ArrowRight") {
          let move = that.variations.moveAtBranch(0);
          that.makeMove(move,true);
          return false;
        }
      }
    };
  }

  focus() {
    this.container.focus();
  }

  switchAvailableMoves(onoff) {
    this.showAvailableMoves = onoff;
  }

  switchSound(onoff) {
    if (onoff && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
    this.soundOn = onoff;
  }

  switchAnimationDuration(ms) {
    this.animationDuration = ms;
  }
}