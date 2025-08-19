import os
import sys
import subprocess
from pathlib import Path
import winreg
import time
import ctypes
import webbrowser
import socket
import tempfile

# Registry target(s)
# Preferred: SystemFileAssociations\image applies to all images
SFA_IMAGE_SHELL_KEY = r"SystemFileAssociations\\image\\shell"
# On Windows 11, writing under HKCU is more reliable for per-user verbs
HKCU_SFA_IMAGE_SHELL_KEY = r"Software\\Classes\\SystemFileAssociations\\image\\shell"
CONTEXT_MENU_NAME = "Convert to WebP"
CONTEXT_MENU_KEY_NAME = CONTEXT_MENU_NAME  # folder name under ...\shell\

# Legacy per-extension entries we previously created (will be removed if present)
IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff', '.tga', '.webp']

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


def show_toast(message, title="WebP Converter", duration=4):
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
        _toaster.show_toast(title, message, icon_path=icon_path, duration=duration, threaded=True)
        # Give the notification a moment to display if the process is about to exit
        start_time = time.time()
        while getattr(_toaster, "notification_active", lambda: False)() and time.time() - start_time < 5:
            time.sleep(0.1)
    except Exception:
        pass


def add_context_menu():
    """Add 'Convert to WebP' to right-click menu for image files only.

    We now register under HKCR\SystemFileAssociations\image\shell so the entry
    appears for any file Windows treats as an image, regardless of extension/ProgID.
    """
    try:
        exe_path = os.path.abspath(sys.argv[0])
        icon_path = exe_path
        if not exe_path.lower().endswith(".exe"):
            script_dir = os.path.dirname(exe_path)
            ico_candidate = os.path.join(script_dir, "quicktool.ico")
            if os.path.exists(ico_candidate):
                icon_path = ico_candidate
        
        # Debug: Show what we're installing
        print(f"🔧 Installing context menu for image files only...")
        print(f"   Executable: {exe_path}")
        print(f"   Icon: {icon_path}")
        
        # First, try to remove any existing entries to avoid conflicts
        remove_context_menu()

        # Add context menu under HKCU so it shows up for the current user
        # Path: HKCU\Software\Classes\SystemFileAssociations\image\shell\{name}\command
        image_menu_key_hkcu = f"{HKCU_SFA_IMAGE_SHELL_KEY}\\{CONTEXT_MENU_KEY_NAME}"
        with winreg.CreateKey(winreg.HKEY_CURRENT_USER, image_menu_key_hkcu) as key:
            winreg.SetValueEx(key, None, 0, winreg.REG_SZ, CONTEXT_MENU_NAME)
            winreg.SetValueEx(key, "Icon", 0, winreg.REG_SZ, icon_path)
            # Allow the verb to appear for multi-selection
            try:
                winreg.SetValueEx(key, "MultiSelectModel", 0, winreg.REG_SZ, "Player")
            except Exception:
                pass

        image_cmd_key_hkcu = f"{image_menu_key_hkcu}\\command"
        with winreg.CreateKey(winreg.HKEY_CURRENT_USER, image_cmd_key_hkcu) as key:
            command = f'"{exe_path}" "%1"'
            winreg.SetValueEx(key, None, 0, winreg.REG_SZ, command)
            print(f"   ✅ Added: HKCU\\{image_cmd_key_hkcu} -> {command}")

        # Force Windows to refresh the shell context menu
        print("🔄 Refreshing Windows shell...")
        try:
            import ctypes
            # Multiple refresh commands to ensure it works
            ctypes.windll.shell32.SHChangeNotify(0x8000000, 0, None, None)  # SHCNE_ASSOCCHANGED
            ctypes.windll.shell32.SHChangeNotify(0x00000001, 0, None, None)  # SHCNE_CREATE
            print("   ✅ Shell refresh commands sent")
        except Exception as e:
            print(f"   ⚠️ Shell refresh failed: {e}")

        print("✅ Context menu 'Convert to WebP' added for image files only.")
        print("💡 Test: Right-click any image file → Convert to WebP")
        print("💡 If menu doesn't appear, try restarting Explorer or logging out/in")
        
    except Exception as e:
        print(f"❌ Failed to add context menu: {e}")


def remove_context_menu():
    """Remove 'Convert to WebP' from right-click menu."""
    try:
        removed_count = 0

        # Remove per-user entry under HKCU
        try:
            image_cmd_key_hkcu = f"{HKCU_SFA_IMAGE_SHELL_KEY}\\{CONTEXT_MENU_KEY_NAME}\\command"
            winreg.DeleteKey(winreg.HKEY_CURRENT_USER, image_cmd_key_hkcu)
            image_menu_key_hkcu = f"{HKCU_SFA_IMAGE_SHELL_KEY}\\{CONTEXT_MENU_KEY_NAME}"
            winreg.DeleteKey(winreg.HKEY_CURRENT_USER, image_menu_key_hkcu)
            removed_count += 1
            print(f"   ✅ Removed HKCU\\{image_menu_key_hkcu}")
        except FileNotFoundError:
            pass
        except Exception as e:
            print(f"   ⚠️ Could not remove HKCU entry: {e}")

        # Also remove any HKCR entry (older installs may have used HKCR)
        try:
            image_cmd_key_hkcr = f"{SFA_IMAGE_SHELL_KEY}\\{CONTEXT_MENU_KEY_NAME}\\command"
            winreg.DeleteKey(winreg.HKEY_CLASSES_ROOT, image_cmd_key_hkcr)
            image_menu_key_hkcr = f"{SFA_IMAGE_SHELL_KEY}\\{CONTEXT_MENU_KEY_NAME}"
            winreg.DeleteKey(winreg.HKEY_CLASSES_ROOT, image_menu_key_hkcr)
            removed_count += 1
            print(f"   ✅ Removed HKCR\\{image_menu_key_hkcr}")
        except FileNotFoundError:
            pass
        except Exception as e:
            print(f"   ⚠️ Could not remove HKCR entry: {e}")

        # Remove any legacy per-extension entries we may have created previously
        for ext in IMAGE_EXTENSIONS:
            try:
                cmd_key = f"{ext}\\shell\\{CONTEXT_MENU_NAME}\\command"
                winreg.DeleteKey(winreg.HKEY_CLASSES_ROOT, cmd_key)
                ext_key = f"{ext}\\shell\\{CONTEXT_MENU_NAME}"
                winreg.DeleteKey(winreg.HKEY_CLASSES_ROOT, ext_key)
                removed_count += 1
                print(f"   ✅ Removed legacy entry for {ext}")
            except FileNotFoundError:
                pass
            except Exception as e:
                print(f"   ⚠️ Could not remove legacy for {ext}: {e}")
        
        # Also check for any old general entries that might conflict
        try:
            old_keys = [
                r"*\\shell\\Convert to WebP\\command",
                r"*\\shell\\Convert to WebP"
            ]
            for old_key in old_keys:
                try:
                    winreg.DeleteKey(winreg.HKEY_CLASSES_ROOT, old_key)
                    print(f"   ✅ Removed old entry: {old_key}")
                    removed_count += 1
                except FileNotFoundError:
                    pass
        except Exception as e:
            print(f"   ⚠️ Could not remove old entries: {e}")
        
        if removed_count > 0:
            print(f"✅ Context menu 'Convert to WebP' removed from {removed_count} locations.")
        else:
            print("✨ No context menu entries found to remove.")
            
        # Refresh Windows shell
        try:
            import ctypes
            ctypes.windll.shell32.SHChangeNotify(0x8000000, 0, None, None)
            print("🔄 Windows shell refreshed")
        except Exception as e:
            print(f"   ⚠️ Could not refresh shell: {e}")
            
    except Exception as e:
        print(f"❌ Failed to remove context menu: {e}")


def convert_to_webp(image_path):
    """Convert image to WebP format. Returns True if successful, False otherwise."""
    image_path = Path(image_path)
    if not image_path.exists():
        return False

    # Create "webp" folder in same directory
    output_dir = image_path.parent / "webp"
    output_dir.mkdir(exist_ok=True)

    # Output file path
    output_file = output_dir / (image_path.stem + ".webp")

    # Run cwebp command silently
    try:
        subprocess.run(
            [get_cwebp_path(), "-q", "80", str(image_path), "-o", str(output_file)],
            check=True,
            capture_output=True,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
        )
        return True
    except Exception:
        return False


def show_menu():
    """GUI installer/uninstaller with optional website link; avoids console input."""
    MB_ICONQUESTION = 0x20
    MB_YESNOCANCEL = 0x00000003
    MB_YESNO = 0x00000004
    IDYES, IDNO, IDCANCEL = 6, 7, 2

    message = (
        "Add or remove the context menu entry?\n\n"
        "Yes = Add 'Convert to WebP' (image files only)\n"
        "No = Remove entry\n"
        "Cancel = Exit"
    )
    result = ctypes.windll.user32.MessageBoxW(
        None, message, "WebP Converter Installer", MB_ICONQUESTION | MB_YESNOCANCEL
    )

    if result == IDYES:
        add_context_menu()
        ctypes.windll.user32.MessageBoxW(None, "Context menu added for image files.", "WebP Converter", 0)
    elif result == IDNO:
        remove_context_menu()
        ctypes.windll.user32.MessageBoxW(None, "Context menu removed.", "WebP Converter", 0)
    else:
        return

    # Offer to open website
    site_url = "https://jdip19.github.io/support-jdip.html"
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
    args = sys.argv[1:]
    if not args:
        return

    # Convert all images
    for arg in args:
        convert_to_webp(arg)

    # Show simple completion toast
    show_toast("WebP conversion completed!")


if __name__ == "__main__":
    main()
