import pyautogui
import time
import random
from pynput import mouse, keyboard

# Time interval in seconds
interval = 10  # Move mouse after 10 seconds of inactivity

# Get the screen size to ensure the cursor doesn't go out of bounds
screen_width, screen_height = pyautogui.size()

# Variable to track the last activity time
last_activity_time = time.time()

def on_mouse_move(x, y):
    try:
        global last_activity_time
        last_activity_time = time.time()
        print(f"Mouse movement detected at ({x}, {y})")
    except Exception as e:
        print(f"Mouse move error: {e}")

def on_mouse_click(x, y, button, pressed):
    try:
        global last_activity_time
        last_activity_time = time.time()
        print(f"Mouse click detected at ({x}, {y}), button: {button}, pressed: {pressed}")
    except Exception as e:
        print(f"Mouse click error: {e}")

def on_key_press(key):
    try:
        global last_activity_time
        last_activity_time = time.time()
        print(f"Keyboard activity detected: {key}")
    except Exception as e:
        print(f"Key press error: {e}")

# Set up listeners for mouse and keyboard events
mouse_listener = mouse.Listener(on_move=on_mouse_move, on_click=on_mouse_click)
keyboard_listener = keyboard.Listener(on_press=on_key_press)

# Start the listeners and ensure they are running
mouse_listener.start()
keyboard_listener.start()

# Main loop for mouse movement after inactivity
try:
    while True:
        # Check the time since the last activity
        time_since_last_activity = time.time() - last_activity_time

        if time_since_last_activity >= interval:
            # Generate random values for moveX and moveY within screen bounds
            moveX = random.randint(0, screen_width)
            moveY = random.randint(0, screen_height)

            # Move the mouse to the random position
            pyautogui.moveTo(moveX, moveY, duration=0.1)

            # Print the new cursor position
            print(f"Mouse moved to position: {moveX}, {moveY}")

            # Reset the last activity time to prevent immediate further movement
            last_activity_time = time.time()

        # Sleep for a short while to avoid high CPU usage
        time.sleep(0.1)
except KeyboardInterrupt:
    print("Script stopped by user.", flush=True)

# Stop the listeners when the script exits
mouse_listener.stop()
keyboard_listener.stop()
