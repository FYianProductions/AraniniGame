document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a elementos del DOM ---
    const coverSection = document.getElementById('cover-section');
    const playButton = document.getElementById('play-button');
    const challengeSection = document.getElementById('challenge-section');
    const player = document.getElementById('player');
    const scoreDisplay = document.getElementById('score-display');
    const modal = document.getElementById('modal');
    const retryButton = document.getElementById('retry-button');
    const finalScoreDisplay = document.getElementById('final-score');

    // --- Estado del Juego ---
    // (Sin cambios aquí)
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
    // (Sin cambios aquí)
    function startGameTransition() {
        if (gameActive || gameJustStarted) return;
        console.log("Iniciando transición al juego...");
        gameJustStarted = true;
        coverSection.classList.add('hidden');
        challengeSection.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        initializeGame();
        setTimeout(() => { gameJustStarted = false; }, 100);
    }
    playButton.addEventListener('click', startGameTransition);
    let scrollTriggered = false;
    function checkScrollToStart() {
        if (!gameActive && !scrollTriggered && window.scrollY > 100) {
            scrollTriggered = true;
            startGameTransition();
            window.removeEventListener('scroll', checkScrollToStart);
        }
    }
    window.addEventListener('scroll', checkScrollToStart);

    // --- 2. Lógica de Inicialización y Reinicio del Juego ---
    // (Sin cambios aquí, excepto la llamada a la nueva resetPlayerPosition)
    function initializeGame() {
        console.log("Inicializando juego...");
        gameActive = true;
        score = 0;
        emojiSpeedMultiplier = 1.0;
        emojis.forEach(emojiObj => emojiObj.element.remove());
        emojis = [];

        resetPlayerPosition(); // <<< LLAMA A LA FUNCIÓN MODIFICADA ABAJO
        updateScoreDisplay();
        clearAllIntervals();

        intervals.score = setInterval(updateScore, 1000);
        intervals.spawn = setInterval(spawnEmoji, 5000);
        intervals.speed = setInterval(increaseSpeed, 20000);

        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(gameLoop);
        console.log("Juego iniciado/reiniciado.");
    }

    // ***** MODIFICACIÓN CLAVE *****
    function resetPlayerPosition() {
        console.log("Attempting CSS center then JS sync...");
        // 1. Asegurar que los estilos de centrado CSS estén aplicados
        //    (Incluso si están en el CSS, aplicarlos aquí asegura el estado inicial)
        player.style.left = '50%';
        player.style.top = '50%';
        player.style.transform = 'translate(-50%, -50%)';
        // Limpiar estilos de píxeles explícitos que podrían haber quedado de antes
        // player.style.left = ''; // Mejor no limpiar, aplicar 50% directamente
        // player.style.top = '';

        // 2. Esperar al siguiente frame para leer la posición resultante
        requestAnimationFrame(() => {
            try {
                // Leer la posición calculada por el navegador basada en el CSS anterior
                // offsetLeft/Top son relativos al offsetParent (debería ser challengeSection)
                const currentX = player.offsetLeft;
                const currentY = player.offsetTop;

                // Actualizar las variables internas de JS
                playerPosX = currentX;
                playerPosY = currentY;

                console.log(`CSS centered. Read position: (${playerPosX.toFixed(0)}, ${playerPosY.toFixed(0)})`);

                // 3. Ahora, cambiar a posicionamiento explícito por JS
                player.style.transform = ''; // Quitar el transform para evitar conflictos
                player.style.left = `${playerPosX}px`; // Establecer posición en píxeles leída
                player.style.top = `${playerPosY}px`;  // Establecer posición en píxeles leída

                console.log(`Switched to explicit JS positioning.`);

            } catch (error) {
                console.error("Error in resetPlayerPosition rAF callback:", error);
                // Fallback si la lectura/aplicación falla
                player.style.transform = ''; // Asegurar que no quede transform
                player.style.left = 'calc(50% - 30px)'; // Fallback visual aproximado
                player.style.top = 'calc(50% - 30px)';
            }
        });
    }
    // ***** FIN DE LA MODIFICACIÓN *****

    function restartGame() {
        console.log("Reiniciando juego desde modal...");
        modal.classList.add('hidden');
        initializeGame();
    }
    retryButton.addEventListener('click', restartGame);


    // --- 3. Lógica del Jugador (Arrastrar en toda la pantalla) ---
    // (Sin cambios aquí)
    function startDrag(event) { /* ... código anterior ... */ }
    function drag(event) { /* ... código anterior ... */ }
    function endDrag() { /* ... código anterior ... */ }
    challengeSection.addEventListener('mousedown', startDrag);
    challengeSection.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    challengeSection.addEventListener('touchstart', startDrag, { passive: false });
    challengeSection.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);


    // --- 4. Lógica de Emojis (Generación, Movimiento, Velocidad) ---
    // (Sin cambios aquí)
     function spawnEmoji() { /* ... código anterior ... */ }
     function moveAndBounceEmojis() { /* ... código anterior ... */ }
     function increaseSpeed() { /* ... código anterior ... */ }


    // --- 5. Lógica de Puntaje y Colisiones ---
    // (Sin cambios aquí)
     function updateScore() { /* ... código anterior ... */ }
     function updateScoreDisplay() { /* ... código anterior ... */ }
     function checkCollisions() { /* ... código anterior ... */ }


    // --- 6. Bucle Principal del Juego y Game Over ---
    // (Sin cambios aquí)
     function gameLoop() { /* ... código anterior ... */ }
     function gameOver() { /* ... código anterior ... */ }
     function clearAllIntervals() { /* ... código anterior ... */ }

}); // Fin del DOMContentLoaded
