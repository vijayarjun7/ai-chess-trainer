-- Additional lessons across all 11 skill categories
-- Run this in the Supabase SQL Editor to expand the lesson library

INSERT INTO lessons (title, theme, skill_name, difficulty, content, min_age, max_age, order_index) VALUES

-- ── HANGING PIECES (3rd lesson) ────────────────────────────────────────────
('The Two-Move Check: Is It Still Safe?',
 'hanging_pieces', 'hanging_pieces', 2,
 '{"type":"text","body":"After your opponent moves, a piece that was safe can suddenly become a target. Always re-check your pieces after each opponent move — a new attacker may have appeared. Ask yourself: is every piece still protected?","tip":"Get in the habit of scanning your pieces after every single opponent move, not just before yours."}',
 9, 99, 3),

-- ── FORKS (3rd lesson) ────────────────────────────────────────────────────
('Bishop and Queen Forks',
 'forks', 'forks', 3,
 '{"type":"text","body":"Forks are not just for Knights! Bishops fork on diagonals, and Queens can fork in any direction. A Queen fork is especially dangerous because the Queen threatens two pieces at once and is very hard to defend against. Look for diagonal lines that hit two enemy pieces.","tip":"Queens are too valuable to risk in most forks — make sure the Queen is safe on the forking square."}',
 12, 99, 3),

-- ── PINS ──────────────────────────────────────────────────────────────────
('What is a Pin?',
 'pins', 'pins', 1,
 '{"type":"text","body":"A pin is when a piece cannot move because moving it would expose a more valuable piece behind it to capture. Bishops and Rooks and Queens create pins. If a Knight is pinned to the King, it cannot move at all — because moving it would put the King in check!","tip":"Always check if your pieces are pinned before you rely on them to defend something else."}',
 6, 99, 1),

('Absolute vs Relative Pins',
 'pins', 'pins', 2,
 '{"type":"text","body":"An absolute pin is when the piece behind is the King — the pinned piece literally cannot move (it would be illegal). A relative pin is when the piece behind is just very valuable, like a Queen. In a relative pin, the pinned piece CAN move, but you would lose the piece behind. Always figure out which type of pin you are dealing with.","tip":"Attack a pinned piece with your own pieces — a piece that cannot move freely cannot defend itself well."}',
 10, 99, 2),

('Breaking a Pin',
 'pins', 'pins', 2,
 '{"type":"text","body":"When your piece is pinned, you have three ways to break it: 1) Move the valuable piece out from behind — removing the threat. 2) Block the pin by putting another piece between the attacker and your valuable piece. 3) Attack the pinning piece and force it to move or be traded. Knowing how to escape pins is just as important as creating them!","tip":"Counter-attack is often the best way to deal with a pin — give your opponent something else to think about."}',
 12, 99, 3),

-- ── SKEWERS ───────────────────────────────────────────────────────────────
('What is a Skewer?',
 'skewers', 'skewers', 1,
 '{"type":"text","body":"A skewer is like a reverse pin. Instead of attacking a less valuable piece pinned in front of a more valuable one, you attack the MORE valuable piece first. It must move — and then the less valuable piece behind it is taken for free. Rooks on open files, Bishops on long diagonals, and Queens are the best skewer pieces.","tip":"Keep your King and Queen off the same rank, file, or diagonal as enemy Rooks, Bishops, or Queens."}',
 9, 99, 1),

('Skewer Practice: Spot the Line',
 'skewers', 'skewers', 2,
 '{"type":"text","body":"Before your opponent can execute a skewer, they need their piece lined up with two of yours. Always check: is my King or Queen lined up with an enemy long-range piece? Are my Rooks doubled but exposed? Moving one piece off a dangerous line can prevent a skewer entirely.","tip":"When your opponent plays a long-range piece to an open file or diagonal, ask: what does it now line up with?"}',
 11, 99, 2),

-- ── CHECKMATE PATTERNS ────────────────────────────────────────────────────
('Back-Rank Checkmate',
 'checkmate_patterns', 'checkmate_patterns', 2,
 '{"type":"text","body":"The back-rank checkmate happens when a Rook or Queen delivers check on the last rank and the King is trapped behind its own pawns with no escape. It is one of the most common ways beginners lose games! The fix: advance one pawn by one square to give your King an escape square. This is called a luft (German for air).","tip":"Before you put your Rooks on the back rank, make sure you have a luft — or your opponent might do it to you first!"}',
 8, 99, 2),

('Scholar''s Mate — and How to Stop It',
 'checkmate_patterns', 'checkmate_patterns', 1,
 '{"type":"text","body":"Scholar''s Mate is a 4-move checkmate: 1.e4 e5 2.Qh5 Nc6 3.Bc4 Nf6?? 4.Qxf7#. Black loses by forgetting to defend f7. The defence: play 2...Nc6 (attacking the Queen) or 2...g6 (chasing the Queen away). Remember: f7 (or f2 for White) is the weakest square in the starting position, defended only by the King!","tip":"If your opponent moves their Queen and Bishop toward your King early, defend f7 immediately — do not ignore the threat."}',
 7, 99, 3),

('Smothered Mate',
 'checkmate_patterns', 'checkmate_patterns', 3,
 '{"type":"text","body":"Smothered mate is a brilliant checkmate where a Knight delivers check and the King is surrounded by its OWN pieces with no escape. It usually requires a Queen sacrifice to force the King into the corner. The sequence: the Knight checks, the King goes to a corner square, then gets trapped by its own army. Look for Kings tucked in corners with no pawn moves available.","tip":"Smothered mates are rare but beautiful — practise the classic Philidor legacy pattern: Qg8+ Rxg8 Nf7#."}',
 13, 99, 4),

-- ── KING SAFETY ───────────────────────────────────────────────────────────
('When NOT to Castle',
 'king_safety', 'king_safety', 2,
 '{"type":"text","body":"Castling is usually good — but not always! Do not castle into an attack. If your opponent has many pieces aimed at the kingside, castling kingside walks your King into danger. Sometimes keeping the King in the center temporarily, or castling queenside, is the better plan. Always check: what is waiting for my King over there?","tip":"Before castling, count how many of your opponent''s pieces are aiming at that side of the board."}',
 11, 99, 2),

('Pawn Storms and King Safety',
 'king_safety', 'king_safety', 3,
 '{"type":"text","body":"A pawn storm is when you advance pawns toward the opponent''s castled King to open lines for your Rooks and Bishops. The key is timing: attack when your King is safe and before your opponent can launch their own attack. If you have castled on opposite sides, the race is on — whoever attacks faster usually wins!","tip":"When attacking with pawns, make sure your own King is safe first. A pawn storm that leaves your own King exposed can backfire badly."}',
 13, 99, 3),

-- ── DEVELOPMENT ───────────────────────────────────────────────────────────
('Control the Center',
 'development', 'development', 1,
 '{"type":"text","body":"The four center squares (d4, d5, e4, e5) are the most important squares on the board. Pieces in the center control more squares and attack more of the board. Your first few moves should aim to place pawns and pieces where they influence the center. Do not move side pawns when you can control the center!","tip":"e4 and d4 for White, e5 and d5 for Black — these are the two key pawn moves to learn first."}',
 6, 99, 2),

('Do Not Move the Same Piece Twice',
 'development', 'development', 1,
 '{"type":"text","body":"In the opening, every move should develop a new piece. Moving the same piece twice in the opening wastes time — your opponent gets one step ahead in development. The only reason to move a piece twice is if it is being attacked and must move to survive. Otherwise, bring out a different piece each turn.","tip":"Count your developed pieces after every opening move. You want all Knights and Bishops out before move 8."}',
 7, 99, 3),

('The Opening Principles — All Together',
 'development', 'development', 2,
 '{"type":"text","body":"There are three golden opening rules: 1) Control the center with pawns and pieces. 2) Develop your Knights and Bishops quickly. 3) Castle to keep your King safe. After following these three rules, you will almost always reach a playable middlegame, even against stronger players. These principles work at every level!","tip":"Check yourself after move 8: are all your pieces developed? Is your King castled? If not, prioritise getting there."}',
 10, 99, 4),

-- ── PAWN STRUCTURE ────────────────────────────────────────────────────────
('Doubled Pawns',
 'pawn_structure', 'pawn_structure', 1,
 '{"type":"text","body":"Doubled pawns occur when two pawns of the same colour are on the same file. They are usually a weakness because: they cannot protect each other, they move slowly, and the file they are on can become a target for enemy Rooks. Avoid creating doubled pawns unless you get something valuable in return — like a strong open file or piece activity.","tip":"Doubled pawns are not always terrible — if they control key squares, they can be fine. Context matters."}',
 9, 99, 1),

('Isolated Pawns',
 'pawn_structure', 'pawn_structure', 2,
 '{"type":"text","body":"An isolated pawn has no friendly pawns on neighbouring files. It cannot be protected by another pawn, so it must be defended by pieces — which ties those pieces down. In the endgame, isolated pawns are often a serious weakness. In the middlegame, they can give you open files for your Rooks and active piece play.","tip":"When you have an isolated pawn, keep the position dynamic and attack. When your opponent has one, trade pieces and head for an endgame."}',
 11, 99, 2),

('Passed Pawns',
 'pawn_structure', 'pawn_structure', 2,
 '{"type":"text","body":"A passed pawn has no enemy pawns blocking it or guarding the squares in front of it. Passed pawns are powerful because they threaten to promote to a Queen! The rule: passed pawns must be pushed. In the endgame, a passed pawn far up the board is worth almost as much as a minor piece. Support it with your King and Rooks.","tip":"Put your Rook BEHIND a passed pawn — that way it supports the pawn all the way to promotion."}',
 10, 99, 3),

-- ── ENDGAME BASICS ────────────────────────────────────────────────────────
('Activate Your King in the Endgame',
 'endgame_basics', 'endgame_basics', 1,
 '{"type":"text","body":"In the opening and middlegame, the King hides. In the endgame, the King becomes a FIGHTING PIECE. With fewer pieces on the board, the King is much safer and much more powerful. Move your King toward the center of the board as soon as the endgame begins. A centralised King wins endgames.","tip":"The King''s best endgame square is d4, d5, e4, or e5 — get there as fast as possible."}',
 7, 99, 1),

('King and Pawn Endgames',
 'endgame_basics', 'endgame_basics', 2,
 '{"type":"text","body":"In a King and pawn endgame, everything depends on whose King gets to the key squares first. The attacking King should march in front of its pawn — ideally two squares ahead. This is called the opposition. If the attacking King reaches the sixth rank in front of its pawn, it almost always wins. If the defending King gets in front, it often draws.","tip":"The rule of the square: draw a diagonal from the pawn to the promotion square. If the defending King can step into this square, it catches the pawn. If not, the pawn promotes."}',
 10, 99, 2),

('Rook Endgames — The Basics',
 'endgame_basics', 'endgame_basics', 2,
 '{"type":"text","body":"Rook endgames are the most common endgame type. The two most important rules: 1) Put your Rook BEHIND passed pawns (yours or the opponent''s). 2) Cut off the enemy King with your Rook. The Lucena and Philidor positions are the most important to learn — Lucena wins for the side with the pawn, Philidor draws for the defending side.","tip":"Keep your Rook active! A passive Rook sitting on the back rank loses rook endgames. It must harass and check constantly."}',
 12, 99, 3),

('Queen vs Pawn on the 7th Rank',
 'endgame_basics', 'endgame_basics', 3,
 '{"type":"text","body":"When you have a Queen vs an enemy pawn one square from promotion, can you win? Usually yes — but not always! Against a centre pawn (d or e file), the Queen wins easily. Against a Rook pawn (a or h file) or Bishop pawn (c or f file) on the 7th rank, the defending King hides in front of the pawn and it can be a draw. The technique: check with the Queen to force the King in front of the pawn, then advance your own King.","tip":"This endgame is tricky — practice it against a computer to get the feel for the King-march technique."}',
 13, 99, 4),

-- ── THREAT AWARENESS ──────────────────────────────────────────────────────
('The One-Move Threat Habit',
 'threat_awareness', 'threat_awareness', 1,
 '{"type":"text","body":"Before every move, stop and ask one question: what is my opponent threatening right now? If they are threatening to win a piece or checkmate you, you MUST deal with it first — before you continue your own plan. Most chess mistakes happen because players forget to look at what the opponent is doing. Build this habit and your game will improve immediately.","tip":"Say it out loud if you have to: ''My opponent just played X. Why? What do they want?''"}',
 6, 99, 2),

('Candidate Moves — Look Before You Leap',
 'threat_awareness', 'threat_awareness', 2,
 '{"type":"text","body":"Before you decide on a move, list your candidate moves — the two or three best options you are considering. For each one, ask: what does my opponent do next? A move that looks great for you can be terrible if the opponent has a strong reply. Finding your opponent''s best response is the key to avoiding blunders.","tip":"For every candidate move you consider, try to find your opponent''s best reply. If you cannot refute their reply, be cautious."}',
 10, 99, 3),

-- ── TACTICS COMBO ─────────────────────────────────────────────────────────
('What is a Combination?',
 'tactics_combo', 'tactics_combo', 1,
 '{"type":"text","body":"A combination is a sequence of forcing moves — usually including checks, captures, and threats — that leads to a concrete benefit: winning material, achieving checkmate, or reaching a better position. Combinations always start with a forcing move that the opponent must respond to. Look for checks and captures first when searching for combinations.","tip":"Before calculating a combination, make sure the final result is actually good — it is easy to calculate many moves ahead and miss that you have lost something at the end."}',
 8, 99, 1),

('Removing the Defender',
 'tactics_combo', 'tactics_combo', 2,
 '{"type":"text","body":"Sometimes a piece is protected and cannot be captured — but what if you capture or deflect the DEFENDER first? Removing the defender is a key tactical idea: you attack the piece that is doing the defending, forcing it to move or be taken. Once the defender is gone, the originally protected piece falls for free. Look for overloaded pieces — pieces doing two defensive jobs at once are easy to deflect.","tip":"Ask: what is protecting that piece? Can I attack the protector, capture it, or lure it away?"}',
 11, 99, 2),

('Deflection and Decoy',
 'tactics_combo', 'tactics_combo', 3,
 '{"type":"text","body":"Deflection: forcing an enemy piece AWAY from an important square or duty. Decoy: luring an enemy piece TO a square where it can be caught or where it gets in the way. Both tactics often involve sacrificing material to achieve a bigger goal. The classic decoy is a Queen sacrifice that forces the King to a mated square.","tip":"Sacrifices that deflect or decoy are the most spectacular moves in chess. They work because your opponent HAS to take the bait — then you win something bigger."}',
 13, 99, 3);

-- ── BOARD-DEMO LESSONS (have fen + steps for interactive demo) ─────────────

INSERT INTO lessons (title, theme, skill_name, difficulty, content, min_age, max_age, order_index) VALUES

('Fork Attack: Watch the Knight',
 'forks', 'forks', 2,
 '{"type":"board","body":"A fork is when one piece attacks two enemy pieces at the same time. The Knight is the best forking piece because it can jump over others. Watch how it attacks both a Rook and the King in one move!","fen":"r3k2r/ppp2ppp/2n5/3Np3/4P3/8/PPP2PPP/R3K2R w KQkq - 0 1","steps":[{"move":"d5f6","san":"Nf6+","explanation":"The Knight jumps to f6, giving check to the King AND attacking the Rook on h8 at the same time!","highlights":["f6","e8","h8"],"arrows":[["f6","e8","#dc2626"],["f6","h8","#16a34a"]]},{"explanation":"Black MUST deal with the check first — the King has to move. But wherever it goes, the Knight takes the Rook on h8 next move.","highlights":["e8","h8"],"arrows":[["e8","f8","#6b7280"],["f6","h8","#16a34a"]]},{"move":"e8f8","san":"Kf8","explanation":"King moves to f8 escaping check. Now it is White''s turn — the Rook on h8 is still attacked!","highlights":["f8","h8"],"arrows":[["f6","h8","#16a34a"]]},{"move":"f6h8","san":"Nxh8","explanation":"Knight takes the Rook! White wins a Rook for free. That is the power of a fork — the opponent cannot save both targets at once.","highlights":["h8"],"arrows":[]}],"tip":"Always look for Knight moves that attack two pieces — especially the King plus something else!"}',
 8, 99, 5),

('Hanging Pieces: Check Every Piece',
 'hanging_pieces', 'hanging_pieces', 1,
 '{"type":"board","body":"A hanging piece has no defender. Your opponent can take it completely for free! Before every move, ask yourself: ''Is every one of my pieces protected?'' Watch what happens when a piece is left alone.","fen":"r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/3B1N2/PPPP1PPP/RNBQK2R b KQkq - 3 4","steps":[{"explanation":"Look at this position. White has just played Bd3. Let''s check if ALL of White''s pieces are protected. The Bishop on d3 — is it defended?","highlights":["d3"],"arrows":[]},{"explanation":"The Bishop on d3 is attacked by the Knight on f6 (diagonally via e4... wait, that is not a diagonal). Actually, look more carefully — the Bishop on d3 is NOT attacked right now. But what if Black plays Bg4 next? Now the Knight on f3 is pinned!","highlights":["f3","d1","g4"],"arrows":[["g4","f3","#dc2626"],["f3","d1","#6b7280"]]},{"move":"f6e4","san":"Nxe4","explanation":"Instead, Black spots that the e4 pawn is hanging — it is only defended by the Bishop on d3. Black takes the pawn! Is this safe? The Bishop CAN recapture, so it is actually an equal exchange here. Always count defenders vs attackers!","highlights":["e4"],"arrows":[["f6","e4","#16a34a"]]}],"tip":"Count attackers and defenders before you capture — if you have more attackers than defenders, you win material!"}',
 6, 99, 4),

('King Safety: Castle Quickly',
 'king_safety', 'king_safety', 1,
 '{"type":"board","body":"Your King is safest tucked in the corner behind a wall of pawns. Castling moves the King to safety in one special move. See how vulnerable a King in the center is — and how castling fixes everything!","fen":"r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 2 5","steps":[{"explanation":"White''s King is on e1 — right in the center. The position is open, pieces are developed, and it is getting dangerous for the King. What should White do?","highlights":["e1"],"arrows":[]},{"move":"e1g1","san":"O-O","explanation":"White castles kingside! The King moves to g1, safely tucked behind the pawns on f2, g2, and h2. The Rook swings to f1, now actively protecting the King and controlling the center.","highlights":["g1","f1","g2","h2"],"arrows":[["e1","g1","#16a34a"],["h1","f1","#16a34a"]]},{"explanation":"Now compare the two Kings. White''s King is safe on g1 with pawns in front. Black''s King is still on e8 in the center — much more exposed. In chess, the side that castles first usually gets a safer position!","highlights":["g1","e8"],"arrows":[["e8","g8","#6b7280"]]}],"tip":"If you can castle, you almost always should — within the first 10 moves, make castling a habit!"}',
 7, 99, 2),

('Checkmate Patterns: Back Rank Mate',
 'checkmate_patterns', 'checkmate_patterns', 2,
 '{"type":"board","body":"The back-rank checkmate is one of the most common ways to win games! It happens when the King is trapped behind its own pawns with no escape. A Rook or Queen slips in on the last rank — checkmate! Watch how it works.","fen":"6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1","steps":[{"explanation":"White''s Rook is very powerful on the d-file. Black''s King is hiding on g8 behind three pawns — h7, g7, f7. Those pawns are protecting the King... or are they trapping it?","highlights":["g8","f7","g7","h7"],"arrows":[]},{"move":"d1d8","san":"Rd8+","explanation":"Rook goes to d8 — CHECK! The King is in check from the Rook on d8. Can the King escape? Let''s check every square...","highlights":["d8","g8"],"arrows":[["d1","d8","#dc2626"]]},{"explanation":"The King cannot go to f8 (attacked by the Rook), h8 (attacked by the Rook on the 8th rank), f7/g7/h7 (own pawns block the way). The King is TRAPPED! That is checkmate — the back-rank mate!","highlights":["f8","h8","f7","g7","h7"],"arrows":[["d8","f8","#dc2626"],["d8","h8","#dc2626"]]}],"tip":"Always leave your King an escape square! After castling, push one pawn one square (g3 or h3) to give the King air."}',
 7, 99, 2),

('Development: Get Your Pieces Out',
 'development', 'development', 1,
 '{"type":"board","body":"In the opening, your pieces are stuck at home and cannot fight! Every move should bring a NEW piece into the game. Knights and Bishops first, then castle. Pieces that are developed early control the board and create threats.","fen":"rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1","steps":[{"explanation":"White has played 1.e4 — taking central space and opening lines for the Queen and Bishop. Now it is Black''s turn. What is the best developing move?","highlights":["e4"],"arrows":[]},{"move":"e7e5","san":"e5","explanation":"1...e5! Black also takes central space. Both sides now have pawns in the center and open lines for their pieces. Always start with a central pawn move if you can!","highlights":["e5","e4"],"arrows":[]},{"move":"g1f3","san":"Nf3","explanation":"2.Nf3 — White develops a Knight to a great central square. From f3, the Knight attacks e5 and controls d4. It is also pointing toward the Black King. Perfect development!","highlights":["f3","e5","d4"],"arrows":[["f3","e5","#16a34a"],["f3","d4","#16a34a"]]},{"move":"b8c6","san":"Nc6","explanation":"2...Nc6 — Black brings out the other Knight, defending the e5 pawn and developing a piece. Both Knights are now active. Next: develop the Bishops and castle!","highlights":["c6","e5"],"arrows":[["c6","e5","#16a34a"]]}],"tip":"Follow the rule: develop a new piece every move in the opening. Never move the same piece twice unless you absolutely have to!"}',
 6, 99, 5);
