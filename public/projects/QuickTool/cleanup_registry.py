import winreg
import os
import sys

def cleanup_registry():
    """Remove all registry entries related to WebP converter."""
    
    # Registry keys to clean up
    keys_to_remove = [
        r"*\\shell\\Convert to WebP",
        r"*\\shell\\Convert to WebP\\command"
    ]
    
    # Also check for any other variations that might exist
    additional_keys = [
        r"*\\shell\\WebP Converter",
        r"*\\shell\\WebP Converter\\command",
        r"*\\shell\\Convert to WebP (QuickTool)",
        r"*\\shell\\Convert to WebP (QuickTool)\\command"
    ]
    
    all_keys = keys_to_remove + additional_keys
    
    print("🧹 Cleaning up WebP Converter registry entries...")
    print("=" * 50)
    
    cleaned_count = 0
    
    for key_path in all_keys:
        try:
            # Try to remove command key first (if it exists)
            if key_path.endswith("\\command"):
                try:
                    winreg.DeleteKey(winreg.HKEY_CLASSES_ROOT, key_path)
                    print(f"✅ Removed: {key_path}")
                    cleaned_count += 1
                except FileNotFoundError:
                    pass  # Key doesn't exist, that's fine
            
            # Then try to remove the main shell key
            try:
                winreg.DeleteKey(winreg.HKEY_CLASSES_ROOT, key_path)
                print(f"✅ Removed: {key_path}")
                cleaned_count += 1
            except FileNotFoundError:
                pass  # Key doesn't exist, that's fine
                
        except Exception as e:
            print(f"⚠️ Could not remove {key_path}: {e}")
    
    # Also check for any shell extensions that might reference the old path
    try:
        # Look for any shell keys that might contain our old path
        with winreg.OpenKey(winreg.HKEY_CLASSES_ROOT, r"*\\shell") as shell_key:
            i = 0
            while True:
                try:
                    subkey_name = winreg.EnumKey(shell_key, i)
                    if "webp" in subkey_name.lower() or "convert" in subkey_name.lower():
                        try:
                            # Check if this key has a command that points to our old path
                            cmd_key_path = rf"*\\shell\\{subkey_name}\\command"
                            try:
                                with winreg.OpenKey(winreg.HKEY_CLASSES_ROOT, cmd_key_path) as cmd_key:
                                    cmd_value, _ = winreg.QueryValueEx(cmd_key, None)
                                    if "convert_to_webp.exe" in cmd_value.lower():
                                        print(f"🔍 Found old reference: {cmd_key_path}")
                                        print(f"   Points to: {cmd_value}")
                                        # Remove it
                                        winreg.DeleteKey(winreg.HKEY_CLASSES_ROOT, cmd_key_path)
                                        winreg.DeleteKey(winreg.HKEY_CLASSES_ROOT, rf"*\\shell\\{subkey_name}")
                                        print(f"✅ Removed old reference: {subkey_name}")
                                        cleaned_count += 1
                            except FileNotFoundError:
                                pass
                        except Exception as e:
                            print(f"⚠️ Could not check {subkey_name}: {e}")
                    i += 1
                except WindowsError:
                    break  # No more keys
    except Exception as e:
        print(f"⚠️ Could not scan shell keys: {e}")
    
    print("=" * 50)
    if cleaned_count > 0:
        print(f"🎉 Cleanup complete! Removed {cleaned_count} registry entries.")
        print("💡 You can now rebuild and reinstall the context menu.")
    else:
        print("✨ No registry entries found to clean up.")
    
    print("\n💡 To reinstall the context menu:")
    print("1. Build the EXE: pyinstaller --clean --noconfirm convert_to_webp.spec")
    print("2. Run the EXE as Administrator")
    print("3. Choose option 1 to add the context menu")

if __name__ == "__main__":
    try:
        cleanup_registry()
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        print("💡 Try running this script as Administrator")
    
    input("\nPress Enter to exit...")
