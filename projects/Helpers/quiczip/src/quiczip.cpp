#include "miniz.h"
#include "file_selection.h"
#include <windows.h>
#include <iostream>
#include <vector>
#include <string>
#include <filesystem>
#include <fstream>
#include <algorithm>
#include <conio.h>
#include "resource.h"

namespace fs = std::filesystem;
HWND g_hHiddenWnd = NULL;
LRESULT CALLBACK HiddenWndProc(HWND hWnd, UINT msg, WPARAM wParam, LPARAM lParam)
{
    if (msg == WM_APP + 1)
    {
        // handle tray events here if needed
    }
    return DefWindowProc(hWnd, msg, wParam, lParam);
}

HWND CreateHiddenWindow()
{
    WNDCLASS wc = {0};
    wc.lpfnWndProc = HiddenWndProc;
    wc.hInstance = GetModuleHandle(NULL);
    wc.lpszClassName = "QuickZipHiddenWindowClass";

    RegisterClass(&wc);

    return CreateWindow(
        "QuickZipHiddenWindowClass",
        "QuickZipHiddenWindow",
        0, 0, 0, 0, 0,
        NULL, NULL, wc.hInstance, NULL
    );
}


bool IsFirstRun()
{
    HKEY hKey;
    LONG result = RegOpenKeyExA(
        HKEY_CURRENT_USER,
        "Software\\QuickZip",
        0,
        KEY_READ,
        &hKey
    );

    if (result != ERROR_SUCCESS)
        return true;  // Key not found → first run

    RegCloseKey(hKey);
    return false; 
}

void ShowWelcomeConsole()
{
    AllocConsole();
    freopen("CONOUT$", "w", stdout);

    std::cout << "--------------------------------------------\n";
    std::cout << "      🎉 Welcome to QuickZip! 🎉\n";
    std::cout << "--------------------------------------------\n\n";
    std::cout << "You made a smart choice by choosing QuickZip.\n";
    std::cout << "Use CTRL + ALT + Z to zip/unzip instantly.\n\n";
    std::cout << "Press O to open website.\n";
    std::cout << "Press X to close this window.\n\n";

    while (true)
    {
        char c = toupper(_getch());
        if (c == 'X')
            break;
        else if (c == 'O')
            ShellExecuteA(NULL, "open", "https://jdip19.github.io", NULL, NULL, SW_SHOWNORMAL);
    }

    FreeConsole();
}


void ShowTrayMessage(HWND hWnd, const char* title, const char* message)
{
    NOTIFYICONDATA nid = {0};
    nid.cbSize = sizeof(nid);
    nid.hWnd = hWnd;
    nid.uID = 1;

    nid.uFlags = NIF_MESSAGE | NIF_ICON | NIF_TIP | NIF_INFO;
    nid.uCallbackMessage = WM_APP + 1;
    nid.hIcon = LoadIcon(GetModuleHandle(NULL), MAKEINTRESOURCE(IDI_APP_ICON));

    strcpy_s(nid.szTip, "QuickZip");

    strcpy_s(nid.szInfoTitle, title);
    strcpy_s(nid.szInfo, message);
    nid.dwInfoFlags = NIIF_INFO;

    Shell_NotifyIcon(NIM_ADD, &nid);
    Shell_NotifyIcon(NIM_MODIFY, &nid);
}

//
// ---------------- ZIP LOGIC ----------------
//
bool ZipFiles(const std::vector<std::string>& inputs, const std::string& outputZip)
{
    mz_zip_archive zip;
    memset(&zip, 0, sizeof(zip));

    if (!mz_zip_writer_init_file(&zip, outputZip.c_str(), 0))
        return false;

    for (const auto& pathStr : inputs)
    {
        fs::path p(pathStr);

        if (fs::is_regular_file(p))
        {
            // Add single file
            if (!mz_zip_writer_add_file(&zip,
                p.filename().string().c_str(),
                p.string().c_str(),
                nullptr, 0, MZ_BEST_COMPRESSION))
            {
                mz_zip_writer_end(&zip);
                return false;
            }
        }
        else if (fs::is_directory(p))
        {
            // Recursively add all files inside the directory
            for (auto& entry : fs::recursive_directory_iterator(p))
            {
                if (!entry.is_regular_file())
                    continue;

                fs::path fullPath = entry.path();
                fs::path relative = fs::relative(fullPath, p);

                std::string zipPath = (p.filename() / relative).string();

                if (!mz_zip_writer_add_file(&zip,
                    zipPath.c_str(),
                    fullPath.string().c_str(),
                    nullptr, 0, MZ_BEST_COMPRESSION))
                {
                    mz_zip_writer_end(&zip);
                    return false;
                }
            }
        }
    }

    mz_zip_writer_finalize_archive(&zip);
    mz_zip_writer_end(&zip);
    return true;
}

//
// ---------------- UNZIP LOGIC ----------------
//
bool UnzipToFolder(const std::string& zipPath, const std::string& destDir)
{
    mz_zip_archive zip;
    memset(&zip, 0, sizeof(zip));

    if (!mz_zip_reader_init_file(&zip, zipPath.c_str(), 0))
        return false;

    mz_uint num_files = mz_zip_reader_get_num_files(&zip);
    for (mz_uint i = 0; i < num_files; i++)
    {
        mz_zip_archive_file_stat stat;
        if (!mz_zip_reader_file_stat(&zip, i, &stat))
            continue;

        fs::path outPath = fs::path(destDir) / stat.m_filename;

        if (stat.m_is_directory)
        {
            fs::create_directories(outPath);
            continue;
        }

        fs::create_directories(outPath.parent_path());

        if (!mz_zip_reader_extract_to_file(&zip, i, outPath.string().c_str(), 0))
        {
            mz_zip_reader_end(&zip);
            return false;
        }
    }

    mz_zip_reader_end(&zip);
    return true;
}


//
// ---------------- MAIN HANDLER LOGIC ----------------
//
void ProcessSelection()
{
    CoInitialize(nullptr);
    auto files = GetSelectedFiles();
    CoUninitialize();

    if (files.empty())
    {
        ShowTrayMessage(GetConsoleWindow(), "QuickZip", "No file selected.");
        return;
    }

    // ----------------- CHECK FOR UNZIP -----------------
    bool containsZip = false;
    std::string zipFile;

    for (auto& f : files)
    {
        std::string ext = fs::path(f).extension().string();
        std::transform(ext.begin(), ext.end(), ext.begin(), ::tolower);

        if (ext == ".zip")
        {
            containsZip = true;
            zipFile = f;
            break;
        }
    }

    if (containsZip)
    {
        std::string folderName = zipFile.substr(0, zipFile.size() - 4);

        if (UnzipToFolder(zipFile, folderName))
            ShowTrayMessage(GetConsoleWindow(), "QuickZip", "Unzip completed!");
        else
            ShowTrayMessage(GetConsoleWindow(), "QuickZip", "Unzip failed!");

        return;
    }

    // ----------------- ZIP CASE -----------------
    fs::path outDir = fs::path(files[0]).parent_path();
    fs::path zipPath = outDir / (fs::path(files[0]).stem().string() + ".zip");

    if (ZipFiles(files, zipPath.string()))
    {
        ShowTrayMessage(GetConsoleWindow(), "QuickZip", "Zip created!");
    }
    else
    {
        ShowTrayMessage(GetConsoleWindow(), "QuickZip", "Zip failed!");
    }
}

//
// ---------------- HOTKEY LISTENER ----------------
//
int WINAPI WinMain(HINSTANCE hInst, HINSTANCE hPrev, LPSTR args, int nShow)
{
    if (IsFirstRun())
    {
        ShowWelcomeConsole();   // Show console
    }

    // After console is closed, continue silently

    g_hHiddenWnd = CreateHiddenWindow();

    RegisterHotKey(NULL, 1, MOD_CONTROL | MOD_ALT, 'Z');

    ShowTrayMessage(g_hHiddenWnd, "QuickZip", "Press CTRL + ALT + Z to zip/unzip.");

    MSG msg = {0};
    while (GetMessage(&msg, NULL, 0, 0))
    {
        if (msg.message == WM_HOTKEY)
            ProcessSelection();
    }
    return 0;
}