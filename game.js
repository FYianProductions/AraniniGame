// ***** game.js - Aplicando correcciones robustas para iOS *****
document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias ---
    console.log("Script Cargado."); // Log simple de carga
    const coverSection = document.getElementById('cover-section');
    const playButton = document.getElementById('play-button');
    const challengeSection = document.getElementById('challenge-section');
    const player = document.getElementById('player');
    const scoreDisplay = document.getElementById('score-display');
    const modal = document.getElementById('modal');
    const retryButton = document.getElementById('retry-button');
    const finalScoreDisplay = document.getElementById('final-score');

    // --- Estado ---
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
        if (gameActive || gameJustStarted) return;
        console.log("Iniciando Transición al Juego...");
        gameJustStarted = true;

        coverSection.classList.add('hidden');
        challengeSection.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        initializeGame();

        setTimeout(() => { gameJustStarted = false; }, 100); // Resetear flag
    }

    if (playButton) {
        playButton.addEventListener('click', startGameTransition);
    } else {
        console.error("Botón Jugar no encontrado!");
    }
    // Scroll listener sigue comentado

    // --- 2. Inicialización / Reinicio ---
    function initializeGame() {
        console.log("Inicializando Juego...");
        gameActive = false; // Asegurar inactivo durante configuración

        score = 0;
        emojiSpeedMultiplier = 1.0;
        // Limpiar emojis anteriores
        emojis.forEach(emojiObj => {
            if (emojiObj && emojiObj.element && emojiObj.element.parentNode) {
                emojiObj.element.parentNode.removeChild(emojiObj.element);
            }
        });
        emojis = [];

        updateScoreDisplay(); // Poner puntaje a 0
        clearAllIntervals(); // Limpiar timers anteriores

        resetPlayerPosition(); // Posicionar jugador (usa la nueva lógica abajo)

        // ***** CORRECCIÓN: Retrasar inicio de intervalos *****
        setTimeout(() => {
            // Verificar si el juego sigue activo (por si acaso)
            if (gameActive) {
                 console.log("Iniciando Intervalos (retrasado)...");
                 intervals.score = setInterval(updateScore, 1000);
                 intervals.spawn = setInterval(spawnEmoji, 5000); // Ahora debería funcionar mejor
                 intervals.speed = setInterval(increaseSpeed, 20000);
                 console.log("Intervalos Programados:", intervals);
            } else {
                console.log("Inicio de intervalos omitido - juego no activo.");
            }
        }, 50); // Pequeño retraso de 50ms

        // Iniciar bucle de juego
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(gameLoop);

        // Activar estado del juego AL FINAL
        gameActive = true;
        console.log("Juego Inicializado. gameActive = true");
    }

    // ***** CORRECCIÓN: Usar window.innerHeight para centrado vertical *****
    function resetPlayerPosition() {
        console.log("Reseteando Posición del Jugador...");
        requestAnimationFrame(() => { // Esperar al frame para dimensiones
            try {
                player.style.transform = ''; // Limpiar transform por si acaso

                const containerWidth = challengeSection.offsetWidth;
                // Usar altura de la ventana para cálculo vertical
                const viewHeight = window.innerHeight;
                const playerWidth = player.offsetWidth;
                const playerHeight = player.offsetHeight;

                // Calcular centro usando dimensiones, pero viewHeight para Y
                if (containerWidth > 0 && viewHeight > 0 && playerWidth > 0 && playerHeight > 0) {
                    playerPosX = containerWidth / 2 - playerWidth / 2;
                    playerPosY = viewHeight / 2 - playerHeight / 2; // <<< USA viewHeight

                    // Asegurar que no sean negativos
                    playerPosX = Math.max(0, playerPosX);
                    playerPosY = Math.max(0, playerPosY);

                    player.style.left = `${playerPosX}px`;
                    player.style.top = `${playerPosY}px`;
                    console.log(`Posición Jugador Reseteada a (${playerPosX.toFixed(0)}, ${playerPosY.toFixed(0)})`);
                } else {
                    console.warn("Dimensiones inválidas al resetear jugador. Usando fallback.");
                    playerPosX = 50; playerPosY = 50; // Posición segura
                    player.style.left = `${playerPosX}px`; player.style.top = `${playerPosY}px`;
                }
            } catch (error) {
                console.error("Error reseteando posición del jugador:", error);
                player.style.left = '10px'; player.style.top = '10px'; // Fallback absoluto
            }
        });
    }

    function restartGame() {
        console.log("Reiniciando Juego...");
        modal.classList.add('hidden');
        initializeGame();
    }
     if (retryButton) { retryButton.addEventListener('click', restartGame); }


    // --- 3. Lógica de Arrastre del Jugador ---
     function startDrag(event) {
        if (!gameActive) return;
        isDragging = true;
        player.style.cursor = 'grabbing';
        const touch = event.type === 'touchstart' ? event.touches[0] : event;
        dragStartX = touch.clientX;
        dragStartY = touch.clientY;
        // Leer posición actual al inicio del arrastre
        playerStartDragX = player.offsetLeft;
        playerStartDragY = player.offsetTop;
        event.preventDefault();
    }

    function drag(event) {
        if (!isDragging || !gameActive) return;
        const touch = event.type === 'touchmove' ? event.touches[0] : event;
        const deltaX = touch.clientX - dragStartX;
        const deltaY = touch.clientY - dragStartY; // Calcular delta Y
        let newX = playerStartDragX + deltaX;
        let newY = playerStartDragY + deltaY; // Calcular nueva Y

        const playerWidth = player.offsetWidth;
        const playerHeight = player.offsetHeight;

        // ***** CORRECCIÓN: Usar window.innerHeight para límite vertical (maxY) *****
        const maxX = challengeSection.offsetWidth - playerWidth;
        const maxY = window.innerHeight - playerHeight; // <<< USA window.innerHeight

        // Aplicar límites
        playerPosX = Math.max(0, Math.min(newX, maxX));
        playerPosY = Math.max(0, Math.min(newY, maxY)); // <<< USA maxY calculado con window.innerHeight

        // Actualizar posición
        player.style.left = `${playerPosX}px`;
        player.style.top = `${playerPosY}px`; // <<< Ahora debería permitir movimiento vertical
        event.preventDefault();
    }

    function endDrag(event) {
        if (!isDragging) return;
        isDragging = false;
        player.style.cursor = 'grab';
    }
    // Listeners de Arrastre
     if(challengeSection) {
        // ... (listeners mousedown, mousemove, mouseup) ...
        challengeSection.addEventListener('mousedown', startDrag);
        challengeSection.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        // ... (listeners touchstart, touchmove, touchend) ...
        challengeSection.addEventListener('touchstart', startDrag, { passive: false });
        challengeSection.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', endDrag);
     } else { console.error("Challenge section no encontrada para listeners de drag"); }


    // --- 4. Lógica de Emojis ---
    //    (Usaremos window.innerHeight aquí también para consistencia en límites)
    function spawnEmoji() {
        if (!gameActive) return;
        const emojiElement = document.createElement('div');
        emojiElement.classList.add('fire-emoji');
        emojiElement.textContent = '🔥';
        const tempSizeStyle = window.getComputedStyle(emojiElement).fontSize;
        const emojiSize = parseFloat(tempSizeStyle) * 1.2 || 32; // Estimar tamaño

        let startX, startY, angle;
        const edge = Math.floor(Math.random() * 4);
        const gameWidth = challengeSection.offsetWidth;
        const gameHeight = window.innerHeight; // <<< Usar altura de ventana

        switch (edge) {
             case 0: startX = Math.random()*(gameWidth-emojiSize); startY = -emojiSize; angle = Math.random()*Math.PI; break;
             case 1: startX = gameWidth; startY = Math.random()*(gameHeight-emojiSize); angle = Math.random()*Math.PI+Math.PI/2; break;
             case 2: startX = Math.random()*(gameWidth-emojiSize); startY = gameHeight; angle = Math.random()*Math.PI+Math.PI; break;
             case 3: startX = -emojiSize; startY = Math.random()*(gameHeight-emojiSize); angle = Math.random()*Math.PI-Math.PI/2; break;
        }
        const baseSpeed = 2.5;
        let speed = baseSpeed * emojiSpeedMultiplier;
        let dx = Math.cos(angle) * speed; let dy = Math.sin(angle) * speed;
        // Asegurar dirección inicial correcta
        if (edge === 0 && dy < 0) dy = Math.abs(dy); if (edge === 1 && dx > 0) dx = -Math.abs(dx);
        if (edge === 2 && dy > 0) dy = -Math.abs(dy); if (edge === 3 && dx < 0) dx = Math.abs(dx);

        emojiElement.style.left = `${startX}px`; emojiElement.style.top = `${startY}px`;
        challengeSection.appendChild(emojiElement);
        emojis.push({ element: emojiElement, x: startX, y: startY, dx, dy, size: emojiSize });
    }

    function moveAndBounceEmojis() {
        const gameWidth = challengeSection.offsetWidth;
        const gameHeight = window.innerHeight; // <<< Usar altura de ventana para rebote
        emojis.forEach((emojiObj) => {
            emojiObj.x += emojiObj.dx; emojiObj.y += emojiObj.dy;
            const maxX = gameWidth - emojiObj.size;
            const maxY = gameHeight - emojiObj.size; // <<< Límite Y basado en ventana
            // Lógica de rebote y clamp (sin cambios en la lógica, solo usa maxY actualizado)
            if (emojiObj.x <= 0 || emojiObj.x >= maxX) { emojiObj.dx *= -1; emojiObj.x = Math.max(0, Math.min(emojiObj.x, maxX)); }
            if (emojiObj.y <= 0 || emojiObj.y >= maxY) { emojiObj.dy *= -1; emojiObj.y = Math.max(0, Math.min(emojiObj.y, maxY)); }
            emojiObj.element.style.left = `${emojiObj.x}px`; emojiObj.element.style.top = `${emojiObj.y}px`;
        });
    }
    function increaseSpeed() {
        // (Sin cambios)
        if (!gameActive) return;
        emojiSpeedMultiplier *= 1.12;
        const baseSpeed = 2.5;
        const targetBaseSpeed = baseSpeed * emojiSpeedMultiplier;
        emojis.forEach(emojiObj => {
             const currentSpeed = Math.sqrt(emojiObj.dx**2 + emojiObj.dy**2);
             if (currentSpeed > 0) {
                 const scaleFactor = targetBaseSpeed / currentSpeed;
                 emojiObj.dx *= scaleFactor; emojiObj.dy *= scaleFactor;
             }
        });
     }

    // --- 5. Puntaje / Colisiones ---
    function updateScore() {
        if (!gameActive) return;
        score++;
        updateScoreDisplay();
    }
    function updateScoreDisplay() { scoreDisplay.textContent = `Puntaje: ${score}`; }
    function checkCollisions() {
        // (Sin cambios aquí, getBoundingClientRect debería funcionar bien)
        if (!gameActive) return;
        const playerRect = player.getBoundingClientRect();
        for (let i = 0; i < emojis.length; i++) {
            const emojiObj = emojis[i];
            const emojiRect = emojiObj.element.getBoundingClientRect();
            if ( playerRect.left < emojiRect.right && playerRect.right > emojiRect.left &&
                 playerRect.top < emojiRect.bottom && playerRect.bottom > emojiRect.top ) {
                gameOver(); return;
            }
        }
     }

    // --- 6. Bucle Principal / Game Over ---
    function gameLoop() {
        if (!gameActive) { animationFrameId = null; return; } // Detener si no está activo
        try {
            moveAndBounceEmojis(); // Mover emojis (usa window.innerHeight para límites Y)
            checkCollisions();    // Comprobar colisiones
        } catch (error) {
            console.error("ERROR en gameLoop:", error);
            gameOver(); // Detener en caso de error
            return;
        }
        // Solicitar siguiente frame SOLO si sigue activo
        if (gameActive) {
            animationFrameId = requestAnimationFrame(gameLoop);
        } else {
             animationFrameId = null;
        }
    }

    function gameOver() {
        if (!gameActive) return; // Prevenir llamadas múltiples
        console.log("GAME OVER.");
        gameActive = false;
        isDragging = false;
        if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
        clearAllIntervals(); // Detener timers
        finalScoreDisplay.textContent = `Puntaje: ${score}`;
        modal.classList.remove('hidden'); // Mostrar modal
    }

    function clearAllIntervals() {
        console.log("Limpiando intervalos...");
        clearInterval(intervals.score); clearInterval(intervals.spawn); clearInterval(intervals.speed);
        intervals.score = null; intervals.spawn = null; intervals.speed = null;
    }

    console.log("Configuración del Script Completa."); // Log final

}); // Fin del DOMContentLoaded
