document.addEventListener('DOMContentLoaded', () => {
    console.log("--- DEBUG: DOMContentLoaded Started ---"); // Log inicial

    // --- Intentar obtener el botón ---
    const playButton = document.getElementById('play-button');

    // --- Verificar si se encontró el botón ---
    if (playButton) {
        console.log("--- DEBUG: Botón 'Jugar' ENCONTRADO en el DOM.");

        // --- Añadir un listener de clic MUY simple ---
        playButton.addEventListener('click', () => {
            console.log("--- DEBUG: Click en 'Jugar' detectado! ---");
            alert("¡El botón 'Jugar' responde!"); // Feedback visual inmediato
            // Por ahora, NO llamamos a startGameTransition() para aislar el problema
            // startGameTransition();
        });
        console.log("--- DEBUG: Listener de prueba añadido al botón 'Jugar'.");

    } else {
        // Si el botón no se encuentra, es un problema grave de HTML o ID
        console.error("--- FATAL ERROR: El botón 'Jugar' (ID: play-button) NO fue encontrado! ---");
        alert("Error Crítico: No se encuentra el botón 'Jugar'. Verifica index.html.");
    }

    // --- DEFINICIONES DE FUNCIONES (para que existan, pero no se usan directamente aquí) ---
    // Mantener las definiciones evita errores si alguna otra parte (que no sea el click inicial) las necesitara.
    const coverSection = document.getElementById('cover-section');
    const challengeSection = document.getElementById('challenge-section');
    const player = document.getElementById('player');
    const scoreDisplay = document.getElementById('score-display');
    const modal = document.getElementById('modal');
    const retryButton = document.getElementById('retry-button');
    const finalScoreDisplay = document.getElementById('final-score');
    let gameActive = false;
    let score = 0;
    let playerPosX = 0, playerPosY = 0;
    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let playerStartDragX = 0, playerStartDragY = 0;
    let emojis = [];
    let emojiSpeedMultiplier = 1.0;
    let intervals = { score: null, spawn: null, speed: null };
    let animationFrameId = null;
    let gameJustStarted = false;

    function startGameTransition() { console.log("startGameTransition defined"); }
    function initializeGame() { console.log("initializeGame defined"); }
    function resetPlayerPosition() { console.log("resetPlayerPosition defined"); }
    function restartGame() { console.log("restartGame defined"); }
    function startDrag(event) { console.log("startDrag defined"); }
    function drag(event) { console.log("drag defined"); }
    function endDrag(event) { console.log("endDrag defined"); }
    function spawnEmoji() { console.log("spawnEmoji defined"); }
    function moveAndBounceEmojis() { console.log("moveAndBounceEmojis defined"); }
    function increaseSpeed() { console.log("increaseSpeed defined"); }
    function updateScore() { console.log("updateScore defined"); }
    function updateScoreDisplay() { console.log("updateScoreDisplay defined"); }
    function checkCollisions() { console.log("checkCollisions defined"); }
    function gameLoop() { console.log("gameLoop defined"); }
    function gameOver() { console.log("gameOver defined"); }
    function clearAllIntervals() { console.log("clearAllIntervals defined"); }

    // Listener del botón de reintentar (lo mantenemos por si acaso)
     if (retryButton) {
        retryButton.addEventListener('click', restartGame);
     } else {
         console.error("Retry button not found");
     }
    // Listeners de drag (definidos pero no activos hasta que el juego empiece)
    if(challengeSection) {
        challengeSection.addEventListener('mousedown', startDrag);
        challengeSection.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        challengeSection.addEventListener('touchstart', startDrag, { passive: false });
        challengeSection.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', endDrag);
    } else {
        console.error("Challenge section not found for drag listeners");
    }


    console.log("--- DEBUG: DOMContentLoaded Finished ---"); // Log final del script inicial
});
