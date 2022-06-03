const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());
require("dotenv").config();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

class Player {
  constructor(id, game, assignment = "") {
    this.id = id;
    this.game = game;
    this.assignment = assignment;
  }
}

class Room {
  constructor(id) {
    this.id = id;
    this.turn = "X";
    this.board = new Array(9).fill(null);
    this.players = [];
  }

  addPlayer(player) {
    this.players.push(player);
  }

  switch_turn() {
    this.turn = this.turn == "X" ? "O" : "X";
  }

  calculateWinner() {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        this.board[a] &&
        this.board[a] === this.board[b] &&
        this.board[a] === this.board[c]
      ) {
        return this.board[a];
      }
    }
    for (i = 0; i < this.board.length; i++) {
      if (this.board[i] == null) {
        return null;
      }
    }
    return "Draw";
  }
}

var players_waiting = [];

const rooms = [];

function generate_room_code() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }

  return result;
}

function generate_assignments(room) {
  let x_player = Math.random() > 0.5 ? 1 : 0;

  room.players[x_player].assignment = "X";
  room.players[x_player == 0 ? 1 : 0].assignment = "O";
}

function generate_room() {
  var room_code = generate_room_code();
  while (rooms.includes(room_code)) {
    room_code = generate_room_code();
  }

  room = new Room(room_code);
  rooms.push(room);
  return room;
}

function get_room(roomID) {
  var room;
  for (i = 0; i < rooms.length; i++) {
    if (roomID == rooms[i].id) {
      room = rooms[i];
    }
  }

  return room;
}

function del_room(roomID) {
  room = get_room(roomID);

  for (i = 0; i < room.players.length; i++) {
    room.players[i].game = "";
  }

  for (i = 0; i < rooms.length; i++) {
    if (rooms[i].id == room.id) {
      rooms.splice(i, 1);
    }
  }
}

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("select_block", (data) => {
    let room = get_room(data.room);

    if (room != undefined) {
      if (data.assignment == room.turn) {
        room.switch_turn();
        room.board[data.block] = data.assignment;

        let turn = room.turn;
        let board = room.board;
        io.to(room.id).emit("receive_block", { board, turn });

        winner = room.calculateWinner();

        if (winner != null) {
          io.to(room.id).emit("winner", winner);
        }
      }
    }
  });

  socket.on("join_room", (roomID) => {
    socket.join(roomID);
    room = roomID;

    for (var i = 0; i < players_waiting.length; i++) {
      if (players_waiting[i] === socket.id) {
        players_waiting.splice(i, 1);
      }
    }
  });

  socket.on("leave_room", () => {
    socket.leave(room);
    room = "";
  });

  socket.on("start_matchmaking", () => {
    
    for (i = 0; i < rooms.length; i++) {
        if ( rooms[i].players[0].id == socket.id || rooms[i].players[1].id == socket.id ) {
          del_room(rooms[i].id);
        }
      }

    if (!players_waiting.includes(socket.id)) {
      players_waiting.push(socket.id);

      if (players_waiting.length >= 2) {
        let room = generate_room();
        let player1 = new Player(socket.id, room.id);
        let player2 = new Player(players_waiting[0], room.id);

        room.addPlayer(player1);
        room.addPlayer(player2);
        generate_assignments(room);

        io.to(player1.id).emit("set_assignment", player1.assignment);
        io.to(player2.id).emit("set_assignment", player2.assignment);

        for (i = 0; i < room.players.length; i++) {
          io.to(players_waiting[i]).emit("connectGame", room.id);
        }
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected.`);

    for (i = 0; i < players_waiting.length; i++) {
      if (players_waiting[i] === socket.id) {
        players_waiting.splice(i, 1);
      }
    }

    for (i = 0; i < rooms.length; i++) {
      if ( rooms[i].players[0].id == socket.id || rooms[i].players[1].id == socket.id ) {
        io.to(rooms[i].id).emit("player_disconnected");
        del_room(rooms[i].id);
      }
    }
  });
});

server.listen(process.env.PORT || 3001, () => {
  console.log("Server running");
});
