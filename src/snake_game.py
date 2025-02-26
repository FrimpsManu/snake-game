import pygame
import random
import sys
from typing import List, Tuple

# Initialize Pygame
pygame.init()

# Constants
GRID_SIZE = 20
CELL_SIZE = 20
WINDOW_SIZE = GRID_SIZE * CELL_SIZE
FPS = 10

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (34, 197, 94)
DARK_GREEN = (21, 128, 61)
RED = (239, 68, 68)
BACKGROUND = (6, 78, 59)

class SnakeGame:
    def __init__(self):
        self.screen = pygame.display.set_mode((WINDOW_SIZE, WINDOW_SIZE))
        pygame.display.set_caption("Snake Game")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.Font(None, 36)
        self.reset_game()

    def reset_game(self):
        self.snake: List[Tuple[int, int]] = [(GRID_SIZE // 2, GRID_SIZE // 2)]
        self.direction = (1, 0)
        self.food = self.generate_food()
        self.score = 0
        self.game_over = False

    def generate_food(self) -> Tuple[int, int]:
        while True:
            food = (random.randint(0, GRID_SIZE - 1), random.randint(0, GRID_SIZE - 1))
            if food not in self.snake:
                return food

    def draw_snake_segment(self, pos: Tuple[int, int], is_head: bool):
        x, y = pos
        rect = pygame.Rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        
        # Draw the main body
        if is_head:
            pygame.draw.circle(self.screen, DARK_GREEN, 
                             (x * CELL_SIZE + CELL_SIZE // 2, y * CELL_SIZE + CELL_SIZE // 2), 
                             CELL_SIZE // 2)
            # Draw eyes
            eye_offset = 3
            if self.direction == (1, 0):  # Right
                eye_positions = [(x * CELL_SIZE + 15, y * CELL_SIZE + 5),
                               (x * CELL_SIZE + 15, y * CELL_SIZE + 15)]
            elif self.direction == (-1, 0):  # Left
                eye_positions = [(x * CELL_SIZE + 5, y * CELL_SIZE + 5),
                               (x * CELL_SIZE + 5, y * CELL_SIZE + 15)]
            elif self.direction == (0, -1):  # Up
                eye_positions = [(x * CELL_SIZE + 5, y * CELL_SIZE + 5),
                               (x * CELL_SIZE + 15, y * CELL_SIZE + 5)]
            else:  # Down
                eye_positions = [(x * CELL_SIZE + 5, y * CELL_SIZE + 15),
                               (x * CELL_SIZE + 15, y * CELL_SIZE + 15)]
            
            for eye_pos in eye_positions:
                pygame.draw.circle(self.screen, BLACK, eye_pos, 2)
        else:
            pygame.draw.circle(self.screen, GREEN, 
                             (x * CELL_SIZE + CELL_SIZE // 2, y * CELL_SIZE + CELL_SIZE // 2), 
                             CELL_SIZE // 2 - 1)

    def draw(self):
        self.screen.fill(BACKGROUND)

        # Draw snake
        for i, segment in enumerate(self.snake):
            self.draw_snake_segment(segment, i == 0)

        # Draw food (apple)
        food_x, food_y = self.food
        # Apple body
        pygame.draw.circle(self.screen, RED,
                         (food_x * CELL_SIZE + CELL_SIZE // 2, 
                          food_y * CELL_SIZE + CELL_SIZE // 2),
                         CELL_SIZE // 2 - 2)
        # Stem
        pygame.draw.rect(self.screen, DARK_GREEN,
                        (food_x * CELL_SIZE + CELL_SIZE // 2 - 1,
                         food_y * CELL_SIZE + 2,
                         2, 4))
        
        # Draw score
        score_text = self.font.render(f'Score: {self.score}', True, WHITE)
        self.screen.blit(score_text, (10, 10))

        if self.game_over:
            game_over_text = self.font.render('Game Over! Press R to Restart', True, WHITE)
            text_rect = game_over_text.get_rect(center=(WINDOW_SIZE // 2, WINDOW_SIZE // 2))
            self.screen.blit(game_over_text, text_rect)

        pygame.display.flip()

    def handle_input(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False
            if event.type == pygame.KEYDOWN:
                if self.game_over and event.key == pygame.K_r:
                    self.reset_game()
                elif not self.game_over:
                    if event.key == pygame.K_UP and self.direction != (0, 1):
                        self.direction = (0, -1)
                    elif event.key == pygame.K_DOWN and self.direction != (0, -1):
                        self.direction = (0, 1)
                    elif event.key == pygame.K_LEFT and self.direction != (1, 0):
                        self.direction = (-1, 0)
                    elif event.key == pygame.K_RIGHT and self.direction != (-1, 0):
                        self.direction = (1, 0)
        return True

    def update(self):
        if self.game_over:
            return

        # Move snake
        head_x, head_y = self.snake[0]
        new_head = (head_x + self.direction[0], head_y + self.direction[1])

        # Check for collisions
        if (new_head[0] < 0 or new_head[0] >= GRID_SIZE or
            new_head[1] < 0 or new_head[1] >= GRID_SIZE or
            new_head in self.snake):
            self.game_over = True
            return

        self.snake.insert(0, new_head)

        # Check if food is eaten
        if new_head == self.food:
            self.score += 1
            self.food = self.generate_food()
        else:
            self.snake.pop()

    def run(self):
        running = True
        while running:
            running = self.handle_input()
            self.update()
            self.draw()
            self.clock.tick(FPS)

        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = SnakeGame()
    game.run()