document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a elementos del DOM ---
    // (Sin cambios)
    const coverSection = document.getElementById('cover-section');
    const playButton = document.getElementById('play-button');
    const challengeSection = document.getElementById('challenge-section');
    const player = document.getElementById('player');
    const scoreDisplay = document.getElementById('score-display');
    const modal = document.getElementById('modal');
    const retryButton = document.getElementById('retry-button');
    const finalScoreDisplay = document.getElementById('final-score');

    // --- Estado del Juego ---
    // (Sin cambios)
    let gameActive = false;
    let score = 0;
    let playerPosX = 0;
    let playerPosY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let playerStartDragX = 0;
    let playerStartDragY = 0;
    let emojis = [];
    let emojiSpeedMultiplier = 1.0;
    let intervals = { score: null, spawn: null, speed: null };
    let animationFrameId = null;
    let gameJustStarted = false;

    // --- 1. Lógica de Inicio (Portada -> Reto) ---
    // (Sin cambios)
    function startGameTransition() { /* ... código anterior ... */ }
    playButton.addEventListener('click', startGameTransition);
    // ... scroll listener ...

    // --- 2. Lógica de Inicialización y Reinicio del Juego ---

    function initializeGame() {
        console.log(">>> initializeGame: START"); // LOG INICIO
        gameActive = false; // Asegurar que esté inactivo antes de empezar

        score = 0;
        emojiSpeedMultiplier = 1.0;
        emojis.forEach(emojiObj => emojiObj.element.remove());
        emojis = [];

        resetPlayerPosition(); // Calcular y poner en el centro
        updateScoreDisplay();
        clearAllIntervals();

        console.log(">>> initializeGame: Setting intervals..."); // LOG INTERVALOS
        intervals.score = setInterval(updateScore, 1000);
        intervals.spawn = setInterval(spawnEmoji, 5000);
        intervals.speed = setInterval(increaseSpeed, 20000);
        console.log(">>> initializeGame: Intervals IDs:", intervals); // LOG IDs

        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        console.log(">>> initializeGame: Requesting first gameLoop frame."); // LOG GAMELOOP
        animationFrameId = requestAnimationFrame(gameLoop);

        // MUY IMPORTANTE: Activar el juego DESPUÉS de configurar todo
        gameActive = true;
        console.log(">>> initializeGame: FINISHED - gameActive set to true"); // LOG FIN
    }

    // ***** VERSIÓN SIMPLIFICADA DE resetPlayerPosition *****
    function resetPlayerPosition() {
        console.log(">>> resetPlayerPosition: Requesting frame..."); // LOG
        // Calcular y establecer en el siguiente frame para dar tiempo a renderizar
        requestAnimationFrame(() => {
            console.log(">>> resetPlayerPosition: rAF callback executing..."); // LOG
            try {
                // Asegurarse de que no haya transform residual
                player.style.transform = '';

                const containerWidth = challengeSection.offsetWidth;
                const containerHeight = challengeSection.offsetHeight;
                const playerWidth = player.offsetWidth;
                const playerHeight = player.offsetHeight;

                console.log(`>>> resetPlayerPosition: Dimensions C(${containerWidth}x${containerHeight}), P(${playerWidth}x${playerHeight})`); // LOG DIMENSIONES

                // Calcular centro sólo si las dimensiones son válidas
                if (containerWidth > 0 && containerHeight > 0 && playerWidth > 0 && playerHeight > 0) {
                    playerPosX = containerWidth / 2 - playerWidth / 2;
                    playerPosY = containerHeight / 2 - playerHeight / 2;

                    // Asegurar que no sea negativo
                    playerPosX = Math.max(0, playerPosX);
                    playerPosY = Math.max(0, playerPosY);

                    player.style.left = `${playerPosX}px`;
                    player.style.top = `${playerPosY}px`;
                    console.log(`>>> resetPlayerPosition: Position calculated and set to (${playerPosX.toFixed(0)}, ${playerPosY.toFixed(0)})`); // LOG POSICIÓN

                } else {
                    console.warn(">>> resetPlayerPosition: Invalid dimensions detected! Setting fallback position."); // LOG WARNING
                    // Fallback si las dimensiones son 0
                    playerPosX = 50;
                    playerPosY = 50;
                    player.style.left = `${playerPosX}px`;
                    player.style.top = `${playerPosY}px`;
                }
            } catch (error) {
                console.error(">>> ERROR in resetPlayerPosition rAF:", error); // LOG ERROR
                // Fallback absoluto si hay error
                player.style.left = '10px';
                player.style.top = '10px';
            }
        });
    }
    // ***** FIN resetPlayerPosition SIMPLIFICADO *****

    function restartGame() {
        console.log(">>> restartGame: Restarting..."); // LOG
        modal.classList.add('hidden');
        initializeGame();
    }
    retryButton.addEventListener('click', restartGame);


    // --- 3. Lógica del Jugador (Arrastrar en toda la pantalla) ---
    function startDrag(event) {
        console.log(`>>> startDrag: Event ${event.type}`); // LOG EVENTO
        if (!gameActive) {
            console.log(">>> startDrag: Ignored (game not active)"); // LOG IGNORADO
            return;
        }
        isDragging = true;
        // ... resto del código de startDrag ...
        console.log(`>>> startDrag: Dragging set to true. Start: ${dragStartX.toFixed(0)},${dragStartY.toFixed(0)}`); // LOG INICIO DRAG
        event.preventDefault(); // Asegurar preventDefault
    }

    function drag(event) {
        // console.log(`>>> drag: Event ${event.type}`); // Demasiado ruidoso usualmente
        if (!isDragging || !gameActive) return;
        // ... resto del código de drag ...
        player.style.left = `${playerPosX}px`;
        player.style.top = `${playerPosY}px`;
        // console.log(`>>> drag: Moved to ${playerPosX.toFixed(0)},${playerPosY.toFixed(0)}`); // Demasiado ruidoso
        event.preventDefault(); // Asegurar preventDefault
    }

    function endDrag(event) {
        // Prevenir error si no estaba arrastrando
        if (!isDragging) return;
        console.log(`>>> endDrag: Event ${event.type}`); // LOG EVENTO
        isDragging = false;
        player.style.cursor = 'grab';
        console.log(">>> endDrag: Dragging set to false."); // LOG FIN DRAG
    }

    // Listeners (sin cambios)
    challengeSection.addEventListener('mousedown', startDrag);
    challengeSection.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    challengeSection.addEventListener('touchstart', startDrag, { passive: false });
    challengeSection.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);

    // --- 4. Lógica de Emojis ---
    // (Sin cambios aquí)
    function spawnEmoji() { /* ... */ }
    function moveAndBounceEmojis() { /* ... */ }
    function increaseSpeed() { /* ... */ }

    // --- 5. Lógica de Puntaje y Colisiones ---
    function updateScore() {
        // console.log(">>> updateScore called"); // Demasiado ruidoso
        if (!gameActive) return;
        score++;
        updateScoreDisplay();
    }
    // (Resto sin cambios)
    function updateScoreDisplay() { /* ... */ }
    function checkCollisions() { /* ... */ }

    // --- 6. Bucle Principal del Juego y Game Over ---
    function gameLoop() {
        // console.log(">>> gameLoop running"); // Demasiado ruidoso
        if (!gameActive) {
            console.log(">>> gameLoop: Stopping (game not active)."); // LOG DETENIDO
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animationFrameId = null; // Limpiar ID
            return;
        }

        try {
            moveAndBounceEmojis();
            checkCollisions();
        } catch (error) {
            console.error(">>> ERROR in gameLoop execution:", error); // LOG ERROR
            gameOver(); // Detener juego si hay error
            return; // Salir del bucle
        }

        // Solicitar siguiente frame SOLO si el juego sigue activo
        if (gameActive) {
            animationFrameId = requestAnimationFrame(gameLoop);
        } else {
             console.log(">>> gameLoop: Not requesting next frame as game became inactive."); // LOG NO SIGUIENTE FRAME
             animationFrameId = null; // Limpiar ID
        }
    }

    function gameOver() {
        // Prevenir llamadas múltiples
        if (!gameActive) return;
        console.log(">>> gameOver: GAME OVER initiated."); // LOG GAME OVER
        gameActive = false; // Marcar como inactivo INMEDIATAMENTE
        isDragging = false;

        // Detener bucle y timers
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            console.log(">>> gameOver: Animation frame cancelled."); // LOG FRAME CANCELADO
        }
        clearAllIntervals();
        console.log(">>> gameOver: Intervals cleared."); // LOG INTERVALOS LIMPIOS

        // Mostrar modal
        finalScoreDisplay.textContent = `Puntaje: ${score}`;
        modal.classList.remove('hidden');
        console.log(">>> gameOver: Modal displayed."); // LOG MODAL
    }

    function clearAllIntervals() {
        clearInterval(intervals.score);
        clearInterval(intervals.spawn);
        clearInterval(intervals.speed);
        intervals.score = null; // Limpiar IDs
        intervals.spawn = null;
        intervals.speed = null;
    }

}); // Fin del DOMContentLoaded
