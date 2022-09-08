import { Chess, BLACK, WHITE, PAWN, BISHOP, KNIGHT, ROOK, QUEEN, KING } from "./chess.js";
import { moveTree } from "./moveTree.js";

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
    this.squareNamesMap = this.squareNamesMapWhite;

    this.DEFAULTFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    // logic library
    this.chess = new Chess();

    // Additional logic components
    this.startFen = this.DEFAULTFEN
    this.variations = new moveTree();
    this.header = {};

    //Colors
    this.whiteSquareColor = "#d3ba90";
    this.blackSquareColor = "#7c522e";
    this.availableMovesColor = "#F1C40F";
    this.incheckColor = "#C73030";
    this.lastMoveFromColor = "#cca45c";
    this.lastMoveToColor = "#ab7c2e";
    this.selectedPieceColor = "#2274a5";
    this.highlightedSquareColor = "#f75c03";
    this.arrowColor = "#30c67c";
    this.squarenameColor = "black";

    // Graphical components
    this.container = document.createElement("div");
    this.container.style.position = "relative";
    this.container.style.aspectRatio = "1/1";
    this.container.style.height = "fit-content";
    this.container.style.userSelect = "none";
    this.container.tabIndex = "0"; // make the div focusable
    this.container.onkeydown = this.keyboardCommands();
    this.container.oncontextmenu = () => false;

    this.chessboard = document.createElement("div");
    this.chessboard.style.height = "100%";
    this.chessboard.style.display = "grid";
    this.chessboard.style.gridTemplateColumns = "repeat(8,12.5%)";
    this.chessboard.style.gridTemplateRows = "repeat(8,12.5%)";

    for (let i = 0; i < 64; i++) {
      let div = document.createElement("div");
      div.className = "chess-aa-square";
      div.style.position = "relative";
      div.onmousedown = this.draw();
      if (i%8 == 0) {
        let divrank = document.createElement("div");
        divrank.className = "chess-aa-rank";
        divrank.style.position = "absolute";
        divrank.style.top = "0";
        divrank.style.left = "0";
        divrank.style.fontSize = "clamp(8px,5vmin,16px)";
        divrank.style.fontFamily = "sans-serif";
        divrank.style.color = this.squarenameColor;
        divrank.style.pointerEvents = "none";
        divrank.textContent = "87654321"[i/8];
        div.appendChild(divrank);
      }
      if (i >= 56) {
        let divfile = document.createElement("div");
        divfile.className = "chess-aa-file";
        divfile.style.position = "absolute";
        divfile.style.bottom = "0";
        divfile.style.right = "0";
        divfile.style.fontSize = "clamp(8px,5vmin,16px)";
        divfile.style.fontFamily = "sans-serif";
        divfile.style.color = this.squarenameColor;
        divfile.style.pointerEvents = "none";
        divfile.textContent = "abcdefgh"[i-56];
        div.appendChild(divfile);
      }
      this.chessboard.appendChild(div);
    }

    this.svgcontainer = this.createSVG();

    this.highlightedSquares = new Array(64).fill(false);
    this.arrows = [];

    // for flipping the board
    this.whiteDown = true;

    // Event dispatcher
    this.dispatcher = document.createElement("div");

    // initialize
    this.colorBoardSquares();

    this.loadFEN(this.startFen);

    this.container.appendChild(this.chessboard);
    this.container.appendChild(this.svgcontainer);
    main_div.appendChild(this.container);

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
      throw("mode " + mode + " undefined.");
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
    let elem = this.chessboard.children[square];
    img.style.position = "absolute";
    img.style.top = "0";
    img.style.left = "0";
    img.style.width = "100%";
    img.style.zIndex = "1";
    img.src = this.pieceSVGsrc(piece.color, piece.type);
    img.onmousedown = this.drag(img);
    img.ondragstart = () => false;
    elem.appendChild(img);
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
    let pieces = this.chessboard.getElementsByClassName("chess-aa-piece");
    for (let i = pieces.length-1; i>=0; i--){
      let piece = pieces[i];
      piece.remove();
    }
    for (let i = 0; i < 64; i++){
      this.newPiece(this.chess.get(this.squareNames[i]), i)
    }

    this.variations.clear();
    if (!quiet) { // skip the following block when loading a pgn
      this.header = {};
      let event = new CustomEvent("chess-aa-newposition", { detail: {fen: this.startFen, variations: this.variations.copy()} });
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
    if (this.chess.load_pgn(pgnstring)) {
      this.header = this.chess.header();
      let moves = this.chess.history({verbose: true});
      for (let i=0; i<moves.length; i++) {
        this.chess.undo();
      }
      this.loadFEN(this.chess.fen(),true);
      
      for (let i=0; i<moves.length; i++) {
        this.variations.add(moves[i]);
      }
      let endAddress = this.variations.address();
      for (let i=0; i<moves.length; i++) {
        this.variations.undo();
      }

      if (this.mode == "play") {
        this.gotoAddress(endAddress);
      }

      let event = new CustomEvent("chess-aa-newposition", { detail: {fen: this.startFen, variations: this.variations.copy()} });
      this.dispatcher.dispatchEvent(event);
    }
  }

  printPGN(skipheader=true) {
    let output = "";
    if (!skipheader) {
      for (let [key,value] of Object.entries(this.header)) {
        output += "[" + key + " " + value + "]\n";
      }
      output += "\n";
    }
    output += this.variations.toPGN();
    return output;
  }

  printPGNMain(skipheader=true,withcomments=true) {
    let output = "";
    if (!skipheader) {
      for (let [key,value] of Object.entries(this.header)) {
        output += "[" + key + " " + value + "]\n";
      }
      output += "\n";
    }
    output += this.variations.toPGNMain(withcomments);
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

  makeMove(move,animate=false) {
    if (!move) return false;
    move = this.chess.move(move);
    if (!move) return false;
    let source = this.squareNamesMap[move.from];
    let target =  this.squareNamesMap[move.to];
    let imageSource = this.chessboard.children[source].getElementsByClassName("chess-aa-piece")[0];

    let rookSource;
    let rookTarget;
    let rookImage;
    let imageTarget;
    switch(move.flags){
      case "n": break;
      case "b": break;
      case "e":
        let ep_square = target + (this.chess.turn() == BLACK ? 8 : -8);
        let ep_image = this.chessboard.children[ep_square].getElementsByClassName("chess-aa-piece")[0];
        this.chessboard.children[ep_square].removeChild(ep_image);
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
        rookImage = this.chessboard.children[rookSource].getElementsByClassName("chess-aa-piece")[0];
        this.chessboard.children[rookTarget].appendChild(rookImage);
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
        rookImage = this.chessboard.children[rookSource].getElementsByClassName("chess-aa-piece")[0];
        this.chessboard.children[rookTarget].appendChild(rookImage);
        break;
      case "pc":
      case "cp":
        imageTarget = this.chessboard.children[target].getElementsByClassName("chess-aa-piece")[0];
        this.chessboard.children[target].removeChild(imageTarget);
        // Continue to promotion
      case "p":
      case "np":
      case "pn":
        imageSource.src = this.pieceSVGsrc(this.chess.turn() == WHITE ? BLACK : WHITE, move.promotion);
        break;
      case "c":
        imageTarget = this.chessboard.children[target].getElementsByClassName("chess-aa-piece")[0];
        this.chessboard.children[target].removeChild(imageTarget);
        break;
    }

    this.variations.add(move);
    let event = new CustomEvent("chess-aa-movemade", { detail: { move:move, address:this.variations.address(), fen: this.chess.fen() } });
    this.dispatcher.dispatchEvent(event);
    this.clearAnnotations();

    // display move
    this.chessboard.children[target].appendChild(imageSource);
    // animate move
    if (animate) {
      let unit = this.chessboard.children[0].offsetWidth;
      let ydiff = -this.rankIndex(source) + this.rankIndex(target);
      let xdiff = this.fileIndex(source) - this.fileIndex(target);
      imageSource.style.top = ydiff*unit + "px";
      imageSource.style.left = xdiff*unit + "px";
      let id = null;
      clearInterval(id);
      id = setInterval(frame, 5);
      let pos = 5;
      function frame() {
        if (pos == 0) {
          clearInterval(id);
          imageSource.style.top = 0;
          imageSource.style.left = 0;
        } else {
          pos--;
          imageSource.style.top = ydiff*pos/5*unit + "px";
          imageSource.style.left = xdiff*pos/5*unit + "px";
        }
      }
    }

    // Ask engine for a move
    if (this.mode == "play" && this.player != this.chess.turn()) {
      this.requestMove();
    }

    return true;
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
      this.variations.undo();
      let event = new CustomEvent("chess-aa-moveunmade", { detail: { move:move, address:this.variations.address(), fen: this.chess.fen() } });
      this.dispatcher.dispatchEvent(event);
      this.clearAnnotations();

      let source = this.squareNamesMap[move.from];
      let target = this.squareNamesMap[move.to];
      let img = this.chessboard.children[target].getElementsByClassName("chess-aa-piece")[0];

      let rookSource;
      let rookTarget;
      let rookImage;
      switch(move.flags) {
        case "n": break;
        case "b": break;
        case "e":
          let ep_square = target + (this.chess.turn() == WHITE ? 8 : -8);
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
          rookImage = this.chessboard.children[rookSource].getElementsByClassName("chess-aa-piece")[0];
          this.chessboard.children[rookTarget].appendChild(rookImage);
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
          rookImage = this.chessboard.children[rookSource].getElementsByClassName("chess-aa-piece")[0];
          this.chessboard.children[rookTarget].appendChild(rookImage);
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
      this.chessboard.children[source].appendChild(img);
      this.newPiece(this.chess.get(this.squareNames[target]), target);
      // animate move
      if (animate) {
        let unit = this.chessboard.children[0].offsetWidth;
        let ydiff = this.rankIndex(source) - this.rankIndex(target);
        let xdiff = -this.fileIndex(source) + this.fileIndex(target);
        img.style.top = ydiff*unit + "px";
        img.style.left = xdiff*unit + "px";
        let id = null;
        clearInterval(id);
        id = setInterval(frame, 5);
        let pos = 5;
        function frame() {
          if (pos == 0) {
            clearInterval(id);
            img.style.top = 0;
            img.style.left = 0;
          } else {
            pos--;
            img.style.top = ydiff*pos/5*unit + "px";
            img.style.left = xdiff*pos/5*unit + "px";
          }
        }
      }
    }
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
    }

    // unmake moves that are not common
    for (let i=currentAddress.length-1; i>commonNode; --i) {
      this.unmakeMove(animate);
    }

    // make moves after common node
    for (let i=commonNode+1; i<address.length; ++i) {
      let move = this.variations.redo(address[i]);
      this.makeMove(move,animate);
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

      let event = new CustomEvent("chess-aa-variationremoval", { detail: {variations: this.variations.copy()} });
      this.dispatcher.dispatchEvent(event);

      return true;
    }
    return false;
  }

  addVariation(moves) {
    let movesmade = 0;
    for (let i=0; i<moves.length; ++i) {
      if (this.makeMove(moves[i]))
        ++movesmade;
      else
        break;
    }
    for (let i=0; i<movesmade; ++i) {
      this.unmakeMove();
    }
    if (movesmade > 0)
      this.makeMove(moves[0],true);
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

  colorBoardSquares() {
    for (let i = 0; i < 64; i++){
      let div = this.chessboard.children[i];
      this.highlightedSquares[i] = false;
      if((this.rankIndex(i)+this.fileIndex(i)) % 2 != 0){
        div.style.backgroundColor = this.whiteSquareColor;
      }
      else {
        div.style.backgroundColor = this.blackSquareColor;
      }
    }
  }

  drag(img){
    let that = this;
    return function(event) {
      if (event.button == 0) {
        that.clearAnnotations();
        if (that.chess.game_over() || (that.mode == "play" && that.player != that.chess.turn())) {
          return;
        }
        img.parentElement.style.backgroundColor = that.selectedPieceColor;;
        let source = Array.from(that.chessboard.children).indexOf(img.parentElement);

        if(that.showAvailableMoves) {
          let availableMoves = that.chess.moves({verbose: true, square: that.squareNames[source]})
          for (let i=0; i<availableMoves.length; i++) {
            let move = availableMoves[i];
            that.chessboard.children[that.squareNamesMap[move.to]].style.backgroundColor = that.availableMovesColor;
          }
        }

        img.style.width = img.offsetWidth + "px";
        img.style.zIndex = 1000;

        // moves the img at (clientX, clientY) coordinates
        // taking initial shifts into account
        let rect = img.parentElement.getBoundingClientRect();
        function moveAt(clientX, clientY) {
          img.style.left = clientX - rect.left - img.offsetWidth / 2 + 'px';
          img.style.top = clientY - rect.top - img.offsetHeight / 2 + 'px';
        }

        moveAt(event.clientX, event.clientY);

        function onMouseMove(event) {
          moveAt(event.clientX, event.clientY);
        }

        // move the img on mousemove
        document.addEventListener('mousemove', onMouseMove);

        // drop the img, remove unneeded handlers
        img.onmouseup = function(event) {
          document.removeEventListener('mousemove', onMouseMove);
          img.onmouseup = null;

          img.hidden = true;
          let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
          img.hidden = false;

          let target;
          if (elemBelow.parentElement === that.chessboard){
            target = Array.from(that.chessboard.children).indexOf(elemBelow);
          }
          else if (elemBelow.parentElement.parentElement === that.chessboard){
            let squareelem = elemBelow.parentElement;
            target = Array.from(that.chessboard.children).indexOf(squareelem);
          }
          let move = that.possibleMove(source,target);
          if (move && that.isPromotion(move.flags)){
            that.selectPromotionPiece(move, img);
          }
          else {
            that.makeMove(move);
            img.style.top = "0";
            img.style.left = "0";
            img.style.zIndex = "1";
            img.style.width = "100%";
            that.clearAnnotations();
          }
        };
      }
    };
  }

  selectPromotionPiece(move, img) {
    let that = this;
    let target = this.squareNamesMap[move.to];
    let div = document.createElement("div");
    div.style.backgroundColor = "#d3d3d3";
    div.style.position = "absolute";
    div.style.zIndex = "1001";
    div.style.margin = "0";
    div.style.width = "100%";
    div.style.height = "400%";
    div.style.cursor = "pointer";
    if (target < 8) { //queening on top of screen 
      div.style.top = "0";
    }
    else { //queening on bottom of screen 
      div.style.top = "-300%";
    }
    this.chessboard.children[target].appendChild(div);
    function closeDiv(event) {
      document.removeEventListener("mousedown",closeDiv);
      let rect = div.getBoundingClientRect();
      let isInDiv=(rect.top <= event.clientY && event.clientY <= rect.top + rect.height
        && rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
      if (!isInDiv) {
        img.style.top = "0";
        img.style.left = "0";
        img.style.zIndex = "1";
        img.style.width = "100%";
        that.clearAnnotations();
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
        img.style.top = "0";
        img.style.left = "0";
        img.style.zIndex = "1";
        img.style.width = "100%";
        that.clearAnnotations();
        div.remove();
        that.container.focus();
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
        let square = event.currentTarget;
        let source = Array.from(that.chessboard.children).indexOf(square);

        // transparent div to help with dragging functionality
        let img = document.createElement("div");
        // img.src = that.pen;
        square.appendChild(img);
        img.style.width = "15%";
        img.style.height = "15%";
        img.style.width = img.offsetWidth + "px";
        img.style.position = 'absolute';
        img.style.zIndex = 1000;

        // moves the img at (pageX, pageY) coordinates
        // taking initial shifts into account
        let rect = img.parentElement.getBoundingClientRect();
        function moveAt(clientX, clientY) {
          img.style.left = clientX - rect.left - img.offsetWidth / 2 + 'px';
          img.style.top = clientY - rect.top - img.offsetHeight / 2 + 'px';
        }

        moveAt(event.clientX, event.clientY);

        function onMouseMove(event) {
          moveAt(event.clientX, event.clientY);
        }

        // move the img on mousemove
        document.addEventListener('mousemove', onMouseMove);

        img.onmouseup = function(event) {
          document.removeEventListener('mousemove', onMouseMove);
          img.remove();

          let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
          let target;
          if (elemBelow.parentElement === that.chessboard){
            target = Array.from(that.chessboard.children).indexOf(elemBelow);
          }
          else if (elemBelow.parentElement.parentElement === that.chessboard){
            let squareelem = elemBelow.parentElement;
            target = Array.from(that.chessboard.children).indexOf(squareelem);
          }
          if (target && target == source){
            if (that.highlightedSquares[source]) {
              that.highlightedSquares[source] = false;
              if((that.rankIndex(source)+that.fileIndex(source)) % 2 != 0){
                square.style.backgroundColor = that.whiteSquareColor;
              }
              else {
                square.style.backgroundColor = that.blackSquareColor;
              }
            }
            else {
              that.highlightedSquares[source] = true;
              square.style.backgroundColor = that.highlightedSquareColor;
            }
          }
          else if (target && target >=0 && target < 64) {
            that.arrowSVG(source,target);
          }
        }
      }
    };
  }

  createSVG() {
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
    this.svgcontainer.appendChild(path);

    this.arrows.push({source: i, target: j, svg: path});
  }

  clearAnnotations() {
    this.colorBoardSquares();
    for (let i=this.arrows.length-1; i>=0; i--) {
      this.arrows[i].svg.remove();
      this.arrows.splice(i,1);
    }

    let move = this.chess.undo();
    if (move) {
      this.chess.move(move);
      this.chessboard.children[this.squareNamesMap[move.from]].style.backgroundColor = this.lastMoveFromColor;
      this.chessboard.children[this.squareNamesMap[move.to]].style.backgroundColor = this.lastMoveToColor;
    }

    if (this.chess.in_check()) {
      for (let i=0; i<64; i++) {
        let piece = this.chess.get(this.squareNames[i]);
        let color = this.chess.turn();
        if (piece && piece.type == KING && piece.color == color) {
          this.chessboard.children[i].style.backgroundColor = this.incheckColor;
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

    for (let i = 0; i < 64; i++) {
      let div = this.chessboard.children[63-i];
      this.chessboard.append(div);
    }

    // Flip ranks
    for (let i=0; i<8; ++i) {
      let div1 = this.chessboard.children[8*i+7];
      let div2 = this.chessboard.children[8*i];
      let divrank = div1.getElementsByClassName("chess-aa-rank");
      div2.appendChild(divrank[0]);
    }
    // Flip files
    for (let i=0; i<8; ++i) {
      let div1 = this.chessboard.children[i];
      let div2 = this.chessboard.children[56+i];
      let divfile = div1.getElementsByClassName("chess-aa-file");
      div2.appendChild(divfile[0]);
    }

    this.squareNames.reverse();

    if (!this.whiteDown) {
      this.squareNamesMap = this.squareNamesMapBlack;
    }
    else {
      this.squareNamesMap = this.squareNamesMapWhite;
    }

    let oldarrows = this.arrows;
    this.arrows = new Array();
    for (let i=0; i<oldarrows.length; ++i) {
      oldarrows[i].svg.remove();
      this.arrowSVG(63 - oldarrows[i].source, 63 - oldarrows[i].target);
    }
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
        }
      }
      else {
        if (event.code == "ArrowLeft") {
          that.unmakeMove(true);
        }
        else if (event.code == "ArrowRight") {
          let move = that.variations.redo();
          that.makeMove(move,true);
        }
      }
    };
  }

  focus() {
    this.container.focus();
  }
}