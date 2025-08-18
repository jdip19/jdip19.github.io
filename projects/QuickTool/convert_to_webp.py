import os
import sys
import subprocess
from pathlib import Path
import winreg
import time
import ctypes
import webbrowser

CONTEXT_MENU_KEY = r"*\\shell\\Convert to WebP"


def get_cwebp_path():
    if hasattr(sys, "_MEIPASS"):
        # If running from bundled exe
        return os.path.join(sys._MEIPASS, "cwebp.exe")
    else:
        # Running from script folder
        return "cwebp.exe"


def get_resource_path(filename):
    """Return absolute path to a resource that may live in PyInstaller bundle or next to script."""
    if hasattr(sys, "_MEIPASS"):
        candidate = os.path.join(sys._MEIPASS, filename)
        if os.path.exists(candidate):
            return candidate
    script_dir = os.path.dirname(os.path.abspath(sys.argv[0]))
    candidate = os.path.join(script_dir, filename)
    if os.path.exists(candidate):
        return candidate
    return None


_toaster = None


def show_toast(message, title="WebP Converter"):
    """Show a Windows toast notification if supported; otherwise, do nothing."""
    global _toaster
    try:
        from win10toast import ToastNotifier
    except Exception:
        return

    if _toaster is None:
        try:
            _toaster = ToastNotifier()
        except Exception:
            return

    icon_path = get_resource_path("quicktool.ico")
    try:
        _toaster.show_toast(title, message, icon_path=icon_path, duration=4, threaded=True)
        # Give the notification a moment to display if the process is about to exit
        start_time = time.time()
        while getattr(_toaster, "notification_active", lambda: False)() and time.time() - start_time < 5:
            time.sleep(0.1)
    except Exception:
        pass


def add_context_menu():
    """Add 'Convert to WebP' to right-click menu."""
    try:
        exe_path = os.path.abspath(sys.argv[0])
        icon_path = exe_path
        if not exe_path.lower().endswith(".exe"):
            script_dir = os.path.dirname(exe_path)
            ico_candidate = os.path.join(script_dir, "quicktool.ico")
            if os.path.exists(ico_candidate):
                icon_path = ico_candidate
        # Create main key
        with winreg.CreateKey(winreg.HKEY_CLASSES_ROOT, CONTEXT_MENU_KEY) as key:
            winreg.SetValueEx(key, None, 0, winreg.REG_SZ, "Convert to WebP")
            # Set icon for the context menu entry
            winreg.SetValueEx(key, "Icon", 0, winreg.REG_SZ, icon_path)

        # Create command key
        cmd_key = CONTEXT_MENU_KEY + r"\\command"
        with winreg.CreateKey(winreg.HKEY_CLASSES_ROOT, cmd_key) as key:
            # Pass all selected files to a single process
            command = f'"{exe_path}" %*'
            winreg.SetValueEx(key, None, 0, winreg.REG_SZ, command)

        print("✅ Context menu 'Convert to WebP' added.")
    except Exception as e:
        print(f"❌ Failed to add context menu: {e}")


def remove_context_menu():
    """Remove 'Convert to WebP' from right-click menu."""
    try:
        winreg.DeleteKey(winreg.HKEY_CLASSES_ROOT, CONTEXT_MENU_KEY + r"\\command")
        winreg.DeleteKey(winreg.HKEY_CLASSES_ROOT, CONTEXT_MENU_KEY)
        print("✅ Context menu 'Convert to WebP' removed.")
    except FileNotFoundError:
        print("⚠️ Context menu entry not found (already removed?).")
    except Exception as e:
        print(f"❌ Failed to remove context menu: {e}")


def convert_to_webp(image_path):
    image_path = Path(image_path)
    if not image_path.exists():
        return False

    # Create "webp" folder in same directory
    output_dir = image_path.parent / "webp"
    output_dir.mkdir(exist_ok=True)

    # Output file path
    output_file = output_dir / (image_path.stem + ".webp")

    # Run cwebp command
    try:
        subprocess.run(
            [get_cwebp_path(), "-q", "80", str(image_path), "-o", str(output_file)],
            check=True,
            capture_output=True,
        )

        print(f"✅ Converted: {output_file}")
        show_toast(f"Converted {image_path.name} → webp")
        return True
    except Exception as e:
        print(f"❌ Error converting {image_path}: {e}")
        show_toast(f"Failed to convert {image_path.name}")
        return False


def show_menu():
    """GUI installer/uninstaller with optional website link; avoids console input."""
    MB_ICONQUESTION = 0x20
    MB_YESNOCANCEL = 0x00000003
    MB_YESNO = 0x00000004
    IDYES, IDNO, IDCANCEL = 6, 7, 2

    message = (
        "Add or remove the context menu entry?\n\n"
        "Yes = Add 'Convert to WebP'\n"
        "No = Remove entry\n"
        "Cancel = Exit"
    )
    result = ctypes.windll.user32.MessageBoxW(
        None, message, "WebP Converter Installer", MB_ICONQUESTION | MB_YESNOCANCEL
    )

    if result == IDYES:
        add_context_menu()
        ctypes.windll.user32.MessageBoxW(None, "Context menu added.", "WebP Converter", 0)
    elif result == IDNO:
        remove_context_menu()
        ctypes.windll.user32.MessageBoxW(None, "Context menu removed.", "WebP Converter", 0)
    else:
        return

    # Offer to open website
    site_url = "https://jdip19.github.io/"
    open_site = ctypes.windll.user32.MessageBoxW(
        None, "Want to support creator?", "WebP Converter", MB_ICONQUESTION | MB_YESNO
    )
    if open_site == IDYES:
        try:
            webbrowser.open(site_url)
        except Exception:
            pass


    


def main():
    if len(sys.argv) == 1:
        # Run without arguments → show install/uninstall menu
        show_menu()
        return

    # Run with arguments (from context menu)
    for arg in sys.argv[1:]:
        convert_to_webp(arg)


if __name__ == "__main__":
    main()
