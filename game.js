// ***** USA ESTE CÓDIGO game.js *****
document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias y Estado (Sin cambios) ---
    console.log(">>> DOMContentLoaded: Script start.");
    const coverSection = document.getElementById('cover-section');
    const playButton = document.getElementById('play-button');
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

    // --- 1. Lógica de Inicio ---
    function startGameTransition() {
        console.log(">>> startGameTransition: Called."); // LOG
        if (gameActive || gameJustStarted) {
             console.log(">>> startGameTransition: Blocked (gameActive or gameJustStarted)");
             return;
        }
        console.log(">>> startGameTransition: Initiating transition...");
        gameJustStarted = true;

        coverSection.classList.add('hidden');
        challengeSection.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Llamar a initializeGame DESPUÉS de mostrar la sección
        console.log(">>> startGameTransition: Calling initializeGame..."); // LOG
        initializeGame();
        console.log(">>> startGameTransition: initializeGame returned."); // LOG

        setTimeout(() => {
             console.log(">>> startGameTransition: Resetting gameJustStarted flag.");
             gameJustStarted = false;
        }, 100);
    }

    // Event listener para el botón "Jugar" - RESTAURADO
    if (playButton) {
        playButton.addEventListener('click', startGameTransition); // Usa la función real
        console.log(">>> startGameTransition listener ATTACHED to playButton.");
    } else {
        console.error(">>> FATAL ERROR: playButton element NOT FOUND!");
    }

    // Scroll Listener (Sigue comentado)
    console.log(">>> Scroll listener remains disabled.");

    // --- 2. Lógica de Inicialización y Reinicio ---
    function initializeGame() {
        console.log(">>> initializeGame: START");
        gameActive = false; // Asegurar inactivo antes de empezar

        score = 0;
        emojiSpeedMultiplier = 1.0;
        // Limpiar emojis anteriores
        emojis.forEach(emojiObj => {
            if (emojiObj && emojiObj.element && emojiObj.element.parentNode) {
                emojiObj.element.parentNode.removeChild(emojiObj.element);
            }
        });
        emojis = [];
        console.log(">>> initializeGame: State reset (score, speed, emojis).");

        updateScoreDisplay(); // Actualizar a 0
        clearAllIntervals();
        console.log(">>> initializeGame: Intervals cleared.");

        // Posicionar jugador
        console.log(">>> initializeGame: Calling resetPlayerPosition..."); // LOG ANTES
        resetPlayerPosition();
        console.log(">>> initializeGame: resetPlayerPosition returned."); // LOG DESPUÉS

        // Iniciar intervalos
        console.log(">>> initializeGame: Setting intervals...");
        intervals.score = setInterval(updateScore, 1000);
        intervals.spawn = setInterval(spawnEmoji, 5000);
        intervals.speed = setInterval(increaseSpeed, 20000);
        console.log(">>> initializeGame: Intervals IDs:", intervals);

        // Iniciar bucle de juego
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            console.log(">>> initializeGame: Previous animation frame cancelled.");
        }
        console.log(">>> initializeGame: Requesting first gameLoop frame..."); // LOG ANTES
        animationFrameId = requestAnimationFrame(gameLoop);
        console.log(">>> initializeGame: First gameLoop frame requested (ID:", animationFrameId, ")"); // LOG DESPUÉS

        // Activar juego AL FINAL
        gameActive = true;
        console.log(">>> initializeGame: FINISHED - gameActive set to true."); // LOG FIN
    }

    // RESET PLAYER POSITION (Calculado en rAF)
    function resetPlayerPosition() {
        console.log(">>> resetPlayerPosition: Requesting frame...");
        requestAnimationFrame(() => {
            console.log(">>> resetPlayerPosition: rAF callback executing...");
            try {
                player.style.transform = '';

                const containerWidth = challengeSection.offsetWidth;
                const containerHeight = challengeSection.offsetHeight;
                const playerWidth = player.offsetWidth;
                const playerHeight = player.offsetHeight;

                console.log(`>>> resetPlayerPosition: Dimensions C(${containerWidth}x${containerHeight}), P(${playerWidth}x${playerHeight})`);

                if (containerWidth > 0 && containerHeight > 0 && playerWidth > 0 && playerHeight > 0) {
                    playerPosX = containerWidth / 2 - playerWidth / 2;
                    playerPosY = containerHeight / 2 - playerHeight / 2;
                    playerPosX = Math.max(0, playerPosX);
                    playerPosY = Math.max(0, playerPosY);

                    player.style.left = `${playerPosX}px`;
                    player.style.top = `${playerPosY}px`;
                    console.log(`>>> resetPlayerPosition: Position calculated and set to (${playerPosX.toFixed(0)}, ${playerPosY.toFixed(0)})`);
                } else {
                    console.warn(">>> resetPlayerPosition: Invalid dimensions detected! Setting fallback.");
                    playerPosX = 50; playerPosY = 50;
                    player.style.left = `${playerPosX}px`; player.style.top = `${playerPosY}px`;
                }
            } catch (error) {
                console.error(">>> ERROR in resetPlayerPosition rAF:", error);
                player.style.left = '10px'; player.style.top = '10px';
            }
        });
    }

    function restartGame() { console.log(">>> restartGame called"); initializeGame(); } // Simplificado para log
     if (retryButton) {
        retryButton.addEventListener('click', restartGame);
     } else {
         console.error("Retry button not found");
     }


    // --- 3. Lógica del Jugador (Arrastrar) ---
     function startDrag(event) {
        console.log(`>>> startDrag: Event ${event.type}`); // LOG EVENTO
        if (!gameActive) {
            console.log(">>> startDrag: Ignored (game not active)"); // LOG IGNORADO
            return;
        }
        isDragging = true;
        player.style.cursor = 'grabbing';
        const touch = event.type === 'touchstart' ? event.touches[0] : event;
        dragStartX = touch.clientX;
        dragStartY = touch.clientY;
        playerStartDragX = player.offsetLeft;
        playerStartDragY = player.offsetTop;
        console.log(`>>> startDrag: Dragging set to true. Start: ${dragStartX.toFixed(0)},${dragStartY.toFixed(0)}`); // LOG INICIO DRAG
        event.preventDefault(); // Asegurar preventDefault
    }

    function drag(event) {
        // console.log(`>>> drag: Event ${event.type}`); // Demasiado ruidoso usualmente
        if (!isDragging || !gameActive) return;
        const touch = event.type === 'touchmove' ? event.touches[0] : event;
        const deltaX = touch.clientX - dragStartX;
        const deltaY = touch.clientY - dragStartY;
        let newX = playerStartDragX + deltaX;
        let newY = playerStartDragY + deltaY;
        const maxX = challengeSection.offsetWidth - player.offsetWidth;
        const maxY = challengeSection.offsetHeight - player.offsetHeight;
        playerPosX = Math.max(0, Math.min(newX, maxX));
        playerPosY = Math.max(0, Math.min(newY, maxY));
        player.style.left = `${playerPosX}px`;
        player.style.top = `${playerPosY}px`;
        event.preventDefault(); // Asegurar preventDefault
    }

    function endDrag(event) {
        if (!isDragging) return; // Prevenir error si no estaba arrastrando
        console.log(`>>> endDrag: Event ${event.type}`); // LOG EVENTO
        isDragging = false;
        player.style.cursor = 'grab';
        console.log(">>> endDrag: Dragging set to false."); // LOG FIN DRAG
    }
    // Listeners de drag
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


    // --- 4. Lógica de Emojis ---
    function spawnEmoji() { /* ... código anterior ... */ }
    function moveAndBounceEmojis() { /* ... código anterior ... */ }
    function increaseSpeed() { /* ... código anterior ... */ }


    // --- 5. Lógica de Puntaje y Colisiones ---
    function updateScore() {
        // console.log(">>> updateScore called"); // Demasiado ruidoso
        if (!gameActive) return;
        score++;
        updateScoreDisplay();
    }
    function updateScoreDisplay() { scoreDisplay.textContent = `Puntaje: ${score}`; }
    function checkCollisions() { /* ... código anterior ... */ }


    // --- 6. Bucle Principal del Juego y Game Over ---
    function gameLoop() {
        console.log(">>> gameLoop: Frame executing. gameActive:", gameActive); // LOG INICIO BUCLE
        if (!gameActive) {
            console.log(">>> gameLoop: Stopping (game not active).");
            animationFrameId = null;
            return;
        }

        try {
            moveAndBounceEmojis();
            checkCollisions();
        } catch (error) {
            console.error(">>> ERROR in gameLoop execution:", error);
            gameOver();
            return;
        }

        if (gameActive) {
            animationFrameId = requestAnimationFrame(gameLoop);
        } else {
             console.log(">>> gameLoop: Not requesting next frame as game became inactive.");
             animationFrameId = null;
        }
    }

    function gameOver() {
        if (!gameActive) return;
        console.log(">>> gameOver: GAME OVER initiated.");
        gameActive = false;
        isDragging = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            console.log(">>> gameOver: Animation frame cancelled.");
        }
        clearAllIntervals();
        console.log(">>> gameOver: Intervals cleared.");
        finalScoreDisplay.textContent = `Puntaje: ${score}`;
        modal.classList.remove('hidden');
        console.log(">>> gameOver: Modal displayed.");
    }

    function clearAllIntervals() {
        clearInterval(intervals.score);
        clearInterval(intervals.spawn);
        clearInterval(intervals.speed);
        intervals.score = null; intervals.spawn = null; intervals.speed = null;
    }

    console.log(">>> DOMContentLoaded: Script end."); // DEBUG

}); // Fin del DOMContentLoaded
