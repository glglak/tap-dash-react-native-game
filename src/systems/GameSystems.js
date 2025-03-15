// Game systems for Tap Dash

// Constants for game physics
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const FLOOR_HEIGHT = 50;
const INITIAL_GAME_SPEED = 5;
const MAX_GAME_SPEED = 10;
const SPEED_INCREASE_RATE = 0.1; // How much to increase speed per point
const OBSTACLE_WIDTH = 30;
const SCREEN_HEIGHT = 800; // Default, will be updated with actual screen height

// Physics System: Handles character movement, gravity, and jumping
const Physics = (entities, { touches, time }) => {
    const character = entities.character;
    
    // Update character Y position based on velocity
    character.position.y += character.velocity.y;
    
    // Apply gravity to velocity
    character.velocity.y += GRAVITY;
    
    // Check for floor collision
    const floorY = SCREEN_HEIGHT - FLOOR_HEIGHT - character.size.height / 2;
    if (character.position.y > floorY) {
        character.position.y = floorY;
        character.velocity.y = 0;
        character.isJumping = false;
        character.doubleJumpAvailable = true;
    }
    
    // Set jumping state for animations
    character.jumping = character.velocity.y < 0 || character.position.y < floorY;
    
    return entities;
};

// Obstacle Generator: Creates and moves obstacles
const ObstacleGenerator = (entities, { time }) => {
    const world = entities.world;
    const character = entities.character;
    const obstacles = Object.keys(entities).filter(key => key.includes('obstacle'));
    
    // Game speed increases with score
    const gameSpeed = Math.min(INITIAL_GAME_SPEED + (entities.score || 0) * SPEED_INCREASE_RATE, MAX_GAME_SPEED);
    
    // Move existing obstacles
    obstacles.forEach(obstacleKey => {
        const obstacle = entities[obstacleKey];
        
        // Move obstacle to the left
        obstacle.position.x -= gameSpeed;
        
        // If obstacle is off-screen, remove it
        if (obstacle.position.x < -OBSTACLE_WIDTH) {
            delete entities[obstacleKey];
            
            // Add score when obstacle passes successfully
            if (!obstacle.passed && !obstacle.hit) {
                obstacle.passed = true;
                entities.score = (entities.score || 0) + 1;
                
                // Dispatch score event
                if (entities.dispatch) {
                    entities.dispatch({ type: 'score' });
                }
            }
        }
        
        // Check for collision with character
        if (!obstacle.hit && checkCollision(character, obstacle)) {
            obstacle.hit = true;
            
            // Dispatch game over event
            if (entities.dispatch) {
                entities.dispatch({ type: 'game-over' });
            }
        }
    });
    
    // Generate new obstacle based on time and randomness
    if (world.lastObstacleTime === undefined || 
        time.current - world.lastObstacleTime > (1500 + Math.random() * 1000) / gameSpeed) {
        
        // Create obstacle ID
        const newObstacleId = `obstacle-${Date.now()}`;
        
        // Add new obstacle
        entities[newObstacleId] = {
            position: { 
                x: world.width + OBSTACLE_WIDTH,
                y: SCREEN_HEIGHT - FLOOR_HEIGHT - 25 // 25 is half obstacle height
            },
            size: { width: OBSTACLE_WIDTH, height: 50 },
            hit: false,
            passed: false,
            renderer: 'Obstacle'
        };
        
        // Update last obstacle time
        world.lastObstacleTime = time.current;
    }
    
    return entities;
};

// Difficulty System: Adjusts game difficulty based on score
const DifficultySystem = (entities, { time }) => {
    // This could include:
    // - Adjusting obstacle generation frequency
    // - Adding different types of obstacles
    // - Changing game speed beyond the basic formula
    
    return entities;
};

// Helper function to check collisions
const checkCollision = (character, obstacle) => {
    if (!character || !obstacle) return false;
    
    const characterLeft = character.position.x - character.size.width / 2;
    const characterRight = character.position.x + character.size.width / 2;
    const characterTop = character.position.y - character.size.height / 2;
    const characterBottom = character.position.y + character.size.height / 2;
    
    const obstacleLeft = obstacle.position.x - obstacle.size.width / 2;
    const obstacleRight = obstacle.position.x + obstacle.size.width / 2;
    const obstacleTop = obstacle.position.y - obstacle.size.height / 2;
    const obstacleBottom = obstacle.position.y + obstacle.size.height / 2;
    
    // Allow some collision forgiveness (70% of the full box) for better game feel
    const forgiveX = character.size.width * 0.15;
    const forgiveY = character.size.height * 0.15;
    
    return (
        characterRight - forgiveX > obstacleLeft &&
        characterLeft + forgiveX < obstacleRight &&
        characterBottom - forgiveY > obstacleTop &&
        characterTop + forgiveY < obstacleBottom
    );
};

// Update the floor height based on the actual screen height (called from setup)
const updateScreenDimensions = (height) => {
    SCREEN_HEIGHT = height;
};

// Set up initial entities
const setupEntities = (width, height) => {
    // Update screen dimensions
    updateScreenDimensions(height);
    
    return {
        world: {
            width,
            height,
            lastObstacleTime: undefined
        },
        character: {
            position: { x: width * 0.2, y: height - FLOOR_HEIGHT - 25 },
            velocity: { x: 0, y: 0 },
            size: { width: 50, height: 50 },
            isJumping: false,
            doubleJumpAvailable: true,
            jumping: false,
            renderer: 'Character'
        },
        floor: {
            position: { x: width / 2, y: height - FLOOR_HEIGHT / 2 },
            size: { width: width, height: FLOOR_HEIGHT },
            renderer: 'Background'
        },
        score: 0
    };
};

// Export all systems and helpers
export { 
    Physics, 
    ObstacleGenerator, 
    DifficultySystem, 
    setupEntities, 
    checkCollision, 
    JUMP_FORCE 
};