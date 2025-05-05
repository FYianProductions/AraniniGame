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
    let intervals = {
        score: null,
        spawn: null,
        speed: null
    };
    let animationFrameId = null;
    let gameJustStarted = false;

    // --- 1. Lógica de Inicio (Portada -> Reto) ---

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

    function initializeGame() {
        console.log("Inicializando juego...");
        gameActive = true;
        score = 0;
        emojiSpeedMultiplier = 1.0;
        emojis.forEach(emojiObj => emojiObj.element.remove());
        emojis = [];

        resetPlayerPosition(); // <<< LLAMA A LA FUNCIÓN MODIFICADA
        updateScoreDisplay();

        clearAllIntervals();

        intervals.score = setInterval(updateScore, 1000);
        intervals.spawn = setInterval(spawnEmoji, 5000);
        intervals.speed = setInterval(increaseSpeed, 20000);

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        animationFrameId = requestAnimationFrame(gameLoop);

        console.log("Juego iniciado/reiniciado.");
    }

    // ***** MODIFICACIÓN CLAVE *****
    function resetPlayerPosition() {
        // Espera al siguiente frame de animación antes de calcular/establecer posición
        requestAnimationFrame(() => {
            try {
                // Verifica si el contenedor tiene dimensiones válidas
                if (challengeSection.offsetWidth > 0 && challengeSection.offsetHeight > 0) {
                    const playerWidth = player.offsetWidth;
                    const playerHeight = player.offsetHeight;

                    // Calcula la posición central
                    playerPosX = challengeSection.offsetWidth / 2 - playerWidth / 2;
                    playerPosY = challengeSection.offsetHeight / 2 - playerHeight / 2;

                    // Asegura que las posiciones no sean inválidas (NaN, negativas)
                    // Esto es una salvaguarda extra
                    playerPosX = Math.max(0, playerPosX || 0);
                    playerPosY = Math.max(0, playerPosY || 0);

                    // Aplica la posición calculada
                    player.style.left = `${playerPosX}px`;
                    player.style.top = `${playerPosY}px`;

                    console.log(`Player position set via rAF: (${playerPosX.toFixed(0)}, ${playerPosY.toFixed(0)})`);

                } else {
                    // Si las dimensiones aún no están listas, loguea un aviso.
                    // Podría implementarse un reintento si esto falla consistentemente.
                    console.warn("Challenge section dimensions not ready in rAF callback.");
                    // Intenta ponerlo en una posición segura por defecto si falla el cálculo
                    player.style.left = '50%';
                    player.style.top = '50%';
                    player.style.transform = 'translate(-50%, -50%)'; // Usa CSS como fallback
                }
            } catch (error) {
                console.error("Error in resetPlayerPosition inside rAF:", error);
                 // Fallback muy básico si todo falla
                 player.style.left = '10px';
                 player.style.top = '10px';
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
    function startDrag(event) {
        if (!gameActive) return;
        isDragging = true;
        player.style.cursor = 'grabbing';

        const touch = event.type === 'touchstart' ? event.touches[0] : event;
        dragStartX = touch.clientX;
        dragStartY = touch.clientY;
        playerStartDragX = player.offsetLeft;
        playerStartDragY = player.offsetTop;

        event.preventDefault();
    }

    function drag(event) {
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

        event.preventDefault();
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        player.style.cursor = 'grab';
    }

    challengeSection.addEventListener('mousedown', startDrag);
    challengeSection.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    challengeSection.addEventListener('touchstart', startDrag, { passive: false });
    challengeSection.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);


    // --- 4. Lógica de Emojis (Generación, Movimiento, Velocidad) ---
    // (Restaurada a la versión 1 en la respuesta anterior - sin cambios aquí)
     function spawnEmoji() {
        if (!gameActive) return;

        const emojiElement = document.createElement('div');
        emojiElement.classList.add('fire-emoji');
        emojiElement.textContent = '🔥';

        const tempSizeStyle = window.getComputedStyle(emojiElement).fontSize;
        const emojiSize = parseFloat(tempSizeStyle) * 1.2 || 32;

        let startX, startY, angle;
        const edge = Math.floor(Math.random() * 4);

        const gameWidth = challengeSection.offsetWidth;
        const gameHeight = challengeSection.offsetHeight;

        switch (edge) {
             case 0:
                startX = Math.random() * (gameWidth - emojiSize);
                startY = -emojiSize;
                angle = Math.random() * Math.PI;
                break;
            case 1:
                startX = gameWidth;
                startY = Math.random() * (gameHeight - emojiSize);
                angle = Math.random() * Math.PI + Math.PI / 2;
                break;
            case 2:
                startX = Math.random() * (gameWidth - emojiSize);
                startY = gameHeight;
                angle = Math.random() * Math.PI + Math.PI;
                break;
            case 3:
                startX = -emojiSize;
                startY = Math.random() * (gameHeight - emojiSize);
                angle = Math.random() * Math.PI - Math.PI / 2;
                break;
        }

        const baseSpeed = 2.5;
        let speed = baseSpeed * emojiSpeedMultiplier;
        let dx = Math.cos(angle) * speed;
        let dy = Math.sin(angle) * speed;

        if (edge === 0 && dy < 0) dy = Math.abs(dy);
        if (edge === 1 && dx > 0) dx = -Math.abs(dx);
        if (edge === 2 && dy > 0) dy = -Math.abs(dy);
        if (edge === 3 && dx < 0) dx = Math.abs(dx);

        emojiElement.style.left = `${startX}px`;
        emojiElement.style.top = `${startY}px`;

        challengeSection.appendChild(emojiElement);
        emojis.push({ element: emojiElement, x: startX, y: startY, dx, dy, size: emojiSize });
    }

    function moveAndBounceEmojis() {
        const gameWidth = challengeSection.offsetWidth;
        const gameHeight = challengeSection.offsetHeight;

        emojis.forEach((emojiObj) => {
            emojiObj.x += emojiObj.dx;
            emojiObj.y += emojiObj.dy;

            const maxX = gameWidth - emojiObj.size;
            const maxY = gameHeight - emojiObj.size;

            if (emojiObj.x <= 0 || emojiObj.x >= maxX) {
                emojiObj.dx *= -1;
                emojiObj.x = Math.max(0, Math.min(emojiObj.x, maxX));
            }
            if (emojiObj.y <= 0 || emojiObj.y >= maxY) {
                emojiObj.dy *= -1;
                emojiObj.y = Math.max(0, Math.min(emojiObj.y, maxY));
            }

            emojiObj.element.style.left = `${emojiObj.x}px`;
            emojiObj.element.style.top = `${emojiObj.y}px`;
        });
    }

    function increaseSpeed() {
        if (!gameActive) return;
        emojiSpeedMultiplier *= 1.12;
        console.log(`Speed increased. Multiplier: ${emojiSpeedMultiplier.toFixed(2)}`);

        const baseSpeed = 2.5;
        const targetBaseSpeed = baseSpeed * emojiSpeedMultiplier;

        emojis.forEach(emojiObj => {
             const currentSpeed = Math.sqrt(emojiObj.dx**2 + emojiObj.dy**2);
             if (currentSpeed > 0) {
                 const scaleFactor = targetBaseSpeed / currentSpeed;
                 emojiObj.dx *= scaleFactor;
                 emojiObj.dy *= scaleFactor;
             }
        });
    }

    // --- 5. Lógica de Puntaje y Colisiones ---
    // (Sin cambios aquí)
     function updateScore() {
        if (!gameActive) return;
        score++;
        updateScoreDisplay();
    }

    function updateScoreDisplay() {
        scoreDisplay.textContent = `Puntaje: ${score}`;
    }

    function checkCollisions() {
        if (!gameActive) return;
        const playerRect = player.getBoundingClientRect();

        for (let i = 0; i < emojis.length; i++) {
            const emojiObj = emojis[i];
            const emojiRect = emojiObj.element.getBoundingClientRect();

            if (
                playerRect.left < emojiRect.right &&
                playerRect.right > emojiRect.left &&
                playerRect.top < emojiRect.bottom &&
                playerRect.bottom > emojiRect.top
            ) {
                gameOver();
                return;
            }
        }
    }

    // --- 6. Bucle Principal del Juego y Game Over ---
    // (Sin cambios aquí)
     function gameLoop() {
        if (!gameActive) {
             if (animationFrameId) cancelAnimationFrame(animationFrameId);
             return;
        }

        moveAndBounceEmojis();
        checkCollisions();

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function gameOver() {
        console.log("¡Game Over!");
        gameActive = false;
        isDragging = false;

        clearAllIntervals();
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        finalScoreDisplay.textContent = `Puntaje: ${score}`;
        modal.classList.remove('hidden');
    }

    function clearAllIntervals() {
        clearInterval(intervals.score);
        clearInterval(intervals.spawn);
        clearInterval(intervals.speed);
        intervals.score = null;
        intervals.spawn = null;
        intervals.speed = null;
    }

}); // Fin del DOMContentLoaded
