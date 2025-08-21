// Game Constants
const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 480;
const TILE_SIZE = 16;
const GRID_WIDTH = 39;
const GRID_HEIGHT = 114;
const TOWN_HEIGHT = 50;
const FPS = 60;

// Colors
const Colors = {
    DIRT: '#8B4513',
    EMPTY: '#000000',
    SILVER: '#C0C0C0',
    GOLD: '#FFD700',
    PLATINUM: '#E5E4E2',
    DIAMOND: '#00FFFF',
    GRANITE: '#808080',
    WATER: '#0000FF',
    SPRING: '#00FF00',
    SANDSTONE: '#F4A460',
    VOLCANIC: '#FF0000',
    CLOVER: '#008000',
    PUMP: '#800080',
    RING: '#FFFF00',
    PLAYER: '#FFFFFF',
    TOWN_BG: '#646464',
    WHITE: '#FFFFFF',
    BLACK: '#000000',
    RED: '#FF0000',
    GREEN: '#00FF00',
    YELLOW: '#FFFF00',
    GRAY: '#646464'
};

// Tile types
const TileType = {
    DIRT: 0,
    EMPTY: 1,
    SILVER: 2,
    GOLD: 3,
    PLATINUM: 4,
    DIAMOND: 5,
    GRANITE: 6,
    WATER: 7,
    SPRING: 8,
    SANDSTONE: 9,
    VOLCANIC: 10,
    CLOVER: 11,
    PUMP: 12,
    RING: 13
};

// Equipment
const Equipment = {
    SHOVEL: 'shovel',
    PICK: 'pick',
    DRILL: 'drill',
    LANTERN: 'lantern',
    BUCKET: 'bucket',
    DYNAMITE: 'dynamite',
    TORCH: 'torch'
};

// Game states
const GameState = {
    TOWN: 'town',
    MINE: 'mine',
    MENU: 'menu',
    GAME_OVER: 'game_over',
    VICTORY: 'victory'
};

// Tile data
const tileData = {
    [TileType.DIRT]: { color: Colors.DIRT, dig_cost: 20, value: 0 },
    [TileType.EMPTY]: { color: Colors.EMPTY, dig_cost: 0, value: 0 },
    [TileType.SILVER]: { color: Colors.SILVER, dig_cost: 20, value: 15 },
    [TileType.GOLD]: { color: Colors.GOLD, dig_cost: 20, value: 50 },
    [TileType.PLATINUM]: { color: Colors.PLATINUM, dig_cost: 20, value: 250 },
    [TileType.DIAMOND]: { color: Colors.DIAMOND, dig_cost: 20, value: 1000 },
    [TileType.GRANITE]: { color: Colors.GRANITE, dig_cost: 150, value: 0 },
    [TileType.WATER]: { color: Colors.WATER, dig_cost: 150, value: 0 },
    [TileType.SPRING]: { color: Colors.SPRING, dig_cost: 20, value: 0 },
    [TileType.SANDSTONE]: { color: Colors.SANDSTONE, dig_cost: 10, value: 0 },
    [TileType.VOLCANIC]: { color: Colors.VOLCANIC, dig_cost: 30, value: 0 },
    [TileType.CLOVER]: { color: Colors.CLOVER, dig_cost: 20, value: 0 },
    [TileType.PUMP]: { color: Colors.PUMP, dig_cost: 20, value: 0 },
    [TileType.RING]: { color: Colors.RING, dig_cost: 20, value: 0 }
};

// Player class
class Player {
    constructor() {
        this.money = 1500;
        this.health = 100;
        this.max_health = 100;
        this.inventory = {};
        this.minerals = {
            'silver': 0,
            'gold': 0,
            'platinum': 0,
            'diamonds': 0
        };
        this.has_ring = false;
        this.position = [Math.floor(GRID_WIDTH / 2), 0];
        this.camera_y = 0;
    }

    addMoney(amount) {
        this.money += amount;
        this.updateUI();
    }

    spendMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            this.updateUI();
            return true;
        }
        return false;
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.updateUI();
    }

    heal(amount) {
        this.health = Math.min(this.max_health, this.health + amount);
        this.updateUI();
    }

    hasEquipment(equipment) {
        return equipment in this.inventory;
    }

    addEquipment(equipment) {
        this.inventory[equipment] = true;
        this.updateEquipmentUI();
    }

    addMineral(mineralType, amount) {
        if (mineralType in this.minerals) {
            this.minerals[mineralType] += amount;
            this.updateUI();
        }
    }

    clearMinerals() {
        this.minerals = { silver: 0, gold: 0, platinum: 0, diamonds: 0 };
        this.updateUI();
    }

    getTotalMineralValue() {
        return Object.values(this.minerals).reduce((sum, val) => sum + val, 0) * 10;
    }

    updateUI() {
        // Update status panel values
        document.getElementById('money').textContent = `$ ${this.money.toLocaleString()}.00`;
        document.getElementById('health').textContent = this.health;
        document.getElementById('platinum-count').textContent = this.minerals.platinum;
        document.getElementById('gold-count').textContent = this.minerals.gold;
        document.getElementById('silver-count').textContent = this.minerals.silver;
        
        // Update equipment list
        const equipmentList = document.getElementById('equipment-list');
        const equipmentNames = Object.keys(this.inventory);
        if (equipmentNames.length === 0) {
            equipmentList.innerHTML = '<div class="equipment-item">No equipment</div>';
        } else {
            equipmentList.innerHTML = equipmentNames.map(item => 
                `<div class="equipment-item">${item}</div>`
            ).join('');
        }
        
        // Update ring status in messages
        if (this.has_ring) {
            this.addMessage('Ring Found!');
        }
    }

    updateEquipmentUI() {
        // Update equipment items visual state
        Object.keys(Equipment).forEach(equipmentKey => {
            const equipment = Equipment[equipmentKey];
            const element = document.querySelector(`[data-equipment="${equipment}"]`);
            if (element) {
                if (this.hasEquipment(equipment)) {
                    element.classList.add('owned');
                } else {
                    element.classList.remove('owned');
                }
            }
        });
    }
    
    addMessage(message) {
        const messagesArea = document.getElementById('messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.textContent = message;
        messagesArea.appendChild(messageElement);
        
        // Keep only last 10 messages
        while (messagesArea.children.length > 10) {
            messagesArea.removeChild(messagesArea.firstChild);
        }
        
        // Auto-scroll to bottom
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
}

// Mine Generator class
class MineGenerator {
    constructor() {
        this.grid = [];
        this.revealed = [];
        this.ringPosition = [0, 0];
    }

    generateMine() {
        // Initialize grid with dirt
        this.grid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(TileType.DIRT));
        this.revealed = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(false));

        // Generate mineral veins
        this.generateMineralVeins();

        // Place special items
        this.placeSpecialItems();
    }

    generateMineralVeins() {
        const veinConfigs = [
            [TileType.SILVER, 15, 1, 6, 10],
            [TileType.GOLD, 12, 1, 5, 8],
            [TileType.PLATINUM, 8, 1, 4, 1],
            [TileType.DIAMOND, 5, 1, 3, 0.1],
            [TileType.GRANITE, 10, 2, 8, 5],
            [TileType.WATER, 8, 1, 4, 3],
            [TileType.SPRING, 6, 1, 3, 2],
            [TileType.SANDSTONE, 12, 1, 5, 10],
            [TileType.VOLCANIC, 8, 1, 4, 5],
            [TileType.CLOVER, 4, 1, 2, 0.5],
            [TileType.PUMP, 3, 1, 2, 0.5]
        ];

        veinConfigs.forEach(([tileType, count, minLength, maxLength, weight]) => {
            for (let i = 0; i < count; i++) {
                this.createVein(tileType, minLength, maxLength, weight);
            }
        });
    }

    createVein(tileType, minLength, maxLength, weight) {
        if (Math.random() > weight / 10) return;

        const x = Math.floor(Math.random() * GRID_WIDTH);
        const y = Math.floor(Math.random() * GRID_HEIGHT);
        const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        const direction = ['horizontal', 'vertical', 'diagonal'][Math.floor(Math.random() * 3)];

        for (let i = 0; i < length; i++) {
            let nx, ny;
            if (direction === 'horizontal') {
                nx = x + i;
                ny = y;
            } else if (direction === 'vertical') {
                nx = x;
                ny = y + i;
            } else {
                nx = x + i;
                ny = y + i;
            }

            if (nx >= 0 && nx < GRID_WIDTH && ny >= 0 && ny < GRID_HEIGHT) {
                this.grid[ny][nx] = tileType;
            }
        }
    }

    placeSpecialItems() {
        // Place ring in a random deep location
        this.ringPosition = [
            Math.floor(Math.random() * GRID_WIDTH),
            Math.floor(Math.random() * (GRID_HEIGHT - 50)) + 50
        ];
        this.grid[this.ringPosition[1]][this.ringPosition[0]] = TileType.RING;
    }

    getTile(x, y) {
        if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
            return this.grid[y][x];
        }
        return TileType.DIRT;
    }

    setTile(x, y, tileType) {
        if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
            this.grid[y][x] = tileType;
        }
    }

    revealTile(x, y) {
        if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
            this.revealed[y][x] = true;
        }
    }

    isRevealed(x, y) {
        if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
            return this.revealed[y][x];
        }
        return false;
    }

    floodArea(x, y) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < GRID_WIDTH && ny >= 0 && ny < GRID_HEIGHT &&
                    this.grid[ny][nx] === TileType.EMPTY) {
                    this.grid[ny][nx] = TileType.WATER;
                }
            }
        }
    }

    caveIn(x, y) {
        const size = [3, 5][Math.floor(Math.random() * 2)];
        const half = Math.floor(size / 2);

        for (let dy = -half; dy <= half; dy++) {
            for (let dx = -half; dx <= half; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < GRID_WIDTH && ny >= 0 && ny < GRID_HEIGHT) {
                    this.grid[ny][nx] = TileType.DIRT;
                }
            }
        }
    }
}

// Town Manager class
class TownManager {
    constructor() {
        this.equipmentCosts = {
            [Equipment.SHOVEL]: 100,
            [Equipment.PICK]: 150,
            [Equipment.DRILL]: 250,
            [Equipment.LANTERN]: 300,
            [Equipment.BUCKET]: 200,
            [Equipment.TORCH]: 100,
            [Equipment.DYNAMITE]: 300
        };
    }

    buyEquipment(player, equipment) {
        if (equipment in this.equipmentCosts &&
            player.spendMoney(this.equipmentCosts[equipment]) &&
            !player.hasEquipment(equipment)) {
            player.addEquipment(equipment);
            this.showMessage('Equipment purchased!', `${equipment} added to inventory.`);
            return true;
        } else if (player.hasEquipment(equipment)) {
            this.showMessage('Already owned!', `You already have ${equipment}.`);
        } else {
            this.showMessage('Cannot afford!', `You need $${this.equipmentCosts[equipment]} to buy ${equipment}.`);
        }
        return false;
    }

    sellMinerals(player) {
        if (!Object.values(player.minerals).some(val => val > 0)) {
            this.showMessage('No minerals!', 'You have no minerals to sell.');
            return 0;
        }

        // Random market rates
        const rates = {
            'silver': Math.random() * 11 + 9,
            'gold': Math.random() * 18 + 45,
            'platinum': Math.random() * 54 + 225,
            'diamonds': 1000
        };

        let totalValue = 0;
        Object.entries(player.minerals).forEach(([mineral, amount]) => {
            if (amount > 0) {
                const value = Math.floor(amount * rates[mineral]);
                totalValue += value;
            }
        });

        player.addMoney(totalValue);
        player.clearMinerals();
        this.showMessage('Minerals sold!', `You earned $${totalValue} from selling minerals.`);
        return totalValue;
    }

    healPlayer(player) {
        if (player.health >= player.max_health) {
            this.showMessage('Already healthy!', 'Your health is already at maximum.');
            return false;
        }

        const cost = (player.max_health - player.health) * 2;
        if (player.spendMoney(cost)) {
            player.heal(player.max_health - player.health);
            this.showMessage('Healed!', `You have been healed to full health for $${cost}.`);
            return true;
        } else {
            this.showMessage('Cannot afford!', `You need $${cost} to heal.`);
            return false;
        }
    }

    saloonInteraction(player, option) {
        if (player.money < 5000) {
            this.showMessage('Too poor!', 'You need $5000 to enter the saloon!');
            return;
        }

        if (option === 'audience') {
            if (player.money >= 10000) {
                player.heal(2);
                this.showMessage('Enjoyed the show!', 'You enjoyed the show and feel better!');
            } else {
                this.showMessage('Too poor!', 'You need $10000 for the audience!');
            }
        } else if (option === 'night') {
            if (player.hasEquipment(Equipment.SHOVEL)) {
                player.heal(10);
                this.showMessage('Good night!', 'You had a good night!');
            } else {
                player.takeDamage(20);
                this.showMessage('Caught something!', 'You caught something! Take damage!');
            }
        }
    }

    showMessage(title, message) {
        // Add message to the status panel
        this.player.addMessage(message);
        
        // Also show modal for important messages
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.remove('hidden');
    }
}

// Renderer class
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    renderTown(player) {
        // Sky background
        this.ctx.fillStyle = '#87CEEB'; // Light blue sky
        this.ctx.fillRect(0, 0, SCREEN_WIDTH, 100);
        
        // Draw clouds
        this.ctx.fillStyle = '#FFFFFF';
        this.drawCloud(100, 30, 20);
        this.drawCloud(300, 40, 15);
        
        // Draw birds
        this.ctx.fillStyle = '#000000';
        this.drawBird(150, 25);
        this.drawBird(400, 35);
        
        // Ground
        this.ctx.fillStyle = '#C0C0C0'; // Light gray ground
        this.ctx.fillRect(0, 100, SCREEN_WIDTH, 50);
        
        // Draw houses
        this.drawHouse(50, 100, '$'); // Bank
        this.drawHouse(200, 100, '🍸'); // Saloon
        this.drawHouse(350, 100, '🏥'); // Hospital
        
        // Draw elevator shaft
        this.drawElevatorShaft(580, 100);
        
        // Draw player character
        this.drawPlayer(500, 120);
        
        // Mine area below
        this.ctx.fillStyle = Colors.DIRT;
        this.ctx.fillRect(0, 150, SCREEN_WIDTH, SCREEN_HEIGHT - 150);
        
        // Draw some mine entrance
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(580, 150, 40, 20);
    }
    
    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.arc(x + size, y, size * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x + size * 1.5, y, size * 0.6, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawBird(x, y) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + 8, y - 4);
        this.ctx.lineTo(x + 16, y);
        this.ctx.stroke();
    }
    
    drawHouse(x, y, symbol) {
        // House base
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x, y, 60, 40);
        
        // Roof
        this.ctx.fillStyle = '#FF0000';
        this.ctx.beginPath();
        this.ctx.moveTo(x - 5, y);
        this.ctx.lineTo(x + 30, y - 20);
        this.ctx.lineTo(x + 65, y);
        this.ctx.fill();
        
        // Door
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x + 20, y + 15, 20, 25);
        
        // Symbol
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(symbol, x + 30, y + 25);
        this.ctx.textAlign = 'left';
    }
    
    drawElevatorShaft(x, y) {
        // Shaft structure
        this.ctx.fillStyle = '#808080';
        this.ctx.fillRect(x, y, 40, 50);
        
        // Ribbed texture
        this.ctx.fillStyle = '#A0A0A0';
        for (let i = 0; i < 5; i++) {
            this.ctx.fillRect(x, y + i * 10, 40, 2);
        }
        
        // Entrance
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 5, y + 10, 30, 30);
    }
    
    drawPlayer(x, y) {
        // Head
        this.ctx.fillStyle = '#FFE4C4';
        this.ctx.fillRect(x + 8, y, 8, 8);
        
        // Body
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(x + 6, y + 8, 12, 12);
        
        // Arms
        this.ctx.fillStyle = '#FFE4C4';
        this.ctx.fillRect(x + 4, y + 10, 4, 8);
        this.ctx.fillRect(x + 16, y + 10, 4, 8);
        
        // Legs
        this.ctx.fillStyle = '#0000FF';
        this.ctx.fillRect(x + 8, y + 20, 4, 8);
        this.ctx.fillRect(x + 12, y + 20, 4, 8);
    }
    
    drawMinePlayer(x, y) {
        // Helmet
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(x + 4, y, 8, 4);
        
        // Head
        this.ctx.fillStyle = '#FFE4C4';
        this.ctx.fillRect(x + 4, y + 4, 8, 6);
        
        // Body
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x + 3, y + 10, 10, 6);
        
        // Arms
        this.ctx.fillStyle = '#FFE4C4';
        this.ctx.fillRect(x + 1, y + 11, 2, 4);
        this.ctx.fillRect(x + 13, y + 11, 2, 4);
        
        // Legs
        this.ctx.fillStyle = '#0000FF';
        this.ctx.fillRect(x + 4, y + 16, 3, 4);
        this.ctx.fillRect(x + 9, y + 16, 3, 4);
    }

    renderMine(player, mine) {
        const visibleHeight = Math.floor(SCREEN_HEIGHT / TILE_SIZE);
        const startY = player.camera_y;
        const endY = Math.min(GRID_HEIGHT, startY + visibleHeight + 1);

        // Render tiles
        for (let y = startY; y < endY; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const screenX = x * TILE_SIZE;
                const screenY = (y - startY) * TILE_SIZE;

                const tileType = mine.getTile(x, y);
                const color = this.getTileColor(tileType, mine.isRevealed(x, y), player);

                this.ctx.fillStyle = color;
                this.ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            }
        }

        // Render player
        const px = player.position[0] * TILE_SIZE;
        const py = (player.position[1] - startY) * TILE_SIZE;
        this.drawMinePlayer(px, py);
    }

    getTileColor(tileType, revealed, player) {
        if (tileType === TileType.EMPTY) {
            return Colors.EMPTY;
        }

        if (!revealed && !player.hasEquipment(Equipment.LANTERN)) {
            return Colors.DIRT;
        }

        return tileData[tileType]?.color || Colors.DIRT;
    }

    renderHUD(player, gameState) {
        // HUD is now handled by the status panel, so we don't render anything on canvas
    }

    renderGameOver(victory) {
        this.ctx.fillStyle = victory ? Colors.GREEN : Colors.RED;
        this.ctx.font = '36px Arial';
        this.ctx.textAlign = 'center';
        const text = victory ? 'You Win! Married Mimi!' : 'Game Over!';
        this.ctx.fillText(text, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);

        this.ctx.fillStyle = Colors.WHITE;
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Click Restart to play again', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 50);
        this.ctx.textAlign = 'left';
    }

    clear() {
        this.ctx.fillStyle = Colors.BLACK;
        this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }
}

// Main Game class
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);
        
        // Game components
        this.player = new Player();
        this.mine = new MineGenerator();
        this.town = new TownManager();
        
        // Game state
        this.gameState = GameState.MINE;
        this.running = true;
        
        // Initialize game
        this.mine.generateMine();
        this.setupEventListeners();
        this.player.updateUI();
        this.player.updateEquipmentUI();
        
        // Start game loop
        this.gameLoop();
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Equipment click events
        document.querySelectorAll('.equipment-item').forEach(item => {
            item.addEventListener('click', () => {
                const equipment = item.dataset.equipment;
                this.town.buyEquipment(this.player, equipment);
            });
        });

        // Building button events
        document.querySelectorAll('.building-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleBuildingAction(action);
            });
        });

        // Game over buttons
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('quit-btn').addEventListener('click', () => this.quitGame());

        // Modal close
        document.getElementById('modal-close').addEventListener('click', () => {
            document.getElementById('modal').classList.add('hidden');
        });

        // Canvas click to show town UI when in town mode
        this.canvas.addEventListener('click', (e) => {
            if (this.gameState === GameState.TOWN) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Check if clicked on elevator shaft
                if (x >= 580 && x <= 620 && y >= 100 && y <= 150) {
                    this.enterMine();
                } else {
                    document.getElementById('town-ui').classList.remove('hidden');
                }
            }
        });
    }

    handleKeydown(e) {
        if (this.gameState === GameState.TOWN) {
            this.handleTownInput(e.key);
        } else if (this.gameState === GameState.MINE) {
            this.handleMineInput(e.key);
        } else if (this.gameState === GameState.GAME_OVER || this.gameState === GameState.VICTORY) {
            this.handleGameOverInput(e.key);
        }
    }

    handleTownInput(key) {
        const equipmentMap = {
            '1': Equipment.SHOVEL,
            '2': Equipment.PICK,
            '3': Equipment.DRILL,
            '4': Equipment.LANTERN,
            '5': Equipment.BUCKET,
            '6': Equipment.TORCH,
            '7': Equipment.DYNAMITE
        };

        if (equipmentMap[key]) {
            this.town.buyEquipment(this.player, equipmentMap[key]);
        } else if (key === 'b' || key === 'B') {
            this.town.sellMinerals(this.player);
        } else if (key === 'h' || key === 'H') {
            this.town.healPlayer(this.player);
        } else if (key === 's' || key === 'S') {
            this.town.saloonInteraction(this.player, 'audience');
        } else if (key === 'e' || key === 'E') {
            this.enterMine();
        }
    }
    
    enterMine() {
        if (this.player.spendMoney(30)) {
            this.gameState = GameState.MINE;
            this.player.position = [Math.floor(GRID_WIDTH / 2), 0]; // Start at top of mine
            this.player.camera_y = 0;
            this.player.addMessage('Entered the mine!');
            this.updateUI();
        } else {
            this.town.showMessage('Cannot afford!', 'You need $30 to enter the mine.');
        }
    }

    handleMineInput(key) {
        let dx = 0, dy = 0;

        if (key === 'ArrowLeft') dx = -1;
        else if (key === 'ArrowRight') dx = 1;
        else if (key === 'ArrowUp') dy = -1;
        else if (key === 'ArrowDown') dy = 1;
        else if (key === 't' || key === 'T') {
            this.useElevator();
        } else if (key === 'Escape') {
            this.exitMine();
        }

        if (dx || dy) {
            this.movePlayer(dx, dy);
        }

        this.updateCamera();
    }
    
    useElevator() {
        if (this.player.position[1] === 0) {
            // At surface, go to town
            this.exitMine();
        } else {
            // In mine, go to surface
            this.player.position[1] = 0;
            this.player.camera_y = 0;
            this.player.addMessage('Used elevator to surface');
        }
    }
    
    exitMine() {
        this.gameState = GameState.TOWN;
        this.player.addMessage('Returned to town');
        this.updateUI();
    }

    handleGameOverInput(key) {
        if (key === 'r' || key === 'R') {
            this.restartGame();
        } else if (key === 'q' || key === 'Q') {
            this.quitGame();
        }
    }

    handleBuildingAction(action) {
        switch (action) {
            case 'store':
                // Store is handled by equipment clicks
                break;
            case 'bank':
                this.town.sellMinerals(this.player);
                break;
            case 'hospital':
                this.town.healPlayer(this.player);
                break;
            case 'saloon':
                this.showSaloonOptions();
                break;
            case 'mine':
                this.enterMine();
                break;
        }
    }

    showSaloonOptions() {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const modalButtons = document.getElementById('modal-buttons');

        modalTitle.textContent = 'Saloon';
        modalMessage.textContent = 'What would you like to do?';

        modalButtons.innerHTML = `
            <button class="primary" onclick="game.town.saloonInteraction(game.player, 'audience'); document.getElementById('modal').classList.add('hidden');">
                Watch Show ($10000)
            </button>
            <button class="secondary" onclick="game.town.saloonInteraction(game.player, 'night'); document.getElementById('modal').classList.add('hidden');">
                Stay the Night
            </button>
        `;

        modal.classList.remove('hidden');
    }

    movePlayer(dx, dy) {
        const newX = this.player.position[0] + dx;
        const newY = this.player.position[1] + dy;

        if (newX >= 0 && newX < GRID_WIDTH && newY >= 0 && newY < GRID_HEIGHT) {
            const tileType = this.mine.getTile(newX, newY);

            if (tileType === TileType.EMPTY) {
                this.player.position = [newX, newY];
            } else {
                if (this.digTile(newX, newY)) {
                    this.player.position = [newX, newY];
                    this.mine.revealTile(newX, newY);
                }
            }
        }
    }

    digTile(x, y) {
        const tileType = this.mine.getTile(x, y);

        // Handle special tiles
        if (tileType === TileType.GRANITE) {
            if (!this.player.hasEquipment(Equipment.DRILL)) {
                this.town.showMessage('Need Drill!', 'You need a drill to dig through granite.');
                return false;
            }
            if (!this.player.spendMoney(150)) {
                this.town.showMessage('Cannot afford!', 'You need $150 to dig through granite.');
                return false;
            }
        } else if (tileType === TileType.WATER) {
            if (!this.player.hasEquipment(Equipment.BUCKET)) {
                this.town.showMessage('Need Bucket!', 'You need a bucket to remove water.');
                return false;
            }
            if (!this.player.spendMoney(150)) {
                this.town.showMessage('Cannot afford!', 'You need $150 to remove water.');
                return false;
            }
        } else {
            // Regular digging
            const cost = this.calculateDigCost(tileType);
            if (!this.player.spendMoney(cost)) {
                this.town.showMessage('Cannot afford!', `You need $${cost} to dig.`);
                return false;
            }
        }

        // Handle rewards
        this.handleTileRewards(tileType);

        // Random cave-in
        if (Math.random() < 0.05) {
            this.mine.caveIn(x, y);
            this.player.takeDamage(30);
            this.town.showMessage('Cave-in!', 'A cave-in occurred! You took 30 damage.');
        }

        // Clear the tile
        this.mine.setTile(x, y, TileType.EMPTY);
        return true;
    }

    calculateDigCost(tileType) {
        let baseCost = 20;

        if (tileType === TileType.SANDSTONE) {
            baseCost = 10;
        } else if (tileType === TileType.VOLCANIC) {
            baseCost = 30;
        }

        // Equipment bonuses
        if (this.player.hasEquipment(Equipment.SHOVEL)) {
            baseCost = Math.max(8, baseCost - 12);
        }
        if (this.player.hasEquipment(Equipment.PICK)) {
            baseCost = Math.max(5, baseCost - 5);
        }

        return baseCost;
    }

    handleTileRewards(tileType) {
        if (tileType === TileType.SILVER) {
            const amount = Math.floor(Math.random() * 6) + 1;
            this.player.addMineral('silver', amount);
        } else if (tileType === TileType.GOLD) {
            const amount = Math.floor(Math.random() * 6) + 1;
            this.player.addMineral('gold', amount);
        } else if (tileType === TileType.PLATINUM) {
            const amount = Math.floor(Math.random() * 6) + 1;
            this.player.addMineral('platinum', amount);
        } else if (tileType === TileType.DIAMOND) {
            this.player.addMineral('diamonds', 1);
        } else if (tileType === TileType.RING) {
            this.player.has_ring = true;
            this.town.showMessage('Ring Found!', 'You found the ring! Now you need $20000 to win.');
        } else if (tileType === TileType.SPRING) {
            this.mine.floodArea(x, y);
            this.player.takeDamage(20);
            this.town.showMessage('Spring!', 'You hit a spring! Water flooded the area and you took 20 damage.');
        }
    }

    updateCamera() {
        const visibleHeight = Math.floor(SCREEN_HEIGHT / TILE_SIZE);

        if (this.player.position[1] > this.player.camera_y + visibleHeight - 3) {
            this.player.camera_y = this.player.position[1] - visibleHeight + 3;
        }
        if (this.player.position[1] < this.player.camera_y + 3) {
            this.player.camera_y = Math.max(0, this.player.position[1] - 3);
        }
    }

    checkWinCondition() {
        return this.player.has_ring && this.player.money >= 20000;
    }

    checkLoseCondition() {
        return this.player.health <= 0 || this.player.money < -100;
    }

    updateUI() {
        // Show/hide appropriate UI panels
        document.getElementById('town-ui').classList.toggle('hidden', this.gameState !== GameState.TOWN);
        document.getElementById('mine-ui').classList.toggle('hidden', this.gameState !== GameState.MINE);
        document.getElementById('game-over-ui').classList.toggle('hidden', 
            this.gameState !== GameState.GAME_OVER && this.gameState !== GameState.VICTORY);

        if (this.gameState === GameState.GAME_OVER || this.gameState === GameState.VICTORY) {
            const title = document.getElementById('game-over-title');
            title.textContent = this.gameState === GameState.VICTORY ? 'You Win!' : 'Game Over!';
        }

        // Show mine UI by default when game starts
        if (this.gameState === GameState.MINE) {
            document.getElementById('mine-ui').classList.remove('hidden');
        }
    }

    restartGame() {
        this.player = new Player();
        this.mine.generateMine();
        this.gameState = GameState.MINE;
        this.player.updateUI();
        this.player.updateEquipmentUI();
        this.updateUI();
    }

    quitGame() {
        this.running = false;
        // In a real web app, you might redirect or show a different page
        alert('Thanks for playing!');
    }

    update() {
        if (this.gameState === GameState.TOWN) {
            if (this.checkWinCondition()) {
                this.gameState = GameState.VICTORY;
                this.updateUI();
            } else if (this.checkLoseCondition()) {
                this.gameState = GameState.GAME_OVER;
                this.updateUI();
            }
        }
    }

    render() {
        this.renderer.clear();

        if (this.gameState === GameState.TOWN) {
            this.renderer.renderTown(this.player);
        } else if (this.gameState === GameState.MINE) {
            this.renderer.renderMine(this.player, this.mine);
        } else if (this.gameState === GameState.VICTORY) {
            this.renderer.renderGameOver(true);
        } else if (this.gameState === GameState.GAME_OVER) {
            this.renderer.renderGameOver(false);
        }

        this.renderer.renderHUD(this.player, this.gameState);
    }

    gameLoop() {
        if (!this.running) return;

        this.update();
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
