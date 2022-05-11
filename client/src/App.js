import "./App.css";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import x from "./img/x.png";
import o from "./img/o.png";

let socket = io("http://localhost:3001/");

function App() {
	const [boardShown, setBoardShown] = useState(false);
	const [matchmakingShown, setMatchmakingShown] = useState(false);
	const [buttonShown, setButtonShown] = useState(true);
  const [playAgainShown, setPlayAgainShown] = useState(false);

	const [room, setRoom] = useState(null);
	const [board, setBoard] = useState(new Array(9).fill(null));
	const [assignment, setAssignment] = useState(null);
	const [turn, setTurn] = useState("X");
  const [winner, setWinner] = useState("O");
	const [gameOver, setGameOver] = useState(true);

	const startMatchmaking = () => {
		socket.emit("start_matchmaking");
		setMatchmakingShown(true);
		setButtonShown(false);
    setPlayAgainShown(false);
    setBoardShown(false);

		setRoom(null);
		setBoard(new Array(9).fill(null));
		setAssignment(null);
		setTurn("X");
	};

	const select = (e) => {
		if (!gameOver && board[e.target.id] == null && turn === assignment && e.target.id !== "") {
			var block = e.target.id;
			socket.emit("select_block", { block, assignment, room });
		}
	};

	useEffect(() => {
		socket.off("connectGame").on("connectGame", (gameID) => {
			setBoardShown(true);
			setMatchmakingShown(false);
      setPlayAgainShown(false);

			setRoom(gameID);
			setBoard(new Array(9).fill(null));
			setTurn("X");
			setGameOver(false);

			socket.emit("join_room", gameID);
		});

		socket.off("receive_block").on("receive_block", (data) => {
			setTurn(data.turn);
			setBoard(data.board);
		});

		socket.off("player_disconnected").on("player_disconnected", () => {
			setBoardShown(true);
			setMatchmakingShown(false);
			setButtonShown(false);
      setWinner(null);
      setPlayAgainShown(true);

			setRoom("");
			setBoard(new Array(9).fill(null));
			setAssignment("");
			setTurn("X");
			setGameOver(true);

			socket.emit("leave_room");
		});

		socket.off("set_assignment").on("set_assignment", (assign) => {
			setAssignment(assign);
		});

		socket.off("winner").on("winner", (winner) => {
      setWinner(winner);
			setTimeout(() => {
				setGameOver(true);
        setPlayAgainShown(true);
			}, 500);
		});
	}, [socket]);

	return (
		<div className="App">
			<div className={`matchmaking_button ${buttonShown ? "" : " hidden"}`}>
				<button className="matchmaking_button" onClick={startMatchmaking} >
					Start Matchmaking
				</button>
			</div>
			<div className={`matchmaking ${matchmakingShown ? "" : " hidden"}`}>
				<p>Waiting for opponent...</p>
			</div>

			<div className={`board ${boardShown ? "" : " hidden"}`}>
				<button
					onClick={select}
					className={`Spot ${turn === assignment ? "my_turn" : ""} 
          ${ (board[0] === null && gameOver !== true) ? "available" : "" }`}
					id="0"
				>
					{board[0] === "X" ? <img className="x" src={x} alt="" /> : ""}
					{board[0] === "O" ? <img className="o" src={o} alt="" /> : ""}
				</button>

				<button
					onClick={select}
					className={`Spot ${turn === assignment ? "my_turn" : ""} ${
						(board[1] === null && gameOver !== true) ? "available" : ""
					}`}
					id="1"
				>
					{board[1] === "X" ? <img className="x" src={x} alt="" /> : ""}
					{board[1] === "O" ? <img className="o" src={o} alt="" /> : ""}
				</button>

				<button
					onClick={select}
					className={`Spot ${turn === assignment ? "my_turn" : ""} ${
						(board[2] === null && gameOver !== true) ? "available" : ""
					}`}
					id="2"
				>
					{board[2] === "X" ? <img className="x" src={x} alt="" /> : ""}
					{board[2] === "O" ? <img className="o" src={o} alt="" /> : ""}
				</button>
				<button
					onClick={select}
					className={`Spot ${turn === assignment ? "my_turn" : ""} ${
						(board[3] === null && gameOver !== true) ? "available" : ""
					}`}
					id="3"
				>
					{board[3] === "X" ? <img className="x" src={x} alt="" /> : ""}
					{board[3] === "O" ? <img className="o" src={o} alt="" /> : ""}
				</button>

				<button
					onClick={select}
					className={`Spot ${turn === assignment ? "my_turn" : ""} ${
						(board[4] === null && gameOver !== true) ? "available" : ""
					}`}
					id="4"
				>
					{board[4] === "X" ? <img className="x" src={x} alt="" /> : ""}
					{board[4] === "O" ? <img className="o" src={o} alt="" /> : ""}
				</button>

				<button
					onClick={select}
					className={`Spot ${turn === assignment ? "my_turn" : ""} ${
						(board[5] === null && gameOver !== true) ? "available" : ""
					}`}
					id="5"
				>
					{board[5] === "X" ? <img className="x" src={x} alt="" /> : ""}
					{board[5] === "O" ? <img className="o" src={o} alt="" /> : ""}
				</button>

				<button
					onClick={select}
					className={`Spot ${turn === assignment ? "my_turn" : ""} ${
						(board[6] === null && gameOver !== true) ? "available" : ""
					}`}
					id="6"
				>
					{board[6] === "X" ? <img className="x" src={x} alt="" /> : ""}
					{board[6] === "O" ? <img className="o" src={o} alt="" /> : ""}
				</button>

				<button
					onClick={select}
					className={`Spot ${turn === assignment ? "my_turn" : ""} ${
						(board[7] === null && gameOver !== true) ? "available" : ""
					}`}
					id="7"
				>
					{board[7] === "X" ? <img className="x" src={x} alt="" /> : ""}
					{board[7] === "O" ? <img className="o" src={o} alt="" /> : ""}
				</button>

				<button
					onClick={select}
					className={`Spot ${turn === assignment ? "my_turn" : ""} ${
						(board[8] === null && gameOver !== true) ? "available" : ""
					}`}
					id="8"
				>
					{board[8] === "X" ? <img className="x" src={x} alt="" /> : ""}
					{board[8] === "O" ? <img className="o" src={o} alt="" /> : ""}
				</button>
			</div>

      {playAgainShown ? 
      <div className={`play_again`}>
        { winner === "Draw" ? <h1 className="play_again_text">Draw!</h1> : "" }
        { winner === "X" ? <h1 className="play_again_text">X Wins!</h1> : "" }
        { winner === "O" ? <h1 className="play_again_text">O Wins!</h1> : "" }
        { winner === null ? <h1 className="play_again_text">Opponent Disconnected!</h1> : "" }

        <button className="matchmaking_button" onClick={startMatchmaking} >
					Play Again
				</button>
      </div> : "" }
		</div>
	);
}

export default App;
