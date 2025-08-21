import pygame
import random
import sys
from enum import Enum
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional
import json
import os

# Constants
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
TILE_SIZE = 16
GRID_WIDTH = 39
GRID_HEIGHT = 114
TOWN_HEIGHT = 50
FPS = 60

# Colors
class Colors:
    DIRT = (139, 69, 19)
    EMPTY = (0, 0, 0)
    SILVER = (192, 192, 192)
    GOLD = (255, 215, 0)
    PLATINUM = (229, 228, 226)
    DIAMOND = (0, 255, 255)
    GRANITE = (128, 128, 128)
    WATER = (0, 0, 255)
    SPRING = (0, 255, 0)
    SANDSTONE = (244, 164, 96)
    VOLCANIC = (255, 0, 0)
    CLOVER = (0, 128, 0)
    PUMP = (128, 0, 128)
    RING = (255, 255, 0)
    PLAYER = (255, 255, 255)
    TOWN_BG = (100, 100, 100)
    WHITE = (255, 255, 255)
    BLACK = (0, 0, 0)
    RED = (255, 0, 0)
    GREEN = (0, 255, 0)
    YELLOW = (255, 255, 0)
    GRAY = (100, 100, 100)

# Tile types
class TileType(Enum):
    DIRT = 0
    EMPTY = 1
    SILVER = 2
    GOLD = 3
    PLATINUM = 4
    DIAMOND = 5
    GRANITE = 6
    WATER = 7
    SPRING = 8
    SANDSTONE = 9
    VOLCANIC = 10
    CLOVER = 11
    PUMP = 12
    RING = 13

# Equipment
class Equipment(Enum):
    SHOVEL = 'shovel'
    PICK = 'pick'
    DRILL = 'drill'
    LANTERN = 'lantern'
    BUCKET = 'bucket'
    DYNAMITE = 'dynamite'
    TORCH = 'torch'

# Buildings
class Building(Enum):
    STORE = 0
    BANK = 1
    HOSPITAL = 2
    SALOON = 3

@dataclass
class TileData:
    """Data class for tile information"""
    type: TileType
    color: Tuple[int, int, int]
    dig_cost: int
    value: int
    revealed: bool = False

@dataclass
class EquipmentData:
    """Data class for equipment information"""
    name: str
    cost: int
    description: str
    effect: str

class GameState(Enum):
    TOWN = "town"
    MINE = "mine"
    MENU = "menu"
    GAME_OVER = "game_over"
    VICTORY = "victory"

class Player:
    """Player class to manage player state and actions"""
    
    def __init__(self):
        self.money = 1500
        self.health = 100
        self.max_health = 100
        self.inventory: Dict[Equipment, bool] = {}
        self.minerals: Dict[str, int] = {
            'silver': 0, 
            'gold': 0, 
            'platinum': 0, 
            'diamonds': 0
        }
        self.has_ring = False
        self.position = (GRID_WIDTH // 2, 0)
        self.camera_y = 0
        
    def add_money(self, amount: int) -> None:
        """Add money to player's account"""
        self.money += amount
        
    def spend_money(self, amount: int) -> bool:
        """Spend money if player has enough"""
        if self.money >= amount:
            self.money -= amount
            return True
        return False
        
    def take_damage(self, amount: int) -> None:
        """Take damage and ensure health doesn't go below 0"""
        self.health = max(0, self.health - amount)
        
    def heal(self, amount: int) -> None:
        """Heal player up to max health"""
        self.health = min(self.max_health, self.health + amount)
        
    def has_equipment(self, equipment: Equipment) -> bool:
        """Check if player has specific equipment"""
        return equipment in self.inventory
        
    def add_equipment(self, equipment: Equipment) -> None:
        """Add equipment to inventory"""
        self.inventory[equipment] = True
        
    def add_mineral(self, mineral_type: str, amount: int) -> None:
        """Add minerals to inventory"""
        if mineral_type in self.minerals:
            self.minerals[mineral_type] += amount
            
    def clear_minerals(self) -> None:
        """Clear all minerals from inventory"""
        self.minerals = {k: 0 for k in self.minerals}
        
    def get_total_mineral_value(self) -> int:
        """Calculate total value of minerals"""
        # This would be calculated with current market rates
        return sum(self.minerals.values()) * 10  # Simplified

class MineGenerator:
    """Handles mine generation and tile management"""
    
    def __init__(self):
        self.grid: List[List[TileType]] = []
        self.revealed: List[List[bool]] = []
        self.tile_data = self._create_tile_data()
        self.ring_position = (0, 0)
        
    def _create_tile_data(self) -> Dict[TileType, TileData]:
        """Create tile data dictionary"""
        return {
            TileType.DIRT: TileData(TileType.DIRT, Colors.DIRT, 20, 0),
            TileType.EMPTY: TileData(TileType.EMPTY, Colors.EMPTY, 0, 0),
            TileType.SILVER: TileData(TileType.SILVER, Colors.SILVER, 20, 15),
            TileType.GOLD: TileData(TileType.GOLD, Colors.GOLD, 20, 50),
            TileType.PLATINUM: TileData(TileType.PLATINUM, Colors.PLATINUM, 20, 250),
            TileType.DIAMOND: TileData(TileType.DIAMOND, Colors.DIAMOND, 20, 1000),
            TileType.GRANITE: TileData(TileType.GRANITE, Colors.GRANITE, 150, 0),
            TileType.WATER: TileData(TileType.WATER, Colors.WATER, 150, 0),
            TileType.SPRING: TileData(TileType.SPRING, Colors.SPRING, 20, 0),
            TileType.SANDSTONE: TileData(TileType.SANDSTONE, Colors.SANDSTONE, 10, 0),
            TileType.VOLCANIC: TileData(TileType.VOLCANIC, Colors.VOLCANIC, 30, 0),
            TileType.CLOVER: TileData(TileType.CLOVER, Colors.CLOVER, 20, 0),
            TileType.PUMP: TileData(TileType.PUMP, Colors.PUMP, 20, 0),
            TileType.RING: TileData(TileType.RING, Colors.RING, 20, 0),
        }
        
    def generate_mine(self) -> None:
        """Generate the mine with random mineral deposits"""
        # Initialize grid with dirt
        self.grid = [[TileType.DIRT for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]
        self.revealed = [[False for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]
        
        # Generate mineral veins
        self._generate_mineral_veins()
        
        # Place special items
        self._place_special_items()
        
    def _generate_mineral_veins(self) -> None:
        """Generate random mineral veins in the mine"""
        vein_configs = [
            (TileType.SILVER, 15, 1, 6, 10),
            (TileType.GOLD, 12, 1, 5, 8),
            (TileType.PLATINUM, 8, 1, 4, 1),
            (TileType.DIAMOND, 5, 1, 3, 0.1),
            (TileType.GRANITE, 10, 2, 8, 5),
            (TileType.WATER, 8, 1, 4, 3),
            (TileType.SPRING, 6, 1, 3, 2),
            (TileType.SANDSTONE, 12, 1, 5, 10),
            (TileType.VOLCANIC, 8, 1, 4, 5),
            (TileType.CLOVER, 4, 1, 2, 0.5),
            (TileType.PUMP, 3, 1, 2, 0.5),
        ]
        
        for tile_type, count, min_length, max_length, weight in vein_configs:
            for _ in range(count):
                self._create_vein(tile_type, min_length, max_length, weight)
                
    def _create_vein(self, tile_type: TileType, min_length: int, max_length: int, weight: float) -> None:
        """Create a single mineral vein"""
        if random.random() > weight / 10:  # Weight-based probability
            return
            
        x = random.randint(0, GRID_WIDTH - 1)
        y = random.randint(0, GRID_HEIGHT - 1)
        length = random.randint(min_length, max_length)
        direction = random.choice(['horizontal', 'vertical', 'diagonal'])
        
        for i in range(length):
            if direction == 'horizontal':
                nx, ny = x + i, y
            elif direction == 'vertical':
                nx, ny = x, y + i
            else:  # diagonal
                nx, ny = x + i, y + i
                
            if 0 <= nx < GRID_WIDTH and 0 <= ny < GRID_HEIGHT:
                self.grid[ny][nx] = tile_type
                
    def _place_special_items(self) -> None:
        """Place special items like the ring"""
        # Place ring in a random deep location
        self.ring_position = (
            random.randint(0, GRID_WIDTH - 1),
            random.randint(50, GRID_HEIGHT - 1)
        )
        self.grid[self.ring_position[1]][self.ring_position[0]] = TileType.RING
        
    def get_tile(self, x: int, y: int) -> TileType:
        """Get tile type at position"""
        if 0 <= x < GRID_WIDTH and 0 <= y < GRID_HEIGHT:
            return self.grid[y][x]
        return TileType.DIRT
        
    def set_tile(self, x: int, y: int, tile_type: TileType) -> None:
        """Set tile type at position"""
        if 0 <= x < GRID_WIDTH and 0 <= y < GRID_HEIGHT:
            self.grid[y][x] = tile_type
            
    def reveal_tile(self, x: int, y: int) -> None:
        """Reveal a tile"""
        if 0 <= x < GRID_WIDTH and 0 <= y < GRID_HEIGHT:
            self.revealed[y][x] = True
            
    def is_revealed(self, x: int, y: int) -> bool:
        """Check if tile is revealed"""
        if 0 <= x < GRID_WIDTH and 0 <= y < GRID_HEIGHT:
            return self.revealed[y][x]
        return False
        
    def flood_area(self, x: int, y: int) -> None:
        """Flood area around a spring"""
        for dy in range(-1, 2):
            for dx in range(-1, 2):
                nx, ny = x + dx, y + dy
                if (0 <= nx < GRID_WIDTH and 0 <= ny < GRID_HEIGHT and 
                    self.grid[ny][nx] == TileType.EMPTY):
                    self.grid[ny][nx] = TileType.WATER
                    
    def cave_in(self, x: int, y: int) -> None:
        """Create a cave-in at position"""
        size = random.choice([3, 5])
        half = size // 2
        
        for dy in range(-half, half + 1):
            for dx in range(-half, half + 1):
                nx, ny = x + dx, y + dy
                if 0 <= nx < GRID_WIDTH and 0 <= ny < GRID_HEIGHT:
                    self.grid[ny][nx] = TileType.DIRT

class TownManager:
    """Manages town interactions and buildings"""
    
    def __init__(self):
        self.equipment_costs = {
            Equipment.SHOVEL: 100,
            Equipment.PICK: 150,
            Equipment.DRILL: 250,
            Equipment.LANTERN: 300,
            Equipment.BUCKET: 200,
            Equipment.TORCH: 100,
            Equipment.DYNAMITE: 300,
        }
        
        self.equipment_descriptions = {
            Equipment.SHOVEL: "Reduces dig cost by 12",
            Equipment.PICK: "Reduces dig cost by 5",
            Equipment.DRILL: "Allows digging through granite",
            Equipment.LANTERN: "Reveals unknown tiles",
            Equipment.BUCKET: "Removes water tiles",
            Equipment.TORCH: "Helps find hidden treasures",
            Equipment.DYNAMITE: "Explodes large areas",
        }
        
    def buy_equipment(self, player: Player, equipment: Equipment) -> bool:
        """Buy equipment from store"""
        if (equipment in self.equipment_costs and 
            player.spend_money(self.equipment_costs[equipment]) and
            not player.has_equipment(equipment)):
            player.add_equipment(equipment)
            return True
        return False
        
    def sell_minerals(self, player: Player) -> int:
        """Sell minerals at bank with random rates"""
        if not any(player.minerals.values()):
            return 0
            
        # Random market rates
        rates = {
            'silver': random.uniform(9, 20),
            'gold': random.uniform(45, 63),
            'platinum': random.uniform(225, 279),
            'diamonds': 1000
        }
        
        total_value = 0
        for mineral, amount in player.minerals.items():
            if amount > 0:
                value = int(amount * rates[mineral])
                total_value += value
                
        player.add_money(total_value)
        player.clear_minerals()
        return total_value
        
    def heal_player(self, player: Player) -> bool:
        """Heal player at hospital"""
        if player.health >= player.max_health:
            return False
            
        cost = (player.max_health - player.health) * 2
        if player.spend_money(cost):
            player.heal(player.max_health - player.health)
            return True
        return False
        
    def saloon_interaction(self, player: Player, option: str) -> str:
        """Handle saloon interactions"""
        if player.money < 5000:
            return "You need $5000 to enter the saloon!"
            
        if option == 'audience':
            if player.money >= 10000:
                player.heal(2)
                return "You enjoyed the show and feel better!"
            else:
                return "You need $10000 for the audience!"
        elif option == 'night':
            if player.has_equipment(Equipment.SHOVEL):  # Using shovel as condom substitute
                player.heal(10)
                return "You had a good night!"
            else:
                player.take_damage(20)
                return "You caught something! Take damage!"
        return "Invalid option!"

class Renderer:
    """Handles all rendering operations"""
    
    def __init__(self, screen: pygame.Surface):
        self.screen = screen
        self.font = pygame.font.SysFont(None, 24)
        self.small_font = pygame.font.SysFont(None, 18)
        self.title_font = pygame.font.SysFont(None, 36)
        
    def render_town(self, player: Player) -> None:
        """Render the town interface"""
        # Background
        pygame.draw.rect(self.screen, Colors.TOWN_BG, (0, 0, SCREEN_WIDTH, TOWN_HEIGHT))
        
        # Building buttons
        buildings = ['Store', 'Bank', 'Hospital', 'Saloon', 'Enter Mine']
        for i, building in enumerate(buildings):
            x = i * 150 + 50
            text = self.font.render(building, True, Colors.WHITE)
            self.screen.blit(text, (x, 10))
            
        # Instructions
        instructions = [
            "Press 1-7 for equipment, B for bank, H for heal, S for saloon, E for mine",
            f"Money: ${player.money} | Health: {player.health}% | Minerals: {sum(player.minerals.values())}"
        ]
        
        for i, instruction in enumerate(instructions):
            text = self.small_font.render(instruction, True, Colors.WHITE)
            self.screen.blit(text, (10, 60 + i * 20))
            
    def render_mine(self, player: Player, mine: MineGenerator) -> None:
        """Render the mine interface"""
        visible_height = (SCREEN_HEIGHT - TOWN_HEIGHT) // TILE_SIZE
        start_y = player.camera_y
        end_y = min(GRID_HEIGHT, start_y + visible_height + 1)
        
        # Render tiles
        for y in range(start_y, end_y):
            for x in range(GRID_WIDTH):
                screen_x = x * TILE_SIZE
                screen_y = (y - start_y) * TILE_SIZE + TOWN_HEIGHT
                
                tile_type = mine.get_tile(x, y)
                color = self._get_tile_color(tile_type, mine.is_revealed(x, y), player)
                
                pygame.draw.rect(self.screen, color, 
                               (screen_x, screen_y, TILE_SIZE, TILE_SIZE))
                
        # Render player
        px = player.position[0] * TILE_SIZE
        py = (player.position[1] - start_y) * TILE_SIZE + TOWN_HEIGHT
        pygame.draw.rect(self.screen, Colors.PLAYER, (px, py, TILE_SIZE, TILE_SIZE))
        
    def _get_tile_color(self, tile_type: TileType, revealed: bool, player: Player) -> Tuple[int, int, int]:
        """Get color for tile based on type and visibility"""
        if tile_type == TileType.EMPTY:
            return Colors.EMPTY
            
        if not revealed and not player.has_equipment(Equipment.LANTERN):
            return Colors.DIRT
            
        color_map = {
            TileType.DIRT: Colors.DIRT,
            TileType.SILVER: Colors.SILVER,
            TileType.GOLD: Colors.GOLD,
            TileType.PLATINUM: Colors.PLATINUM,
            TileType.DIAMOND: Colors.DIAMOND,
            TileType.GRANITE: Colors.GRANITE,
            TileType.WATER: Colors.WATER,
            TileType.SPRING: Colors.SPRING,
            TileType.SANDSTONE: Colors.SANDSTONE,
            TileType.VOLCANIC: Colors.VOLCANIC,
            TileType.CLOVER: Colors.CLOVER,
            TileType.PUMP: Colors.PUMP,
            TileType.RING: Colors.RING,
        }
        
        return color_map.get(tile_type, Colors.DIRT)
        
    def render_hud(self, player: Player, game_state: GameState) -> None:
        """Render heads-up display"""
        # Status bar
        status_text = f"Money: ${player.money} | Health: {player.health}%"
        text = self.font.render(status_text, True, Colors.WHITE)
        self.screen.blit(text, (10, SCREEN_HEIGHT - 30))
        
        # Ring indicator
        if player.has_ring:
            ring_text = self.font.render("Has Ring!", True, Colors.YELLOW)
            self.screen.blit(ring_text, (300, SCREEN_HEIGHT - 30))
            
        # Equipment indicator
        if game_state == GameState.MINE:
            equipment_text = f"Equipment: {len(player.inventory)} items"
            text = self.small_font.render(equipment_text, True, Colors.WHITE)
            self.screen.blit(text, (500, SCREEN_HEIGHT - 30))
            
    def render_game_over(self, victory: bool) -> None:
        """Render game over screen"""
        if victory:
            text = self.title_font.render("You Win! Married Mimi!", True, Colors.GREEN)
        else:
            text = self.title_font.render("Game Over!", True, Colors.RED)
            
        text_rect = text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2))
        self.screen.blit(text, text_rect)
        
        restart_text = self.font.render("Press R to restart or Q to quit", True, Colors.WHITE)
        restart_rect = restart_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 50))
        self.screen.blit(restart_text, restart_rect)

class Game:
    """Main game class"""
    
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Miner Tribute - Enhanced Edition")
        self.clock = pygame.time.Clock()
        
        # Game components
        self.player = Player()
        self.mine = MineGenerator()
        self.town = TownManager()
        self.renderer = Renderer(self.screen)
        
        # Game state
        self.game_state = GameState.TOWN
        self.running = True
        
        # Initialize game
        self.mine.generate_mine()
        
    def handle_input(self) -> None:
        """Handle all input events"""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
                
            if event.type == pygame.KEYDOWN:
                self._handle_keydown(event.key)
                
    def _handle_keydown(self, key: int) -> None:
        """Handle key press events"""
        if self.game_state == GameState.TOWN:
            self._handle_town_input(key)
        elif self.game_state == GameState.MINE:
            self._handle_mine_input(key)
        elif self.game_state in [GameState.GAME_OVER, GameState.VICTORY]:
            self._handle_game_over_input(key)
            
    def _handle_town_input(self, key: int) -> None:
        """Handle input while in town"""
        if key == pygame.K_1:
            self.town.buy_equipment(self.player, Equipment.SHOVEL)
        elif key == pygame.K_2:
            self.town.buy_equipment(self.player, Equipment.PICK)
        elif key == pygame.K_3:
            self.town.buy_equipment(self.player, Equipment.DRILL)
        elif key == pygame.K_4:
            self.town.buy_equipment(self.player, Equipment.LANTERN)
        elif key == pygame.K_5:
            self.town.buy_equipment(self.player, Equipment.BUCKET)
        elif key == pygame.K_6:
            self.town.buy_equipment(self.player, Equipment.TORCH)
        elif key == pygame.K_7:
            self.town.buy_equipment(self.player, Equipment.DYNAMITE)
        elif key == pygame.K_b:
            self.town.sell_minerals(self.player)
        elif key == pygame.K_h:
            self.town.heal_player(self.player)
        elif key == pygame.K_s:
            self.town.saloon_interaction(self.player, 'audience')
        elif key == pygame.K_e:
            if self.player.spend_money(30):  # Elevator cost
                self.game_state = GameState.MINE
                
    def _handle_mine_input(self, key: int) -> None:
        """Handle input while in mine"""
        dx, dy = 0, 0
        
        if key == pygame.K_LEFT:
            dx = -1
        elif key == pygame.K_RIGHT:
            dx = 1
        elif key == pygame.K_UP:
            dy = -1
        elif key == pygame.K_DOWN:
            dy = 1
        elif key == pygame.K_t:  # Teleport glitch tribute
            self.player.position = (self.player.position[0], 0)
        elif key == pygame.K_ESCAPE:
            self.game_state = GameState.TOWN
            
        if dx or dy:
            self._move_player(dx, dy)
            
        # Update camera
        self._update_camera()
        
    def _handle_game_over_input(self, key: int) -> None:
        """Handle input on game over screen"""
        if key == pygame.K_r:
            self._restart_game()
        elif key == pygame.K_q:
            self.running = False
            
    def _move_player(self, dx: int, dy: int) -> None:
        """Move player and handle digging"""
        new_x = self.player.position[0] + dx
        new_y = self.player.position[1] + dy
        
        if 0 <= new_x < GRID_WIDTH and 0 <= new_y < GRID_HEIGHT:
            tile_type = self.mine.get_tile(new_x, new_y)
            
            if tile_type == TileType.EMPTY:
                self.player.position = (new_x, new_y)
            else:
                if self._dig_tile(new_x, new_y):
                    self.player.position = (new_x, new_y)
                    self.mine.reveal_tile(new_x, new_y)
                    
    def _dig_tile(self, x: int, y: int) -> bool:
        """Dig a tile and handle consequences"""
        tile_type = self.mine.get_tile(x, y)
        
        # Handle special tiles
        if tile_type == TileType.GRANITE:
            if not self.player.has_equipment(Equipment.DRILL):
                return False
            if not self.player.spend_money(150):
                return False
        elif tile_type == TileType.WATER:
            if not self.player.has_equipment(Equipment.BUCKET):
                return False
            if not self.player.spend_money(150):
                return False
        elif tile_type == TileType.SPRING:
            self.mine.flood_area(x, y)
            self.player.take_damage(20)
        else:
            # Regular digging
            cost = self._calculate_dig_cost(tile_type)
            if not self.player.spend_money(cost):
                return False
                
        # Handle rewards
        self._handle_tile_rewards(tile_type)
        
        # Random cave-in
        if random.random() < 0.05:
            self.mine.cave_in(x, y)
            self.player.take_damage(30)
            
        # Clear the tile
        self.mine.set_tile(x, y, TileType.EMPTY)
        return True
        
    def _calculate_dig_cost(self, tile_type: TileType) -> int:
        """Calculate dig cost based on tile type and equipment"""
        base_cost = 20
        
        if tile_type == TileType.SANDSTONE:
            base_cost = 10
        elif tile_type == TileType.VOLCANIC:
            base_cost = 30
            
        # Equipment bonuses
        if self.player.has_equipment(Equipment.SHOVEL):
            base_cost = max(8, base_cost - 12)
        if self.player.has_equipment(Equipment.PICK):
            base_cost = max(5, base_cost - 5)
            
        return base_cost
        
    def _handle_tile_rewards(self, tile_type: TileType) -> None:
        """Handle rewards from digging tiles"""
        if tile_type == TileType.SILVER:
            amount = random.randint(1, 6)
            self.player.add_mineral('silver', amount)
        elif tile_type == TileType.GOLD:
            amount = random.randint(1, 6)
            self.player.add_mineral('gold', amount)
        elif tile_type == TileType.PLATINUM:
            amount = random.randint(1, 6)
            self.player.add_mineral('platinum', amount)
        elif tile_type == TileType.DIAMOND:
            self.player.add_mineral('diamonds', 1)
        elif tile_type == TileType.RING:
            self.player.has_ring = True
            
    def _update_camera(self) -> None:
        """Update camera to follow player"""
        visible_height = (SCREEN_HEIGHT - TOWN_HEIGHT) // TILE_SIZE
        
        if self.player.position[1] > self.player.camera_y + visible_height - 3:
            self.player.camera_y = self.player.position[1] - visible_height + 3
        if self.player.position[1] < self.player.camera_y + 3:
            self.player.camera_y = max(0, self.player.position[1] - 3)
            
    def _check_win_condition(self) -> bool:
        """Check if player has won"""
        return self.player.has_ring and self.player.money >= 20000
        
    def _check_lose_condition(self) -> bool:
        """Check if player has lost"""
        return self.player.health <= 0 or self.player.money < -100
        
    def _restart_game(self) -> None:
        """Restart the game"""
        self.player = Player()
        self.mine.generate_mine()
        self.game_state = GameState.TOWN
        
    def update(self) -> None:
        """Update game state"""
        if self.game_state == GameState.TOWN:
            if self._check_win_condition():
                self.game_state = GameState.VICTORY
            elif self._check_lose_condition():
                self.game_state = GameState.GAME_OVER
                
    def render(self) -> None:
        """Render the current game state"""
        self.screen.fill(Colors.BLACK)
        
        if self.game_state == GameState.TOWN:
            self.renderer.render_town(self.player)
        elif self.game_state == GameState.MINE:
            self.renderer.render_mine(self.player, self.mine)
        elif self.game_state == GameState.VICTORY:
            self.renderer.render_game_over(True)
        elif self.game_state == GameState.GAME_OVER:
            self.renderer.render_game_over(False)
            
        self.renderer.render_hud(self.player, self.game_state)
        
    def run(self) -> None:
        """Main game loop"""
        while self.running:
            self.handle_input()
            self.update()
            self.render()
            
            pygame.display.flip()
            self.clock.tick(FPS)
            
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = Game()
    game.run()