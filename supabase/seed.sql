-- ============================================================
-- Seed: Puzzles
-- ============================================================

INSERT INTO puzzles (fen, solution_moves, theme, difficulty, rating, hint, explanation, min_age) VALUES

-- HANGING PIECE puzzles
('r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
 ARRAY['d8f6'], 'hanging_pieces', 1, 400,
 'Look for a piece that is not protected!',
 'The white Bishop on c4 is not defended. Take it with your Queen for free!',
 6),

('rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3',
 ARRAY['c4f7'], 'hanging_pieces', 2, 500,
 'Is there a piece your opponent left undefended?',
 'The f7 pawn is only protected by the King. Capturing it wins material!',
 7),

-- FORK puzzles
('r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4',
 ARRAY['f3e5'], 'forks', 2, 600,
 'Can one piece attack two pieces at the same time?',
 'Knight to e5 attacks the Bishop on c6 and threatens the f7 pawn — a fork!',
 7),

('5rk1/pp3ppp/2p5/8/3Pn3/2P2N2/PP3PPP/R3R1K1 b - - 0 1',
 ARRAY['e4c3'], 'forks', 3, 800,
 'Your Knight can attack two pieces at once. Where?',
 'Knight takes c3 forks the Rook on a1 and the Rook on e1. White loses material!',
 9),

-- CHECKMATE PATTERNS
('r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 b kq - 0 1',
 ARRAY['f6g4', 'f2f3', 'g4h2'], 'checkmate_patterns', 3, 900,
 'Find the sequence that leads to checkmate!',
 'Knight g4 attacks f2 and h2. After f3, Knight h2 is checkmate!',
 10),

('6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
 ARRAY['e1e8'], 'checkmate_patterns', 1, 300,
 'Your Rook can deliver checkmate in one move!',
 'Rook to e8 — the King has no escape squares. Checkmate!',
 6),

-- KING SAFETY
('r3k2r/ppp2ppp/2n5/3qp3/1b1P4/2N1BN2/PPP2PPP/R2QK2R w KQkq - 0 1',
 ARRAY['e1g1'], 'king_safety', 2, 700,
 'Your King is not safe in the center. What should you do?',
 'Castle kingside! Moving the King to safety behind pawns is the right idea here.',
 9),

-- DEVELOPMENT
('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
 ARRAY['e7e5'], 'development', 1, 300,
 'Control the center with a pawn!',
 'Playing e5 is the best reply — it claims central space and opens lines for your pieces.',
 6),

-- THREAT AWARENESS
('r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 4',
 ARRAY['c3d5'], 'threat_awareness', 3, 800,
 'What is your opponent threatening? Can you counter-attack?',
 'Black threatens Bxc3 ruining your structure. Knight d5 attacks f6 and c7 — a strong counter!',
 10);

-- ============================================================
-- Seed: Lessons
-- ============================================================

INSERT INTO lessons (title, theme, skill_name, difficulty, content, min_age, max_age, order_index) VALUES

('Do Not Leave Pieces Alone!',
 'hanging_pieces', 'hanging_pieces', 1,
 '{"type":"text","body":"Before you move, look at ALL your pieces. Is each one protected by a friend? If not, your opponent can take it for FREE! Always check: is this piece safe?","tip":"After you make your move, check if your opponent can take anything for free."}',
 6, 8, 1),

('What is a Hanging Piece?',
 'hanging_pieces', 'hanging_pieces', 1,
 '{"type":"text","body":"A hanging piece is a piece that has no defender. If your opponent can take it without losing anything, it is hanging. Always protect your pieces or move them to safety.","tip":"Scan the whole board before every move. Ask: can they take anything of mine?"}',
 9, 12, 2),

('The Knight Fork',
 'forks', 'forks', 2,
 '{"type":"text","body":"A fork is when one piece attacks two or more enemy pieces at the same time. Knights are great at forking because they jump over pieces! Look for squares where your Knight can attack two valuable pieces at once.","tip":"Knights fork best from the center of the board."}',
 9, 12, 1),

('Fork Attack Strategy',
 'forks', 'forks', 2,
 '{"type":"text","body":"When you find a fork opportunity, calculate carefully. Make sure the forking square is safe to land on. If your Knight can reach a square attacking the King and a Rook — that is a royal fork!","tip":"Always check if the forking square is defended before jumping there."}',
 13, 99, 2),

('Checkmate in One',
 'checkmate_patterns', 'checkmate_patterns', 1,
 '{"type":"text","body":"Checkmate means the King is in check and cannot escape. Look for moves that check the King AND cover all escape squares. Rooks and Queens on the back rank are the most common checkmate patterns for beginners.","tip":"When you see check, look if the King can move, block, or capture the checker."}',
 6, 9, 1),

('Castle to Keep Your King Safe',
 'king_safety', 'king_safety', 1,
 '{"type":"text","body":"Your King is safest behind pawns in the corner after castling. Castle early — usually in the first 10 moves. A King stuck in the middle of the board is easy to attack!","tip":"If you can castle, you usually should — especially if the center is open."}',
 9, 12, 1),

('Bring Out Your Pieces First',
 'development', 'development', 1,
 '{"type":"text","body":"In the opening, your goal is to develop your pieces — move your Knights and Bishops out before doing anything else. Pieces on their starting squares cannot help you fight! Aim to develop all your pieces before attacking.","tip":"Knights before Bishops. Do not move the same piece twice unless you have to."}',
 6, 9, 1),

('Watch What Your Opponent is Doing',
 'threat_awareness', 'threat_awareness', 2,
 '{"type":"text","body":"Before every move, ask yourself: What does my opponent want to do next? If they are threatening to win a piece or checkmate you — deal with it first! Good chess players always think about both sides of the board.","tip":"Before you plan your own move, look at your opponent''s last move and ask why they played it."}',
 9, 12, 1);
