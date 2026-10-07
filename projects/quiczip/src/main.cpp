#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <windows.h>
#include <shellapi.h>
#include <shlobj.h>
#include <shlwapi.h>
#include <shobjidl.h>
#include <wrl/client.h>
#include <wincodec.h>
#include <webp/encode.h>
#include <filesystem>
#include <fstream>
#include <string>
#include <vector>
#include <thread>
#include <mutex>
#include <algorithm>
#include <sstream>
#include <cwchar>

using Microsoft::WRL::ComPtr;
namespace fs = std::filesystem;

constexpr UINT WM_TRAY = WM_APP + 1, WM_WORK_DONE = WM_APP + 2;
constexpr int HOTKEY_ZIP = 1, HOTKEY_WEBP = 2;
constexpr UINT ID_ZIP = 1001, ID_WEBP = 1002, ID_SETTINGS = 1003, ID_STARTUP = 1004, ID_EXIT = 1005;
constexpr wchar_t CLASS_NAME[] = L"QuickZip.HiddenWindow";

struct Settings { int quality = 85; bool overwrite = false; bool recursive = false; bool startup = false; };
struct Result { std::wstring title, text; };
HWND g_window = nullptr; HINSTANCE g_instance = nullptr; Settings g_settings; std::mutex g_settings_mutex;
std::mutex g_log_mutex;

std::wstring AppDataFile() {
    wchar_t path[MAX_PATH]{}; SHGetFolderPathW(nullptr, CSIDL_LOCAL_APPDATA, nullptr, SHGFP_TYPE_CURRENT, path);
    fs::path dir = fs::path(path) / L"QuickZip"; std::error_code ec; fs::create_directories(dir, ec); return (dir / L"settings.ini").wstring();
}
void Log(const std::wstring& message) {
    std::lock_guard lock(g_log_mutex); SYSTEMTIME now{}; GetLocalTime(&now); wchar_t timestamp[64]{}; swprintf_s(timestamp, L"%04u-%02u-%02u %02u:%02u:%02u", now.wYear, now.wMonth, now.wDay, now.wHour, now.wMinute, now.wSecond);
    std::wofstream log(fs::path(AppDataFile()).parent_path() / L"QuickZip.log", std::ios::app); if (log) log << L"[" << timestamp << L"] " << message << L"\n";
    OutputDebugStringW((std::wstring(L"QuickZip: ") + message + L"\n").c_str());
}
void LoadSettings() {
    auto file = AppDataFile(); g_settings.quality = GetPrivateProfileIntW(L"WebP", L"Quality", 85, file.c_str());
    g_settings.overwrite = GetPrivateProfileIntW(L"WebP", L"Overwrite", 0, file.c_str()) != 0;
    g_settings.recursive = GetPrivateProfileIntW(L"WebP", L"Recursive", 0, file.c_str()) != 0;
    g_settings.startup = GetPrivateProfileIntW(L"General", L"Startup", 0, file.c_str()) != 0;
    Log(L"QuickZip started; settings loaded");
}
void SaveSettings() {
    auto file = AppDataFile(); wchar_t value[16]; _itow_s(std::clamp(g_settings.quality, 1, 100), value, 10); WritePrivateProfileStringW(L"WebP", L"Quality", value, file.c_str());
    WritePrivateProfileStringW(L"WebP", L"Overwrite", g_settings.overwrite ? L"1" : L"0", file.c_str()); WritePrivateProfileStringW(L"WebP", L"Recursive", g_settings.recursive ? L"1" : L"0", file.c_str());
    WritePrivateProfileStringW(L"General", L"Startup", g_settings.startup ? L"1" : L"0", file.c_str());
    HKEY key; if (RegOpenKeyExW(HKEY_CURRENT_USER, L"Software\\Microsoft\\Windows\\CurrentVersion\\Run", 0, KEY_SET_VALUE, &key) == ERROR_SUCCESS) {
        if (g_settings.startup) { wchar_t exe[MAX_PATH]; GetModuleFileNameW(nullptr, exe, MAX_PATH); RegSetValueExW(key, L"QuickZip", 0, REG_SZ, reinterpret_cast<BYTE*>(exe), static_cast<DWORD>((wcslen(exe) + 1) * sizeof(wchar_t))); }
        else RegDeleteValueW(key, L"QuickZip"); RegCloseKey(key);
    }
}
void Notify(const std::wstring& title, const std::wstring& text) {
    Log(title + L": " + text);
    NOTIFYICONDATAW data{sizeof(data)}; data.hWnd = g_window; data.uID = 1; data.dwInfoFlags = NIIF_INFO; wcscpy_s(data.szInfoTitle, title.c_str()); wcscpy_s(data.szInfo, text.c_str()); Shell_NotifyIconW(NIM_MODIFY, &data);
}

std::vector<std::wstring> SelectedPaths() {
    std::vector<std::wstring> paths; ComPtr<IShellWindows> windows; if (FAILED(CoCreateInstance(CLSID_ShellWindows, nullptr, CLSCTX_LOCAL_SERVER, IID_PPV_ARGS(&windows)))) return paths;
    long count = 0; if (FAILED(windows->get_Count(&count))) return paths;
    for (long i = 0; i < count; ++i) { VARIANT index; VariantInit(&index); V_VT(&index) = VT_I4; V_I4(&index) = i; ComPtr<IDispatch> explorer;
        if (FAILED(windows->Item(index, &explorer)) || !explorer) { VariantClear(&index); continue; } VariantClear(&index);
        DISPID documentId, selectedId, countId, itemId, pathId; LPOLESTR names[] = {const_cast<LPOLESTR>(L"Document")}; if (FAILED(explorer->GetIDsOfNames(IID_NULL, names, 1, LOCALE_USER_DEFAULT, &documentId))) continue;
        DISPPARAMS noArgs{}; VARIANT document; VariantInit(&document); if (FAILED(explorer->Invoke(documentId, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &noArgs, &document, nullptr, nullptr)) || V_VT(&document) != VT_DISPATCH) { VariantClear(&document); continue; }
        IDispatch* doc = V_DISPATCH(&document); LPOLESTR sn[] = {const_cast<LPOLESTR>(L"SelectedItems")}; if (FAILED(doc->GetIDsOfNames(IID_NULL, sn, 1, LOCALE_USER_DEFAULT, &selectedId))) { VariantClear(&document); continue; }
        VARIANT selected; VariantInit(&selected); if (FAILED(doc->Invoke(selectedId, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &noArgs, &selected, nullptr, nullptr)) || V_VT(&selected) != VT_DISPATCH) { VariantClear(&selected); VariantClear(&document); continue; }
        IDispatch* sel = V_DISPATCH(&selected); LPOLESTR cn[] = {const_cast<LPOLESTR>(L"Count")}; if (FAILED(sel->GetIDsOfNames(IID_NULL, cn, 1, LOCALE_USER_DEFAULT, &countId))) { VariantClear(&selected); VariantClear(&document); continue; }
        VARIANT selectedCount; VariantInit(&selectedCount); if (FAILED(sel->Invoke(countId, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &noArgs, &selectedCount, nullptr, nullptr))) { VariantClear(&selected); VariantClear(&document); continue; }
        long selectedNumber = V_I4(&selectedCount); VariantClear(&selectedCount); LPOLESTR in[] = {const_cast<LPOLESTR>(L"Item")}; if (FAILED(sel->GetIDsOfNames(IID_NULL, in, 1, LOCALE_USER_DEFAULT, &itemId))) { VariantClear(&selected); VariantClear(&document); continue; }
        for (long j = 0; j < selectedNumber; ++j) { VARIANT arg; VariantInit(&arg); V_VT(&arg) = VT_I4; V_I4(&arg) = j; DISPPARAMS dp{&arg, nullptr, 1, 0}; VARIANT item; VariantInit(&item);
            if (SUCCEEDED(sel->Invoke(itemId, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &dp, &item, nullptr, nullptr)) && V_VT(&item) == VT_DISPATCH) { IDispatch* id = V_DISPATCH(&item); if (SUCCEEDED(id->GetIDsOfNames(IID_NULL, names, 1, LOCALE_USER_DEFAULT, &pathId))) { VARIANT p; VariantInit(&p); if (SUCCEEDED(id->Invoke(pathId, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &noArgs, &p, nullptr, nullptr)) && V_VT(&p) == VT_BSTR && p.bstrVal) paths.emplace_back(p.bstrVal); VariantClear(&p); } } VariantClear(&item); }
        VariantClear(&selected); VariantClear(&document);
    } return paths;
}

std::wstring UniquePath(fs::path base) { if (!fs::exists(base)) return base.wstring(); auto stem = base.stem().wstring(), ext = base.extension().wstring(); for (int n = 1; n < 10000; ++n) { auto candidate = base.parent_path() / (stem + L" (" + std::to_wstring(n) + L")" + ext); if (!fs::exists(candidate)) return candidate.wstring(); } return {}; }
bool SafeZipEntry(const std::wstring& name) { fs::path p(name); if (p.is_absolute() || name.find(L':') != std::wstring::npos) return false; for (const auto& part : p) if (part == L"..") return false; return true; }

bool CreateZip(const std::vector<std::wstring>& paths, std::wstring& output) {
    if (paths.empty()) return false; fs::path parent = fs::path(paths.front()).parent_path(); for (const auto& path : paths) if (fs::path(path).parent_path() != parent) { parent = parent.lexically_normal(); while (!parent.empty() && fs::path(path).lexically_normal().string().rfind(parent.string(), 0) != 0) parent = parent.parent_path(); }
    output = UniquePath(parent / (paths.size() == 1 ? fs::path(paths.front()).stem().wstring() + L".zip" : L"Archive.zip")); if (output.empty()) return false;
    static const unsigned char emptyZip[] = {80,75,5,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0}; std::ofstream stream(fs::path(output), std::ios::binary); stream.write(reinterpret_cast<const char*>(emptyZip), sizeof(emptyZip)); stream.close();
    ComPtr<IShellDispatch> shell; if (FAILED(CoCreateInstance(CLSID_Shell, nullptr, CLSCTX_INPROC_SERVER, IID_PPV_ARGS(&shell)))) return false; VARIANT zipArg; VariantInit(&zipArg); zipArg.vt = VT_BSTR; zipArg.bstrVal = SysAllocString(output.c_str()); Folder* zipFolder = nullptr; if (FAILED(shell->NameSpace(zipArg, &zipFolder)) || !zipFolder) { VariantClear(&zipArg); return false; } VariantClear(&zipArg);
    for (const auto& path : paths) { fs::path itemPath(path); VARIANT folderArg; VariantInit(&folderArg); folderArg.vt = VT_BSTR; folderArg.bstrVal = SysAllocString(itemPath.parent_path().c_str()); Folder* source = nullptr; if (SUCCEEDED(shell->NameSpace(folderArg, &source)) && source) { VariantClear(&folderArg); BSTR name = SysAllocString(itemPath.filename().c_str()); FolderItem* item = nullptr; if (SUCCEEDED(source->ParseName(name, &item)) && item) { VARIANT itemArg; VariantInit(&itemArg); itemArg.vt = VT_DISPATCH; itemArg.pdispVal = item; item->AddRef(); VARIANT options; VariantInit(&options); options.vt = VT_I4; options.lVal = 4 | 16; zipFolder->CopyHere(itemArg, options); VariantClear(&itemArg); VariantClear(&options); item->Release(); } SysFreeString(name); source->Release(); } else VariantClear(&folderArg); }
    zipFolder->Release(); return true;
}
bool ExtractZip(const std::wstring& zip, std::wstring& output) {
    ComPtr<IShellDispatch> shell; if (FAILED(CoCreateInstance(CLSID_Shell, nullptr, CLSCTX_INPROC_SERVER, IID_PPV_ARGS(&shell)))) return false; VARIANT arg; VariantInit(&arg); arg.vt = VT_BSTR; arg.bstrVal = SysAllocString(zip.c_str()); Folder* folder = nullptr; if (FAILED(shell->NameSpace(arg, &folder)) || !folder) { VariantClear(&arg); return false; } VariantClear(&arg);
    FolderItems* items = nullptr; if (FAILED(folder->Items(&items)) || !items) { folder->Release(); return false; } long count = 0; items->get_Count(&count); for (long i = 0; i < count; ++i) { VARIANT v; VariantInit(&v); v.vt = VT_I4; v.lVal = i; FolderItem* item = nullptr; if (SUCCEEDED(items->Item(v, &item)) && item) { BSTR name = nullptr; item->get_Name(&name); bool safe = name && SafeZipEntry(name); SysFreeString(name); item->Release(); if (!safe) { items->Release(); folder->Release(); return false; } } VariantClear(&v); }
    items->Release(); folder->Release(); fs::path zipPath(zip); output = UniquePath(zipPath.parent_path() / zipPath.stem()); if (output.empty()) return false; std::error_code ec; fs::create_directories(output, ec); if (ec) return false;
    arg = {}; arg.vt = VT_BSTR; arg.bstrVal = SysAllocString(zip.c_str()); if (FAILED(shell->NameSpace(arg, &folder)) || !folder) { VariantClear(&arg); return false; } VariantClear(&arg); VARIANT destArg; VariantInit(&destArg); destArg.vt = VT_BSTR; destArg.bstrVal = SysAllocString(output.c_str()); Folder* dest = nullptr; if (FAILED(shell->NameSpace(destArg, &dest)) || !dest) { VariantClear(&destArg); folder->Release(); return false; } VariantClear(&destArg); VARIANT all; VariantInit(&all); all.vt = VT_DISPATCH; FolderItems* allItems = nullptr; folder->Items(&allItems); all.pdispVal = allItems; VARIANT options; VariantInit(&options); options.vt = VT_I4; options.lVal = 4 | 16; dest->CopyHere(all, options); VariantClear(&all); VariantClear(&options); dest->Release(); folder->Release(); return true;
}

bool ConvertWebP(const std::wstring& sourcePath, const Settings& settings) {
    ComPtr<IWICImagingFactory> factory; if (FAILED(CoCreateInstance(CLSID_WICImagingFactory, nullptr, CLSCTX_INPROC_SERVER, IID_PPV_ARGS(&factory)))) return false; ComPtr<IWICBitmapDecoder> decoder; if (FAILED(factory->CreateDecoderFromFilename(sourcePath.c_str(), nullptr, GENERIC_READ, WICDecodeMetadataCacheOnLoad, &decoder))) return false; ComPtr<IWICBitmapFrameDecode> frame; if (FAILED(decoder->GetFrame(0, &frame))) return false; ComPtr<IWICFormatConverter> converter; if (FAILED(factory->CreateFormatConverter(&converter))) return false; if (FAILED(converter->Initialize(frame.Get(), GUID_WICPixelFormat32bppRGBA, WICBitmapDitherTypeNone, nullptr, 0, WICBitmapPaletteTypeCustom))) return false; UINT width, height; converter->GetSize(&width, &height); std::vector<uint8_t> pixels(static_cast<size_t>(width) * height * 4); if (FAILED(converter->CopyPixels(nullptr, width * 4, static_cast<UINT>(pixels.size()), pixels.data()))) return false;
    std::vector<uint8_t> encoded; uint8_t* data = nullptr; size_t size = WebPEncodeRGBA(pixels.data(), width, height, width * 4, static_cast<float>(settings.quality), &data); if (!size || !data) return false; encoded.assign(data, data + size); WebPFree(data); fs::path destination = fs::path(sourcePath).parent_path() / L"webp" / (fs::path(sourcePath).stem().wstring() + L".webp"); std::error_code ec; fs::create_directories(destination.parent_path(), ec); if (ec || (fs::exists(destination) && !settings.overwrite)) return false; std::ofstream out(destination, std::ios::binary | std::ios::trunc); out.write(reinterpret_cast<const char*>(encoded.data()), encoded.size()); return out.good();
}

void DoZip() { auto paths = SelectedPaths(); if (paths.empty()) { Notify(L"QuickZip", L"Select a file or folder in File Explorer first."); return; } if (paths.size() == 1 && _wcsicmp(fs::path(paths[0]).extension().c_str(), L".zip") == 0) { std::wstring out; if (ExtractZip(paths[0], out)) Notify(L"QuickZip", fs::path(paths[0]).stem().wstring() + L" extracted successfully."); else Notify(L"QuickZip", L"The ZIP could not be extracted safely."); } else { std::wstring out; if (CreateZip(paths, out)) Notify(L"QuickZip", fs::path(out).filename().wstring() + L" created successfully."); else Notify(L"QuickZip", L"The ZIP could not be created."); } }
void DoWebP() { auto paths = SelectedPaths(); if (paths.empty()) { Notify(L"QuickZip", L"Select images or a folder in File Explorer first."); return; } Settings settings; { std::lock_guard lock(g_settings_mutex); settings = g_settings; } std::vector<std::wstring> files; for (const auto& path : paths) { fs::path p(path); if (fs::is_directory(p)) { auto options = settings.recursive ? fs::directory_options::skip_permission_denied : fs::directory_options::none; if (settings.recursive) for (auto& entry : fs::recursive_directory_iterator(p, options)) if (entry.is_regular_file()) files.push_back(entry.path().wstring()); else for (auto& entry : fs::directory_iterator(p, options)) if (entry.is_regular_file()) files.push_back(entry.path().wstring()); } else files.push_back(path); } int converted = 0, skipped = 0; for (const auto& file : files) { auto ext = fs::path(file).extension().wstring(); std::transform(ext.begin(), ext.end(), ext.begin(), towlower); if (ext != L".jpg" && ext != L".jpeg" && ext != L".png") { ++skipped; continue; } fs::path dest = fs::path(file).parent_path() / L"webp" / (fs::path(file).stem().wstring() + L".webp"); if (fs::exists(dest) && !settings.overwrite) { ++skipped; continue; } if (ConvertWebP(file, settings)) ++converted; else ++skipped; } Notify(L"QuickZip", std::to_wstring(converted) + L" converted, " + std::to_wstring(skipped) + L" skipped."); }

HWND CreateSettingsWindow();
void Worker(UINT command) { std::thread([command] { if (command == ID_ZIP) DoZip(); else DoWebP(); }).detach(); }
void ShowMenu() { HMENU menu = CreatePopupMenu(); AppendMenuW(menu, MF_STRING, ID_ZIP, L"Zip / Extract\tCtrl + Alt + G"); AppendMenuW(menu, MF_STRING, ID_WEBP, L"Convert to WebP\tCtrl + Alt + W"); AppendMenuW(menu, MF_SEPARATOR, 0, nullptr); AppendMenuW(menu, MF_STRING, ID_SETTINGS, L"Settings"); AppendMenuW(menu, MF_STRING | (g_settings.startup ? MF_CHECKED : 0), ID_STARTUP, L"Start with Windows"); AppendMenuW(menu, MF_SEPARATOR, 0, nullptr); AppendMenuW(menu, MF_STRING, ID_EXIT, L"Exit"); POINT point; GetCursorPos(&point); SetForegroundWindow(g_window); TrackPopupMenu(menu, TPM_RIGHTBUTTON, point.x, point.y, 0, g_window, nullptr); DestroyMenu(menu); }
LRESULT CALLBACK WindowProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) { if (msg == WM_HOTKEY) Worker(wParam == HOTKEY_ZIP ? ID_ZIP : ID_WEBP); else if (msg == WM_TRAY && lParam == WM_RBUTTONUP) ShowMenu(); else if (msg == WM_COMMAND) { switch (LOWORD(wParam)) { case ID_ZIP: Worker(ID_ZIP); break; case ID_WEBP: Worker(ID_WEBP); break; case ID_SETTINGS: CreateSettingsWindow(); break; case ID_STARTUP: g_settings.startup = !g_settings.startup; SaveSettings(); break; case ID_EXIT: DestroyWindow(hwnd); break; } } else if (msg == WM_DESTROY) { UnregisterHotKey(hwnd, HOTKEY_ZIP); UnregisterHotKey(hwnd, HOTKEY_WEBP); NOTIFYICONDATAW data{sizeof(data)}; data.hWnd = hwnd; data.uID = 1; Shell_NotifyIconW(NIM_DELETE, &data); PostQuitMessage(0); } return DefWindowProcW(hwnd, msg, wParam, lParam); }

HWND CreateSettingsWindow() { HWND window = CreateWindowExW(WS_EX_DLGMODALFRAME, L"STATIC", L"QuickZip Settings", WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU, CW_USEDEFAULT, CW_USEDEFAULT, 330, 260, g_window, nullptr, g_instance, nullptr); CreateWindowW(L"STATIC", L"WebP quality (1-100):", WS_CHILD | WS_VISIBLE, 20, 20, 170, 22, window, nullptr, g_instance, nullptr); HWND quality = CreateWindowW(L"EDIT", std::to_wstring(g_settings.quality).c_str(), WS_CHILD | WS_VISIBLE | WS_BORDER | ES_NUMBER, 205, 18, 70, 24, window, nullptr, g_instance, nullptr); HWND skip = CreateWindowW(L"BUTTON", L"Skip existing WebP files", WS_CHILD | WS_VISIBLE | BS_AUTORADIOBUTTON | (g_settings.overwrite ? 0 : BST_CHECKED), 20, 60, 240, 24, window, nullptr, g_instance, nullptr); HWND overwrite = CreateWindowW(L"BUTTON", L"Overwrite existing WebP files", WS_CHILD | WS_VISIBLE | BS_AUTORADIOBUTTON | (g_settings.overwrite ? BST_CHECKED : 0), 20, 88, 240, 24, window, nullptr, g_instance, nullptr); HWND recursive = CreateWindowW(L"BUTTON", L"Recursive folder conversion", WS_CHILD | WS_VISIBLE | BS_AUTOCHECKBOX | (g_settings.recursive ? BST_CHECKED : 0), 20, 125, 240, 24, window, nullptr, g_instance, nullptr); HWND startup = CreateWindowW(L"BUTTON", L"Start with Windows", WS_CHILD | WS_VISIBLE | BS_AUTOCHECKBOX | (g_settings.startup ? BST_CHECKED : 0), 20, 153, 240, 24, window, nullptr, g_instance, nullptr); HWND save = CreateWindowW(L"BUTTON", L"Save", WS_CHILD | WS_VISIBLE | BS_DEFPUSHBUTTON, 190, 190, 85, 28, window, reinterpret_cast<HMENU>(1), g_instance, nullptr); ShowWindow(window, SW_SHOW); MSG message; while (IsWindow(window) && GetMessageW(&message, nullptr, 0, 0) > 0) { if (message.hwnd == save && message.message == WM_LBUTTONDOWN) { wchar_t text[8]{}; GetWindowTextW(quality, text, 8); g_settings.quality = std::clamp(_wtoi(text), 1, 100); g_settings.overwrite = SendMessageW(overwrite, BM_GETCHECK, 0, 0) == BST_CHECKED; g_settings.recursive = SendMessageW(recursive, BM_GETCHECK, 0, 0) == BST_CHECKED; g_settings.startup = SendMessageW(startup, BM_GETCHECK, 0, 0) == BST_CHECKED; SaveSettings(); DestroyWindow(window); break; } TranslateMessage(&message); DispatchMessageW(&message); } return window; }

int APIENTRY wWinMain(HINSTANCE instance, HINSTANCE, LPWSTR, int) { g_instance = instance; LoadSettings(); CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED); WNDCLASSW wc{}; wc.lpfnWndProc = WindowProc; wc.hInstance = instance; wc.lpszClassName = CLASS_NAME; wc.hCursor = LoadCursor(nullptr, IDC_ARROW); RegisterClassW(&wc); g_window = CreateWindowW(CLASS_NAME, L"QuickZip", 0, 0, 0, 0, 0, HWND_MESSAGE, nullptr, instance, nullptr); if (!g_window) return 1; RegisterHotKey(g_window, HOTKEY_ZIP, MOD_CONTROL | MOD_ALT, 'G'); RegisterHotKey(g_window, HOTKEY_WEBP, MOD_CONTROL | MOD_ALT, 'W'); NOTIFYICONDATAW tray{sizeof(tray)}; tray.hWnd = g_window; tray.uID = 1; tray.uFlags = NIF_ICON | NIF_MESSAGE | NIF_TIP; tray.uCallbackMessage = WM_TRAY; tray.hIcon = LoadIcon(nullptr, IDI_APPLICATION); wcscpy_s(tray.szTip, L"QuickZip"); Shell_NotifyIconW(NIM_ADD, &tray); MSG message; while (GetMessageW(&message, nullptr, 0, 0) > 0) { TranslateMessage(&message); DispatchMessageW(&message); } CoUninitialize(); return 0; }
